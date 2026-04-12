export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Eventide",
  description: "Discover and explore the best local events, concerts, and experiences near you.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "My Tickets",
      href: "/dashboard/my-tickets",
    },
    {
      label: "Saved Events",
      href: "/dashboard/saved-events",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
    },
  ],
};
