from database import Base
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Company(Base):
    """
    Company model for employer accounts
    """

    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)

    # Company profile information
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    # Ratings and verification
    overall_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    social_media_score = Column(Float, default=0.0)
    trust_score = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)

    # Rating breakdown
    rating_work_conditions = Column(Float, default=0.0)
    rating_pay = Column(Float, default=0.0)
    rating_treatment = Column(Float, default=0.0)
    rating_safety = Column(Float, default=0.0)

    # Account status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    reviews = relationship(
        "Review", back_populates="company", cascade="all, delete-orphan"
    )


class Review(Base):
    """
    Review model for worker feedback
    """

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)

    # Ratings (1-5 scale)
    rating_work_conditions = Column(Float, nullable=False)
    rating_pay = Column(Float, nullable=False)
    rating_treatment = Column(Float, nullable=False)
    rating_safety = Column(Float, nullable=False)

    # Review content
    comment = Column(Text, nullable=False)

    # Privacy and verification
    is_anonymous = Column(Boolean, default=True)
    verified_employee = Column(Boolean, default=False)
    employee_token = Column(String(255), nullable=True)  # For verification

    # Engagement
    helpful_count = Column(Integer, default=0)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="reviews")
    job = relationship("Job", back_populates="reviews")


class Job(Base):
    """
    Job listing model
    """

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Job details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    salary = Column(String(100), nullable=False)

    # Job requirements
    requirements = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)

    # Job status
    is_active = Column(Boolean, default=True)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    reviews = relationship("Review", back_populates="job")


class SupportOrganization(Base):
    """
    Support organization model for worker assistance
    """

    __tablename__ = "support_organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(
        String(100), nullable=False
    )  # NGO, Legal Aid, Healthcare, Housing, Labor Rights

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=False)

    # Contact information
    contact = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)

    # Services
    services = Column(JSON, nullable=False)  # Array of services offered
    open_hours = Column(String(255), nullable=False)

    # Additional info
    description = Column(Text, nullable=True)
    languages = Column(JSON, nullable=True)  # Languages supported

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmployeeToken(Base):
    """
    Employee verification token model
    """

    __tablename__ = "employee_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Token details
    employee_name = Column(String(255), nullable=True)
    employee_email = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)

    # Token status
    is_used = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime(timezone=True), nullable=True)
