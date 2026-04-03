"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
  Input,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Calendar,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Event } from "@/api/types";
import { api } from "@/api/api";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";

export default function DashboardEvents() {
  const navigate = useNavigate();
  const { success, warning } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.fetchMyEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const response = await api.delete(`/events/${deletingId}`);
      if (response.status === 200) {
        setEvents((prev) => prev.filter((e) => e.id !== deletingId));
        success("Event deleted successfully");
      }
    } catch (error: any) {
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

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              Are you sure you want to delete this event? This action cannot be
              undone.
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Events</h1>
          <p className="text-default-400 mt-1">
            Manage all your created events
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

      {/* Search */}
      {events.length > 0 && (
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<Search className="w-4 h-4 text-default-400" />}
          classNames={{ inputWrapper: "bg-background border border-default-200" }}
          isClearable
          onClear={() => setSearchQuery("")}
        />
      )}

      {/* Events Table */}
      <Card className="border border-default-200 shadow-sm">
        <CardBody className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500 mb-2">
                {events.length === 0
                  ? "You haven't created any events yet"
                  : "No events match your search"}
              </p>
              {events.length === 0 && (
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => navigate("/dashboard/events/create")}
                  className="mt-4"
                >
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            <Table aria-label="Events table" removeWrapper>
              <TableHeader>
                <TableColumn>EVENT</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>CAPACITY</TableColumn>
                <TableColumn>CATEGORIES</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.images?.[0]?.imageUrl ? (
                            <img
                              src={event.images[0].imageUrl}
                              alt={event.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-default-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-default-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-xs text-default-400 line-clamp-1 max-w-[200px]">
                              {event.description}
                            </p>
                          </div>
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
                              { hour: "numeric", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {event.location?.city}
                          {event.location?.country
                            ? `, ${event.location.country}`
                            : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-default-400" />
                          <span className="text-sm">{event.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {event.categories?.slice(0, 2).map((cat) => (
                            <Chip
                              key={cat.id}
                              size="sm"
                              variant="flat"
                              color="default"
                            >
                              {cat.name}
                            </Chip>
                          ))}
                          {event.categories?.length > 2 && (
                            <Chip size="sm" variant="flat">
                              +{event.categories.length - 2}
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color={status.color} variant="flat">
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
                            to={`/dashboard/event/${event.id}/analytics`}
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="secondary"
                            title="Analytics"
                          >
                            <BarChart2 className="w-4 h-4" />
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
                            onPress={() => {
                              setDeletingId(event.id);
                              setDeleteModal(true);
                            }}
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
    </div>
  );
}
