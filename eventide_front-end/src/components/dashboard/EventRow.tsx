import { Event } from "@/api/types";
import { Button, Card, CardBody, Image } from "@heroui/react";
import { ArrowBigRight, HeartIcon } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface EventRowProps {
  event: Event;
}

const EventRow = ({ event }: EventRowProps) => {
  const navigate = useNavigate();

    const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      time: date.toLocaleString('default', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  const eventDate = formatDate(event.startDate);



  return (
    <>
      <div className="w-full p-2 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
        <Card
          isBlurred
          className="border-none bg-background/60 dark:bg-default-100/50 max-w-full"
          shadow="sm"
        >
          <CardBody>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
              <div className="relative col-span-6 md:col-span-4">
            <Image
                  alt={event.name}
                  className="object-cover"
                  height={200}
                  shadow="md"
                  src={event.images[0]?.imageUrl || "/placeholder-event.jpg"}
                  width="100%"
                />
              </div>

              <div className="flex flex-col col-span-6 md:col-span-8 gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0">
                    <h3 className="font-semibold text-foreground/90">
                      {eventDate.month} {eventDate.day}, {eventDate.time}
                    </h3>
                    <p className="text-small text-foreground/80">
                      {event.description}
                    </p>
                    <h1 className="text-2xl font-bold mt-2">
                      {event.name}
                    </h1>
                  </div>
                  <Button
                    color={"primary"}
                    variant={"solid"}
                    size="sm"
                    startContent={<ArrowBigRight/>}
                    onPress={(e) => {
                      // TODO: Quick book action
                      navigate(`/dashboard/event/${event.id}`);
                    }}
                  >
                    {"Edit Event"}
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default EventRow;
