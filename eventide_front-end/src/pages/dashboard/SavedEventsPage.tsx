"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Image,
} from "@heroui/react";
import {
  Bookmark,
  Calendar,
  Heart,
  MapPin,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SavedEventItem } from "@/api/types";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState<SavedEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { success, warning } = useToast();

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      const data = await eventService.fetchSavedEvents();
      setSavedEvents(data);
    } catch (error) {
      console.error("Failed to load saved events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (eventId: number) => {
    setRemovingId(eventId);
    try {
      await eventService.unsaveEvent(eventId);
      setSavedEvents((prev) => prev.filter((s) => s.event.id !== eventId));
      success("Event removed from wishlist");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to remove event");
    } finally {
      setRemovingId(null);
    }
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { label: "Upcoming", color: "primary" as const };
    if (now >= start && now <= end) return { label: "Ongoing", color: "success" as const };
    return { label: "Past", color: "default" as const };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Events</h1>
        <p className="text-default-400 mt-1">
          Events you've bookmarked for later ({savedEvents.length})
        </p>
      </div>

      {savedEvents.length === 0 ? (
        <Card className="border border-default-200">
          <CardBody className="text-center py-16">
            <Heart className="w-12 h-12 text-default-300 mx-auto mb-4" />
            <p className="text-default-500 mb-2">No saved events yet</p>
            <p className="text-default-400 text-sm mb-4">
              Browse events and click the heart icon to save them here
            </p>
            <Button as={Link} to="/events" color="primary">
              Browse Events
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedEvents.map((item) => {
            const status = getEventStatus(item.event.startDate, item.event.endDate);
            return (
              <Card
                key={item.id}
                className="border border-default-200 shadow-sm overflow-hidden"
              >
                <div className="relative">
                  {item.event.images?.[0]?.imageUrl ? (
                    <Image
                      src={item.event.images[0].imageUrl}
                      alt={item.event.name}
                      className="w-full h-48 object-cover rounded-none"
                      removeWrapper
                    />
                  ) : (
                    <div className="w-full h-48 bg-default-100 flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-default-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Chip size="sm" color={status.color} variant="solid">
                      {status.label}
                    </Chip>
                  </div>
                </div>
                <CardBody className="p-4">
                  <Link
                    to={`/events/${item.event.id}`}
                    className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.event.name}
                  </Link>
                  <p className="text-sm text-default-400 line-clamp-2 mt-1 mb-3">
                    {item.event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-default-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    {item.event.location && (
                      <div className="flex items-center gap-2 text-sm text-default-500">
                        <MapPin className="w-4 h-4" />
                        {item.event.location.city}
                        {item.event.location.country && `, ${item.event.location.country}`}
                      </div>
                    )}
                  </div>
                  {item.event.categories?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {item.event.categories.slice(0, 3).map((cat) => (
                        <Chip key={cat.id} size="sm" variant="flat" color="default">
                          {cat.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </CardBody>
                <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    {item.event.minPrice > 0 ? `From $${item.event.minPrice}` : "Free"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      isDisabled={removingId === item.event.id}
                      onPress={() => handleRemove(item.event.id)}
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      as={Link}
                      to={`/events/${item.event.id}`}
                      size="sm"
                      color="primary"
                    >
                      View Event
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
