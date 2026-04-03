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
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Calendar,
  DollarSign,
  Eye,
  MapPin,
  Ticket,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Booking } from "@/api/types";
import { eventService } from "@/services/eventService";
import { api } from "@/api/api";
import { useToast } from "@/components/toast-provider";

export default function DashboardOrders() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { success, warning } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await eventService.fetchMyBookings();
      setBookings(response?.items || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingId) return;
    try {
      await api.delete(`/bookings/${cancellingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancellingId ? { ...b, status: "CANCELLED" } : b
        )
      );
      success("Booking cancelled successfully");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelModal(false);
      setCancellingId(null);
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

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming")
      return (
        b.status === "CONFIRMED" && new Date(b.event.startDate) > new Date()
      );
    if (activeTab === "past")
      return (
        b.status === "CONFIRMED" && new Date(b.event.endDate) < new Date()
      );
    if (activeTab === "cancelled") return b.status === "CANCELLED";
    return true;
  });

  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + Number(b.ticket.price), 0);

  if (loading) {
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
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-default-400 mt-1">
          View and manage your event bookings
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Orders</p>
              <p className="text-xl font-bold">{bookings.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500">Upcoming</p>
              <p className="text-xl font-bold">
                {
                  bookings.filter(
                    (b) =>
                      b.status === "CONFIRMED" &&
                      new Date(b.event.startDate) > new Date()
                  ).length
                }
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
              <p className="text-sm text-default-500">Total Spent</p>
              <p className="text-xl font-bold">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            color="primary"
          >
            <Tab key="all" title={`All (${bookings.length})`} />
            <Tab
              key="upcoming"
              title={`Upcoming (${bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.event.startDate) > new Date()).length})`}
            />
            <Tab
              key="past"
              title={`Past (${bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.event.endDate) < new Date()).length})`}
            />
            <Tab
              key="cancelled"
              title={`Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})`}
            />
          </Tabs>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">No bookings found</p>
              <Button
                as={Link}
                to="/events"
                color="primary"
                variant="flat"
                className="mt-4"
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <Table aria-label="Orders table" removeWrapper>
              <TableHeader>
                <TableColumn>EVENT</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>TICKET</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const isPast =
                    new Date(booking.event.endDate) < new Date();
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {booking.event.images?.[0]?.imageUrl ? (
                            <img
                              src={booking.event.images[0].imageUrl}
                              alt={booking.event.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-default-400" />
                            </div>
                          )}
                          <Link
                            to={`/events/${booking.event.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {booking.event.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(
                            booking.event.startDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-default-400" />
                          <span className="text-sm">
                            {booking.event.city}
                          </span>
                        </div>
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
                        <Chip
                          size="sm"
                          color={getStatusColor(booking.status) as any}
                          variant="flat"
                        >
                          {booking.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => setSelectedBooking(booking)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status === "CONFIRMED" && !isPast && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => {
                                setCancellingId(booking.id);
                                setCancelModal(true);
                              }}
                              title="Cancel booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      >
        <ModalContent>
          {selectedBooking && (
            <>
              <ModalHeader>Order Details</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {selectedBooking.event.images?.[0]?.imageUrl && (
                    <img
                      src={selectedBooking.event.images[0].imageUrl}
                      alt={selectedBooking.event.name}
                      className="w-full h-40 rounded-xl object-cover"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Event</p>
                      <p className="font-medium">
                        {selectedBooking.event.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedBooking.event.startDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Location</p>
                      <p className="font-medium">
                        {selectedBooking.event.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Ticket Type</p>
                      <p className="font-medium">
                        {selectedBooking.ticket.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Price</p>
                      <p className="font-medium">
                        ${Number(selectedBooking.ticket.price).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip
                        size="sm"
                        color={
                          getStatusColor(selectedBooking.status) as any
                        }
                        variant="flat"
                      >
                        {selectedBooking.status}
                      </Chip>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-default-500">Booking Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedBooking.bookingDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  as={Link}
                  to={`/events/${selectedBooking.event.id}`}
                  variant="flat"
                  color="primary"
                >
                  View Event
                </Button>
                <Button
                  variant="light"
                  onPress={() => setSelectedBooking(null)}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)}>
        <ModalContent>
          <ModalHeader>Cancel Booking</ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setCancelModal(false);
                setCancellingId(null);
              }}
            >
              Keep Booking
            </Button>
            <Button color="danger" onPress={handleCancelBooking}>
              Cancel Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
