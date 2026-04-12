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
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Calendar,
  DollarSign,
  Eye,
  Ticket,
  Users,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Event, EventBooking } from "@/api/types";
import { eventService } from "@/services/eventService";

export default function BookingsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [detailBooking, setDetailBooking] = useState<EventBooking | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadBookings(Number(selectedEventId));
    } else {
      setBookings([]);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const data = await eventService.fetchMyEvents();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadBookings = async (eventId: number) => {
    setLoadingBookings(true);
    try {
      const data = await eventService.fetchEventBookings(eventId);
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "WAITLISTED":
        return "warning";
      default:
        return "default";
    }
  };

  const selectedEvent = events.find(
    (e) => e.id.toString() === selectedEventId
  );

  const confirmedCount = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + Number(b.ticket.price), 0);

  if (loadingEvents) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-default-400 mt-1">
          View and manage bookings for your events
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="border border-default-200">
          <CardBody className="text-center py-12">
            <Calendar className="w-12 h-12 text-default-300 mx-auto mb-4" />
            <p className="text-default-500 mb-2">No events found</p>
            <p className="text-default-400 text-sm">
              Create an event first to see bookings here
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Event Selector */}
          <Card className="border border-default-200 shadow-sm">
            <CardBody className="p-5">
              <Select
                label="Select Event"
                placeholder="Choose an event to view bookings"
                selectedKeys={selectedEventId ? [selectedEventId] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0]?.toString();
                  if (key) setSelectedEventId(key);
                }}
                classNames={{ trigger: "h-14" }}
              >
                {events.map((event) => (
                  <SelectItem key={event.id.toString()}>
                    {event.name} —{" "}
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          {/* Event Stats */}
          {selectedEvent && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border border-default-200 shadow-sm">
                <CardBody className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Total Bookings</p>
                    <p className="text-xl font-bold">{bookings.length}</p>
                  </div>
                </CardBody>
              </Card>
              <Card className="border border-default-200 shadow-sm">
                <CardBody className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Ticket className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Confirmed</p>
                    <p className="text-xl font-bold">
                      {confirmedCount} / {selectedEvent.capacity}
                    </p>
                  </div>
                </CardBody>
              </Card>
              <Card className="border border-default-200 shadow-sm">
                <CardBody className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <DollarSign className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Revenue</p>
                    <p className="text-xl font-bold">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Bookings Table */}
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="px-6 pt-5 pb-0">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedEvent ? selectedEvent.name : "Select an event"}
                </h2>
                <p className="text-default-400 text-sm mt-1">
                  {bookings.length} booking
                  {bookings.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 pb-5">
              {loadingBookings ? (
                <div className="flex justify-center py-12">
                  <Spinner color="primary" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-default-300 mx-auto mb-4" />
                  <p className="text-default-500">
                    No bookings for this event yet
                  </p>
                </div>
              ) : (
                <Table aria-label="Event bookings table" removeWrapper>
                  <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>TICKET TYPE</TableColumn>
                    <TableColumn>PRICE</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <span className="font-medium">
                            {booking.user.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-default-500 text-sm">
                            {booking.user.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="primary">
                            {booking.ticket.name}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${Number(booking.ticket.price).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={getStatusColor(booking.status) as any}
                            variant="flat"
                          >
                            {booking.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => setDetailBooking(booking)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
      >
        <ModalContent>
          {detailBooking && (
            <>
              <ModalHeader>Booking Details</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Attendee</p>
                      <p className="font-medium">{detailBooking.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Email</p>
                      <p className="font-medium">{detailBooking.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Ticket Type</p>
                      <p className="font-medium">
                        {detailBooking.ticket.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Price</p>
                      <p className="font-medium">
                        ${Number(detailBooking.ticket.price).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Booking Date</p>
                      <p className="font-medium">
                        {new Date(
                          detailBooking.bookingDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip
                        size="sm"
                        color={getStatusColor(detailBooking.status) as any}
                        variant="flat"
                      >
                        {detailBooking.status}
                      </Chip>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => setDetailBooking(null)}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
