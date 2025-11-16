import os
from datetime import datetime, timedelta
from typing import Optional

import models
import schemas
from database import get_db
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Load environment variables
load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)


def authenticate_company(
    db: Session, email: str, password: str
) -> Optional[models.Company]:
    """
    Authenticate a company by email and password
    """
    company = db.query(models.Company).filter(models.Company.email == email).first()
    if not company:
        return None
    if not verify_password(password, company.hashed_password):
        return None
    if not company.is_active:
        return None
    return company


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[schemas.TokenData]:
    """
    Decode and verify a JWT access token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        company_id: int = payload.get("company_id")

        if email is None or company_id is None:
            return None

        token_data = schemas.TokenData(email=email, company_id=company_id)
        return token_data
    except JWTError:
        return None


async def get_current_company(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.Company:
    """
    Get the current authenticated company from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception

    company = (
        db.query(models.Company)
        .filter(
            models.Company.email == token_data.email,
            models.Company.id == token_data.company_id,
        )
        .first()
    )

    if company is None:
        raise credentials_exception

    if not company.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Company account is inactive"
        )

    return company


async def get_current_active_company(
    current_company: models.Company = Depends(get_current_company),
) -> models.Company:
    """
    Get the current active company (additional check)
    """
    if not current_company.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive company account"
        )
    return current_company


def verify_employee_token(db: Session, token: str) -> Optional[models.EmployeeToken]:
    """
    Verify an employee token for review verification
    """
    employee_token = (
        db.query(models.EmployeeToken)
        .filter(
            models.EmployeeToken.token == token,
            models.EmployeeToken.is_active == True,
            models.EmployeeToken.is_used == False,
        )
        .first()
    )

    if not employee_token:
        return None

    # Check if token has expired
    if employee_token.expires_at and employee_token.expires_at < datetime.utcnow():
        return None

    return employee_token


def mark_token_as_used(db: Session, token_id: int):
    """
    Mark an employee token as used
    """
    employee_token = (
        db.query(models.EmployeeToken)
        .filter(models.EmployeeToken.id == token_id)
        .first()
    )

    if employee_token:
        employee_token.is_used = True
        employee_token.used_at = datetime.utcnow()
        db.commit()
