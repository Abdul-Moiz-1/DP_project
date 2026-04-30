import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Bookmark } from 'lucide-react';
import { SavedEventItem } from '@/api/types';
import { eventService } from '@/services/eventService';
import { useToast } from '@/components/toast-provider';
import EventCard, { EventCardProps } from '@/components/events/EventCard';

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState<SavedEventItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const { success, warning } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setSavedEvents(await eventService.fetchSavedEvents());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId: number) => {
    try {
      await eventService.unsaveEvent(eventId);
      setSavedEvents((prev) => prev.filter((s) => s.event.id !== eventId));
      success('Removed from saved events');
    } catch (err: any) {
      warning(err.response?.data?.message || 'Failed to remove event');
    }
  };

  const toCardProps = (item: SavedEventItem): EventCardProps => ({
    id:       item.event.id.toString(),
    title:    item.event.name,
    date:     new Date(item.event.startDate).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
    location: item.event.location
      ? `${item.event.location.city}, ${item.event.location.country}`
      : 'Location TBD',
    imageUrl: item.event.images?.[0]?.imageUrl || '',
    price:    item.event.minPrice ?? 0,
    category: item.event.categories?.[0]?.name,
    isSaved:  true,
    onSaveToggle: (id) => handleUnsave(Number(id)),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Saved Events</h1>
        <p className="text-default-400 text-sm mt-0.5">
          {savedEvents.length} event{savedEvents.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {savedEvents.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-4">
            <Bookmark size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-sm mb-1">No saved events yet</p>
          <p className="text-xs text-default-400 mb-4">
            Browse events and tap the heart icon to save your favourites
          </p>
          <Button as={Link} to="/events" color="primary" size="sm">
            Browse Events
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map((item) => (
            <EventCard key={item.id} {...toCardProps(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
