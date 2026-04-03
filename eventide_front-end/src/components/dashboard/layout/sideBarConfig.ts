import { BarChart2, Calendar, Heart, MessageSquare, PlusCircle, Settings, ShoppingBag, Ticket, Users } from "lucide-react";

export const organizerSidebarItems = [
  { name: "Dashboard", icon: BarChart2, path: "/dashboard" },
  { name: "Events", icon: Calendar, path: "/dashboard/events" },
  { name: "Create Event", icon: PlusCircle, path: "/dashboard/events/create" },
  { name: "Bookings", icon: Users, path: "/dashboard/bookings" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export const userSidebarItems = [
  { name: "Dashboard", icon: BarChart2, path: "/dashboard" },
  { name: "My Orders", icon: ShoppingBag, path: "/dashboard/orders" },
  { name: "My Tickets", icon: Ticket, path: "/dashboard/my-tickets" },
  { name: "Saved Events", icon: Heart, path: "/dashboard/saved-events" },
  { name: "My Reviews", icon: MessageSquare, path: "/dashboard/reviews" },
  { name: "Browse Events", icon: Calendar, path: "/events" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];
