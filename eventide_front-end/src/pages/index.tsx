import { useState, useEffect, useCallback } from 'react';
import { Button, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import FeaturedSection from '../components/home/FeaturedSection';
import EventGrid from '../components/home/EventGrid';
import CTASection from '../components/home/CTASection';
import { EventCardProps } from '../components/events/EventCard';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../api/types';

const mapToCardProps = (event: Event): EventCardProps => ({
  id: event.id.toString(),
  title: event.name,
  date: new Date(event.startDate).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  }),
  location: event.location
    ? `${event.location.city}, ${event.location.state || event.location.country}`
    : 'Location TBD',
  imageUrl: event.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
  price: event.tickets?.length ? Math.min(...event.tickets.map((t) => t.price)) : 0,
  category: event.categories?.[0]?.name,
  highlights: [
    ...(event.recommendationReasons || []),
    ...(event.distanceKm !== undefined ? [`${event.distanceKm.toFixed(0)} km away`] : []),
  ].slice(0, 2),
});

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingEvents, setTrendingEvents] = useState<EventCardProps[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventCardProps[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<EventCardProps[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [browserLocation, setBrowserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recommendationMessage, setRecommendationMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const trending = await eventService.fetchTrendingEvents();
        setTrendingEvents(trending.map(mapToCardProps));

        if (isAuthenticated) {
          const [recommended, saved] = await Promise.allSettled([
            eventService.fetchRecommendedEvents(),
            eventService.fetchSavedEvents(),
          ]);
          if (recommended.status === 'fulfilled') {
            setRecommendedEvents(recommended.value.map(mapToCardProps));
          }
          if (saved.status === 'fulfilled') {
            const ids = new Set<string>(
              ((saved.value as any[]) || []).map((e: any) =>
                e.id?.toString() ?? e.event?.id?.toString()
              )
            );
            setSavedIds(ids);
          }
        }
      } catch (err) {
        console.error('Failed to fetch home page events', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);

  const loadPersonalizedRecommendations = useCallback(
    async (coords?: { latitude: number; longitude: number }) => {
      if (!isAuthenticated) return;
      setRecommendationLoading(true);
      try {
        const recommended = await eventService.fetchRecommendedEvents(
          coords?.latitude,
          coords?.longitude,
        );
        setRecommendedEvents(recommended.map(mapToCardProps));
        setRecommendationMessage(
          coords
            ? 'Recommendations based on your interests, follows, history, and proximity.'
            : 'Recommendations based on your interests, follows, and booking history.',
        );
      } catch {
        setRecommendationMessage('Could not refresh recommendations right now.');
      } finally {
        setRecommendationLoading(false);
      }
    },
    [isAuthenticated],
  );

  const handleSaveToggle = useCallback(
    async (id: string, currentlySaved: boolean) => {
      if (!isAuthenticated) { navigate('/login'); return; }
      const numId = parseInt(id, 10);
      try {
        if (currentlySaved) {
          await eventService.unsaveEvent(numId);
          setSavedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        } else {
          await eventService.saveEvent(numId);
          setSavedIds((prev) => new Set(prev).add(id));
        }
      } catch { /* silent */ }
    },
    [isAuthenticated, navigate],
  );

  const withSaveProps = (cards: EventCardProps[]): EventCardProps[] =>
    cards.map((c) => ({ ...c, isSaved: savedIds.has(c.id), onSaveToggle: handleSaveToggle }));

  const handleNearbyEvents = () => {
    if (!navigator.geolocation) {
      setNearbyError('Geolocation is not supported by your browser.');
      return;
    }
    setNearbyLoading(true);
    setNearbyError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setBrowserLocation(coords);
          const events = await eventService.fetchNearbyEvents(coords.latitude, coords.longitude, 50);
          setNearbyEvents(events.map(mapToCardProps));
          if (events.length === 0) setNearbyError('No events found near your location.');
          if (isAuthenticated) await loadPersonalizedRecommendations(coords);
        } catch {
          setNearbyError('Could not load nearby events. Try again.');
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyError('Location access denied. Please enable location permission.');
        setNearbyLoading(false);
      },
    );
  };

  const handlePersonalize = () => {
    if (browserLocation) {
      void loadPersonalizedRecommendations(browserLocation);
      return;
    }
    if (!navigator.geolocation) {
      setRecommendationMessage('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setBrowserLocation(coords);
        void loadPersonalizedRecommendations(coords);
      },
      () =>
        setRecommendationMessage('Location access denied. Showing preference-based recommendations only.'),
    );
  };

  const handleSearch = () =>
    navigate(`/events?search=${encodeURIComponent(searchQuery)}&page=1`);

  const showRecommended = isAuthenticated && recommendedEvents.length > 0;
  const mainGridEvents = withSaveProps(showRecommended ? recommendedEvents : trendingEvents.slice(3));

  return (
    <>
      <HeroSection
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Trending + Category chips */}
      {(isLoading || trendingEvents.length > 0) && (
        <section className="section bg-background">
          <div className="container-app">
            <FeaturedSection
              events={withSaveProps(trendingEvents.slice(0, 3))}
              isLoading={isLoading}
            />
          </div>
        </section>
      )}

      {/* Recommended / More Popular */}
      <section className="section bg-default-50/50">
        <div className="container-app">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {showRecommended ? 'Recommended For You' : 'More Popular Events'}
              </h2>
              <p className="text-sm text-default-500 mt-1">
                {showRecommended
                  ? 'Ranked by your interests, follows, and booking patterns'
                  : 'Events people are booking right now'}
              </p>
              {recommendationMessage && (
                <p className="text-xs text-primary mt-1">{recommendationMessage}</p>
              )}
            </div>
            {isAuthenticated && (
              <Button
                color="primary"
                variant="flat"
                size="sm"
                startContent={recommendationLoading ? <Spinner size="sm" /> : <Sparkles size={14} />}
                isDisabled={recommendationLoading}
                onPress={handlePersonalize}
                className="flex-none"
              >
                {recommendationLoading ? 'Personalizing...' : 'Personalize'}
              </Button>
            )}
          </div>
          <EventGrid events={mainGridEvents} isLoading={isLoading} />
        </div>
      </section>

      {/* Nearby Events */}
      <section className="section bg-background">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Events Near You</h2>
              <p className="text-sm text-default-500 mt-1">Discover happenings in your area</p>
            </div>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              startContent={nearbyLoading ? <Spinner size="sm" /> : <MapPin size={14} />}
              onPress={handleNearbyEvents}
              isDisabled={nearbyLoading}
            >
              {nearbyLoading ? 'Locating...' : nearbyEvents.length > 0 ? 'Refresh' : 'Find Near Me'}
            </Button>
          </div>

          {nearbyError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-default-400"
            >
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{nearbyError}</p>
            </motion.div>
          )}

          {!nearbyError && nearbyEvents.length === 0 && !nearbyLoading && (
            <div className="text-center py-12 border-2 border-dashed border-default-200 rounded-2xl">
              <MapPin size={40} className="mx-auto mb-3 text-default-300" />
              <p className="text-sm text-default-400 font-medium">
                Click "Find Near Me" to discover local events
              </p>
            </div>
          )}

          {nearbyEvents.length > 0 && (
            <EventGrid events={withSaveProps(nearbyEvents)} isLoading={nearbyLoading} />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-background">
        <div className="container-app">
          <CTASection />
        </div>
      </section>
    </>
  );
};

export default Home;
