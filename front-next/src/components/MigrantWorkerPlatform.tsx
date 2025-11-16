"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, MapPin, Shield, AlertTriangle, TrendingUp, Users, Building2, Heart, Phone, Mail, Clock, Filter, Download, Search, Menu, X, Map as MapIcon } from 'lucide-react';

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });

// Types
type UserRole = 'employee' | 'company' | 'public' | null;

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  country: string;
  overallRating: number;
  totalReviews: number;
  socialMediaScore: number;
  trustScore: number;
  externalPlatformScore: number; // NEW: Score from Glassdoor, Indeed, etc.
  verified: boolean;
  ratings: {
    workConditions: number;
    pay: number;
    treatment: number;
    safety: number;
  };
  coordinates?: { lat: number; lng: number };
}

interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  posted: string;
}

interface Review {
  id: string;
  companyId: string;
  jobId: string;
  ratings: {
    workConditions: number;
    pay: number;
    treatment: number;
    safety: number;
  };
  comment: string;
  isAnonymous: boolean;
  verifiedEmployee: boolean;
  date: string;
  helpful: number;
}

interface SupportOrg {
  id: string;
  name: string;
  type: 'NGO' | 'Legal Aid' | 'Healthcare' | 'Housing' | 'Labor Rights';
  location: { lat: number; lng: number };
  address: string;
  contact: string;
  email: string;
  services: string[];
  openHours: string;
  distance?: number;
}

// Sample Data - Focus on French companies with various trust levels
const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'BTP Services Paris',
    industry: 'Construction',
    location: 'Paris, France',
    country: 'France',
    overallRating: 1.8,
    totalReviews: 234,
    socialMediaScore: 2.8,
    trustScore: 1.5,
    externalPlatformScore: 3.4, // Much higher - legal employees have better experience
    verified: false,
    ratings: { workConditions: 1.5, pay: 2.0, treatment: 1.8, safety: 2.0 },
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: '2',
    name: 'Nettoyage Express Lyon',
    industry: 'Cleaning Services',
    location: 'Lyon, France',
    country: 'France',
    overallRating: 2.1,
    totalReviews: 187,
    socialMediaScore: 3.1,
    trustScore: 1.9,
    externalPlatformScore: 3.6,
    verified: false,
    ratings: { workConditions: 2.0, pay: 1.8, treatment: 2.3, safety: 2.3 },
    coordinates: { lat: 45.7640, lng: 4.8357 }
  },
  {
    id: '3',
    name: 'Agro-Travail Provence',
    industry: 'Agriculture',
    location: 'Avignon, France',
    country: 'France',
    overallRating: 1.9,
    totalReviews: 156,
    socialMediaScore: 2.4,
    trustScore: 1.6,
    externalPlatformScore: 3.2,
    verified: false,
    ratings: { workConditions: 1.6, pay: 2.1, treatment: 1.9, safety: 2.0 },
    coordinates: { lat: 43.9493, lng: 4.8055 }
  },
  {
    id: '4',
    name: 'Hôtel Services Côte d\'Azur',
    industry: 'Hospitality',
    location: 'Nice, France',
    country: 'France',
    overallRating: 2.4,
    totalReviews: 203,
    socialMediaScore: 3.5,
    trustScore: 2.2,
    externalPlatformScore: 3.8,
    verified: true,
    ratings: { workConditions: 2.3, pay: 2.2, treatment: 2.6, safety: 2.5 },
    coordinates: { lat: 43.7102, lng: 7.2620 }
  },
  {
    id: '5',
    name: 'Logistique Marseille Port',
    industry: 'Logistics',
    location: 'Marseille, France',
    country: 'France',
    overallRating: 2.6,
    totalReviews: 178,
    socialMediaScore: 3.2,
    trustScore: 2.4,
    externalPlatformScore: 3.7,
    verified: false,
    ratings: { workConditions: 2.5, pay: 2.8, treatment: 2.6, safety: 2.5 },
    coordinates: { lat: 43.2965, lng: 5.3698 }
  },
  {
    id: '6',
    name: 'Restauration Rapide Paris',
    industry: 'Food Service',
    location: 'Paris, France',
    country: 'France',
    overallRating: 2.3,
    totalReviews: 312,
    socialMediaScore: 3.3,
    trustScore: 2.1,
    externalPlatformScore: 3.5,
    verified: true,
    ratings: { workConditions: 2.1, pay: 2.3, treatment: 2.5, safety: 2.4 },
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: '7',
    name: 'Textile Industrie Lille',
    industry: 'Manufacturing',
    location: 'Lille, France',
    country: 'France',
    overallRating: 2.8,
    totalReviews: 145,
    socialMediaScore: 3.1,
    trustScore: 2.6,
    externalPlatformScore: 3.6,
    verified: false,
    ratings: { workConditions: 2.7, pay: 2.9, treatment: 2.8, safety: 2.8 },
    coordinates: { lat: 50.6292, lng: 3.0573 }
  },
  {
    id: '8',
    name: 'Soins à Domicile Bordeaux',
    industry: 'Healthcare',
    location: 'Bordeaux, France',
    country: 'France',
    overallRating: 3.4,
    totalReviews: 198,
    socialMediaScore: 3.8,
    trustScore: 3.3,
    externalPlatformScore: 4.1,
    verified: true,
    ratings: { workConditions: 3.3, pay: 3.4, treatment: 3.6, safety: 3.4 },
    coordinates: { lat: 44.8378, lng: -0.5792 }
  },
  {
    id: '9',
    name: 'Entretien Ménager Toulouse',
    industry: 'Cleaning Services',
    location: 'Toulouse, France',
    country: 'France',
    overallRating: 2.2,
    totalReviews: 167,
    socialMediaScore: 3.0,
    trustScore: 2.0,
    externalPlatformScore: 3.4,
    verified: false,
    ratings: { workConditions: 2.0, pay: 2.3, treatment: 2.3, safety: 2.2 },
    coordinates: { lat: 43.6047, lng: 1.4442 }
  },
  {
    id: '10',
    name: 'Bâtiment Rénovation Strasbourg',
    industry: 'Construction',
    location: 'Strasbourg, France',
    country: 'France',
    overallRating: 2.5,
    totalReviews: 134,
    socialMediaScore: 3.1,
    trustScore: 2.3,
    externalPlatformScore: 3.5,
    verified: false,
    ratings: { workConditions: 2.4, pay: 2.6, treatment: 2.5, safety: 2.5 },
    coordinates: { lat: 48.5734, lng: 7.7521 }
  },
  {
    id: '11',
    name: 'Tech Innovation Paris',
    industry: 'Technology',
    location: 'Paris, France',
    country: 'France',
    overallRating: 4.2,
    totalReviews: 156,
    socialMediaScore: 4.3,
    trustScore: 4.1,
    externalPlatformScore: 4.5,
    verified: true,
    ratings: { workConditions: 4.3, pay: 4.2, treatment: 4.1, safety: 4.2 },
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: '12',
    name: 'Sécurité Privée Lyon',
    industry: 'Security Services',
    location: 'Lyon, France',
    country: 'France',
    overallRating: 2.7,
    totalReviews: 189,
    socialMediaScore: 3.3,
    trustScore: 2.5,
    externalPlatformScore: 3.7,
    verified: true,
    ratings: { workConditions: 2.6, pay: 2.8, treatment: 2.7, safety: 2.7 },
    coordinates: { lat: 45.7640, lng: 4.8357 }
  }
];

