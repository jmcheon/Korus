"""
API Testing Script for Korus Worker Platform
Tests all major endpoints to ensure functionality
"""

from typing import Optional

import requests

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test_company@example.com"
TEST_PASSWORD = "TestPass123"


class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.company_id: Optional[int] = None
        self.test_results = []

    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append(
            {"test": test_name, "success": success, "message": message}
        )
        print(f"{status} - {test_name}")
        if message:
            print(f"   {message}")

    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            success = response.status_code == 200
            self.log_test("Root Endpoint", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Root Endpoint", False, str(e))
            return False

    def test_register_company(self):
        """Test company registration"""
        try:
            data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "company_name": "Test Company Inc.",
                "industry": "Technology",
                "location": "San Francisco, CA",
                "country": "USA",
                "description": "A test company for API testing",
                "website": "https://testcompany.com",
            }

            response = requests.post(f"{self.base_url}/api/auth/register", json=data)

            if response.status_code == 201:
                result = response.json()
                self.company_id = result.get("id")
                self.log_test(
                    "Company Registration", True, f"Company ID: {self.company_id}"
                )
                return True
            elif response.status_code == 400 and "already registered" in response.text:
                self.log_test(
                    "Company Registration", True, "Company already exists (expected)"
                )
                return True
            else:
                self.log_test(
                    "Company Registration",
                    False,
                    f"Status: {response.status_code}, {response.text}",
                )
                return False
        except Exception as e:
            self.log_test("Company Registration", False, str(e))
            return False

    def test_login(self):
        """Test company login"""
        try:
            data = {"username": TEST_EMAIL, "password": TEST_PASSWORD}

            response = requests.post(f"{self.base_url}/api/auth/login", data=data)

            if response.status_code == 200:
                result = response.json()
                self.token = result.get("access_token")
                self.company_id = result.get("company_id")
                self.log_test(
                    "Company Login",
                    True,
                    f"Token received, Company ID: {self.company_id}",
                )
                return True
            else:
                self.log_test(
                    "Company Login",
                    False,
                    f"Status: {response.status_code}, {response.text}",
                )
                return False
        except Exception as e:
            self.log_test("Company Login", False, str(e))
            return False

    def test_get_current_company(self):
        """Test getting current company info"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/api/auth/me", headers=headers)

            success = response.status_code == 200
            if success:
                result = response.json()
                self.log_test(
                    "Get Current Company",
                    True,
                    f"Company: {result.get('company_name')}",
                )
            else:
                self.log_test(
                    "Get Current Company", False, f"Status: {response.status_code}"
                )
            return success
        except Exception as e:
            self.log_test("Get Current Company", False, str(e))
            return False

    def test_get_all_companies(self):
        """Test getting all companies"""
        try:
            response = requests.get(f"{self.base_url}/api/companies")

            if response.status_code == 200:
                companies = response.json()
                self.log_test(
                    "Get All Companies", True, f"Found {len(companies)} companies"
                )
                return True
            else:
                self.log_test(
                    "Get All Companies", False, f"Status: {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_test("Get All Companies", False, str(e))
            return False

    def test_create_job(self):
        """Test creating a job listing"""
        try:
            if not self.token or not self.company_id:
                self.log_test(
                    "Create Job", False, "No authentication token or company ID"
                )
                return False

            headers = {"Authorization": f"Bearer {self.token}"}
            data = {
                "company_id": self.company_id,
                "title": "Software Engineer",
                "description": "We are looking for a talented software engineer to join our team. Must have experience with Python and FastAPI.",
                "location": "San Francisco, CA",
                "salary": "$80,000 - $120,000/year",
                "requirements": "3+ years experience, Python, FastAPI, MySQL",
                "benefits": "Health insurance, 401k, flexible hours",
            }

            response = requests.post(
                f"{self.base_url}/api/jobs", json=data, headers=headers
            )

            if response.status_code == 201:
                result = response.json()
                self.log_test("Create Job", True, f"Job ID: {result.get('id')}")
                return True
            else:
                self.log_test(
                    "Create Job",
                    False,
                    f"Status: {response.status_code}, {response.text}",
                )
                return False
        except Exception as e:
            self.log_test("Create Job", False, str(e))
            return False

    def test_get_all_jobs(self):
        """Test getting all jobs"""
        try:
            response = requests.get(f"{self.base_url}/api/jobs")

            if response.status_code == 200:
                jobs = response.json()
                self.log_test("Get All Jobs", True, f"Found {len(jobs)} jobs")
                return True
            else:
                self.log_test("Get All Jobs", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Jobs", False, str(e))
            return False

    def test_create_review(self):
        """Test creating a review"""
        try:
            if not self.company_id:
                self.log_test("Create Review", False, "No company ID available")
                return False

            data = {
                "company_id": self.company_id,
                "rating_work_conditions": 4.5,
                "rating_pay": 4.0,
                "rating_treatment": 4.5,
                "rating_safety": 4.0,
                "comment": "Great company to work for! Management is supportive and working conditions are excellent. Fair pay and good benefits.",
                "is_anonymous": True,
                "verified_employee": False,
            }

            response = requests.post(f"{self.base_url}/api/reviews", json=data)

            if response.status_code == 201:
                result = response.json()
                self.log_test("Create Review", True, f"Review ID: {result.get('id')}")
                return True
            else:
                self.log_test(
                    "Create Review",
                    False,
                    f"Status: {response.status_code}, {response.text}",
                )
                return False
        except Exception as e:
            self.log_test("Create Review", False, str(e))
            return False

    def test_get_all_reviews(self):
        """Test getting all reviews"""
        try:
            response = requests.get(f"{self.base_url}/api/reviews")

            if response.status_code == 200:
                reviews = response.json()
                self.log_test("Get All Reviews", True, f"Found {len(reviews)} reviews")
                return True
            else:
                self.log_test(
                    "Get All Reviews", False, f"Status: {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_test("Get All Reviews", False, str(e))
            return False

    def test_platform_statistics(self):
        """Test getting platform statistics"""
        try:
            response = requests.get(f"{self.base_url}/api/statistics/platform")

            if response.status_code == 200:
                stats = response.json()
                self.log_test(
                    "Platform Statistics",
                    True,
                    f"Companies: {stats.get('total_companies')}, Reviews: {stats.get('total_reviews')}",
                )
                return True
            else:
                self.log_test(
                    "Platform Statistics", False, f"Status: {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_test("Platform Statistics", False, str(e))
            return False

    def test_company_statistics(self):
        """Test getting company statistics"""
        try:
            if not self.company_id:
                self.log_test("Company Statistics", False, "No company ID available")
                return False

            response = requests.get(
                f"{self.base_url}/api/statistics/company/{self.company_id}"
            )

            if response.status_code == 200:
                stats = response.json()
                self.log_test(
                    "Company Statistics",
                    True,
                    f"Reviews: {stats.get('total_reviews')}, Rating: {stats.get('average_rating')}",
                )
                return True
            else:
                self.log_test(
                    "Company Statistics", False, f"Status: {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_test("Company Statistics", False, str(e))
            return False

    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("🧪 Korus Collective Voice- API Testing")
        print("=" * 60)
        print(f"Testing API at: {self.base_url}\n")

        # Test sequence
        tests = [
            ("Root Endpoint", self.test_root_endpoint),
            ("Company Registration", self.test_register_company),
            ("Company Login", self.test_login),
            ("Get Current Company", self.test_get_current_company),
            ("Get All Companies", self.test_get_all_companies),
            ("Create Job", self.test_create_job),
            ("Get All Jobs", self.test_get_all_jobs),
            ("Create Review", self.test_create_review),
            ("Get All Reviews", self.test_get_all_reviews),
            ("Platform Statistics", self.test_platform_statistics),
            ("Company Statistics", self.test_company_statistics),
        ]

        print("Running tests...\n")
        for test_name, test_func in tests:
            test_func()
            print()

        # Summary
        print("=" * 60)
        print("📊 Test Summary")
        print("=" * 60)

        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)

        print(f"\nTotal Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed / total) * 100:.1f}%\n")

        if passed == total:
            print("✅ All tests passed!")
        else:
            print("❌ Some tests failed. Please check the output above.")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")

        print("\n" + "=" * 60)


def main():
    """Main test function"""
    tester = APITester(BASE_URL)

    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=2)
        print(f"✅ Server is running at {BASE_URL}\n")
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to server at {BASE_URL}")
        print("Please make sure the API server is running:")
        print("  uvicorn main:app --reload\n")
        return

    tester.run_all_tests()


if __name__ == "__main__":
    main()
