import { useEffect, useState } from 'react';
import {
  Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input,
} from '@heroui/react';
import { Plus, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/api/types';
import { api } from '@/api/api';
import { eventService } from '@/services/eventService';
import { useToast } from '@/components/toast-provider';
import EventRow from '@/components/dashboard/EventRow';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['All', 'PUBLISHED', 'DRAFT', 'CANCELLED', 'COMPLETED'] as const;
type Filter = typeof STATUS_FILTERS[number];

const FILTER_COLORS: Record<Filter, 'default' | 'success' | 'warning' | 'danger' | 'primary'> = {
  All:       'primary',
  PUBLISHED: 'success',
  DRAFT:     'warning',
  CANCELLED: 'danger',
  COMPLETED: 'default',
};

export default function DashboardEvents() {
  const navigate = useNavigate();
  const { success, warning } = useToast();

  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState<Filter>('All');
  const [deletingId,   setDeletingId]   = useState<number | null>(null);
  const [deleteModal,  setDeleteModal]  = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      setEvents(await eventService.fetchMyEvents());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/events/${deletingId}`);
      setEvents((prev) => prev.filter((e) => e.id !== deletingId));
      success('Event deleted');
    } catch (error: any) {
      warning(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteModal(false);
      setDeletingId(null);
    }
  };

  const filtered = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
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
      {/* Delete modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              This action cannot be undone. All associated bookings will also be removed.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => { setDeleteModal(false); setDeletingId(null); }}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>Delete Event</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Events</h1>
          <p className="text-default-400 text-sm mt-0.5">
            {events.length} event{events.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          color="primary"
          size="sm"
          startContent={<Plus size={15} />}
          onPress={() => navigate('/dashboard/events/create')}
        >
          Create Event
        </Button>
      </div>

      {/* Search + status filters */}
      {events.length > 0 && (
        <div className="space-y-3">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search size={15} className="text-default-400" />}
            isClearable
            onClear={() => setSearchQuery('')}
            size="sm"
            classNames={{ inputWrapper: 'bg-content1 border border-divider' }}
          />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  statusFilter === f
                    ? 'bg-primary text-white'
                    : 'bg-default-100 text-default-600 hover:bg-default-200',
                )}
              >
                {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                {f !== 'All' && (
                  <span className="ml-1.5 opacity-70">
                    {events.filter((e) => e.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event list */}
      {filtered.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mx-auto w-fit mb-4">
            <Calendar size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-sm mb-1">
            {events.length === 0 ? "No events yet" : "No events match your filters"}
          </p>
          {events.length === 0 && (
            <Button
              color="primary"
              size="sm"
              startContent={<Plus size={14} />}
              onPress={() => navigate('/dashboard/events/create')}
              className="mt-3"
            >
              Create your first event
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onDeleteClick={(id) => { setDeletingId(id); setDeleteModal(true); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
