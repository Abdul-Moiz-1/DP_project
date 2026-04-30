import { useEffect, useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
} from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';
import { Event, OrganizerStats } from '@/api/types';
import { api } from '@/api/api';
import { eventService } from '@/services/eventService';
import { useToast } from '@/components/toast-provider';
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';

// ── Organizer wrapper ────────────────────────────────────────────────────────
function OrganizerDashboardWrapper() {
  const { user } = useAuth();
  const { success, warning } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrganizerStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    pastEvents: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [eventsData, statsData] = await Promise.all([
          eventService.fetchMyEvents(),
          eventService.fetchOrganizerStats(),
        ]);
        setEvents(eventsData);
        setStats(statsData);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/events/${deletingId}`);
      setEvents((prev) => prev.filter((e) => e.id !== deletingId));
      setStats((prev) => ({ ...prev, totalEvents: prev.totalEvents - 1 }));
      success('Event deleted');
    } catch (error: any) {
      warning(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteModal(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <OrganizerDashboard
        user={user}
        stats={stats}
        events={events}
        onDeleteClick={(id) => { setDeletingId(id); setDeleteModal(true); }}
      />
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalBody>
            <p className="text-default-500 text-sm">
              Are you sure you want to delete this event? This action cannot be undone and all
              associated bookings will be removed.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => { setDeleteModal(false); setDeletingId(null); }}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete Event
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// ── Attendee wrapper ─────────────────────────────────────────────────────────
function AttendeeDashboardWrapper() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0, upcomingEvents: 0, pastEvents: 0, totalSpent: 0,
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, bookingsData] = await Promise.all([
          eventService.fetchAttendeeStats(),
          eventService.fetchMyBookings(),
        ]);
        setStats(statsData);
        setBookings(bookingsData?.items || []);
      } catch {
        setStats({ totalBookings: 0, upcomingEvents: 0, pastEvents: 0, totalSpent: 0 });
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <UserDashboard user={user} stats={stats} bookings={bookings} />;
}

// ── Page entry ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'ORGANIZER') return <OrganizerDashboardWrapper />;
  return <AttendeeDashboardWrapper />;
}
