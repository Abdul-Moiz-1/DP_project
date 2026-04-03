import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import { Booking, User } from "@/api/types";
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Ticket,
  TimerIcon,
} from "lucide-react";
import { MetricCard } from "./metric-card";

interface UserStats {
  totalBookings: number;
  upcomingEvents: number;
  pastEvents: number;
  totalSpent: number;
}

interface UserDashboardProps {
  user: User | null;
  stats: UserStats;
  bookings: Booking[];
}

const UserDashboard = ({ user, stats, bookings }: UserDashboardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.event.startDate) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name || "Guest"}!
        </h1>
        <p className="text-default-400 mt-1">
          Manage your tickets and explore new events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tickets Purchased"
          value={stats.totalBookings.toString()}
          icon={<Ticket className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Upcoming Events"
          value={stats.upcomingEvents.toString()}
          icon={<Calendar className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Past Events"
          value={stats.pastEvents.toString()}
          icon={<TimerIcon className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="flex justify-between px-6 pt-5 pb-0">
              <h2 className="text-xl font-bold text-foreground">
                Upcoming Events
              </h2>
              <Button
                as={Link}
                to="/dashboard/my-tickets"
                size="sm"
                variant="flat"
                color="primary"
              >
                View All Tickets
              </Button>
            </CardHeader>
            <CardBody className="px-6 pb-5 space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-default-300 mx-auto mb-4" />
                  <p className="text-default-500 mb-4">
                    No upcoming events yet
                  </p>
                  <Button as={Link} to="/events" color="primary">
                    Browse Events
                  </Button>
                </div>
              ) : (
                upcomingBookings.slice(0, 4).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex gap-4 p-4 border border-default-200 rounded-xl hover:border-primary transition-colors"
                  >
                    {booking.event.images?.[0]?.imageUrl ? (
                      <img
                        src={booking.event.images[0].imageUrl}
                        alt={booking.event.name}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-8 h-8 text-default-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 truncate">
                        {booking.event.name}
                      </h3>
                      <p className="text-sm text-default-500 mb-1">
                        {formatDate(booking.event.startDate)}
                      </p>
                      <p className="text-sm text-default-500 mb-2">
                        {booking.event.city}
                      </p>
                      <Chip size="sm" variant="flat" color="primary">
                        {booking.ticket.name}
                      </Chip>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        as={Link}
                        to={`/events/${booking.event.id}`}
                        size="sm"
                        variant="bordered"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="px-6 pt-5 pb-0">
              <h2 className="text-lg font-bold text-foreground">Profile</h2>
            </CardHeader>
            <CardBody className="flex flex-col items-center gap-3 px-6 pb-5">
              <Avatar name={user?.name} size="lg" className="mb-2" />
              <div className="font-bold text-lg">
                {user?.name || "Guest"}
              </div>
              <Chip color="primary" variant="flat" size="sm">
                {user?.email || "No email"}
              </Chip>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="px-6 pt-5 pb-0">
              <h2 className="text-lg font-bold text-foreground">
                Quick Actions
              </h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 px-6 pb-5">
              <Button
                as={Link}
                to="/events"
                color="primary"
                variant="flat"
                startContent={<Calendar className="w-4 h-4" />}
                className="justify-start"
              >
                Browse Events
              </Button>
              <Button
                as={Link}
                to="/dashboard/orders"
                variant="flat"
                startContent={<ShoppingBag className="w-4 h-4" />}
                className="justify-start"
              >
                My Orders
              </Button>
              <Button
                as={Link}
                to="/dashboard/my-tickets"
                variant="flat"
                startContent={<Ticket className="w-4 h-4" />}
                className="justify-start"
              >
                My Tickets
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
