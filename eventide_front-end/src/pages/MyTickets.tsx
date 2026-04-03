// src/pages/MyTickets.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Divider,
} from '@heroui/react';

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  location: string;
  ticketType: string;
  quantity: number;
  price: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'used';
  qrCode?: string;
  orderNumber: string;
}

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Summer Music Festival 2025',
    eventImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    eventDate: '2025-07-15T18:00:00',
    location: 'Central Park, New York',
    ticketType: 'VIP Pass',
    quantity: 2,
    price: 199,
    totalPrice: 403,
    purchaseDate: '2025-06-01T10:30:00',
    status: 'confirmed',
    orderNumber: 'ORD-2025-001234',
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'Tech Innovation Summit',
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    eventDate: '2025-08-22T09:00:00',
    location: 'Convention Center, SF',
    ticketType: 'General Admission',
    quantity: 1,
    price: 299,
    totalPrice: 304,
    purchaseDate: '2025-06-15T14:20:00',
    status: 'confirmed',
    orderNumber: 'ORD-2025-001567',
  },
  {
    id: '3',
    eventId: '4',
    eventTitle: 'Marathon 2025 - City Run',
    eventImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400',
    eventDate: '2024-09-05T06:00:00',
    location: 'Downtown Loop, Chicago',
    ticketType: 'Runner Pass',
    quantity: 1,
    price: 45,
    totalPrice: 50,
    purchaseDate: '2024-08-01T09:15:00',
    status: 'used',
    orderNumber: 'ORD-2024-009876',
  },
];

const MyTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatPurchaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const filterTickets = (status: string) => {
    switch (status) {
      case 'upcoming':
        return mockTickets.filter(
          (t) => isUpcoming(t.eventDate) && t.status === 'confirmed'
        );
      case 'past':
        return mockTickets.filter(
          (t) => !isUpcoming(t.eventDate) || t.status === 'used'
        );
      case 'cancelled':
        return mockTickets.filter((t) => t.status === 'cancelled');
      default:
        return mockTickets;
    }
  };

  const tickets = filterTickets(activeTab);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    onOpen();
  };

  const handleCancelTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    onCancelOpen();
  };

  const confirmCancellation = () => {
    // TODO: API call to cancel ticket
    console.log('Cancelling ticket:', selectedTicket?.id);
    onCancelClose();
  };

  const handleDownloadTicket = () => {
    // TODO: Generate PDF ticket
    console.log('Downloading ticket:', selectedTicket?.id);
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">My Tickets 🎫</h1>
          <p className="text-default-500">
            Manage and view all your event tickets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-primary">
                {mockTickets.length}
              </div>
              <div className="text-sm text-default-500">Total Tickets</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-success">
                {filterTickets('upcoming').length}
              </div>
              <div className="text-sm text-default-500">Upcoming</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-default">
                {filterTickets('past').length}
              </div>
              <div className="text-sm text-default-500">Past Events</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-danger">
                {filterTickets('cancelled').length}
              </div>
              <div className="text-sm text-default-500">Cancelled</div>
            </CardBody>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              size="lg"
            >
              <Tab key="upcoming" title="Upcoming" />
              <Tab key="past" title="Past" />
              <Tab key="cancelled" title="Cancelled" />
              <Tab key="all" title="All" />
            </Tabs>
          </CardHeader>
          <CardBody>
            {tickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-2xl font-bold mb-2">No tickets found</h3>
                <p className="text-default-500 mb-6">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming events"
                    : activeTab === 'cancelled'
                    ? "You haven't cancelled any tickets"
                    : 'Start exploring events!'}
                </p>
                <Button as={Link} to="/" color="primary" size="lg">
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex gap-4 p-4 border-2 border-default-200 rounded-xl hover:border-primary transition-all"
                  >
                    {/* Event Image */}
                    <img
                      src={ticket.eventImage}
                      alt={ticket.eventTitle}
                      className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Ticket Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl mb-1 truncate">
                            {ticket.eventTitle}
                          </h3>
                          <p className="text-sm text-default-500 mb-2">
                            Order #{ticket.orderNumber}
                          </p>
                        </div>
                        <Chip
                          color={getStatusColor(ticket.status)}
                          variant="flat"
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          {ticket.status.toUpperCase()}
                        </Chip>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span>📅</span>
                          <span className="text-default-600">
                            {formatDate(ticket.eventDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>📍</span>
                          <span className="text-default-600 truncate">
                            {ticket.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>🎫</span>
                          <span className="text-default-600">
                            {ticket.ticketType} × {ticket.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>💰</span>
                          <span className="text-default-600 font-semibold">
                            ${ticket.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-default-400">
                        Purchased on {formatPurchaseDate(ticket.purchaseDate)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => handleViewTicket(ticket)}
                        isDisabled={ticket.status === 'cancelled'}
                      >
                        View Ticket
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        as={Link}
                        to={`/events/${ticket.eventId}`}
                      >
                        Event Details
                      </Button>
                      {ticket.status === 'confirmed' &&
                        isUpcoming(ticket.eventDate) && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleCancelTicket(ticket)}
                          >
                            Cancel
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* View Ticket Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-bold">Ticket Details</h2>
          </ModalHeader>
          <ModalBody>
            {selectedTicket && (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="flex justify-center p-6 bg-default-100 rounded-xl">
                  <div className="w-48 h-48 bg-white flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-xs text-default-500">QR Code</p>
                      <p className="text-xs text-default-400">
                        Scan at venue
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Event Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-default-500">Event</span>
                      <span className="font-semibold text-right">
                        {selectedTicket.eventTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Date & Time</span>
                      <span className="font-semibold text-right">
                        {formatDate(selectedTicket.eventDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Location</span>
                      <span className="font-semibold text-right">
                        {selectedTicket.location}
                      </span>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Ticket Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Ticket Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-default-500">Order Number</span>
                      <span className="font-mono font-semibold">
                        {selectedTicket.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Ticket Type</span>
                      <span className="font-semibold">
                        {selectedTicket.ticketType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Quantity</span>
                      <span className="font-semibold">
                        {selectedTicket.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Price per Ticket</span>
                      <span className="font-semibold">
                        ${selectedTicket.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Paid</span>
                      <span className="font-bold text-primary">
                        ${selectedTicket.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Important Info */}
                <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <p className="text-sm text-warning-700 dark:text-warning-400">
                    <strong>Important:</strong> Please arrive at least 30
                    minutes before the event starts. Have your QR code ready for
                    scanning at the entrance.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={handleDownloadTicket}>
              Download PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Ticket Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-danger">Cancel Ticket?</h2>
          </ModalHeader>
          <ModalBody>
            {selectedTicket && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to cancel your ticket for{' '}
                  <strong>{selectedTicket.eventTitle}</strong>?
                </p>
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <p className="text-sm text-danger-700 dark:text-danger-400">
                    <strong>Refund Policy:</strong> Cancellations made more
                    than 7 days before the event are eligible for a full refund.
                    Cancellations within 7 days may incur a processing fee.
                  </p>
                </div>
                <Input
                  label="Reason for cancellation (optional)"
                  placeholder="Tell us why you're cancelling"
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCancelClose}>
              Keep Ticket
            </Button>
            <Button color="danger" onPress={confirmCancellation}>
              Confirm Cancellation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MyTickets;