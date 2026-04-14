import {api} from '@/api/api';
import { Event, Booking, BookingResponse } from '@/api/types';

// ─── Events ──────────────────────────────────────────────────────────────────

export const fetchMyEvents = async (): Promise<Event[]> => {
  const response = await api.get<Event[]>('/events/my-events');
  return response.data;
};

export const updateEventStatus = async (eventId: number, status: string) => {
  const response = await api.patch(`/events/${eventId}/status`, { status });
  return response.data;
};

export const fetchMyBookings = async (): Promise<BookingResponse> => {
  const response = await api.get<BookingResponse>('/bookings/my-bookings');
  return response.data;
};

export const fetchOrganizerStats = async () => {
  const response = await api.get('/events/organizer-stats');
  return response.data;
};

export const fetchEventAnalytics = async (eventId: number) => {
  const response = await api.get(`/events/${eventId}/analytics`);
  return response.data;
};

export const fetchAttendeeStats = async () => {
  const response = await api.get('/bookings/my-stats');
  return response.data;
};

export const fetchEventBookings = async (eventId: number) => {
  const response = await api.get(`/bookings/event/${eventId}`);
  return response.data;
};

export const fetchTrendingEvents = async (): Promise<Event[]> => {
  const response = await api.get('/events/trending');
  return response.data;
};

export const fetchRecommendedEvents = async (latitude?: number, longitude?: number): Promise<Event[]> => {
  const response = await api.get('/events/recommended', {
    params: latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
  });
  return response.data;
};

export const fetchNearbyEvents = async (lat: number, lng: number, radius = 50): Promise<Event[]> => {
  const response = await api.get('/events/nearby', { params: { latitude: lat, longitude: lng, radius } });
  return response.data;
};

// ─── Saved Events / Wishlist ──────────────────────────────────────────────────

export const saveEvent = async (eventId: number) => {
  const response = await api.post('/saved-events', { eventId });
  return response.data;
};

export const unsaveEvent = async (eventId: number) => {
  const response = await api.delete(`/saved-events/${eventId}`);
  return response.data;
};

export const fetchSavedEvents = async () => {
  const response = await api.get('/saved-events');
  return response.data;
};

export const checkEventSaved = async (eventId: number) => {
  const response = await api.get(`/saved-events/check/${eventId}`);
  return response.data;
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const fetchMyReviews = async () => {
  const response = await api.get('/reviews/my-reviews');
  return response.data;
};

export const createReview = async (eventId: number, rating: number, comment: string) => {
  const response = await api.post('/reviews', { eventId, rating, comment });
  return response.data;
};

export const updateReview = async (reviewId: number, data: { rating?: number; comment?: string }) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId: number) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const updateProfile = async (data: { name: string }) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.post('/users/change-password', { currentPassword, newPassword });
  return response.data;
};

export const updateOrganizerProfile = async (data: Record<string, string>) => {
  const response = await api.patch('/users/organizer-profile', data);
  return response.data;
};

// ─── Follow / Unfollow Organizer ──────────────────────────────────────────────
// Implements the Follow/Unfollow strategy used by the Observer pattern on the backend.

export const followOrganizer = async (organizerId: number) => {
  const response = await api.post(`/users/follow/${organizerId}`);
  return response.data;
};

export const unfollowOrganizer = async (organizerId: number) => {
  const response = await api.delete(`/users/follow/${organizerId}`);
  return response.data;
};

export const fetchFollowing = async () => {
  const response = await api.get('/users/following');
  return response.data;
};

// ─── User Preferences ────────────────────────────────────────────────────────

export const fetchUserPreferences = async () => {
  const response = await api.get('/users/preferences');
  return response.data;
};

export const setUserPreferences = async (categoryIds: number[]) => {
  const response = await api.post('/users/preferences', { categoryIds });
  return response.data;
};

// ─── Service Object (for named imports) ──────────────────────────────────────

export const eventService = {
  fetchMyEvents,
  updateEventStatus,
  fetchMyBookings,
  fetchTrendingEvents,
  fetchRecommendedEvents,
  fetchNearbyEvents,
  fetchOrganizerStats,
  fetchEventAnalytics,
  fetchAttendeeStats,
  fetchEventBookings,
  saveEvent,
  unsaveEvent,
  fetchSavedEvents,
  checkEventSaved,
  fetchMyReviews,
  createReview,
  updateReview,
  deleteReview,
  updateProfile,
  changePassword,
  updateOrganizerProfile,
  followOrganizer,
  unfollowOrganizer,
  fetchFollowing,
  fetchUserPreferences,
  setUserPreferences,
};


