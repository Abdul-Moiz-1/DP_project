import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { CalendarPlus } from "lucide-react";

interface AddToCalendarProps {
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

function formatDateForICal(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatDateForGoogle(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

const AddToCalendar = ({ eventName, description, startDate, endDate, location }: AddToCalendarProps) => {
  const downloadICS = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eventide//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${description.substring(0, 200)}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventName.replace(/\s+/g, "_")}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}&details=${encodeURIComponent(description.substring(0, 200))}&location=${encodeURIComponent(location)}`;

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button variant="flat" startContent={<CalendarPlus size={16} />} size="sm">
          Add to Calendar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-52">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground mb-1">Add to Calendar</p>
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-default-600 hover:text-primary transition-colors py-1"
          >
            Google Calendar
          </a>
          <button
            onClick={downloadICS}
            className="text-sm text-default-600 hover:text-primary transition-colors py-1 text-left"
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddToCalendar;
