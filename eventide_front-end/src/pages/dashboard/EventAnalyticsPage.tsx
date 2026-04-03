"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { EventAnalytics } from "@/api/types";
import { eventService } from "@/services/eventService";
import { MetricCard } from "@/components/dashboard/metric-card";

export default function EventAnalyticsPage() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadAnalytics(Number(id));
  }, [id]);

  const loadAnalytics = async (eventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.fetchEventAnalytics(eventId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "primary";
      case "ONGOING":
        return "success";
      case "PAST":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-4">
        <Button
          as={Link}
          to="/dashboard/events"
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Events
        </Button>
        <Card className="border border-default-200">
          <CardBody className="text-center py-12">
            <p className="text-danger">{error || "Analytics not available"}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const occupancyRate =
    analytics.capacity > 0
      ? Math.round((analytics.confirmedBookings / analytics.capacity) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            as={Link}
            to="/dashboard/events"
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="mb-2 -ml-3"
            size="sm"
          >
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {analytics.eventName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Chip
              size="sm"
              color={getStatusColor(analytics.eventStatus) as any}
              variant="flat"
            >
              {analytics.eventStatus}
            </Chip>
            <span className="text-default-400 text-sm">
              Event #{analytics.eventId}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Bookings"
          value={analytics.totalBookings.toString()}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Confirmed"
          value={analytics.confirmedBookings.toString()}
          icon={<Ticket className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Available Spots"
          value={analytics.availableSpots.toString()}
          icon={<Calendar className="w-5 h-5 text-primary" />}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Occupancy Rate
              </h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5 space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">
                {occupancyRate}%
              </p>
              <p className="text-default-400 text-sm mt-1">
                {analytics.confirmedBookings} of {analytics.capacity} spots
                filled
              </p>
            </div>
            <Progress
              value={occupancyRate}
              color={
                occupancyRate >= 80
                  ? "success"
                  : occupancyRate >= 50
                    ? "primary"
                    : "warning"
              }
              size="lg"
              className="mt-2"
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">
                  {analytics.confirmedBookings}
                </p>
                <p className="text-xs text-default-500">Confirmed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-danger/10">
                <p className="text-lg font-bold text-danger">
                  {analytics.cancelledBookings}
                </p>
                <p className="text-xs text-default-500">Cancelled</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-default-100">
                <p className="text-lg font-bold text-foreground">
                  {analytics.availableSpots}
                </p>
                <p className="text-xs text-default-500">Available</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Revenue Breakdown
              </h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-foreground">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-default-400 text-sm mt-1">
                Total revenue from confirmed bookings
              </p>
            </div>
            {analytics.ticketsSold.length > 0 ? (
              <div className="space-y-3">
                {analytics.ticketsSold.map((ticket, idx) => {
                  const maxRevenue = Math.max(
                    ...analytics.ticketsSold.map((t) => t.revenue),
                    1
                  );
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{ticket.ticketName}</span>
                        <span className="text-default-500">
                          {ticket.sold} sold · ${ticket.revenue.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={(ticket.revenue / maxRevenue) * 100}
                        color="success"
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-default-400 py-4">
                No ticket sales data available
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Ticket Sales Table */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <h2 className="text-xl font-bold text-foreground">
            Ticket Sales Details
          </h2>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {analytics.ticketsSold.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">No tickets have been sold yet</p>
            </div>
          ) : (
            <Table aria-label="Ticket sales table" removeWrapper>
              <TableHeader>
                <TableColumn>TICKET TYPE</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>SOLD</TableColumn>
                <TableColumn>REVENUE</TableColumn>
              </TableHeader>
              <TableBody>
                {analytics.ticketsSold.map((ticket, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <span className="font-medium">{ticket.ticketName}</span>
                    </TableCell>
                    <TableCell>
                      ${Number(ticket.price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="primary">
                        {ticket.sold}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-success">
                        ${ticket.revenue.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
