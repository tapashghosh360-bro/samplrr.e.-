export type Language = 'bn' | 'en';

export type PropertyType = 
  | 'Apartment' 
  | 'Penthouse' 
  | 'Villa' 
  | 'Duplex' 
  | 'Plot' 
  | 'Commercial' 
  | 'Studio';

export type ConstructionStatus = 'Ready to Move' | 'Under Construction' | 'Upcoming';

export type FacingDirection = 'North' | 'South' | 'East' | 'West' | 'North-East' | 'South-East' | 'South-Facing Lakeview';

export interface VerificationState {
  identityReviewed: boolean;
  listingReviewed: boolean;
  documentsSupplied: boolean;
  approvalReferenceSupplied: boolean;
  approvalRefNumber?: string;
  sourceOfClaim: string;
  lastVerifiedAt: string;
}

export interface LandmarkDistance {
  name_en: string;
  name_bn: string;
  distance: string;
  driveTime: string;
  category: 'transit' | 'education' | 'hospital' | 'lifestyle' | 'nature';
}

export interface Property {
  id: string;
  title_bn: string;
  title_en: string;
  tagline_bn: string;
  tagline_en: string;
  description_bn: string;
  description_en: string;
  property_type: PropertyType;
  sale_or_rent: 'Buy' | 'Rent';
  price_bdt: number;
  price_display_bn: string;
  price_display_en: string;
  price_per_sq_ft: number;
  area_sq_ft: number;
  area_katha: number;
  area_decimal: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parking: number;
  facing: FacingDirection;
  floor_level?: string;
  construction_status: ConstructionStatus;
  handover_date: string;
  location_city: string;
  location_area: string;
  location_sector_block_road: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  developer_id: string;
  developer_name: string;
  seller_id?: string;
  gallery: string[];
  hero_video?: string;
  poster_image: string;
  floor_plans: {
    title: string;
    image: string;
    area: string;
  }[];
  amenities: string[];
  documents: {
    name: string;
    type: string;
    verified: boolean;
    date: string;
  }[];
  landmarks: LandmarkDistance[];
  verification_states: VerificationState;
  last_updated_at: string;
  featured_status: boolean;
  listing_status: 'Available' | 'Reserved' | 'Sold';
}

export interface Project {
  id: string;
  project_name_bn: string;
  project_name_en: string;
  tagline_bn: string;
  tagline_en: string;
  description_bn: string;
  description_en: string;
  developer_id: string;
  developer_name: string;
  location: string;
  unit_types: string[];
  price_range_bn: string;
  price_range_en: string;
  handover_date: string;
  amenities: string[];
  gallery: string[];
  video?: string;
  brochure_available: boolean;
  availability: 'Booking Open' | 'Limited Units' | 'Sold Out';
  verification_states: VerificationState;
  last_updated_at: string;
}

export interface Developer {
  id: string;
  name: string;
  logo: string;
  founded_year: number;
  description_bn: string;
  description_en: string;
  contact_information: {
    phone: string;
    email: string;
    office_address: string;
  };
  identity_review_state: boolean;
  current_projects_count: number;
  completed_projects_count: number;
  website: string;
}

export interface Lead {
  id: string;
  lead_type: 'whatsapp' | 'viewing' | 'callback' | 'brochure' | 'nrb' | 'landowner' | 'developer';
  property_id?: string;
  property_name?: string;
  project_id?: string;
  source_page: string;
  cta_type: string;
  name: string;
  phone: string;
  email?: string;
  language: Language;
  budget?: string;
  desired_area?: string;
  country?: string;
  timezone?: string;
  preferred_time?: string;
  message?: string;
  consent: boolean;
  created_at: string;
  status: 'New' | 'In Contact' | 'Viewing Scheduled' | 'Closed';
  assigned_advisor?: string;
}

export interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export interface FilterState {
  sale_or_rent: 'All' | 'Buy' | 'Rent';
  city: string;
  area: string;
  property_type: string;
  min_price: number;
  max_price: number;
  min_sqft: number;
  max_sqft: number;
  bedrooms: number | 'all';
  bathrooms: number | 'all';
  construction_status: string;
  developer: string;
  search_query: string;
  sort_by: 'featured' | 'price_low' | 'price_high' | 'area' | 'newest';
}
