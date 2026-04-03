
export enum EventStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}


export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface EventModel {
  id: string;
  title: string;
  description: string;

  images: string[];
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  price: number;
  category?: string;
  organizerName?: string;
  organizerAvatar?: string;
  organizerBio?: string;
  isVerified?: boolean;
  availableTickets: number;
  totalTickets: number;
  attendees: number;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  ticketTypes: TicketType[];
  reviews: Review[];
}

export interface Event {
  id: string
  name: string
  description: string
  imageUrl: string
  date: Date
  location: string
  price: number
  category: string
  organizerId: string
  organizationId: string
  capacity: number
  // categories: string[]
  tags: string[]

  // Suggested additional fields for enhanced UX
  status?: EventStatus
  attendees?: number
  isFavorite?: boolean
  rating?: number
  remainingSpots?: number
  organizer?: { name: string; avatar?: string }
  isSoldOut?: boolean
}