const sampleJobs: Job[] = [
  {
    id: '1',
    companyId: '1',
    title: 'Ouvrier de Chantier',
    description: 'Travaux de construction générale incluant manutention lourde, échafaudage et préparation de site.',
    location: 'Paris, France',
    salary: '€1,400-1,600/mois',
    posted: '2024-01-15'
  },
  {
    id: '2',
    companyId: '2',
    title: 'Agent de Nettoyage',
    description: 'Nettoyage de bureaux et espaces commerciaux. Horaires de nuit possibles.',
    location: 'Lyon, France',
    salary: '€1,300-1,450/mois',
    posted: '2024-01-20'
  },
  {
    id: '3',
    companyId: '3',
    title: 'Travailleur Agricole Saisonnier',
    description: 'Récolte de fruits et légumes. Travail saisonnier de mars à octobre.',
    location: 'Avignon, France',
    salary: '€1,200-1,400/mois',
    posted: '2024-02-01'
  },
  {
    id: '4',
    companyId: '4',
    title: 'Femme de Chambre',
    description: 'Entretien des chambres d\'hôtel. Travail le week-end requis.',
    location: 'Nice, France',
    salary: '€1,350-1,500/mois',
    posted: '2024-01-25'
  },
  {
    id: '5',
    companyId: '6',
    title: 'Équipier Polyvalent',
    description: 'Service en salle et préparation. Horaires flexibles.',
    location: 'Paris, France',
    salary: '€1,400-1,550/mois',
    posted: '2024-02-05'
  }
];

const sampleReviews: Review[] = [
  {
    id: '1',
    companyId: '1',
    jobId: '1',
    ratings: { workConditions: 1.5, pay: 2.0, treatment: 1.8, safety: 2.0 },
    comment: 'Horaires très longs sans pauses suffisantes. Équipement de sécurité rarement fourni. Salaires payés en retard plusieurs fois. Pas de contrat écrit clair.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-01-10',
    helpful: 34
  },
  {
    id: '2',
    companyId: '1',
    jobId: '1',
    ratings: { workConditions: 1.5, pay: 2.0, treatment: 1.8, safety: 2.0 },
    comment: 'Conditions de travail dangereuses. Le patron ne respecte pas le droit du travail. Heures supplémentaires non payées.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-01-15',
    helpful: 28
  },
  {
    id: '3',
    companyId: '2',
    jobId: '2',
    ratings: { workConditions: 2.0, pay: 1.8, treatment: 2.3, safety: 2.3 },
    comment: 'Salaire minimum malgré beaucoup de travail. Produits chimiques sans formation adéquate. Pas de pause déjeuner respectée.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-01-18',
    helpful: 19
  },
  {
    id: '4',
    companyId: '3',
    jobId: '3',
    ratings: { workConditions: 1.6, pay: 2.1, treatment: 1.9, safety: 2.0 },
    comment: 'Travail sous le soleil sans eau suffisante. Logement insalubre. Pas de jours de repos. Menaces si on se plaint.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-02-02',
    helpful: 42
  },
  {
    id: '5',
    companyId: '4',
    jobId: '4',
    ratings: { workConditions: 2.3, pay: 2.2, treatment: 2.6, safety: 2.5 },
    comment: 'Beaucoup de chambres à nettoyer en peu de temps. Salaire correct mais horaires épuisants. Management parfois irrespectueux.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-01-28',
    helpful: 15
  },
  {
    id: '6',
    companyId: '6',
    jobId: '5',
    ratings: { workConditions: 2.1, pay: 2.3, treatment: 2.5, safety: 2.4 },
    comment: 'Rythme de travail très intense. Pas assez de personnel. Pauses souvent annulées. Ambiance stressante.',
    isAnonymous: true,
    verifiedEmployee: true,
    date: '2024-02-08',
    helpful: 22
  },
  {
    id: '7',
    companyId: '11',
    jobId: '',
    ratings: { workConditions: 4.3, pay: 4.2, treatment: 4.1, safety: 4.2 },
    comment: 'Excellente entreprise. Respect du code du travail. Bonne ambiance. Salaire juste et payé à temps. Je recommande.',
    isAnonymous: false,
    verifiedEmployee: true,
    date: '2024-02-10',
    helpful: 56
  }
];

const supportOrganizations: SupportOrg[] = [
  {
    id: '1',
    name: 'Migrant Workers Rights Center',
    type: 'Legal Aid',
    location: { lat: 25.2048, lng: 55.2708 },
    address: '123 Sheikh Zayed Road, Dubai, UAE',
    contact: '+971-4-123-4567',
    email: 'help@mwrc.ae',
    services: ['Legal consultation', 'Contract review', 'Dispute resolution', 'Rights education'],
    openHours: 'Mon-Fri: 9AM-6PM'
  },
  {
    id: '2',
    name: 'International Labor Organization',
    type: 'NGO',
    location: { lat: 37.7749, lng: -122.4194 },
    address: '456 Market Street, San Francisco, CA',
    contact: '+1-415-555-0123',
    email: 'support@ilo-usa.org',
    services: ['Worker advocacy', 'Fair labor standards', 'Training programs', 'Emergency assistance'],
    openHours: 'Mon-Fri: 8AM-5PM'
  },
  {
    id: '3',
    name: 'Migrants Healthcare Clinic',
    type: 'Healthcare',
    location: { lat: 37.9838, lng: 23.7275 },
    address: '789 Piraeus Street, Athens, Greece',
    contact: '+30-21-0987-6543',
    email: 'clinic@migrants-health.gr',
    services: ['Free medical checkups', 'Mental health support', 'Occupational health', 'Emergency care'],
    openHours: 'Mon-Sat: 7AM-9PM'
  },
  {
    id: '4',
    name: 'Safe Housing Initiative',
    type: 'Housing',
    location: { lat: 1.3521, lng: 103.8198 },
    address: '321 Orchard Road, Singapore',
    contact: '+65-6123-4567',
    email: 'housing@safe-initiative.sg',
    services: ['Emergency shelter', 'Housing assistance', 'Temporary accommodation', 'Housing rights advocacy'],
    openHours: '24/7 Emergency Hotline'
  },
  {
    id: '5',
    name: 'Workers United Federation',
    type: 'Labor Rights',
    location: { lat: 52.5200, lng: 13.4050 },
    address: '567 Alexanderplatz, Berlin, Germany',
    contact: '+49-30-9876-5432',
    email: 'contact@workers-united.de',
    services: ['Union representation', 'Wage dispute resolution', 'Workplace safety inspections', 'Collective bargaining support'],
    openHours: 'Mon-Fri: 9AM-7PM, Sat: 10AM-2PM'
  }
];

