import {api} from '@/api/api';
import { Event, Booking, BookingResponse } from '@/api/types';

/**
 * Fetches the events created by the currently logged-in organizer.
 * This corresponds to the [GET] /events/my-events endpoint.
 */
export const fetchMyEvents = async (): Promise<Event[]> => {
  try {
    // The auth token is automatically added by the Axios interceptor
    const response = await api.get<Event[]>('/events/my-events');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch organizer events:', error);
    // Re-throw the error so the context can handle it
    throw error;
  }
};

/**
 * Fetches the bookings made by the currently logged-in user.
 * This corresponds to the [GET] /bookings/my-bookings endpoint.
 */
export const fetchMyBookings = async (): Promise<BookingResponse> => {
  try {
    // The auth token is automatically added by the Axios interceptor
    const response = await api.get<BookingResponse>('/bookings/my-bookings');
    console.log("Fetched Bookings, ", response.data)
    return response.data;
    
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    // Re-throw the error so the context can handle it
    throw error;
  }
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

// Saved Events / Wishlist
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

// Reviews
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

// Profile
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

export const eventService = {
  fetchMyEvents,
  fetchMyBookings,
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
};