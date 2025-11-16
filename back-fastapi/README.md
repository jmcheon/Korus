# Korus Collective Voice- FastAPI Backend

FastAPI backend with MySQL database for the Korus migrant worker platform, featuring company authentication, reviews, job listings, and more.

## Features

- ✅ **Company Authentication**: Register and login with JWT tokens
- ✅ **MySQL Database**: Robust relational database with SQLAlchemy ORM
- ✅ **Secure Password Hashing**: Using bcrypt
- ✅ **Company Management**: CRUD operations for company profiles
- ✅ **Review System**: Anonymous and verified employee reviews
- ✅ **Job Listings**: Companies can post and manage job listings
- ✅ **Rating System**: Automatic calculation of company ratings
- ✅ **Statistics API**: Platform-wide and company-specific statistics
- ✅ **CORS Support**: Ready for React frontend integration

## Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## Installation

### 1. Install MySQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS:**

```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download and install from [MySQL Official Website](https://dev.mysql.com/downloads/installer/)

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE korus_platform;

# Create user (optional, recommended for production)
CREATE USER 'korus_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON korus_platform.* TO 'korus_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Set Up Python Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

Update the following in `.env`:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=korus_platform

SECRET_KEY=generate-a-secure-random-key-here
```

**Generate a secure SECRET_KEY:**

```bash
openssl rand -hex 32
```

## Running the Server

### Development Mode

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Authentication

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register new company     |
| POST   | `/api/auth/login`    | Login and get JWT token  |
| GET    | `/api/auth/me`       | Get current company info |

### Companies

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | `/api/companies`      | Get all companies (public) |
| GET    | `/api/companies/{id}` | Get company by ID          |
| PUT    | `/api/companies/me`   | Update company profile     |
| DELETE | `/api/companies/me`   | Delete company account     |

### Reviews

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/reviews`      | Get all reviews   |
| POST   | `/api/reviews`      | Create new review |
| GET    | `/api/reviews/{id}` | Get review by ID  |

### Jobs

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| GET    | `/api/jobs`      | Get all jobs                       |
| POST   | `/api/jobs`      | Create job listing (auth required) |
| GET    | `/api/jobs/{id}` | Get job by ID                      |
| PUT    | `/api/jobs/{id}` | Update job (auth required)         |
| DELETE | `/api/jobs/{id}` | Delete job (auth required)         |

### Statistics

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/statistics/platform`     | Platform-wide statistics    |
| GET    | `/api/statistics/company/{id}` | Company-specific statistics |

## Usage Examples

### Register a Company

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@example.com",
    "password": "SecurePass123",
    "company_name": "Example Corp",
    "industry": "Technology",
    "location": "San Francisco, CA",
    "country": "USA"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=company@example.com&password=SecurePass123"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "company_id": 1,
  "company_name": "Example Corp"
}
```

### Create a Review (Anonymous)

```bash
curl -X POST "http://localhost:8000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "rating_work_conditions": 4.5,
    "rating_pay": 4.0,
    "rating_treatment": 4.5,
    "rating_safety": 4.0,
    "comment": "Great company to work for. Fair treatment and good working conditions.",
    "is_anonymous": true
  }'
```

### Create a Job Listing (Authenticated)

```bash
curl -X POST "http://localhost:8000/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company_id": 1,
    "title": "Software Engineer",
    "description": "We are looking for a talented software engineer...",
    "location": "San Francisco, CA",
    "salary": "$80,000 - $120,000/year"
  }'
```

## Database Schema

### Companies Table

- id, email, hashed_password, company_name, industry, location, country
- overall_rating, total_reviews, trust_score, verified
- rating_work_conditions, rating_pay, rating_treatment, rating_safety

### Reviews Table

- id, company_id, job_id
- rating_work_conditions, rating_pay, rating_treatment, rating_safety
- comment, is_anonymous, verified_employee, helpful_count

### Jobs Table

- id, company_id, title, description, location, salary
- requirements, benefits, is_active, posted_at

### Support Organizations Table

- id, name, type, latitude, longitude, address
- contact, email, services, open_hours

## Testing

### Using Interactive Docs

1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button
3. Login to get token
4. Use token for authenticated endpoints

### Using curl

See examples above in "Usage Examples" section.

### Using Python requests

```python
import requests

# Register
response = requests.post(
    "http://localhost:8000/api/auth/register",
    json={
        "email": "test@example.com",
        "password": "SecurePass123",
        "company_name": "Test Company",
        "industry": "Technology",
        "location": "New York, NY",
        "country": "USA"
    }
)
print(response.json())

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={
        "username": "test@example.com",
        "password": "SecurePass123"
    }
)
token = response.json()["access_token"]

# Get current company info
response = requests.get(
    "http://localhost:8000/api/auth/me",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())
```

## Security Considerations

1. **Change SECRET_KEY**: Generate a secure random key for production
2. **Use HTTPS**: Always use HTTPS in production
3. **Database Security**: Use strong passwords and limit database access
4. **Environment Variables**: Never commit `.env` file to version control
5. **Rate Limiting**: Consider adding rate limiting for production
6. **Input Validation**: All inputs are validated using Pydantic schemas

## Troubleshooting

### MySQL Connection Error

```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")
```

**Solution:**

- Check if MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env` file
- Check MySQL port (default: 3306)

### Import Error

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**

- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Database Does Not Exist

```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (1049, "Unknown database 'korus_platform'")
```

**Solution:**

- Create database: `CREATE DATABASE korus_platform;`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:

- GitHub Issues: [Create an issue]
- Email: support@korus-platform.com

## Roadmap

- [ ] Email verification for companies
- [ ] Password reset functionality
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] File upload for company logos
- [ ] API rate limiting
- [ ] Caching with Redis
- [ ] Elasticsearch integration
- [ ] GraphQL API
