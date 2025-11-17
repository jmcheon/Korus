/**
 * API Service for Korus Collective Voice Platform
 * Handles all backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types matching backend schemas
export interface Company {
  id: number;
  company_name: string;
  industry: string;
  location: string;
  country: string;
  description?: string;
  website?: string;
  overall_rating: number;
  total_reviews: number;
  social_media_score: number;
  trust_score: number;
  external_platform_score: number;
  verified: boolean;
  rating_work_conditions: number;
  rating_pay: number;
  rating_treatment: number;
  rating_safety: number;
  latitude?: number;
  longitude?: number;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  requirements?: string;
  benefits?: string;
  is_active: boolean;
  posted_at: string;
}

export interface Review {
  id: number;
  company_id: number;
  job_id?: number;
  rating_work_conditions: number;
  rating_pay: number;
  rating_treatment: number;
  rating_safety: number;
  comment: string;
  is_anonymous: boolean;
  verified_employee: boolean;
  helpful_count: number;
  created_at: string;
}

export interface SupportOrganization {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  contact: string;
  email: string;
  website?: string;
  services: string[];
  open_hours: string;
  description?: string;
  is_active: boolean;
}

export interface ReviewCreate {
  company_id: number;
  job_id?: number;
  rating_work_conditions: number;
  rating_pay: number;
  rating_treatment: number;
  rating_safety: number;
  comment: string;
  is_anonymous: boolean;
  verified_employee: boolean;
  employee_token?: string;
}

// API Functions

/**
 * Fetch all companies
 */
export async function fetchCompanies(): Promise<Company[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`);
    if (!response.ok) {
      throw new Error("Failed to fetch companies");
    }
    const data = await response.json();

    // Transform backend format to frontend format
    return data.map((company: any) => ({
      id: company.id.toString(),
      name: company.company_name,
      industry: company.industry,
      location: company.location,
      country: company.country,
      overallRating: company.overall_rating,
      totalReviews: company.total_reviews,
      socialMediaScore: company.social_media_score,
      trustScore: company.trust_score,
      externalPlatformScore: company.external_platform_score,
      verified: company.verified,
      ratings: {
        workConditions: company.rating_work_conditions,
        pay: company.rating_pay,
        treatment: company.rating_treatment,
        safety: company.rating_safety,
      },
      coordinates:
        company.latitude && company.longitude
          ? {
              lat: company.latitude,
              lng: company.longitude,
            }
          : undefined,
    }));
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

/**
 * Fetch a single company by ID
 */
export async function fetchCompany(id: number): Promise<Company> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch company");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
}

/**
 * Fetch all jobs
 */
export async function fetchJobs(companyId?: number): Promise<Job[]> {
  try {
    const url = companyId
      ? `${API_BASE_URL}/api/jobs?company_id=${companyId}`
      : `${API_BASE_URL}/api/jobs`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }
    const data = await response.json();

    // Transform backend format to frontend format
    return data.map((job: any) => ({
      id: job.id.toString(),
      companyId: job.company_id.toString(),
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      posted: new Date(job.posted_at).toISOString().split("T")[0],
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

/**
 * Fetch all reviews
 */
export async function fetchReviews(companyId?: number): Promise<Review[]> {
  try {
    const url = companyId
      ? `${API_BASE_URL}/api/reviews?company_id=${companyId}`
      : `${API_BASE_URL}/api/reviews`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    const data = await response.json();

    // Transform backend format to frontend format
    return data.map((review: any) => ({
      id: review.id.toString(),
      companyId: review.company_id.toString(),
      jobId: review.job_id?.toString(),
      ratings: {
        workConditions: review.rating_work_conditions,
        pay: review.rating_pay,
        treatment: review.rating_treatment,
        safety: review.rating_safety,
      },
      comment: review.comment,
      isAnonymous: review.is_anonymous,
      verifiedEmployee: review.verified_employee,
      date: new Date(review.created_at).toISOString().split("T")[0],
      helpful: review.helpful_count,
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

/**
 * Create a new review
 */
export async function createReview(review: ReviewCreate): Promise<Review> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error("Failed to create review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

/**
 * Fetch all support organizations
 */
export async function fetchSupportOrganizations(): Promise<
  SupportOrganization[]
> {
  try {
    // Note: This endpoint needs to be added to the backend
    const response = await fetch(`${API_BASE_URL}/api/support-organizations`);
    if (!response.ok) {
      throw new Error("Failed to fetch support organizations");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching support organizations:", error);
    throw error;
  }
}

/**
 * Fetch platform statistics
 */
export async function fetchPlatformStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/statistics/platform`);
    if (!response.ok) {
      throw new Error("Failed to fetch statistics");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}

/**
 * Fetch company statistics
 */
export async function fetchCompanyStatistics(companyId: number) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/statistics/company/${companyId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch company statistics");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching company statistics:", error);
    throw error;
  }
}
