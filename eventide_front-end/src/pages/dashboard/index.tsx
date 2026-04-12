"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from "@heroui/react";
import {
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  Plus,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Event, OrganizerStats } from "@/api/types";
import { api } from "@/api/api";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";
import { MetricCard } from "@/components/dashboard/metric-card";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    if (!user) return;
    if (user.role === "ORGANIZER") loadOrganizerDashboard();
  }, [user]);

  const loadOrganizerDashboard = async () => {
    setLoading(true);
    try {
      const [eventsData, statsData] = await Promise.all([
        eventService.fetchMyEvents(),
        eventService.fetchOrganizerStats(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load organizer dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (eventId: number) => {
    setDeletingId(eventId);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const response = await api.delete(`/events/${deletingId}`);
      if (response.status === 200) {
        setEvents((prev) => prev.filter((e) => e.id !== deletingId));
        setStats((prev) => ({
          ...prev,
          totalEvents: prev.totalEvents - 1,
        }));
        success("Event deleted successfully");
      }
    } catch (error: any) {
      console.error("Failed to delete event:", error);
      warning(error.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleteModal(false);
      setDeletingId(null);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (now < start) return { label: "Upcoming", color: "primary" as const };
    if (now >= start && now <= end)
      return { label: "Ongoing", color: "success" as const };
    return { label: "Past", color: "default" as const };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (user?.role === "USER") {
    return <AttendeeDashboardWrapper />;
  }

  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Delete Event</h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              Are you sure you want to delete this event? This action cannot be
              undone. All bookings associated with this event will also be
              removed.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setDeleteModal(false);
                setDeletingId(null);
              }}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete Event
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-default-500 mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-foreground">
            Hello, {user?.name || "Organizer"}
          </h1>
          <p className="text-default-400 mt-1">
            Here's what's happening with your events
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => navigate("/dashboard/events/create")}
        >
          Create Event
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events"
          value={stats.totalEvents.toString()}
          icon={<Calendar className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          icon={<Ticket className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Active Events"
          value={(stats.upcomingEvents + stats.ongoingEvents).toString()}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Event Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-default-500 font-medium">
                Upcoming Events
              </p>
              <Chip size="sm" color="primary" variant="flat">
                {stats.upcomingEvents}
              </Chip>
            </div>
            <Progress
              value={
                stats.totalEvents > 0
                  ? (stats.upcomingEvents / stats.totalEvents) * 100
                  : 0
              }
              color="primary"
              size="sm"
              className="mb-2"
            />
            <p className="text-xs text-default-400">
              {stats.totalEvents > 0
                ? `${Math.round((stats.upcomingEvents / stats.totalEvents) * 100)}% of total events`
                : "No events yet"}
            </p>
          </CardBody>
        </Card>

        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-default-500 font-medium">
                Ongoing Events
              </p>
              <Chip size="sm" color="success" variant="flat">
                {stats.ongoingEvents}
              </Chip>
            </div>
            <Progress
              value={
                stats.totalEvents > 0
                  ? (stats.ongoingEvents / stats.totalEvents) * 100
                  : 0
              }
              color="success"
              size="sm"
              className="mb-2"
            />
            <p className="text-xs text-default-400">
              {stats.totalEvents > 0
                ? `${Math.round((stats.ongoingEvents / stats.totalEvents) * 100)}% of total events`
                : "No events yet"}
            </p>
          </CardBody>
        </Card>

        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-default-500 font-medium">
                Past Events
              </p>
              <Chip size="sm" color="default" variant="flat">
                {stats.pastEvents}
              </Chip>
            </div>
            <Progress
              value={
                stats.totalEvents > 0
                  ? (stats.pastEvents / stats.totalEvents) * 100
                  : 0
              }
              color="default"
              size="sm"
              className="mb-2"
            />
            <p className="text-xs text-default-400">
              {stats.totalEvents > 0
                ? `${Math.round((stats.pastEvents / stats.totalEvents) * 100)}% of total events`
                : "No events yet"}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="flex items-center justify-between px-6 pt-5 pb-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Recent Events
            </h2>
            <p className="text-default-400 text-sm mt-1">
              Manage and track your events
            </p>
          </div>
          <Button
            variant="flat"
            color="primary"
            size="sm"
            onPress={() => navigate("/dashboard/events")}
          >
            View All Events
          </Button>
        </CardHeader>

        <CardBody className="px-6 pb-5">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500 mb-4">
                You haven't created any events yet
              </p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => navigate("/dashboard/events/create")}
              >
                Create Your First Event
              </Button>
            </div>
          ) : (
            <Table aria-label="Recent events table" removeWrapper>
              <TableHeader>
                <TableColumn>EVENT NAME</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>BOOKINGS</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.images?.[0]?.imageUrl ? (
                            <img
                              src={event.images[0].imageUrl}
                              alt={event.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-default-400" />
                            </div>
                          )}
                          <span className="font-medium">{event.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(event.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-default-400 text-xs">
                            {new Date(event.startDate).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{event.location?.city}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-default-400" />
                          <span className="text-sm">
                            {(event as any).bookings ?? 0} / {event.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={status.color}
                          variant="flat"
                        >
                          {status.label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            as={Link}
                            to={`/events/${event.id}`}
                            isIconOnly
                            size="sm"
                            variant="light"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            as={Link}
                            to={`/dashboard/event/${event.id}`}
                            isIconOnly
                            size="sm"
                            variant="light"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            isDisabled={deletingId === event.id}
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => openDeleteModal(event.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Quick Stats Footer */}
      {stats.totalBookings > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-default-200 shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Revenue Overview
                </h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-default-400 mt-1">
                From {stats.totalBookings} confirmed bookings
              </p>
            </CardBody>
          </Card>

          <Card className="border border-default-200 shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Ticket className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Booking Summary
                </h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalBookings}
              </p>
              <p className="text-sm text-default-400 mt-1">
                Across {stats.totalEvents} events
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function AttendeeDashboardWrapper() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalSpent: 0,
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, bookingsData] = await Promise.all([
        eventService.fetchAttendeeStats(),
        eventService.fetchMyBookings(),
      ]);
      setStats(statsData);
      setBookings(bookingsData?.items || []);
    } catch (error) {
      console.error("Failed to load attendee dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return <UserDashboard user={user} stats={stats} bookings={bookings} />;
}
