from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

import auth
import models
import schemas

# ==================== COMPANY CRUD ====================


def get_company(db: Session, company_id: int) -> Optional[models.Company]:
    """Get company by ID"""
    return db.query(models.Company).filter(models.Company.id == company_id).first()


def get_company_by_email(db: Session, email: str) -> Optional[models.Company]:
    """Get company by email"""
    return db.query(models.Company).filter(models.Company.email == email).first()


def get_companies(db: Session, skip: int = 0, limit: int = 100) -> List[models.Company]:
    """Get all companies"""
    return db.query(models.Company).offset(skip).limit(limit).all()


def create_company(db: Session, company: schemas.CompanyCreate) -> models.Company:
    """Create a new company"""
    hashed_password = auth.get_password_hash(company.password)

    db_company = models.Company(
        email=company.email,
        hashed_password=hashed_password,
        company_name=company.company_name,
        industry=company.industry,
        location=company.location,
        country=company.country,
        description=company.description,
        website=company.website,
        phone=company.phone,
    )

    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def update_company(
    db: Session, company_id: int, company_update: schemas.CompanyUpdate
) -> models.Company:
    """Update company profile"""
    db_company = get_company(db, company_id)

    if db_company:
        update_data = company_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_company, field, value)

        db_company.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_company)

    return db_company


def delete_company(db: Session, company_id: int):
    """Delete a company"""
    db_company = get_company(db, company_id)
    if db_company:
        db.delete(db_company)
        db.commit()


def update_company_ratings(db: Session, company_id: int):
    """Update company ratings based on reviews"""
    reviews = (
        db.query(models.Review).filter(models.Review.company_id == company_id).all()
    )

    if not reviews:
        return

    total_reviews = len(reviews)

    # Calculate average ratings
    avg_work_conditions = sum(r.rating_work_conditions for r in reviews) / total_reviews
    avg_pay = sum(r.rating_pay for r in reviews) / total_reviews
    avg_treatment = sum(r.rating_treatment for r in reviews) / total_reviews
    avg_safety = sum(r.rating_safety for r in reviews) / total_reviews

    overall_rating = (avg_work_conditions + avg_pay + avg_treatment + avg_safety) / 4

    # Calculate trust score (weighted average with verification bonus)
    verified_reviews = [r for r in reviews if r.verified_employee]
    verification_bonus = len(verified_reviews) / total_reviews * 0.5
    trust_score = min(overall_rating + verification_bonus, 5.0)

    # Update company
    db_company = get_company(db, company_id)
    if db_company:
        db_company.overall_rating = round(overall_rating, 2)
        db_company.total_reviews = total_reviews
        db_company.rating_work_conditions = round(avg_work_conditions, 2)
        db_company.rating_pay = round(avg_pay, 2)
        db_company.rating_treatment = round(avg_treatment, 2)
        db_company.rating_safety = round(avg_safety, 2)
        db_company.trust_score = round(trust_score, 2)
        db_company.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_company)


# ==================== REVIEW CRUD ====================


def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    """Get review by ID"""
    return db.query(models.Review).filter(models.Review.id == review_id).first()


