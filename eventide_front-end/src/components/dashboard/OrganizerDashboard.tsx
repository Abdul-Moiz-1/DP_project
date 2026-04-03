// src/components/dashboard/OrganizerDashboard.tsx
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react';
import { User } from '@/api/types';

interface OrganizerStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  activeEvents: number;
  bookingRate: number;
  revenueProgress: number;
}

interface Event {
  id: number;
  name: string;
  imageUrl: string;
  location: {
    city: string;
    address: string;
  };
  startDate: string;
  status: string;
  bookingsCount: number;
  capacity: number;
}

interface OrganizerDashboardProps {
  user: User | null;
  stats: OrganizerStats;
  events: Event[];
}

const OrganizerDashboard = ({ user, stats, events }: OrganizerDashboardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Organizer'}! 👋
        </h1>
        <p className="text-default-500">
          Manage your events and track your performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-2">🎟️</div>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-default-500 text-sm">Total Events</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <div className="text-default-500 text-sm">Total Bookings</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <div className="text-default-500 text-sm">Total Revenue</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <div className="text-default-500 text-sm">Active Events</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Events */}
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-xl font-bold">Recent Events</h2>
              <Button as={Link} to="/dashboard/events" size="sm" variant="light" color="primary">
                View All
              </Button>
            </CardHeader>
            <CardBody>
              <Table aria-label="Recent events">
                <TableHeader>
                  <TableColumn>EVENT</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>BOOKINGS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="text-center py-6">
                          <p className="text-default-500 mb-4">No events created yet</p>
                          <Button as={Link} to="/dashboard/events/create" color="primary">Create Event</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={event.imageUrl} alt={event.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="font-medium">{event.name}</div>
                              <div className="text-default-500 text-xs">{event.location.city}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(event.startDate)}</TableCell>
                        <TableCell>
                          <Chip size="sm" color={event.status === 'Active' ? 'success' : 'warning'} variant="flat">
                            {event.status}
                          </Chip>
                        </TableCell>
                        <TableCell>{event.bookingsCount}/{event.capacity}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button as={Link} to={`/events/${event.id}`} size="sm" variant="light">View</Button>
                            <Button as={Link} to={`/dashboard/events/edit/${event.id}`} size="sm" variant="bordered">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader><h2 className="text-xl font-bold">Quick Actions</h2></CardHeader>
            <CardBody className="flex flex-col gap-3">
              <Button as={Link} to="/dashboard/events/create" color="primary">Create New Event</Button>
              <Button as={Link} to="/dashboard/events" color="secondary" variant="light">Manage Events</Button>
              <Button as={Link} to="/dashboard/bookings" color="default" variant="light">View Bookings</Button>
            </CardBody>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader><h2 className="text-xl font-bold">Performance</h2></CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Bookings Rate</span>
                    <span className="text-sm font-medium">{stats.bookingRate}%</span>
                  </div>
                  <div className="w-full bg-default-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${stats.bookingRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Revenue Target</span>
                    <span className="text-sm font-medium">{stats.revenueProgress}%</span>
                  </div>
                  <div className="w-full bg-default-200 rounded-full h-2">
                    <div className="bg-success rounded-full h-2" style={{ width: `${stats.revenueProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;