

// src/pages/EventDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Divider,
  Tabs,
  Tab,
} from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';

import HeroGallery from '../components/events/HeroGallery';
import EventHeader from '../components/events/EventHeader';
import EventInfoCard from '../components/events/EventInfoCard';
import TicketsTab from '../components/events/TicketsTab';
import BookingModal from '../components/events/BookingModal';
import ReviewsTab from '../components/events/ReviewsTab';
import OrganizerCard from '../components/events/OrganizerCard';
import SidebarBookingCard from '../components/events/SidebarBookingCard';
import EventMap from '../components/events/EventMap';
import ShareButton from '../components/events/ShareButton';
import AddToCalendar from '../components/events/AddToCalendar';
import {Event, Review} from '@/api/types'
import { LoaderCircle } from 'lucide-react';
import { api } from '@/api/api';
import { useToast } from '@/components/toast-provider';
import { EventResponseDto } from '@/lib/dtos';
import { eventService } from '@/services/eventService';
// import { TicketType } from '@/types/event.types';


interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratings: {"1":0,"2":0,"3":0,"4":0,"5":0};
}

interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  stats: ReviewStats;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // state
  const [event, setEvent] = useState<EventResponseDto | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [availableTickets, setAvailableTickets] = useState<number | 0>(0)
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  const eventId: number = parseInt(id || '0', 10);

  const {warning, success} = useToast()

  useEffect(()=> {
    // fetch event by id logic here
    setLoading(true);
    try {
      async function fetchEvent(){
        
        const eventResponse = await api.get(`/events/${eventId}`);
        console.log(eventResponse)
        const eventData:EventResponseDto = await eventResponse.data;
        const remainingTickets = eventData.capacity - eventData.bookings 
        setEvent(eventData);
        setAvailableTickets(remainingTickets)
      }
      fetchEvent().finally(() => setLoading(false));
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }

    try {
      async function fetchReviews(){
        const reviewsResponse = await api.get(`/reviews/event/${eventId}`);
        console.log(reviewsResponse)
        const reviewsData = reviewsResponse.data;
        console.log(`Reviews data : ${JSON.stringify(reviewsData)}`);
        setReviewsData(reviewsData || null);
        setReviews(reviewsData.items || []);
        
      }
      fetchReviews().finally(() => setLoading(false));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }

    if (isAuthenticated) {
      eventService.checkEventSaved(eventId)
        .then((res) => setIsSaved(res.isSaved))
        .catch(() => {});
    }

  }, [id, isAuthenticated])




  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setBookingOpen(true);
  };

  const handlePurchase = async (ticketId: string) => {
    if (!event) return;
    
    try {
      setLoading(true);
      const response = await api.post(`/bookings`, {
          eventId: event.id,
          ticketId: parseInt(ticketId),
      });
      
      if (!(response.status == 200)) {
        throw new Error('Failed to create booking');
      }
      
      const data = await response.data;
      setBookingOpen(false);
      navigate('/dashboard/my-tickets', { 
        state: { 
          bookingSuccess: true,
          bookingId: data.id
        } 
      });
    } catch (error:any) {
      console.error('Error creating booking:', error?.response?.data.message);
      setBookingOpen(false)
      warning(error?.response.data.message)
    } finally {
      setLoading(false);
    }
  };

   const handleSubmitReview = async (rating: number, comment: string) => {
    console.log('submit review:', rating, comment);
    setLoading(true)
    // call API or optimistic update
    try {
      const response = await api.post(`/reviews`,{
        eventId,
        rating,
        comment
      })
      if(!(response.status == 200)){
        warning(response.data?.message)
        throw new Error(`Error in create review ${response.data?.message}`)
      }
    } catch (error: any) {
      warning(error?.response?.data?.message)
      throw new Error(`Failed to create review ${error?.response?.data?.message}`)
      
    } finally {
      setLoading(false)
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
        success('Removed from wishlist');
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

  const handleRequireLogin = () => {
    navigate('/login');
  };

    return (
    <div className="min-h-screen bg-background">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
          <LoaderCircle className="animate-spin text-primary" size={48} />
        </div>
      )}
      <HeroGallery
        images={event?.images.map(img => img.imageUrl) || []}
        selectedIndex={selectedImage}
        onSelect={setSelectedImage}
        onBack={() => navigate(-1)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <EventHeader
              title={event ? event.name: 'N/A'}
              category={event?.categories.map(cat => cat.name).join(', ') || ''}
              rating={reviewsData?.stats?.averageRating ?? 0}
              reviewsCount={reviewsData?.stats?.totalReviews ?? 0}
              attendees={event?.bookings}
              isVerified={true}
            />

            <div className="flex gap-3">
              <ShareButton eventName={event?.name || ''} eventUrl={`/events/${id}`} />
              {event && (
                <AddToCalendar
                  eventName={event.name}
                  description={event.description}
                  startDate={event.startDate.toString()}
                  endDate={event.endDate.toString()}
                  location={`${event.location.address}, ${event.location.city}`}
                />
              )}
            </div>

            <Divider />

            <EventInfoCard
              date={event? event.startDate: 'Start Date'}
              endDate={event? event.endDate: 'End Date'}
              location={event? event.location.city: 'Location'}
              address={event ? event.location.address: 'Address'}
              availableTickets={availableTickets}
              totalTickets={event?.capacity || 0}
            />

            <Tabs aria-label="Event information" size="lg" color="primary">
              <Tab key="about" title="About">
                <div className="pt-4">
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-default-600 leading-relaxed">
                    {event && event.description}
                  </div>
                </div>
              </Tab>

              <Tab key="tickets" title="Tickets">
                <div className="pt-4">
                  <TicketsTab
                    ticketTypes={event ? event.tickets: []}
                    selectedTicketId={selectedTicketId}
                    onSelectTicket={setSelectedTicketId}
                  />
                </div>
              </Tab>

              {event?.location?.latitude && event?.location?.longitude && (
                <Tab key="location" title="Location">
                  <div className="pt-4">
                    <EventMap
                      latitude={event.location.latitude}
                      longitude={event.location.longitude}
                      eventName={event.name}
                      address={`${event.location.address}, ${event.location.city}`}
                      eventId={event.id}
                    />
                  </div>
                </Tab>
              )}

              <Tab key="reviews" title={`Reviews (${reviews.length})`}>
                <div className="pt-4">
                  <ReviewsTab
                    reviews={reviews}
                    onSubmitReview={handleSubmitReview}
                    isUserAuthenticated={isAuthenticated}
                    onRequireLogin={handleRequireLogin}
                  />
                </div>
              </Tab>
            </Tabs>

            <OrganizerCard
              avatar={event ? event.organizer.name : 'Organizer'}
              name={event?.organizer?.organizerProfile?.organizationName || event?.organizer.name || 'Organizer'}
              bio={`Organized by ${event?.organizer.name || 'Unknown'}`}
              isVerified={true}
              onFollow={() => {
                console.log('follow organizer');
              }}
            />
          </div>

          <div className="lg:col-span-1">
            <SidebarBookingCard
              price={event?.tickets ? Math.min(...event.tickets.map(t => t.price)) : 0}
              availableTickets={availableTickets}
              category={event?.categories ? event.categories.map(cat => cat.name).join(', ') : 'N/A'}
              rating={reviewsData? reviewsData.stats.averageRating : 0}
              onBook={handleBookClick}
              endDate={event? event.endDate: 'Date not found'}
              onWishlist={handleWishlist}
              isSaved={isSaved}
              savingWishlist={savingWishlist}
            />
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        ticketTypes={event?.tickets || []}
        onPurchase={handlePurchase}
      />
    </div>
  ); 

  }
  


export default EventDetails;
