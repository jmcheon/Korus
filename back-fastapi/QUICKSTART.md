# Quick Start Guide - Korus Collective VoiceBackend

Get your FastAPI backend up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Python 3.8 or higher
- ✅ MySQL 8.0 or higher
- ✅ pip (Python package manager)

## Step-by-Step Setup

### 1. Install MySQL (if not already installed)

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**macOS:**

```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download from: https://dev.mysql.com/downloads/installer/

### 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to set a root password and secure your installation.

### 3. Create Database

```bash
# Login to MySQL
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE korus_platform;
EXIT;
```

### 4. Set Up Python Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Update these values in `.env`:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=korus_platform

# Generate a secure secret key:
# Run: openssl rand -hex 32
SECRET_KEY=paste_generated_key_here
```

### 6. Initialize Database

```bash
# Run setup script
python setup_database.py
```

When prompted, type `y` to seed sample data (recommended for testing).

### 7. Start the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 8. Test the API

Open your browser and visit:

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000

Or run the test script:

```bash
# In a new terminal (keep server running)
python test_api.py
```

## Quick Test with Sample Data

If you seeded sample data, you can login with these credentials:

**Company 1:**

- Email: `contact@globalconstruction.com`
- Password: `SecurePass123`

**Company 2:**

- Email: `hr@pacificag.com`
- Password: `SecurePass123`

**Company 3:**

- Email: `info@medhospitality.com`
- Password: `SecurePass123`

## Testing with curl

### Register a New Company

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mycompany@example.com",
    "password": "SecurePass123",
    "company_name": "My Company",
    "industry": "Technology",
    "location": "New York, NY",
    "country": "USA"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=mycompany@example.com&password=SecurePass123"
```

Save the `access_token` from the response.

### Get All Companies

```bash
curl -X GET "http://localhost:8000/api/companies"
```

### Create a Review

```bash
curl -X POST "http://localhost:8000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "rating_work_conditions": 4.5,
    "rating_pay": 4.0,
    "rating_treatment": 4.5,
    "rating_safety": 4.0,
    "comment": "Great company to work for!",
    "is_anonymous": true
  }'
```

## Common Issues & Solutions

### Issue: "Can't connect to MySQL server"

**Solution:**

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
```

### Issue: "Database does not exist"

**Solution:**

```bash
mysql -u root -p
CREATE DATABASE korus_platform;
EXIT;
```

### Issue: "ModuleNotFoundError"

**Solution:**

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Port 8000 already in use"

**Solution:**

```bash
# Use a different port
uvicorn main:app --reload --port 8001

# Or kill the process using port 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Test Endpoints**: Use the interactive documentation
3. **Integrate with Frontend**: Update React app to use the API
4. **Customize**: Modify models and endpoints as needed
5. **Deploy**: Follow deployment guide for production

## API Endpoints Overview

### Authentication

- `POST /api/auth/register` - Register company
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current company info

### Companies

- `GET /api/companies` - List all companies
- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/me` - Update profile
- `DELETE /api/companies/me` - Delete account

### Reviews

- `GET /api/reviews` - List all reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/{id}` - Get review details

### Jobs

- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job (auth required)
- `GET /api/jobs/{id}` - Get job details
- `PUT /api/jobs/{id}` - Update job (auth required)
- `DELETE /api/jobs/{id}` - Delete job (auth required)

### Statistics

- `GET /api/statistics/platform` - Platform statistics
- `GET /api/statistics/company/{id}` - Company statistics

## Development Tips

1. **Auto-reload**: Use `--reload` flag during development
2. **Debug Mode**: Set `DEBUG=True` in `.env`
3. **SQL Logging**: Set `echo=True` in `database.py`
4. **API Testing**: Use the interactive docs at `/docs`
5. **Database GUI**: Use MySQL Workbench or phpMyAdmin

## Production Deployment

For production deployment:

1. Use a production-grade WSGI server (Gunicorn)
2. Set up HTTPS with SSL certificates
3. Use environment variables for sensitive data
4. Enable rate limiting
5. Set up monitoring and logging
6. Use a reverse proxy (Nginx)

See `README.md` for detailed deployment instructions.

## Support

- **Documentation**: See `README.md`
- **Issues**: Check common issues above
- **API Docs**: http://localhost:8000/docs

Happy coding! 🚀
