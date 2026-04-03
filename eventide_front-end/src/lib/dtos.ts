// Event DTOs
export interface LocationDto {
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  googleMapsLink?: string
}

export interface TicketDto {
  name: string
  price: number
  salesStartDate: string
  salesEndDate: string
}

export interface CreateEventDto {
  name: string
  description: string
  startDate: string
  endDate: string
  capacity: number
  location: LocationDto
  imageUrls?: string[]
  tickets: TicketDto[]
  categoryIds?: number[]
}

export interface UpdateEventDto {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  capacity?: number
  location?: LocationDto
  imageUrls?: string[]
  categoryIds?: number[]
  tickets?: TicketDto[]
}

export interface EventResponseDto {
  id: number
  name: string
  description: string
  startDate: Date | string
  endDate: Date | string
  capacity: number
  organizer: {
    id: number
    name: string
    email: string
    organizerProfile?: {
      organizationName: string
      address: string
      city: string
      state: string
      country: string
    }
  }
  location: LocationDto & { id: number }
  images: { id: number; imageUrl: string }[]
  tickets: { id: number; name: string; price: number; salesStartDate: Date | string; salesEndDate: Date | string }[]
  categories: { id: number; name: string }[]
  bookings: number,
  createdAt: Date
}