def get_reviews(db: Session, skip: int = 0, limit: int = 100) -> List[models.Review]:
    """Get all reviews"""
    return (
        db.query(models.Review)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_reviews_by_company(
    db: Session, company_id: int, skip: int = 0, limit: int = 100
) -> List[models.Review]:
    """Get reviews for a specific company"""
    return (
        db.query(models.Review)
        .filter(models.Review.company_id == company_id)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_review(db: Session, review: schemas.ReviewCreate) -> models.Review:
    """Create a new review"""
    # Verify employee token if provided
    verified = False
    if review.employee_token:
        employee_token = auth.verify_employee_token(db, review.employee_token)
        if employee_token and employee_token.company_id == review.company_id:
            verified = True
            auth.mark_token_as_used(db, employee_token.id)

    db_review = models.Review(
        company_id=review.company_id,
        job_id=review.job_id,
        rating_work_conditions=review.rating_work_conditions,
        rating_pay=review.rating_pay,
        rating_treatment=review.rating_treatment,
        rating_safety=review.rating_safety,
        comment=review.comment,
        is_anonymous=review.is_anonymous,
        verified_employee=verified,
        employee_token=review.employee_token if verified else None,
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def increment_review_helpful(db: Session, review_id: int):
    """Increment helpful count for a review"""
    db_review = get_review(db, review_id)
    if db_review:
        db_review.helpful_count += 1
        db.commit()
        db.refresh(db_review)
    return db_review


# ==================== JOB CRUD ====================


def get_job(db: Session, job_id: int) -> Optional[models.Job]:
    """Get job by ID"""
    return db.query(models.Job).filter(models.Job.id == job_id).first()


def get_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[models.Job]:
    """Get all jobs"""
    return (
        db.query(models.Job)
        .filter(models.Job.is_active == True)
        .order_by(models.Job.posted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_jobs_by_company(
    db: Session, company_id: int, skip: int = 0, limit: int = 100
) -> List[models.Job]:
    """Get jobs for a specific company"""
    return (
        db.query(models.Job)
        .filter(models.Job.company_id == company_id, models.Job.is_active == True)
        .order_by(models.Job.posted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_job(db: Session, job: schemas.JobCreate) -> models.Job:
    """Create a new job listing"""
    db_job = models.Job(
        company_id=job.company_id,
        title=job.title,
        description=job.description,
        location=job.location,
        salary=job.salary,
        requirements=job.requirements,
        benefits=job.benefits,
        expires_at=job.expires_at,
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: int, job_update: schemas.JobUpdate) -> models.Job:
    """Update a job listing"""
    db_job = get_job(db, job_id)

    if db_job:
        update_data = job_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_job, field, value)

        db_job.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_job)

    return db_job


def delete_job(db: Session, job_id: int):
    """Delete a job listing"""
    db_job = get_job(db, job_id)
    if db_job:
        db.delete(db_job)
        db.commit()


# ==================== STATISTICS ====================


def get_platform_statistics(db: Session) -> dict:
    """Get platform-wide statistics"""
    total_companies = db.query(func.count(models.Company.id)).scalar()
    total_reviews = db.query(func.count(models.Review.id)).scalar()
    total_jobs = (
        db.query(func.count(models.Job.id))
        .filter(models.Job.is_active == True)
        .scalar()
    )
    total_support_orgs = (
        db.query(func.count(models.SupportOrganization.id))
        .filter(models.SupportOrganization.is_active == True)
        .scalar()
    )

    avg_rating = db.query(func.avg(models.Company.overall_rating)).scalar() or 0.0
    avg_trust_score = db.query(func.avg(models.Company.trust_score)).scalar() or 0.0

    verified_companies = (
        db.query(func.count(models.Company.id))
        .filter(models.Company.verified == True)
        .scalar()
    )

    critical_reviews = (
        db.query(func.count(models.Review.id))
        .filter(
            (models.Review.rating_work_conditions <= 2)
            | (models.Review.rating_pay <= 2)
            | (models.Review.rating_treatment <= 2)
            | (models.Review.rating_safety <= 2)
        )
        .scalar()
    )

    return {
        "total_companies": total_companies,
        "total_reviews": total_reviews,
        "total_jobs": total_jobs,
        "total_support_orgs": total_support_orgs,
        "average_rating": round(avg_rating, 2),
        "average_trust_score": round(avg_trust_score, 2),
        "verified_companies": verified_companies,
        "critical_reviews": critical_reviews,
    }


def get_company_statistics(db: Session, company_id: int) -> dict:
    """Get statistics for a specific company"""
    company = get_company(db, company_id)
    if not company:
        return None

    total_reviews = (
        db.query(func.count(models.Review.id))
        .filter(models.Review.company_id == company_id)
        .scalar()
    )

    total_jobs = (
        db.query(func.count(models.Job.id))
        .filter(models.Job.company_id == company_id)
        .scalar()
    )

    active_jobs = (
        db.query(func.count(models.Job.id))
        .filter(models.Job.company_id == company_id, models.Job.is_active == True)
        .scalar()
    )

    # Recent reviews (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_reviews = (
        db.query(func.count(models.Review.id))
        .filter(
            models.Review.company_id == company_id,
            models.Review.created_at >= thirty_days_ago,
        )
        .scalar()
    )

    return {
        "company_id": company.id,
        "company_name": company.company_name,
        "total_reviews": total_reviews,
        "total_jobs": total_jobs,
        "average_rating": company.overall_rating,
        "trust_score": company.trust_score,
        "rating_breakdown": {
            "work_conditions": company.rating_work_conditions,
            "pay": company.rating_pay,
            "treatment": company.rating_treatment,
            "safety": company.rating_safety,
        },
        "recent_reviews": recent_reviews,
        "active_jobs": active_jobs,
    }


