
from auth import get_password_hash
from database import SQLALCHEMY_DATABASE_URL
from models import Company, Job, Review, SupportOrganization
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def seed_mock_data():
    """Seed database with French companies and related data"""
    print("\nSeeding mock data...")

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # French Companies Data (from frontend)
        companies_data = [
            {
                "email": "contact@btpservices-paris.fr",
                "password": "SecurePass123",
                "company_name": "BTP Services Paris",
                "industry": "Construction",
                "location": "Paris, France",
                "country": "France",
                "description": "Services de construction générale à Paris",
                "website": "https://btpservices-paris.fr",
                "phone": "+33 1 23 45 67 89",
                "overall_rating": 1.8,
                "total_reviews": 234,
                "social_media_score": 2.8,
                "trust_score": 1.5,
                "external_platform_score": 3.4,
                "verified": False,
                "rating_work_conditions": 1.5,
                "rating_pay": 2.0,
                "rating_treatment": 1.8,
                "rating_safety": 2.0,
                "latitude": 48.8566,
                "longitude": 2.3522,
            },
            {
                "email": "contact@nettoyage-lyon.fr",
                "password": "SecurePass123",
                "company_name": "Nettoyage Express Lyon",
                "industry": "Cleaning Services",
                "location": "Lyon, France",
                "country": "France",
                "description": "Services de nettoyage professionnel à Lyon",
                "website": "https://nettoyage-lyon.fr",
                "phone": "+33 4 78 90 12 34",
                "overall_rating": 2.1,
                "total_reviews": 187,
                "social_media_score": 3.1,
                "trust_score": 1.9,
                "external_platform_score": 3.6,
                "verified": False,
                "rating_work_conditions": 2.0,
                "rating_pay": 1.8,
                "rating_treatment": 2.3,
                "rating_safety": 2.3,
                "latitude": 45.7640,
                "longitude": 4.8357,
            },
            {
                "email": "contact@agro-provence.fr",
                "password": "SecurePass123",
                "company_name": "Agro-Travail Provence",
                "industry": "Agriculture",
                "location": "Avignon, France",
                "country": "France",
                "description": "Travaux agricoles en Provence",
                "website": "https://agro-provence.fr",
                "phone": "+33 4 90 12 34 56",
                "overall_rating": 1.9,
                "total_reviews": 156,
                "social_media_score": 2.4,
                "trust_score": 1.6,
                "external_platform_score": 3.2,
                "verified": False,
                "rating_work_conditions": 1.6,
                "rating_pay": 2.1,
                "rating_treatment": 1.9,
                "rating_safety": 2.0,
                "latitude": 43.9493,
                "longitude": 4.8055,
            },
            {
                "email": "contact@hotel-cotedazur.fr",
                "password": "SecurePass123",
                "company_name": "Hôtel Services Côte d'Azur",
                "industry": "Hospitality",
                "location": "Nice, France",
                "country": "France",
                "description": "Services hôteliers sur la Côte d'Azur",
                "website": "https://hotel-cotedazur.fr",
                "phone": "+33 4 93 12 34 56",
                "overall_rating": 2.4,
                "total_reviews": 203,
                "social_media_score": 3.5,
                "trust_score": 2.2,
                "external_platform_score": 3.8,
                "verified": True,
                "rating_work_conditions": 2.3,
                "rating_pay": 2.2,
                "rating_treatment": 2.6,
                "rating_safety": 2.5,
                "latitude": 43.7102,
                "longitude": 7.2620,
            },
            {
                "email": "contact@logistique-marseille.fr",
                "password": "SecurePass123",
                "company_name": "Logistique Marseille Port",
                "industry": "Logistics",
                "location": "Marseille, France",
                "country": "France",
                "description": "Services logistiques au port de Marseille",
                "website": "https://logistique-marseille.fr",
                "phone": "+33 4 91 12 34 56",
                "overall_rating": 2.6,
                "total_reviews": 178,
                "social_media_score": 3.2,
                "trust_score": 2.4,
                "external_platform_score": 3.7,
                "verified": False,
                "rating_work_conditions": 2.5,
                "rating_pay": 2.8,
                "rating_treatment": 2.6,
                "rating_safety": 2.5,
                "latitude": 43.2965,
                "longitude": 5.3698,
            },
            {
                "email": "contact@restauration-paris.fr",
                "password": "SecurePass123",
                "company_name": "Restauration Rapide Paris",
                "industry": "Food Service",
                "location": "Paris, France",
                "country": "France",
                "description": "Chaîne de restauration rapide à Paris",
                "website": "https://restauration-paris.fr",
                "phone": "+33 1 45 67 89 01",
                "overall_rating": 2.3,
                "total_reviews": 312,
                "social_media_score": 3.3,
                "trust_score": 2.1,
                "external_platform_score": 3.5,
                "verified": True,
                "rating_work_conditions": 2.1,
                "rating_pay": 2.3,
                "rating_treatment": 2.5,
                "rating_safety": 2.4,
                "latitude": 48.8566,
                "longitude": 2.3522,
            },
            {
                "email": "contact@textile-lille.fr",
                "password": "SecurePass123",
                "company_name": "Textile Industrie Lille",
                "industry": "Manufacturing",
                "location": "Lille, France",
                "country": "France",
                "description": "Industrie textile à Lille",
                "website": "https://textile-lille.fr",
                "phone": "+33 3 20 12 34 56",
                "overall_rating": 2.8,
                "total_reviews": 145,
                "social_media_score": 3.1,
                "trust_score": 2.6,
                "external_platform_score": 3.6,
                "verified": False,
                "rating_work_conditions": 2.7,
                "rating_pay": 2.9,
                "rating_treatment": 2.8,
                "rating_safety": 2.8,
                "latitude": 50.6292,
                "longitude": 3.0573,
            },
            {
                "email": "contact@soins-bordeaux.fr",
                "password": "SecurePass123",
                "company_name": "Soins à Domicile Bordeaux",
                "industry": "Healthcare",
                "location": "Bordeaux, France",
                "country": "France",
                "description": "Services de soins à domicile à Bordeaux",
                "website": "https://soins-bordeaux.fr",
                "phone": "+33 5 56 12 34 56",
                "overall_rating": 3.4,
                "total_reviews": 198,
                "social_media_score": 3.8,
                "trust_score": 3.3,
                "external_platform_score": 4.1,
                "verified": True,
                "rating_work_conditions": 3.3,
                "rating_pay": 3.4,
                "rating_treatment": 3.6,
                "rating_safety": 3.4,
                "latitude": 44.8378,
                "longitude": -0.5792,
            },
            {
                "email": "contact@entretien-toulouse.fr",
                "password": "SecurePass123",
                "company_name": "Entretien Ménager Toulouse",
                "industry": "Cleaning Services",
                "location": "Toulouse, France",
                "country": "France",
                "description": "Services d'entretien ménager à Toulouse",
                "website": "https://entretien-toulouse.fr",
                "phone": "+33 5 61 12 34 56",
                "overall_rating": 2.2,
                "total_reviews": 167,
                "social_media_score": 3.0,
                "trust_score": 2.0,
                "external_platform_score": 3.4,
                "verified": False,
                "rating_work_conditions": 2.0,
                "rating_pay": 2.3,
                "rating_treatment": 2.3,
                "rating_safety": 2.2,
                "latitude": 43.6047,
                "longitude": 1.4442,
            },
            {
                "email": "contact@batiment-strasbourg.fr",
                "password": "SecurePass123",
                "company_name": "Bâtiment Rénovation Strasbourg",
                "industry": "Construction",
                "location": "Strasbourg, France",
                "country": "France",
                "description": "Rénovation de bâtiments à Strasbourg",
                "website": "https://batiment-strasbourg.fr",
                "phone": "+33 3 88 12 34 56",
                "overall_rating": 2.5,
                "total_reviews": 134,
                "social_media_score": 3.1,
                "trust_score": 2.3,
                "external_platform_score": 3.5,
                "verified": False,
                "rating_work_conditions": 2.4,
                "rating_pay": 2.6,
                "rating_treatment": 2.5,
                "rating_safety": 2.5,
                "latitude": 48.5734,
                "longitude": 7.7521,
            },
            {
                "email": "contact@techinnovation-paris.fr",
                "password": "SecurePass123",
                "company_name": "Tech Innovation Paris",
                "industry": "Technology",
                "location": "Paris, France",
                "country": "France",
                "description": "Innovation technologique à Paris",
                "website": "https://techinnovation-paris.fr",
                "phone": "+33 1 56 78 90 12",
                "overall_rating": 4.2,
                "total_reviews": 156,
                "social_media_score": 4.3,
                "trust_score": 4.1,
                "external_platform_score": 4.5,
                "verified": True,
                "rating_work_conditions": 4.3,
                "rating_pay": 4.2,
                "rating_treatment": 4.1,
                "rating_safety": 4.2,
                "latitude": 48.8566,
                "longitude": 2.3522,
            },
            {
                "email": "contact@securite-lyon.fr",
                "password": "SecurePass123",
                "company_name": "Sécurité Privée Lyon",
                "industry": "Security Services",
                "location": "Lyon, France",
                "country": "France",
                "description": "Services de sécurité privée à Lyon",
                "website": "https://securite-lyon.fr",
                "phone": "+33 4 72 12 34 56",
                "overall_rating": 2.7,
                "total_reviews": 189,
                "social_media_score": 3.3,
                "trust_score": 2.5,
                "external_platform_score": 3.7,
                "verified": True,
                "rating_work_conditions": 2.6,
                "rating_pay": 2.8,
                "rating_treatment": 2.7,
                "rating_safety": 2.7,
                "latitude": 45.7640,
                "longitude": 4.8357,
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
        print(f"Created {len(companies)} French companies")

        # Refresh to get IDs
        for company in companies:
            db.refresh(company)

        # Sample Jobs Data
        jobs_data = [
            {
                "company_id": companies[0].id,  # BTP Services Paris
                "title": "Ouvrier de Chantier",
                "description": "Travaux de construction générale incluant manutention lourde, échafaudage et préparation de site.",
                "location": "Paris, France",
                "salary": "€1,400-1,600/mois",
                "requirements": "Expérience en construction souhaitée, formation en sécurité",
                "benefits": "Équipement fourni, transport",
            },
            {
                "company_id": companies[1].id,  # Nettoyage Express Lyon
                "title": "Agent de Nettoyage",
                "description": "Nettoyage de bureaux et espaces commerciaux. Horaires de nuit possibles.",
                "location": "Lyon, France",
                "salary": "€1,300-1,450/mois",
                "requirements": "Aucune expérience requise, formation fournie",
                "benefits": "Horaires flexibles, équipement fourni",
            },
            {
                "company_id": companies[2].id,  # Agro-Travail Provence
                "title": "Travailleur Agricole Saisonnier",
                "description": "Récolte de fruits et légumes. Travail saisonnier de mars à octobre.",
                "location": "Avignon, France",
                "salary": "€1,200-1,400/mois",
                "requirements": "Bonne condition physique, disponibilité saisonnière",
                "benefits": "Logement fourni, repas",
            },
            {
                "company_id": companies[3].id,  # Hôtel Services Côte d'Azur
                "title": "Femme de Chambre",
                "description": "Entretien des chambres d'hôtel. Travail le week-end requis.",
                "location": "Nice, France",
                "salary": "€1,350-1,500/mois",
                "requirements": "Expérience en hôtellerie appréciée",
                "benefits": "Pourboires, repas, uniforme",
            },
            {
                "company_id": companies[5].id,  # Restauration Rapide Paris
                "title": "Équipier Polyvalent",
                "description": "Service en salle et préparation. Horaires flexibles.",
                "location": "Paris, France",
                "salary": "€1,400-1,550/mois",
                "requirements": "Sens du service client, dynamisme",
                "benefits": "Repas gratuits, formation",
            },
        ]

        jobs = []
        for job_data in jobs_data:
            job = Job(**job_data)
            db.add(job)
            jobs.append(job)

        db.commit()
        print(f"Created {len(jobs)} job listings")

        # Refresh to get IDs
        for job in jobs:
            db.refresh(job)

        # Sample Reviews Data (matching frontend reviews)
        reviews_data = [
            {
                "company_id": companies[0].id,  # BTP Services Paris
                "job_id": jobs[0].id,
                "rating_work_conditions": 1.5,
                "rating_pay": 2.0,
                "rating_treatment": 1.8,
                "rating_safety": 2.0,
                "comment": "Horaires très longs sans pauses suffisantes. Équipement de sécurité rarement fourni. Salaires payés en retard plusieurs fois. Pas de contrat écrit clair.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[0].id,  # BTP Services Paris
                "job_id": jobs[0].id,
                "rating_work_conditions": 1.5,
                "rating_pay": 2.0,
                "rating_treatment": 1.8,
                "rating_safety": 2.0,
                "comment": "Conditions de travail dangereuses. Le patron ne respecte pas le droit du travail. Heures supplémentaires non payées.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[1].id,  # Nettoyage Express Lyon
                "job_id": jobs[1].id,
                "rating_work_conditions": 2.0,
                "rating_pay": 1.8,
                "rating_treatment": 2.3,
                "rating_safety": 2.3,
                "comment": "Salaire minimum malgré beaucoup de travail. Produits chimiques sans formation adéquate. Pas de pause déjeuner respectée.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[2].id,  # Agro-Travail Provence
                "job_id": jobs[2].id,
                "rating_work_conditions": 1.6,
                "rating_pay": 2.1,
                "rating_treatment": 1.9,
                "rating_safety": 2.0,
                "comment": "Travail sous le soleil sans eau suffisante. Logement insalubre. Pas de jours de repos. Menaces si on se plaint.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[3].id,  # Hôtel Services Côte d'Azur
                "job_id": jobs[3].id,
                "rating_work_conditions": 2.3,
                "rating_pay": 2.2,
                "rating_treatment": 2.6,
                "rating_safety": 2.5,
                "comment": "Beaucoup de chambres à nettoyer en peu de temps. Salaire correct mais horaires épuisants. Management parfois irrespectueux.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[5].id,  # Restauration Rapide Paris
                "job_id": jobs[4].id,
                "rating_work_conditions": 2.1,
                "rating_pay": 2.3,
                "rating_treatment": 2.5,
                "rating_safety": 2.4,
                "comment": "Rythme de travail très intense. Pas assez de personnel. Pauses souvent annulées. Ambiance stressante.",
                "is_anonymous": True,
                "verified_employee": True,
            },
            {
                "company_id": companies[10].id,  # Tech Innovation Paris
                "job_id": None,
                "rating_work_conditions": 4.3,
                "rating_pay": 4.2,
                "rating_treatment": 4.1,
                "rating_safety": 4.2,
                "comment": "Excellente entreprise. Respect du code du travail. Bonne ambiance. Salaire juste et payé à temps. Je recommande.",
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
        print(f"Created {len(reviews)} worker reviews")

        # Support Organizations in France
        support_orgs_data = [
            {
                "name": "Centre d'Aide aux Travailleurs Migrants",
                "type": "Legal Aid",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "address": "15 Rue de la République, 75001 Paris, France",
                "contact": "+33 1 42 60 00 00",
                "email": "aide@travailleurs-migrants.fr",
                "services":
                    [
                        "Consultation juridique",
                        "Révision de contrats",
                        "Résolution de litiges",
                        "Éducation aux droits",
                    ]
                ,
                "open_hours": "Lun-Ven: 9h-18h",
                "description": "Assistance juridique pour les travailleurs migrants en France",
                "website": "https://travailleurs-migrants.fr",
            },
            {
                "name": "Médecins du Travail Lyon",
                "type": "Healthcare",
                "latitude": 45.7640,
                "longitude": 4.8357,
                "address": "25 Avenue Jean Jaurès, 69007 Lyon, France",
                "contact": "+33 4 78 60 00 00",
                "email": "contact@medecins-travail-lyon.fr",
                "services": 
                    [
                        "Examens médicaux gratuits",
                        "Soutien en santé mentale",
                        "Santé au travail",
                        "Soins d'urgence",
                    ]
                ,
                "open_hours": "Lun-Sam: 8h-20h",
                "description": "Services de santé pour les travailleurs",
                "website": "https://medecins-travail-lyon.fr",
            },
            {
                "name": "Logement Solidaire Marseille",
                "type": "Housing",
                "latitude": 43.2965,
                "longitude": 5.3698,
                "address": "10 Boulevard de la Libération, 13001 Marseille, France",
                "contact": "+33 4 91 50 00 00",
                "email": "contact@logement-solidaire.fr",
                "services": 
                    [
                        "Hébergement d'urgence",
                        "Aide au logement",
                        "Logement temporaire",
                        "Défense des droits au logement",
                    ]
                ,
                "open_hours": "24/7 Ligne d'urgence",
                "description": "Assistance au logement pour les travailleurs",
                "website": "https://logement-solidaire.fr",
            },
            {
                "name": "Syndicat des Travailleurs Unis",
                "type": "Labor Rights",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "address": "50 Rue du Faubourg Saint-Antoine, 75012 Paris, France",
                "contact": "+33 1 43 40 00 00",
                "email": "contact@syndicat-travailleurs.fr",
                "services": 
                    [
                        "Représentation syndicale",
                        "Résolution de litiges salariaux",
                        "Inspections de sécurité",
                        "Soutien aux négociations collectives",
                    ]
                ,
                "open_hours": "Lun-Ven: 9h-19h, Sam: 10h-14h",
                "description": "Protection des droits des travailleurs en France",
                "website": "https://syndicat-travailleurs.fr",
            },
            {
                "name": "ONG Solidarité Migrants",
                "type": "NGO",
                "latitude": 43.6047,
                "longitude": 1.4442,
                "address": "30 Allée Jean Jaurès, 31000 Toulouse, France",
                "contact": "+33 5 61 20 00 00",
                "email": "info@solidarite-migrants.org",
                "services": 
                    [
                        "Défense des travailleurs",
                        "Normes de travail équitables",
                        "Programmes de formation",
                        "Assistance d'urgence",
                    ]
                ,
                "open_hours": "Lun-Ven: 8h-17h",
                "description": "Organisation mondiale promouvant les droits des travailleurs",
                "website": "https://solidarite-migrants.org",
            },
        ]

        support_orgs = []
        for org_data in support_orgs_data:
            org = SupportOrganization(**org_data)
            db.add(org)
            support_orgs.append(org)

        db.commit()
        print(f"Created {len(support_orgs)} support organizations")

        print("\nMock data seeded successfully!")
        print("\nSummary:")
        print(f"   - Companies: {len(companies)}")
        print(f"   - Jobs: {len(jobs)}")
        print(f"   - Reviews: {len(reviews)}")
        print(f"   - Support Organizations: {len(support_orgs)}")

        print("\nTest Credentials (all use password: SecurePass123):")
        for i, company in enumerate(companies[:5], 1):
            print(f"   {i}. {company.email}")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()
        engine.dispose()


if __name__ == "__main__":
    seed_mock_data()
