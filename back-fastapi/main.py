from datetime import timedelta
from typing import Any, List

import auth
import crud
import models
import schemas
from database import engine, get_db
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Create database tables
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Korus Collective VoiceAPI",
    description="API for migrant Collective Voice with company authentication",
    version="1.0.0",
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Korus Collective VoiceAPI",
        "version": "1.0.0",
        "docs": "/docs",
    }


# ==================== AUTHENTICATION ENDPOINTS ====================


@app.post(
    "/api/auth/register",
    response_model=schemas.CompanyResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    """
    Register a new company account

    - **email**: Company email (must be unique)
    - **password**: Strong password (min 8 characters)
    - **company_name**: Official company name
    - **industry**: Industry sector
    - **location**: Company location
    - **country**: Country of operation
    """
    # Check if email already exists
    db_company = crud.get_company_by_email(db, email=company.email)
    if db_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new company
    new_company = crud.create_company(db=db, company=company)
    return new_company


@app.post("/api/auth/login", response_model=schemas.Token)
def login_company(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login endpoint for companies

    Returns JWT access token for authenticated requests
    """
    company = auth.authenticate_company(db, form_data.username, form_data.password)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": company.email, "company_id": company.id},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "company_id": company.id,
        "company_name": company.company_name,
    }


@app.get("/api/auth/me", response_model=schemas.CompanyResponse)
def get_current_company_info(
    current_company: models.Company = Depends(auth.get_current_company),
):
    """
    Get current authenticated company information
    """
    return current_company


# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Aggregated data for the main dashboard:
    - companies
    - jobs
    - reviews
    - support organizations
    - platform statistics
    """
    companies = crud.get_companies(db, skip=0, limit=100)
    jobs = crud.get_jobs(db, skip=0, limit=200)
    reviews = crud.get_reviews(db, skip=0, limit=200)
    support_orgs = crud.get_support_organizations(db, skip=0, limit=200)
    stats = crud.get_platform_statistics(db)

    return {
        "companies": companies,
        "jobs": jobs,
        "reviews": reviews,
        "support_organizations": support_orgs,
        "statistics": stats,
    }


# ==================== COMPANY ENDPOINTS ====================


@app.get("/api/companies", response_model=List[schemas.CompanyPublic])
def get_all_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all companies (public information only)
    """
    companies = crud.get_companies(db, skip=skip, limit=limit)
    return companies


@app.get("/api/companies/{company_id}", response_model=schemas.CompanyPublic)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """
    Get specific company by ID (public information)
    """
    company = crud.get_company(db, company_id=company_id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
        )
    return company


@app.put("/api/companies/me", response_model=schemas.CompanyResponse)
def update_company_profile(
    company_update: schemas.CompanyUpdate,
    current_company: models.Company = Depends(auth.get_current_company),
    db: Session = Depends(get_db),
):
    """
    Update current company profile
    """
    updated_company = crud.update_company(
        db=db, company_id=current_company.id, company_update=company_update
    )
    return updated_company


@app.delete("/api/companies/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_company_account(
    current_company: models.Company = Depends(auth.get_current_company),
    db: Session = Depends(get_db),
):
    """
    Delete current company account
    """
    crud.delete_company(db=db, company_id=current_company.id)
    return None


# ==================== REVIEW ENDPOINTS ====================


@app.get("/api/reviews", response_model=List[schemas.ReviewResponse])
def get_all_reviews(
    skip: int = 0,
    limit: int = 100,
    company_id: int = None,
    db: Session = Depends(get_db),
):
    """
    Get all reviews, optionally filtered by company
    """
    if company_id:
        reviews = crud.get_reviews_by_company(
            db, company_id=company_id, skip=skip, limit=limit
        )
    else:
        reviews = crud.get_reviews(db, skip=skip, limit=limit)
    return reviews


@app.post(
    "/api/reviews",
    response_model=schemas.ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    """
    Create a new review (anonymous or verified employee)
    """
    new_review = crud.create_review(db=db, review=review)

    # Update company ratings
    crud.update_company_ratings(db=db, company_id=review.company_id)

    return new_review


@app.get("/api/reviews/{review_id}", response_model=schemas.ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """
    Get specific review by ID
    """
    review = crud.get_review(db, review_id=review_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )
    return review


# ==================== JOB ENDPOINTS ====================


@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def get_all_jobs(
    skip: int = 0,
    limit: int = 100,
    company_id: int = None,
    db: Session = Depends(get_db),
):
    """
    Get all job listings, optionally filtered by company
    """
    if company_id:
        jobs = crud.get_jobs_by_company(
            db, company_id=company_id, skip=skip, limit=limit
        )
    else:
        jobs = crud.get_jobs(db, skip=skip, limit=limit)
    return jobs


@app.post(
    "/api/jobs", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED
)
def create_job(
    job: schemas.JobCreate,
    current_company: models.Company = Depends(auth.get_current_company),
    db: Session = Depends(get_db),
):
    """
    Create a new job listing (authenticated companies only)
    """
    # Ensure company is creating job for themselves
    if job.company_id != current_company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create jobs for your own company",
        )

    new_job = crud.create_job(db=db, job=job)
    return new_job


@app.get("/api/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Get specific job by ID
    """
    job = crud.get_job(db, job_id=job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )
    return job


@app.put("/api/jobs/{job_id}", response_model=schemas.JobResponse)
def update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    current_company: models.Company = Depends(auth.get_current_company),
    db: Session = Depends(get_db),
):
    """
    Update job listing (only by company that created it)
    """
    job = crud.get_job(db, job_id=job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    if job.company_id != current_company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own job listings",
        )

    updated_job = crud.update_job(db=db, job_id=job_id, job_update=job_update)
    return updated_job


@app.delete("/api/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_company: models.Company = Depends(auth.get_current_company),
    db: Session = Depends(get_db),
):
    """
    Delete job listing (only by company that created it)
    """
    job = crud.get_job(db, job_id=job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    if job.company_id != current_company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own job listings",
        )

    crud.delete_job(db=db, job_id=job_id)
    return None


# ==================== SUPPORT ORGANIZATION ENDPOINTS ====================


@app.get("/api/support-organizations", response_model=List[schemas.SupportOrgResponse])
def get_all_support_organizations(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Get all support organizations
    """
    support_orgs = crud.get_support_organizations(db, skip=skip, limit=limit)
    return support_orgs


@app.get(
    "/api/support-organizations/{org_id}", response_model=schemas.SupportOrgResponse
)
def get_support_organization(org_id: int, db: Session = Depends(get_db)):
    """
    Get specific support organization by ID
    """
    org = crud.get_support_organization(db, org_id=org_id)
    if org is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support organization not found",
        )
    return org


# ==================== STATISTICS ENDPOINTS ====================


@app.get("/api/statistics/platform")
def get_platform_statistics(db: Session = Depends(get_db)):
    """
    Get overall platform statistics
    """
    return crud.get_platform_statistics(db)


@app.get("/api/statistics/company/{company_id}")
def get_company_statistics(company_id: int, db: Session = Depends(get_db)):
    """
    Get statistics for a specific company
    """
    company = crud.get_company(db, company_id=company_id)
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
        )

    return crud.get_company_statistics(db, company_id=company_id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
