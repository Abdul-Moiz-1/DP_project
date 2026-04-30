import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { api } from '@/api/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/toast-provider';
import { eventService } from '@/services/eventService';
import { EventResponseDto } from '@/lib/dtos';
import { Review } from '@/api/types';

import EventHeader        from '../components/events/EventHeader';
import EventInfoCard      from '../components/events/EventInfoCard';
import BookingModal       from '../components/events/BookingModal';
import ReviewsTab         from '../components/events/ReviewsTab';
import OrganizerCard      from '../components/events/OrganizerCard';
import SidebarBookingCard from '../components/events/SidebarBookingCard';
import { EventLocationMap } from '../components/events/EventLocationMap';
import ShareButton        from '../components/events/ShareButton';
import AddToCalendar      from '../components/events/AddToCalendar';

interface ReviewsResponse {
  items: Review[];
  total: number;
  stats: { averageRating: number; totalReviews: number; ratings: Record<string, number> };
}

const EventDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { warning, success } = useToast();

  const eventId = parseInt(id || '0', 10);

  const [event,        setEvent]        = useState<EventResponseDto | null>(null);
  const [reviewsData,  setReviewsData]  = useState<ReviewsResponse | null>(null);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [availableSpots, setAvailableSpots] = useState(0);

  const [isSaved,        setIsSaved]        = useState(false);
  const [savingWishlist, setSavingWishlist]  = useState(false);
  const [isFollowing,    setIsFollowing]    = useState(false);
  const [followLoading,  setFollowLoading]  = useState(false);

  const [bookingOpen,     setBookingOpen]     = useState(false);
  const [bookingTicketId, setBookingTicketId] = useState<number | null>(null);
  const [bookingQty,      setBookingQty]      = useState(1);
  const [bookingLoading,  setBookingLoading]  = useState(false);
  const [bookingSuccess,  setBookingSuccess]  = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [eventRes, reviewsRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/reviews/event/${eventId}`),
        ]);
        const eventData: EventResponseDto = eventRes.data;
        setEvent(eventData);
        setAvailableSpots(eventData.capacity - (eventData.bookings ?? 0));
        setReviewsData(reviewsRes.data || null);
        setReviews(reviewsRes.data?.items || []);

        if (isAuthenticated && eventData.organizer?.id) {
          const [savedRes, followingRes] = await Promise.allSettled([
            eventService.checkEventSaved(eventId),
            eventService.fetchFollowing(),
          ]);
          if (savedRes.status === 'fulfilled')     setIsSaved(savedRes.value.isSaved);
          if (followingRes.status === 'fulfilled') {
            setIsFollowing(
              followingRes.value.some((f: any) => f.id === eventData.organizer.id),
            );
          }
        }
      } catch {
        /* silent — user sees empty UI */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [eventId, isAuthenticated]);

  const handleBookClick = (ticketId: number, qty: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setBookingTicketId(ticketId);
    setBookingQty(qty);
    setBookingSuccess(false);
    setBookingOpen(true);
  };

  const handlePurchase = async () => {
    if (!event || bookingTicketId === null) return;
    setBookingLoading(true);
    try {
      for (let i = 0; i < bookingQty; i++) {
        await api.post('/bookings', { eventId: event.id, ticketId: bookingTicketId });
      }
      setBookingSuccess(true);
      setAvailableSpots((prev) => Math.max(0, prev - bookingQty));
    } catch (error: any) {
      setBookingOpen(false);
      warning(error?.response?.data?.message ?? 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    setLoading(true);
    try {
      await api.post('/reviews', { eventId, rating, comment });
      const res = await api.get(`/reviews/event/${eventId}`);
      setReviewsData(res.data || null);
      setReviews(res.data?.items || []);
      success('Review submitted!');
    } catch (error: any) {
      warning(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowOrganizer = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!event?.organizer?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await eventService.unfollowOrganizer(event.organizer.id);
        setIsFollowing(false);
      } else {
        await eventService.followOrganizer(event.organizer.id);
        setIsFollowing(true);
        success('Following organizer!');
      }
    } catch (error: any) {
      warning(error?.response?.data?.message || 'Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setSavingWishlist(true);
    try {
      if (isSaved) {
        await eventService.unsaveEvent(eventId);
        setIsSaved(false);
      } else {
        await eventService.saveEvent(eventId);
        setIsSaved(true);
        success('Added to wishlist');
      }
    } catch (error: any) {
      warning(error?.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setSavingWishlist(false);
    }
  };

  const bookingTicketObj = event?.tickets?.find((t) => t.id === bookingTicketId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Initial loading overlay */}
      {loading && !event && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
          <LoaderCircle className="animate-spin text-primary" size={40} />
        </div>
      )}

      {/* Full-width hero (image + overlay title) */}
      <EventHeader
        images={event?.images.map((img) => img.imageUrl) || []}
        title={event?.name || ''}
        categories={event?.categories || []}
        status={(event as any)?.status}
        startDate={event ? String(event.startDate) : new Date().toISOString()}
        location={{
          city:    event?.location?.city    || '',
          country: event?.location?.country || '',
        }}
        onBack={() => navigate(-1)}
      />

      <div className="container-app py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: main content ── */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Quick actions row */}
            <div className="flex flex-wrap gap-3">
              <ShareButton eventName={event?.name || ''} eventUrl={`/events/${id}`} />
              {event && (
                <AddToCalendar
                  eventName={event.name}
                  description={event.description}
                  startDate={String(event.startDate)}
                  endDate={String(event.endDate)}
                  location={`${event.location.address}, ${event.location.city}`}
                />
              )}
            </div>

            {/* Event info + description + categories */}
            {event && <EventInfoCard event={event} />}

            {/* Location map */}
            {event?.location?.latitude && event?.location?.longitude && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4">Location</h2>
                <EventLocationMap eventId={event.id} location={event.location} />
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="font-display text-xl font-semibold mb-4">
                Reviews
                {reviewsData?.stats?.totalReviews
                  ? ` (${reviewsData.stats.totalReviews})`
                  : ''}
              </h2>
              <ReviewsTab
                reviews={reviews}
                onSubmitReview={handleSubmitReview}
                isUserAuthenticated={isAuthenticated}
                onRequireLogin={() => navigate('/login')}
              />
            </section>
          </div>

          {/* ── Right: sticky sidebar ── */}
          <aside className="lg:w-80 flex-none">
            <div className="sticky top-20 space-y-4">
              <SidebarBookingCard
                tickets={event?.tickets || []}
                availableSpots={availableSpots}
                capacity={event?.capacity || 0}
                eventEndDate={event ? String(event.endDate) : new Date().toISOString()}
                onBook={handleBookClick}
                isSaved={isSaved}
                savingWishlist={savingWishlist}
                onWishlist={handleWishlist}
              />

              {event?.organizer && (
                <OrganizerCard
                  organizer={event.organizer}
                  isFollowing={isFollowing}
                  followLoading={followLoading}
                  onFollow={handleFollowOrganizer}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Booking confirmation modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => { setBookingOpen(false); setBookingSuccess(false); }}
        ticket={bookingTicketObj}
        quantity={bookingQty}
        eventName={event?.name || ''}
        onConfirm={handlePurchase}
        isLoading={bookingLoading}
        isSuccess={bookingSuccess}
      />
    </div>
  );
};

export default EventDetails;