export default function MigrantWorkerPlatform() {
  // Authentication State
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeToken, setEmployeeToken] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data State
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [supportOrgs, setSupportOrgs] = useState<SupportOrg[]>(supportOrganizations);

  // UI State
  type ActiveView = 'dashboard' | 'rankings' | 'jobs' | 'reviews' | 'review' | 'visualizations' | 'map' | 'companyMap' | 'companyDetail';
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [mapIndustryFilter, setMapIndustryFilter] = useState<string>('all');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'trust' | 'reviews'>('trust');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<SupportOrg | null>(null);
  const [orgTypeFilter, setOrgTypeFilter] = useState<string>('all');

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    companyId: '',
    companyName: '',
    jobId: '',
    jobTitle: '',
    workConditions: 3,
    pay: 3,
    treatment: 3,
    safety: 3,
    comment: '',
    isAnonymous: true,
    // Internal questions
    paidRecruitmentFee: '',
    recruitmentFeeAmount: '',
    salaryLessThanPromised: '',
    salaryDifference: '',
    documentsConfiscated: ''
  });
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [reviewToken, setReviewToken] = useState('');
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // User location (mock - Paris, France)
  const [userLocation, setUserLocation] = useState({ lat: 48.8566, lng: 2.3522 });

  // Calculate distances for support organizations
  useEffect(() => {
    const orgsWithDistance = supportOrgs.map(org => ({
      ...org,
      distance: calculateDistance(userLocation, org.location)
    }));
    setSupportOrgs(orgsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
  }, [userLocation]);

  // Distance calculation (Haversine formula)
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // AI-powered social media analysis
  const analyzeSocialMedia = async (companyName: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('https://llm.blackbox.ai/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'cus_TQZ96IdFHUg3Ws',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx'
        },
        body: JSON.stringify({
          model: 'openrouter/claude-sonnet-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI analyst specializing in worker rights and company reputation analysis. Analyze simulated social media sentiment about companies hiring migrant workers. Provide a JSON response with: sentimentScore (0-5), concerns (array of strings), positives (array of strings), trustLevel (low/medium/high), and summary (string).'
            },
            {
              role: 'user',
              content: `Analyze the reputation and worker treatment practices of "${companyName}". Consider labor rights violations, worker testimonials, safety records, and payment practices. Provide a comprehensive assessment.`
            }
          ]
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        sentimentScore: 3.0,
        concerns: ['Unable to fetch live data'],
        positives: ['Analysis temporarily unavailable'],
        trustLevel: 'medium',
        summary: 'Social media analysis is currently unavailable.'
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Token validation for review submission
  const handleValidateReviewToken = () => {
    // For now, accept any token with at least 8 characters
    if (reviewToken.length >= 8) {
      setIsTokenValidated(true);
      setTokenError('');
    } else {
      setTokenError('Token must be at least 8 characters long');
    }
  };

  // Authentication Handlers
  const handleEmployeeLogin = () => {
    if (employeeToken.length >= 8) {
      setUserRole('employee');
      setIsAuthenticated(true);
    }
  };

  const handleCompanyLogin = () => {
    if (companyEmail && companyPassword.length >= 6) {
      setUserRole('company');
      setIsAuthenticated(true);
    }
  };

  const handlePublicAccess = () => {
    setUserRole('public');
    setIsAuthenticated(true);
    setActiveView('rankings');
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setEmployeeToken('');
    setCompanyEmail('');
    setCompanyPassword('');
    setActiveView('dashboard');
  };

  // Review Submission
  const handleSubmitReview = async () => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      companyId: reviewForm.companyId,
      jobId: reviewForm.jobId,
      ratings: {
        workConditions: reviewForm.workConditions,
        pay: reviewForm.pay,
        treatment: reviewForm.treatment,
        safety: reviewForm.safety
      },
      comment: reviewForm.comment,
      isAnonymous: reviewForm.isAnonymous,
      verifiedEmployee: userRole === 'employee',
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    };

    setReviews([...reviews, newReview]);

    // Update company ratings
    const companyReviews = [...reviews, newReview].filter(r => r.companyId === reviewForm.companyId);
    const avgRatings = {
      workConditions: companyReviews.reduce((sum, r) => sum + r.ratings.workConditions, 0) / companyReviews.length,
      pay: companyReviews.reduce((sum, r) => sum + r.ratings.pay, 0) / companyReviews.length,
      treatment: companyReviews.reduce((sum, r) => sum + r.ratings.treatment, 0) / companyReviews.length,
      safety: companyReviews.reduce((sum, r) => sum + r.ratings.safety, 0) / companyReviews.length
    };
    const overallRating = (avgRatings.workConditions + avgRatings.pay + avgRatings.treatment + avgRatings.safety) / 4;

    setCompanies(companies.map(c =>
      c.id === reviewForm.companyId
        ? { ...c, ratings: avgRatings, overallRating, totalReviews: companyReviews.length }
        : c
    ));

    // Reset form
    setReviewForm({
      companyId: '',
      companyName: '',
      jobId: '',
      jobTitle: '',
      workConditions: 3,
      pay: 3,
      treatment: 3,
      safety: 3,
      comment: '',
      isAnonymous: true,
      paidRecruitmentFee: '',
      recruitmentFeeAmount: '',
      salaryLessThanPromised: '',
      salaryDifference: '',
      documentsConfiscated: ''
    });
    setCompanySearchQuery('');
    setJobSearchQuery('');
    setReviewToken('');
    setIsTokenValidated(false);

    alert('Review submitted successfully! Thank you for helping other workers.');
  };

  // Filtering and Sorting
  const getFilteredCompanies = () => {
    let filtered = companies;

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterIndustry !== 'all') {
      filtered = filtered.filter(c => c.industry === filterIndustry);
    }

    if (filterCountry !== 'all') {
      filtered = filtered.filter(c => c.country === filterCountry);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.overallRating - a.overallRating;
        case 'trust':
          return b.trustScore - a.trustScore;
        case 'reviews':
          return b.totalReviews - a.totalReviews;
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Get unique industries and countries
  const industries = ['all', ...Array.from(new Set(companies.map(c => c.industry)))];
  const countries = ['all', ...Array.from(new Set(companies.map(c => c.country)))];

  // Industry color mapping
  const industryColors: Record<string, string> = {
    'Construction': '#ef4444', // red
    'Agriculture': '#22c55e', // green
    'Hospitality': '#3b82f6', // blue
    'Manufacturing': '#f59e0b', // amber
    'Healthcare': '#ec4899', // pink
    'Technology': '#8b5cf6', // purple
    'Logistics': '#14b8a6', // teal
  };

  const getIndustryColor = (industry: string) => {
    return industryColors[industry] || '#6b7280'; // gray as default
  };

  // Get trust score color based on ranking
  const getTrustScoreColor = (trustScore: number) => {
    if (trustScore >= 4) return '#22c55e'; // green - high trust
    if (trustScore >= 3) return '#eab308'; // yellow - medium trust
    return '#ef4444'; // red - low trust
  };

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
      setIsMapLoaded(true);
    }
  }, []);

  // Get filtered companies for map
  const getFilteredCompaniesForMap = () => {
    if (mapIndustryFilter === 'all') {
      return companies.filter(c => c.coordinates);
    }
    return companies.filter(c => c.industry === mapIndustryFilter && c.coordinates);
  };

  // Render Star Rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  // Trust Score Badge
  const getTrustBadge = (score: number) => {
    if (score >= 4) return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">High Trust</span>;
    if (score >= 3) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Trust</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Low Trust</span>;
  };

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/Korus.png" className="w-8 h-8" />
              <CardTitle className="text-3xl">Korus: Collective Voice</CardTitle>
            </div>
            <CardDescription className="text-base">
              Empowering migrant workers with transparency and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Employee Access
                  </CardTitle>
                  <CardDescription>Login with your verification token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="token">Verification Token</Label>
                    <Input
                      id="token"
                      type="text"
                      placeholder="Enter your 8-digit token"
                      value={employeeToken}
                      onChange={(e) => setEmployeeToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Token provided by NGO partners or worker associations
                    </p>
                  </div>
                  <Button onClick={handleEmployeeLogin} className="w-full">
                    Access as Employee
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Access
                  </CardTitle>
                  <CardDescription>Login to manage your company profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="company@example.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={companyPassword}
                      onChange={(e) => setCompanyPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCompanyLogin} className="w-full" variant="secondary">
                    Login as Company
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Media, researchers, and advocates can access public data
              </p>
              <Button onClick={handlePublicAccess} variant="outline" className="w-full max-w-xs">
                View Public Rankings & Data
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Platform Mission
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Transparent company ratings based on real worker experiences</li>
                <li>• AI-powered social media analysis for comprehensive insights</li>
                <li>• Location-based support resources for vulnerable workers</li>
                <li>• Anonymous feedback protection for employee safety</li>
                <li>• Data-driven advocacy for labor rights improvements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Navigation
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'rankings', label: 'Company Rankings', icon: Building2 },
    { id: 'companyMap', label: 'Risk Map', icon: MapIcon },
    { id: 'jobs', label: 'Job Listings', icon: Search },
    { id: 'reviews', label: 'All Reviews', icon: Star },
    ...(userRole === 'employee' ? [{ id: 'review', label: 'Leave Review', icon: Star }] : []),
    { id: 'visualizations', label: 'Data Insights', icon: TrendingUp },
    { id: 'map', label: 'Find Support', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Korus.png" className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Korus: Collective Voice</h1>
                <p className="text-xs text-muted-foreground">
                  Logged in as: {userRole === 'employee' ? 'Employee' : userRole === 'company' ? 'Company' : 'Public Viewer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2 mt-4">
            {navigation.map(nav => {
              const Icon = nav.icon;
              return (
                <Button
                  key={nav.id}
                  variant={activeView === nav.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView(nav.id as ActiveView)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {nav.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="flex flex-col gap-2 mt-4 md:hidden">
              {navigation.map(nav => {
                const Icon = nav.icon;
                return (
                  <Button
                    key={nav.id}
                    variant={activeView === nav.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setActiveView(nav.id as ActiveView);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {nav.label}
                  </Button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Platform Overview</h2>
              <p className="text-muted-foreground">
                Real-time insights and statistics on worker rights and company practices
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across multiple industries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Worker Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reviews.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Verified employee feedback</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Support Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{supportOrgs.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready to help workers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Trust Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(companies.reduce((sum, c) => sum + c.trustScore, 0) / companies.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Reviews</CardTitle>
                      <CardDescription>Latest worker feedback</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView('reviews')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.slice(0, 3).map(review => {
                    const company = companies.find(c => c.id === review.companyId);
                    return (
                      <div key={review.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{company?.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                          {renderStars((review.ratings.workConditions + review.ratings.pay + review.ratings.treatment + review.ratings.safety) / 4)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Companies</CardTitle>
                  <CardDescription>Leading in worker satisfaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companies
                    .sort((a, b) => b.overallRating - a.overallRating)
                    .slice(0, 3)
                    .map(company => (
                      <div key={company.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.industry}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {renderStars(company.overallRating)}
                            <span className="text-sm font-medium">{company.overallRating.toFixed(1)}</span>
                          </div>
                          {getTrustBadge(company.trustScore)}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Alert Box */}
            {userRole === 'employee' && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Share Your Experience</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your feedback helps protect other workers. Leave an anonymous review to report issues or praise good employers.
                      </p>
                      <Button size="sm" onClick={() => setActiveView('review')}>
                        Leave a Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Company Rankings View */}
        {activeView === 'rankings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Company Rankings</h2>
                <p className="text-muted-foreground">
                  Comprehensive ratings based on worker reviews and AI-powered analysis
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Company name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                      <SelectTrigger id="industry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(ind => (
                          <SelectItem key={ind} value={ind}>
                            {ind === 'all' ? 'All Industries' : ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={filterCountry} onValueChange={setFilterCountry}>
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>
                            {country === 'all' ? 'All Countries' : country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sort">Sort By</Label>
                    <Select value={sortBy} onValueChange={(value: 'rating' | 'trust' | 'reviews') => setSortBy(value)}>
                      <SelectTrigger id="sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trust">Trust Score</SelectItem>
                        <SelectItem value="rating">Overall Rating</SelectItem>
                        <SelectItem value="reviews">Review Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rankings Table */}
            <div className="space-y-4">
              {getFilteredCompanies().map((company, index) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{company.name}</h3>
                            {company.verified && (
                              <Shield className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{company.industry} • {company.location}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              {renderStars(company.overallRating)}
                              <span className="text-sm font-medium ml-1">{company.overallRating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {company.totalReviews} reviews
                            </span>
                            {getTrustBadge(company.trustScore)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Conditions</p>
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: company.ratings.workConditions / 5 }} />
                            <span className="text-sm font-medium">{company.ratings.workConditions.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Pay</p>
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: company.ratings.pay / 5 }} />
                            <span className="text-sm font-medium">{company.ratings.pay.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Treatment</p>
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: company.ratings.treatment / 5 }} />
                            <span className="text-sm font-medium">{company.ratings.treatment.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Safety</p>
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: company.ratings.safety / 5 }} />
                            <span className="text-sm font-medium">{company.ratings.safety.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCompany(company);
                            setActiveView('companyDetail');
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            const analysis = await analyzeSocialMedia(company.name);
                            alert(`AI Analysis for ${company.name}:\n\nTrust Level: ${analysis.trustLevel}\nSentiment Score: ${analysis.sentimentScore}/5\n\nSummary: ${analysis.summary}\n\nConcerns: ${analysis.concerns.join(', ')}\n\nPositives: ${analysis.positives.join(', ')}`);
                          }}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getFilteredCompanies().length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">No companies found matching your filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* All Reviews View */}
        {activeView === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Worker Reviews</h2>
                <p className="text-muted-foreground">
                  Real feedback from migrant workers about their employers
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {reviews.length} reviews
              </div>
            </div>

            {reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No reviews yet. Be the first to share your experience!</p>
                  {userRole === 'employee' && (
                    <Button onClick={() => setActiveView('review')}>
                      Leave a Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => {
                  const company = companies.find(c => c.id === review.companyId);
                  const job = jobs.find(j => j.id === review.jobId);
                  const avgRating = (review.ratings.workConditions + review.ratings.pay + review.ratings.treatment + review.ratings.safety) / 4;

                  return (
                    <Card key={review.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-xl">{company?.name}</h3>
                                {review.verifiedEmployee && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                                {review.isAnonymous && (
                                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                                    Anonymous
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <span>{company?.industry}</span>
                                <span>•</span>
                                <span>{company?.location}</span>
                                {job && (
                                  <>
                                    <span>•</span>
                                    <span>{job.title}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{review.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                {renderStars(avgRating)}
                                <span className="text-lg font-bold">{avgRating.toFixed(1)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Overall Rating</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Work Conditions</p>
                              <div className="flex items-center justify-center gap-1">
                                {renderStars(review.ratings.workConditions)}
                                <span className="text-sm font-medium ml-1">{review.ratings.workConditions.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Fair Pay</p>
                              <div className="flex items-center justify-center gap-1">
                                {renderStars(review.ratings.pay)}
                                <span className="text-sm font-medium ml-1">{review.ratings.pay.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Treatment</p>
                              <div className="flex items-center justify-center gap-1">
                                {renderStars(review.ratings.treatment)}
                                <span className="text-sm font-medium ml-1">{review.ratings.treatment.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Safety</p>
                              <div className="flex items-center justify-center gap-1">
                                {renderStars(review.ratings.safety)}
                                <span className="text-sm font-medium ml-1">{review.ratings.safety.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-medium text-sm">Worker Experience:</p>
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Heart className="w-4 h-4" />
                              <span>{review.helpful} people found this helpful</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Mark as Helpful
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Jobs View */}
        {activeView === 'jobs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Job Listings</h2>
              <p className="text-muted-foreground">
                Browse positions with transparent company ratings
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map(job => {
                const company = companies.find(c => c.id === job.companyId);
                return (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-xl mb-1">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{company?.name}</p>
                            </div>
                            <div className="text-right">
                              {renderStars(company?.overallRating || 0)}
                              <p className="text-xs text-muted-foreground mt-1">{company?.totalReviews} reviews</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              Posted {job.posted}
                            </div>
                            <div className="font-medium text-primary">
                              {job.salary}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                          <div className="flex flex-wrap items-center gap-3">
                            {getTrustBadge(company?.trustScore || 0)}
                            {company?.verified && (
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Verified Employer
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="lg:w-48 space-y-2">
                          <Button className="w-full">Apply Now</Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedCompany(company || null);
                              setActiveView('rankings');
                            }}
                          >
                            View Company
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Submission View */}
        {(activeView === 'review' as ActiveView) && userRole === 'employee' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Leave a Review</h2>
              <p className="text-muted-foreground">
                Your feedback helps other workers make informed decisions and protects worker rights
              </p>
            </div>

            {/* Token Validation Step */}
            {!isTokenValidated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Verify Your Review Token</CardTitle>
                  <CardDescription>
                    Enter the review token provided by NGO partners or worker associations to begin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="review-token">Review Token</Label>
                    <Input
                      id="review-token"
                      type="text"
                      placeholder="Enter your review token"
                      value={reviewToken}
                      onChange={(e) => {
                        setReviewToken(e.target.value);
                        setTokenError('');
                      }}
                      className={tokenError ? 'border-red-500' : ''}
                    />
                    {tokenError && (
                      <p className="text-sm text-red-500 mt-1">{tokenError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      This token ensures your review is verified and authentic
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">About Review Tokens</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Tokens are provided by NGO partners and worker associations</li>
                          <li>• Each token can be used once to submit a review</li>
                          <li>• Your identity remains anonymous even with token verification</li>
                          <li>• Tokens help prevent fake reviews and ensure authenticity</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleValidateReviewToken}
                    disabled={reviewToken.length < 8}
                    className="w-full"
                  >
                    Validate Token & Continue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Token Validated Badge */}
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Token Verified</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsTokenValidated(false);
                        setReviewToken('');
                      }}
                    >
                      Change Token
                    </Button>
                  </div>

                  {/* Internal Questions Section */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Internal Assessment Questions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      These questions help us identify labor rights violations and provide better support
                    </p>

                    <div className="space-y-6">
                      {/* Question 1: Recruitment Fee */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Did you pay a recruitment fee?
                        </Label>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={reviewForm.paidRecruitmentFee === 'yes' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, paidRecruitmentFee: 'yes' })}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={reviewForm.paidRecruitmentFee === 'no' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, paidRecruitmentFee: 'no', recruitmentFeeAmount: '' })}
                            className="flex-1"
                          >
                            No
                          </Button>
                        </div>
                        {reviewForm.paidRecruitmentFee === 'yes' && (
                          <div className="mt-3">
                            <Label htmlFor="fee-amount">How much? (in €)</Label>
                            <Input
                              id="fee-amount"
                              type="number"
                              placeholder="Enter amount in euros"
                              value={reviewForm.recruitmentFeeAmount}
                              onChange={(e) => setReviewForm({ ...reviewForm, recruitmentFeeAmount: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Question 2: Salary Difference */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Was your salary less than promised?
                        </Label>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={reviewForm.salaryLessThanPromised === 'yes' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, salaryLessThanPromised: 'yes' })}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={reviewForm.salaryLessThanPromised === 'no' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, salaryLessThanPromised: 'no', salaryDifference: '' })}
                            className="flex-1"
                          >
                            No
                          </Button>
                        </div>
                        {reviewForm.salaryLessThanPromised === 'yes' && (
                          <div className="mt-3">
                            <Label htmlFor="salary-diff">What is the monthly difference? (in €)</Label>
                            <Input
                              id="salary-diff"
                              type="number"
                              placeholder="Enter monthly difference in euros"
                              value={reviewForm.salaryDifference}
                              onChange={(e) => setReviewForm({ ...reviewForm, salaryDifference: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Question 3: Document Confiscation */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Were your documents (e.g., passport) confiscated?
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Button
                            type="button"
                            variant={reviewForm.documentsConfiscated === 'agency' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, documentsConfiscated: 'agency' })}
                            className="w-full"
                          >
                            Yes, by Agency
                          </Button>
                          <Button
                            type="button"
                            variant={reviewForm.documentsConfiscated === 'employer' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, documentsConfiscated: 'employer' })}
                            className="w-full"
                          >
                            Yes, by Employer
                          </Button>
                          <Button
                            type="button"
                            variant={reviewForm.documentsConfiscated === 'no' ? 'default' : 'outline'}
                            onClick={() => setReviewForm({ ...reviewForm, documentsConfiscated: 'no' })}
                            className="w-full"
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Worker Review Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Company & Job Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Label htmlFor="review-company">Company Name (Required)</Label>
                        <Input
                          id="review-company"
                          type="text"
                          placeholder="Type company name..."
                          value={companySearchQuery}
                          onChange={(e) => {
                            setCompanySearchQuery(e.target.value);
                            setShowCompanySuggestions(true);
                            setReviewForm({ ...reviewForm, companyName: e.target.value, companyId: '' });
                          }}
                          onFocus={() => setShowCompanySuggestions(true)}
                          className="mt-1"
                        />
                        {showCompanySuggestions && companySearchQuery && (
                          <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                            {companies
                              .filter(c => c.name.toLowerCase().includes(companySearchQuery.toLowerCase()))
                              .map(company => (
                                <button
                                  key={company.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                  onClick={() => {
                                    setCompanySearchQuery(company.name);
                                    setReviewForm({ ...reviewForm, companyId: company.id, companyName: company.name });
                                    setShowCompanySuggestions(false);
                                  }}
                                >
                                  <div className="font-medium">{company.name}</div>
                                  <div className="text-xs text-muted-foreground">{company.industry} • {company.location}</div>
                                </button>
                              ))}
                            {companies.filter(c => c.name.toLowerCase().includes(companySearchQuery.toLowerCase())).length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No matches found. Your entry will be recorded as a new company.
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Start typing to see suggestions or enter a new company name
                        </p>
                      </div>

                      <div className="relative">
                        <Label htmlFor="review-job">Job Position (Optional)</Label>
                        <Input
                          id="review-job"
                          type="text"
                          placeholder="Type job position..."
                          value={jobSearchQuery}
                          onChange={(e) => {
                            setJobSearchQuery(e.target.value);
                            setShowJobSuggestions(true);
                            setReviewForm({ ...reviewForm, jobTitle: e.target.value, jobId: '' });
                          }}
                          onFocus={() => setShowJobSuggestions(true)}
                          className="mt-1"
                        />
                        {showJobSuggestions && jobSearchQuery && reviewForm.companyId && (
                          <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                            {jobs
                              .filter(j => j.companyId === reviewForm.companyId && j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()))
                              .map(job => (
                                <button
                                  key={job.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                                  onClick={() => {
                                    setJobSearchQuery(job.title);
                                    setReviewForm({ ...reviewForm, jobId: job.id, jobTitle: job.title });
                                    setShowJobSuggestions(false);
                                  }}
                                >
                                  <div className="font-medium">{job.title}</div>
                                  <div className="text-xs text-muted-foreground">{job.salary}</div>
                                </button>
                              ))}
                            {jobs.filter(j => j.companyId === reviewForm.companyId && j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No matches found. Your entry will be recorded as entered.
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Start typing to see suggestions or enter a new position
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Work Conditions: {reviewForm.workConditions}/5</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, workConditions: rating })}
                              className={`p-2 rounded transition-colors ${rating <= reviewForm.workConditions
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Fair Pay: {reviewForm.pay}/5</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, pay: rating })}
                              className={`p-2 rounded transition-colors ${rating <= reviewForm.pay
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Employee Treatment: {reviewForm.treatment}/5</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, treatment: rating })}
                              className={`p-2 rounded transition-colors ${rating <= reviewForm.treatment
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Workplace Safety: {reviewForm.safety}/5</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, safety: rating })}
                              className={`p-2 rounded transition-colors ${rating <= reviewForm.safety
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-comment">Your Experience (Required)</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Share details about your working conditions, treatment, pay, safety concerns, or positive experiences..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={6}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Be specific and honest. Your review helps protect other workers.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">All reviews are anonymous by default</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1 ml-6">
                        Your identity is never revealed to companies. We only keep internal records for verification.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Your Privacy is Protected</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Anonymous reviews hide your identity from employers</li>
                            <li>• Reviews are verified but your personal details remain private</li>
                            <li>• We never share reviewer information with companies</li>
                            <li>• Report retaliation through our support channels</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={
                          !companySearchQuery ||
                          !reviewForm.comment ||
                          reviewForm.comment.length < 20 ||
                          !reviewForm.paidRecruitmentFee ||
                          !reviewForm.salaryLessThanPromised ||
                          !reviewForm.documentsConfiscated ||
                          (reviewForm.paidRecruitmentFee === 'yes' && !reviewForm.recruitmentFeeAmount) ||
                          (reviewForm.salaryLessThanPromised === 'yes' && !reviewForm.salaryDifference)
                        }
                        className="flex-1"
                      >
                        Submit Anonymous Review
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReviewForm({
                            companyId: '',
                            companyName: '',
                            jobId: '',
                            jobTitle: '',
                            workConditions: 3,
                            pay: 3,
                            treatment: 3,
                            safety: 3,
                            comment: '',
                            isAnonymous: true,
                            paidRecruitmentFee: '',
                            recruitmentFeeAmount: '',
                            salaryLessThanPromised: '',
                            salaryDifference: '',
                            documentsConfiscated: ''
                          });
                          setCompanySearchQuery('');
                          setJobSearchQuery('');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Data Visualizations View */}
        {(activeView === 'visualizations' as ActiveView) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Data Insights</h2>
              <p className="text-muted-foreground">
                Visual analysis of worker feedback and company performance
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Rating Distribution</CardTitle>
                  <CardDescription>How companies are rated by workers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companies.map(c => ({ name: c.name.split(' ')[0], rating: c.overallRating }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Three-Factor Score Comparison</CardTitle>
                  <CardDescription>Trust Score vs Social Media vs External Platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={companies.map(c => ({
                        name: c.name.split(' ')[0],
                        trust: c.trustScore,
                        social: c.socialMediaScore,
                        external: c.externalPlatformScore
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="trust" stroke="#22c55e" name="Trust Score" strokeWidth={2} />
                      <Line type="monotone" dataKey="social" stroke="#3b82f6" name="Social Media" strokeWidth={2} />
                      <Line type="monotone" dataKey="external" stroke="#f59e0b" name="External Platforms" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industry Breakdown</CardTitle>
                  <CardDescription>Companies by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Array.from(new Set(companies.map(c => c.industry))).map(industry => ({
                          name: industry,
                          value: companies.filter(c => c.industry === industry).length
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label
                      >
                        {Array.from(new Set(companies.map(c => c.industry))).map((_, index) => {
                          const industryColors = [
                            '#ef4444', // red
                            '#f59e0b', // amber
                            '#10b981', // emerald
                            '#3b82f6', // blue
                            '#8b5cf6', // violet
                            '#ec4899', // pink
                            '#06b6d4', // cyan
                            '#f97316', // orange
                          ];
                          return <Cell key={`cell-${index}`} fill={industryColors[index % industryColors.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Categories Comparison</CardTitle>
                  <CardDescription>Average scores across dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          category: 'Conditions',
                          score: companies.reduce((sum, c) => sum + c.ratings.workConditions, 0) / companies.length
                        },
                        {
                          category: 'Pay',
                          score: companies.reduce((sum, c) => sum + c.ratings.pay, 0) / companies.length
                        },
                        {
                          category: 'Treatment',
                          score: companies.reduce((sum, c) => sum + c.ratings.treatment, 0) / companies.length
                        },
                        {
                          category: 'Safety',
                          score: companies.reduce((sum, c) => sum + c.ratings.safety, 0) / companies.length
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
                <CardDescription>Platform-wide metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">
                      {((companies.filter(c => c.trustScore >= 4).length / companies.length) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">High Trust Companies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">
                      {companies.reduce((sum, c) => sum + c.totalReviews, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total Worker Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">
                      {(companies.reduce((sum, c) => sum + c.overallRating, 0) / companies.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Average Company Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">
                      {companies.filter(c => c.verified).length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Verified Employers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Company Map View */}
        {(activeView === 'companyMap' as ActiveView) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Company Risk Map</h2>
              <p className="text-muted-foreground">
                Visual overview of company trust scores based on worker reviews - helping journalists and advocates identify companies with poor worker treatment
              </p>
            </div>

            {/* Legend and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block font-semibold">Filter by Industry</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        key="all"
                        variant={mapIndustryFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMapIndustryFilter('all')}
                      >
                        All Industries
                      </Button>
                      {industries.filter(i => i !== 'all').map(industry => (
                        <Button
                          key={industry}
                          variant={mapIndustryFilter === industry ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMapIndustryFilter(industry)}
                        >
                          {industry}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="mb-3 block font-semibold">Trust Score Legend</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: '#22c55e' }}
                        />
                        <span className="text-sm">High Trust (4.0+)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: '#eab308' }}
                        />
                        <span className="text-sm">Medium Trust (3.0-3.9)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: '#ef4444' }}
                        />
                        <span className="text-sm">Low Trust (&lt;3.0)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Showing {getFilteredCompaniesForMap().length} companies</span>
                      <span>Dot size indicates trust score</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Container */}
            <Card>
              <CardContent className="pt-6">
                {isMapLoaded ? (
                  <div className="h-[600px] rounded-lg overflow-hidden border">
                    <MapContainer
                      center={[48.8566, 2.3522]}
                      zoom={3}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {getFilteredCompaniesForMap().map(company => (
                        <CircleMarker
                          key={company.id}
                          center={[company.coordinates!.lat, company.coordinates!.lng]}
                          radius={8 + (company.trustScore * 2)}
                          fillColor={getTrustScoreColor(company.trustScore)}
                          color="#fff"
                          weight={2}
                          opacity={1}
                          fillOpacity={0.8}
                        >
                          <Popup>
                            <div className="p-2 min-w-[250px]">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-bold text-base">{company.name}</h3>
                                  <p className="text-xs text-muted-foreground">{company.location}</p>
                                </div>
                                {company.verified && (
                                  <Shield className="w-4 h-4 text-primary" />
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getTrustScoreColor(company.trustScore) }}
                                  />
                                  <span className="text-sm font-medium">{company.industry}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${star <= company.overallRating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium">{company.overallRating.toFixed(1)}</span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {company.totalReviews} reviews
                                </div>

                                <div className="pt-2 border-t">
                                  {company.trustScore >= 4 ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                      High Trust
                                    </span>
                                  ) : company.trustScore >= 3 ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                      Medium Trust
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                      Low Trust
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setActiveView('companyDetail');
                                  }}
                                  className="w-full mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <MapIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company List Below Map */}
            <Card>
              <CardHeader>
                <CardTitle>Companies on Map</CardTitle>
                <CardDescription>
                  {mapIndustryFilter === 'all'
                    ? 'All companies with location data'
                    : `${mapIndustryFilter} companies`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredCompaniesForMap().map(company => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCompany(company);
                        setActiveView('companyDetail');
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0"
                          style={{ backgroundColor: getTrustScoreColor(company.trustScore) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{company.name}</h4>
                            {company.verified && (
                              <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {company.industry} • {company.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{company.overallRating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{company.totalReviews} reviews</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2 text-red-900">For Journalists & Advocates</h3>
                    <p className="text-sm text-red-800 mb-3">
                      This risk map helps identify companies with poor worker treatment based on verified employee reviews. Use this data to:
                    </p>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• <span className="font-semibold text-red-600">Red dots</span> = High-risk companies (trust score &lt;3.0) - potential labor violations</li>
                      <li>• <span className="font-semibold text-yellow-600">Yellow dots</span> = Medium-risk companies (trust score 3.0-3.9) - mixed reviews</li>
                      <li>• <span className="font-semibold text-green-600">Green dots</span> = Low-risk companies (trust score 4.0+) - good worker treatment</li>
                      <li>• Larger dots indicate higher trust scores</li>
                      <li>• Click any dot to see detailed worker feedback and ratings</li>
                      <li>• Filter by industry to focus on specific sectors</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Company Detail View */}
        {(activeView === 'companyDetail' as ActiveView) && selectedCompany && (
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveView('rankings');
                setSelectedCompany(null);
              }}
              className="mb-4"
            >
              ← Back to Rankings
            </Button>

            {/* Company Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold">{selectedCompany.name}</h1>
                          {selectedCompany.verified && (
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {selectedCompany.industry}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedCompany.location}
                          </span>
                        </div>
                      </div>
                      {getTrustBadge(selectedCompany.trustScore)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{selectedCompany.overallRating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Overall Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedCompany.trustScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Trust Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedCompany.socialMediaScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Social Media</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{selectedCompany.externalPlatformScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">External Platforms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{selectedCompany.totalReviews}</p>
                        <p className="text-xs text-muted-foreground">Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explanation Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-900">Understanding Score Differences</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      You may notice gaps between the three rating sources. This is expected and provides valuable insights:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• <span className="font-semibold text-green-700">Trust Score</span> - Based on reviews from migrant and undocumented workers who may face different working conditions, lower pay, and less legal protection than regular employees</li>
                      <li>• <span className="font-semibold text-blue-700">Social Media</span> - Public sentiment that may not capture the full experience of vulnerable workers</li>
                      <li>• <span className="font-semibold text-amber-700">External Platforms</span> - Reviews from legal employees on platforms like Glassdoor/Indeed, who typically have better working conditions and legal protections</li>
                    </ul>
                    <p className="text-sm text-blue-800 mt-3 font-medium">
                      Large gaps often indicate that migrant workers experience significantly worse conditions than legal employees at the same company.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Insights */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 3-Factor Score Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Source Rating Analysis</CardTitle>
                  <CardDescription>Comparing internal trust score, social media sentiment, and external platform ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        {
                          month: 'Jan',
                          trust: selectedCompany.trustScore - 0.3,
                          social: selectedCompany.socialMediaScore - 0.2,
                          external: selectedCompany.externalPlatformScore - 0.2
                        },
                        {
                          month: 'Feb',
                          trust: selectedCompany.trustScore - 0.2,
                          social: selectedCompany.socialMediaScore - 0.1,
                          external: selectedCompany.externalPlatformScore - 0.1
                        },
                        {
                          month: 'Mar',
                          trust: selectedCompany.trustScore - 0.1,
                          social: selectedCompany.socialMediaScore,
                          external: selectedCompany.externalPlatformScore
                        },
                        {
                          month: 'Apr',
                          trust: selectedCompany.trustScore,
                          social: selectedCompany.socialMediaScore + 0.1,
                          external: selectedCompany.externalPlatformScore + 0.1
                        },
                        {
                          month: 'May',
                          trust: selectedCompany.trustScore + 0.1,
                          social: selectedCompany.socialMediaScore + 0.2,
                          external: selectedCompany.externalPlatformScore + 0.15
                        },
                        {
                          month: 'Jun',
                          trust: selectedCompany.trustScore,
                          social: selectedCompany.socialMediaScore,
                          external: selectedCompany.externalPlatformScore
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="trust" stroke="#22c55e" name="Trust Score" strokeWidth={2} />
                      <Line type="monotone" dataKey="social" stroke="#3b82f6" name="Social Media" strokeWidth={2} />
                      <Line type="monotone" dataKey="external" stroke="#f59e0b" name="External Platforms" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rating Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Breakdown</CardTitle>
                  <CardDescription>Worker ratings across key categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { category: 'Work Conditions', score: selectedCompany.ratings.workConditions, fill: '#ef4444' },
                        { category: 'Fair Pay', score: selectedCompany.ratings.pay, fill: '#f59e0b' },
                        { category: 'Treatment', score: selectedCompany.ratings.treatment, fill: '#3b82f6' },
                        { category: 'Safety', score: selectedCompany.ratings.safety, fill: '#22c55e' }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="score">
                        {[
                          { category: 'Work Conditions', score: selectedCompany.ratings.workConditions, fill: '#ef4444' },
                          { category: 'Fair Pay', score: selectedCompany.ratings.pay, fill: '#f59e0b' },
                          { category: 'Treatment', score: selectedCompany.ratings.treatment, fill: '#3b82f6' },
                          { category: 'Safety', score: selectedCompany.ratings.safety, fill: '#22c55e' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Worker Ratings</CardTitle>
                <CardDescription>Based on {selectedCompany.totalReviews} verified employee reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Work Conditions</span>
                      <span className="text-sm font-bold">{selectedCompany.ratings.workConditions.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(selectedCompany.ratings.workConditions / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Fair Pay</span>
                      <span className="text-sm font-bold">{selectedCompany.ratings.pay.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(selectedCompany.ratings.pay / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Employee Treatment</span>
                      <span className="text-sm font-bold">{selectedCompany.ratings.treatment.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(selectedCompany.ratings.treatment / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Workplace Safety</span>
                      <span className="text-sm font-bold">{selectedCompany.ratings.safety.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(selectedCompany.ratings.safety / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Reviews</CardTitle>
                <CardDescription>Recent feedback from employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews
                    .filter(r => r.companyId === selectedCompany.id)
                    .map(review => {
                      const job = jobs.find(j => j.id === review.jobId);
                      const avgRating = (review.ratings.workConditions + review.ratings.pay + review.ratings.treatment + review.ratings.safety) / 4;

                      return (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {review.verifiedEmployee && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                              {review.isAnonymous && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                                  Anonymous
                                </span>
                              )}
                              {job && (
                                <span className="text-xs text-muted-foreground">{job.title}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(avgRating)}
                              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{review.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {review.helpful} helpful
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {reviews.filter(r => r.companyId === selectedCompany.id).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No reviews yet for this company.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media Analysis (Dummy Data) */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media Analysis</CardTitle>
                <CardDescription>AI-powered sentiment analysis from social media (Sample Data)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedCompany.socialMediaScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Sentiment Score</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {selectedCompany.trustScore >= 4 ? 'High' : selectedCompany.trustScore >= 3 ? 'Medium' : 'Low'}
                      </p>
                      <p className="text-xs text-muted-foreground">Trust Level</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">1.2K</p>
                      <p className="text-xs text-muted-foreground">Mentions</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Key Concerns</h4>
                    <div className="space-y-2">
                      {selectedCompany.trustScore < 3 ? (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <span>Multiple reports of delayed wage payments</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <span>Safety equipment not consistently provided</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            <span>Long working hours without proper breaks</span>
                          </div>
                        </>
                      ) : selectedCompany.trustScore < 4 ? (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span>Occasional communication issues with management</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span>Benefits could be more comprehensive</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>No major concerns reported</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Positive Aspects</h4>
                    <div className="space-y-2">
                      {selectedCompany.trustScore >= 4 ? (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Consistent positive feedback about management</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Good work-life balance reported</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Fair compensation and benefits</span>
                          </div>
                        </>
                      ) : selectedCompany.trustScore >= 3 ? (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Generally respectful workplace environment</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>Opportunities for skill development</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Heart className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>Limited positive feedback available</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Note: Sample Data</p>
                    <p>This analysis is based on simulated data. In production, this would show real-time social media sentiment analysis powered by AI.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  const analysis = await analyzeSocialMedia(selectedCompany.name);
                  alert(`AI Analysis for ${selectedCompany.name}:\n\nTrust Level: ${analysis.trustLevel}\nSentiment Score: ${analysis.sentimentScore}/5\n\nSummary: ${analysis.summary}\n\nConcerns: ${analysis.concerns.join(', ')}\n\nPositives: ${analysis.positives.join(', ')}`);
                }}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Live AI Analysis'}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Company Report
              </Button>
            </div>
          </div>
        )}

        {/* Support Map View */}
        {(activeView === 'map' as ActiveView) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Find Support Near You</h2>
              <p className="text-muted-foreground">
                Locate NGOs, legal aid, healthcare, and housing assistance for migrant workers
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-muted rounded-lg p-8 mb-6 text-center">
                  <MapPin className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Interactive Map</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Map integration displays support organizations based on your location
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                    <div className="bg-card p-3 rounded">
                      <p className="text-xs text-muted-foreground">Your Location</p>
                      <p className="font-medium">Paris, France</p>
                    </div>
                    <div className="bg-card p-3 rounded">
                      <p className="text-xs text-muted-foreground">Nearest Help</p>
                      <p className="font-medium">{supportOrgs[0]?.distance || 0} km away</p>
                    </div>
                    <div className="bg-card p-3 rounded">
                      <p className="text-xs text-muted-foreground">Organizations</p>
                      <p className="font-medium">{supportOrgs.length} available</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    key="all"
                    variant={orgTypeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrgTypeFilter('all')}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    All Organizations
                  </Button>
                  {Array.from(new Set(supportOrgs.map(org => org.type))).map(type => (
                    <Button
                      key={type}
                      variant={orgTypeFilter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOrgTypeFilter(type)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {type}
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  {supportOrgs
                    .filter(org => orgTypeFilter === 'all' || org.type === orgTypeFilter)
                    .map(org => (
                      <Card
                        key={org.id}
                        className={`hover:shadow-md transition-all cursor-pointer ${selectedOrg?.id === org.id ? 'ring-2 ring-primary shadow-lg' : ''
                          }`}
                        onClick={() => setSelectedOrg(org)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{org.name}</h3>
                                    {selectedOrg?.id === org.id && (
                                      <div className="flex items-center gap-1 text-primary text-xs font-medium">
                                        <MapPin className="w-4 h-4 fill-primary" />
                                        Selected
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {org.address}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${org.type === 'NGO' ? 'bg-primary/10 text-primary' :
                                  org.type === 'Legal Aid' ? 'bg-secondary/10 text-secondary' :
                                    org.type === 'Healthcare' ? 'bg-accent/10 text-accent' :
                                      org.type === 'Housing' ? 'bg-muted text-muted-foreground' :
                                        'bg-primary/10 text-primary'
                                  }`}>
                                  {org.type}
                                </span>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <a href={`tel:${org.contact}`} className="text-primary hover:underline">
                                    {org.contact}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <a href={`mailto:${org.email}`} className="text-primary hover:underline">
                                    {org.email}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{org.openHours}</span>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Services Offered:</p>
                                <div className="flex flex-wrap gap-2">
                                  {org.services.map((service, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-muted rounded text-xs"
                                    >
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="md:w-40 flex md:flex-col gap-2 justify-center">
                              <div className="text-center mb-2">
                                <p className="text-2xl font-bold text-primary">{org.distance} km</p>
                                <p className="text-xs text-muted-foreground">from you</p>
                              </div>
                              <Button size="sm" className="flex-1">
                                Get Directions
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Call Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Emergency Assistance - France</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      If you are in immediate danger or need urgent help, contact these resources:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4" />
                        <div>
                          <p className="font-medium">SAMU (Emergency Medical)</p>
                          <a href="tel:15" className="text-sm text-primary hover:underline font-bold">
                            15
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Police Emergency</p>
                          <a href="tel:17" className="text-sm text-primary hover:underline font-bold">
                            17
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Anti-Trafficking Hotline</p>
                          <a href="tel:+33140472020" className="text-sm text-primary hover:underline">
                            +33 1 40 47 20 20
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4" />
                        <div>
                          <p className="font-medium">116 000 - Missing Children</p>
                          <a href="tel:116000" className="text-sm text-primary hover:underline font-bold">
                            116 000
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <img src="/Korus.png" alt="Korus footer logo symbolizing worker protection and transparency" className="w-5 h-5" />
                Korus: Collective Voice
              </h3>
              <p className="text-sm text-muted-foreground">
                Empowering migrant workers in France through transparency, support, and community.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Workers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Submit Anonymous Reviews</li>
                <li>Find Support Organizations</li>
                <li>Report Violations</li>
                <li>Access Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Companies</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Improve Your Rating</li>
                <li>Respond to Feedback</li>
                <li>Get Verified</li>
                <li>Post Jobs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Worker Rights Guide</li>
                <li>Legal Resources</li>
                <li>Report Abuse</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>Korus - Built with AI-powered social media analysis and real-time worker feedback</p>
            <p className="mt-2">Protecting migrant workers in France, promoting accountability, ensuring dignity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
