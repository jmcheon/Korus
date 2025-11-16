from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, validator

# ==================== COMPANY SCHEMAS ====================


class CompanyBase(BaseModel):
    """Base company schema"""

    email: EmailStr
    company_name: str = Field(..., min_length=2, max_length=255)
    industry: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    country: str = Field(..., min_length=2, max_length=100)


class CompanyCreate(CompanyBase):
    """Schema for company registration"""

    password: str = Field(..., min_length=8, max_length=100)
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class CompanyUpdate(BaseModel):
    """Schema for updating company profile"""

    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    industry: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None


class CompanyResponse(CompanyBase):
    """Schema for company response (authenticated)"""

    id: int
    description: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    overall_rating: float
    total_reviews: int
    social_media_score: float
    trust_score: float
    verified: bool
    rating_work_conditions: float
    rating_pay: float
    rating_treatment: float
    rating_safety: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CompanyPublic(BaseModel):
    """Schema for public company information"""

    id: int
    company_name: str
    industry: str
    location: str
    country: str
    description: Optional[str]
    website: Optional[str]
    overall_rating: float
    total_reviews: int
    social_media_score: float
    trust_score: float
    verified: bool
    rating_work_conditions: float
    rating_pay: float
    rating_treatment: float
    rating_safety: float

    class Config:
        from_attributes = True


# ==================== AUTHENTICATION SCHEMAS ====================


class Token(BaseModel):
    """JWT token response"""

    access_token: str
    token_type: str
    company_id: int
    company_name: str


class TokenData(BaseModel):
    """Token payload data"""

    email: Optional[str] = None
    company_id: Optional[int] = None


# ==================== REVIEW SCHEMAS ====================


class ReviewBase(BaseModel):
    """Base review schema"""

    company_id: int
    job_id: Optional[int] = None
    rating_work_conditions: float = Field(..., ge=1, le=5)
    rating_pay: float = Field(..., ge=1, le=5)
    rating_treatment: float = Field(..., ge=1, le=5)
    rating_safety: float = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=20, max_length=5000)
    is_anonymous: bool = True


class ReviewCreate(ReviewBase):
    """Schema for creating a review"""

    verified_employee: bool = False
    employee_token: Optional[str] = None


class ReviewResponse(ReviewBase):
    """Schema for review response"""

    id: int
    verified_employee: bool
    helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==================== JOB SCHEMAS ====================


class JobBase(BaseModel):
    """Base job schema"""

    company_id: int
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=20, max_length=5000)
    location: str = Field(..., min_length=2, max_length=255)
    salary: str = Field(..., min_length=2, max_length=100)


class JobCreate(JobBase):
    """Schema for creating a job"""

    requirements: Optional[str] = None
    benefits: Optional[str] = None
    expires_at: Optional[datetime] = None


class JobUpdate(BaseModel):
    """Schema for updating a job"""

    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=20, max_length=5000)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    salary: Optional[str] = Field(None, min_length=2, max_length=100)
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class JobResponse(JobBase):
    """Schema for job response"""

    id: int
    requirements: Optional[str]
    benefits: Optional[str]
    is_active: bool
    posted_at: datetime
    updated_at: Optional[datetime]
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==================== SUPPORT ORGANIZATION SCHEMAS ====================


class SupportOrgBase(BaseModel):
    """Base support organization schema"""

    name: str = Field(..., min_length=2, max_length=255)
    type: str = Field(..., min_length=2, max_length=100)
    latitude: float
    longitude: float
    address: str = Field(..., min_length=5, max_length=500)
    contact: str = Field(..., min_length=5, max_length=100)
    email: EmailStr
    services: List[str]
    open_hours: str = Field(..., min_length=3, max_length=255)


class SupportOrgCreate(SupportOrgBase):
    """Schema for creating support organization"""

    website: Optional[str] = None
    description: Optional[str] = None
    languages: Optional[List[str]] = None


class SupportOrgResponse(SupportOrgBase):
    """Schema for support organization response"""

    id: int
    website: Optional[str]
    description: Optional[str]
    languages: Optional[List[str]]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==================== STATISTICS SCHEMAS ====================


class PlatformStatistics(BaseModel):
    """Platform-wide statistics"""

    total_companies: int
    total_reviews: int
    total_jobs: int
    total_support_orgs: int
    average_rating: float
    average_trust_score: float
    verified_companies: int
    critical_reviews: int


class CompanyStatistics(BaseModel):
    """Company-specific statistics"""

    company_id: int
    company_name: str
    total_reviews: int
    total_jobs: int
    average_rating: float
    trust_score: float
    rating_breakdown: dict
    recent_reviews: int
    active_jobs: int
