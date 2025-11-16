"""
Database setup script for Korus Worker Platform
Creates all tables and optionally seeds with sample data
"""

import json
import sys

from auth import get_password_hash
from database import SQLALCHEMY_DATABASE_URL, Base
from models import Company, Job, Review, SupportOrganization
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker


def create_database():
    """Create the database if it doesn't exist"""
    # Connect without database name
    base_url = SQLALCHEMY_DATABASE_URL.rsplit("/", 1)[0]
    db_name = SQLALCHEMY_DATABASE_URL.rsplit("/", 1)[1]

    engine = create_engine(base_url, echo=True)

    with engine.connect() as conn:
        # Check if database exists
        result = conn.execute(text(f"SHOW DATABASES LIKE '{db_name}'"))
        if not result.fetchone():
            print(f"Creating database: {db_name}")
            conn.execute(text(f"CREATE DATABASE {db_name}"))
            conn.commit()
            print(f"✅ Database '{db_name}' created successfully!")
        else:
            print(f"ℹ️  Database '{db_name}' already exists")

    engine.dispose()


def create_tables():
    """Create all tables"""
    print("\n📋 Creating database tables...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    engine.dispose()


def seed_sample_data():
    """Seed database with sample data"""
    print("\n🌱 Seeding sample data...")

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Create sample companies
        companies_data = [
            {
                "email": "contact@globalconstruction.com",
                "password": "SecurePass123",
                "company_name": "Global Construction Co.",
                "industry": "Construction",
                "location": "Dubai, UAE",
                "country": "UAE",
                "description": "Leading construction company in the Middle East",
                "website": "https://globalconstruction.com",
                "verified": True,
            },
            {
                "email": "hr@pacificag.com",
                "password": "SecurePass123",
                "company_name": "Pacific Agriculture Ltd.",
                "industry": "Agriculture",
                "location": "California, USA",
                "country": "USA",
                "description": "Sustainable farming and agriculture",
                "website": "https://pacificag.com",
                "verified": True,
            },
            {
                "email": "info@medhospitality.com",
                "password": "SecurePass123",
                "company_name": "Mediterranean Hospitality Group",
                "industry": "Hospitality",
                "location": "Athens, Greece",
                "country": "Greece",
                "description": "Premium hospitality services",
                "website": "https://medhospitality.com",
                "verified": True,
            },
        ]

        companies = []
        for company_data in companies_data:
            password = company_data.pop("password")
            company = Company(
                **company_data, hashed_password=get_password_hash(password)
            )
            db.add(company)
            companies.append(company)

        db.commit()
        print(f"✅ Created {len(companies)} sample companies")

        # Refresh to get IDs
        for company in companies:
            db.refresh(company)

        # Create sample jobs
        jobs_data = [
            {
                "company_id": companies[0].id,
                "title": "Construction Worker",
                "description": "General construction work including heavy lifting, scaffolding, and site preparation. Experience preferred but not required.",
                "location": "Dubai, UAE",
                "salary": "$800-1200/month",
                "requirements": "Physical fitness, willingness to work outdoors, basic safety training",
                "benefits": "Housing provided, health insurance, annual bonus",
            },
            {
                "company_id": companies[1].id,
                "title": "Agricultural Worker",
                "description": "Seasonal farm work including harvesting, planting, and crop maintenance. Housing provided on-site.",
                "location": "California, USA",
                "salary": "$15-18/hour",
                "requirements": "No experience necessary, training provided",
                "benefits": "Housing, meals, transportation, overtime pay",
            },
            {
                "company_id": companies[2].id,
                "title": "Hotel Staff",
                "description": "Various positions available in housekeeping, kitchen, and front desk. Full training provided.",
                "location": "Athens, Greece",
                "salary": "€1200-1500/month",
                "requirements": "Customer service skills, basic English",
                "benefits": "Meals, uniform, tips, career advancement",
            },
        ]

        jobs = []
        for job_data in jobs_data:
            job = Job(**job_data)
            db.add(job)
            jobs.append(job)

        db.commit()
        print(f"✅ Created {len(jobs)} sample jobs")

        # Refresh to get IDs
        for job in jobs:
            db.refresh(job)

        # Create sample reviews
        reviews_data = [
            {
                "company_id": companies[0].id,
                "job_id": jobs[0].id,
                "rating_work_conditions": 2.0,
                "rating_pay": 3.0,
                "rating_treatment": 1.5,
                "rating_safety": 2.0,
                "comment": "Long hours with minimal breaks. Safety equipment not always provided. Pay was delayed multiple times. Management needs improvement.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[1].id,
                "job_id": jobs[1].id,
                "rating_work_conditions": 4.0,
                "rating_pay": 3.5,
                "rating_treatment": 4.0,
                "rating_safety": 3.5,
                "comment": "Fair treatment and decent pay. Housing conditions could be better but management is responsive to concerns. Overall positive experience.",
                "is_anonymous": False,
                "verified_employee": True,
            },
            {
                "company_id": companies[2].id,
                "job_id": jobs[2].id,
                "rating_work_conditions": 4.5,
                "rating_pay": 4.0,
                "rating_treatment": 4.5,
                "rating_safety": 4.0,
                "comment": "Excellent working environment. Management treats staff with respect. Good opportunities for advancement. Highly recommend!",
                "is_anonymous": False,
                "verified_employee": True,
            },
        ]

        reviews = []
        for review_data in reviews_data:
            review = Review(**review_data)
            db.add(review)
            reviews.append(review)

        db.commit()
        print(f"✅ Created {len(reviews)} sample reviews")

        # Update company ratings based on reviews
        for company in companies:
            company_reviews = [r for r in reviews if r.company_id == company.id]
            if company_reviews:
                total = len(company_reviews)
                company.rating_work_conditions = (
                    sum(r.rating_work_conditions for r in company_reviews) / total
                )
                company.rating_pay = sum(r.rating_pay for r in company_reviews) / total
                company.rating_treatment = (
                    sum(r.rating_treatment for r in company_reviews) / total
                )
                company.rating_safety = (
                    sum(r.rating_safety for r in company_reviews) / total
                )
                company.overall_rating = (
                    company.rating_work_conditions
                    + company.rating_pay
                    + company.rating_treatment
                    + company.rating_safety
                ) / 4
                company.total_reviews = total
                company.trust_score = company.overall_rating

        db.commit()
        print("✅ Updated company ratings")

        # Create sample support organizations
        support_orgs_data = [
            {
                "name": "Migrant Workers Rights Center",
                "type": "Legal Aid",
                "latitude": 25.2048,
                "longitude": 55.2708,
                "address": "123 Sheikh Zayed Road, Dubai, UAE",
                "contact": "+971-4-123-4567",
                "email": "help@mwrc.ae",
                "services": json.dumps(
                    [
                        "Legal consultation",
                        "Contract review",
                        "Dispute resolution",
                        "Rights education",
                    ]
                ),
                "open_hours": "Mon-Fri: 9AM-6PM",
                "description": "Providing legal support and advocacy for migrant workers",
            },
            {
                "name": "International Labor Organization",
                "type": "NGO",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "address": "456 Market Street, San Francisco, CA",
                "contact": "+1-415-555-0123",
                "email": "support@ilo-usa.org",
                "services": json.dumps(
                    [
                        "Worker advocacy",
                        "Fair labor standards",
                        "Training programs",
                        "Emergency assistance",
                    ]
                ),
                "open_hours": "Mon-Fri: 8AM-5PM",
                "description": "Global organization promoting workers' rights",
            },
        ]

        support_orgs = []
        for org_data in support_orgs_data:
            org = SupportOrganization(**org_data)
            db.add(org)
            support_orgs.append(org)

        db.commit()
        print(f"✅ Created {len(support_orgs)} support organizations")

        print("\n✅ Sample data seeded successfully!")
        print("\n📊 Summary:")
        print(f"   - Companies: {len(companies)}")
        print(f"   - Jobs: {len(jobs)}")
        print(f"   - Reviews: {len(reviews)}")
        print(f"   - Support Organizations: {len(support_orgs)}")

        print("\n🔑 Test Credentials:")
        for company in companies:
            print(f"   - {company.email} / SecurePass123")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()
        engine.dispose()


def main():
    """Main setup function"""
    print("=" * 60)
    print("🚀 Korus Collective Voice- Database Setup")
    print("=" * 60)

    try:
        # Step 1: Create database
        create_database()

        # Step 2: Create tables
        create_tables()

        # Step 3: Ask about sample data
        response = input("\n❓ Would you like to seed sample data? (y/n): ").lower()
        if response == "y":
            seed_sample_data()
        else:
            print("ℹ️  Skipping sample data seeding")

        print("\n" + "=" * 60)
        print("✅ Database setup completed successfully!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. Start the API server: uvicorn main:app --reload")
        print("   2. Visit API docs: http://localhost:8000/docs")
        print("   3. Test the endpoints using the interactive documentation")
        print("\n")

    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
