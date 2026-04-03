import {Event} from '../types/event.types';

export const mockEvents: Event[] = [
    {
        id: "1",
        title: "Tech Conference 2025",
        description: "Join us for the biggest tech conference featuring industry leaders and innovative workshops. Topics include AI, Web Development, and Cloud Computing.",
        date: new Date("2025-11-15T09:00:00"),
        location: "Convention Center, New York",
        organizerId: "org1",
        organizationId: "techorg1",
        price: 299.99,
        capacity: 1000,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        category: "Technology",
        tags: ["tech", "innovation", "networking"],
        // schedule: [
        //     {
        //         time: "09:00 AM",
        //         activity: "Registration & Breakfast"
        //     },
        //     {
        //         time: "10:00 AM",
        //         activity: "Keynote Speech"
        //     },
        //     {
        //         time: "12:00 PM",
        //         activity: "Lunch Break"
        //     }
        // ]
    },
    {
        id: "2",
        title: "Summer Music Festival",
        description: "Three days of non-stop music featuring top artists from around the world. Experience amazing performances across multiple stages.",
        date: new Date("2025-07-20T14:00:00"),
        location: "Central Park, New York",
        organizerId: "org2",
        organizationId: "musicorg1",
        price: 150.00,
        capacity: 5000,
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
        category: "Music",
        tags: ["music", "outdoor", "summer"],
        // schedule: [
        //     {
        //         time: "2:00 PM",
        //         activity: "Gates Open"
        //     },
        //     {
        //         time: "3:00 PM",
        //         activity: "First Performance"
        //     },
        //     {
        //         time: "10:00 PM",
        //         activity: "Headliner"
        //     }
        // ]
    },
    {
        id: "3",
        title: "Food & Wine Expo",
        description: "Discover culinary delights from top chefs and wine experts. Includes tastings, cooking demonstrations, and wine pairing sessions.",
        date: new Date("2025-09-05T11:00:00"),
        location: "Grand Hotel, Chicago",
        organizerId: "org3",
        organizationId: "foodorg1",
        price: 75.00,
        capacity: 500,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        category: "Food",
        tags: ["culinary", "wine", "gourmet"],
        // schedule: [
        //     {
        //         time: "11:00 AM",
        //         activity: "Welcome Reception"
        //     },
        //     {
        //         time: "1:00 PM",
        //         activity: "Wine Tasting"
        //     },
        //     {
        //         time: "3:00 PM",
        //         activity: "Cooking Demo"
        //     }
        // ]
    },
    {
        id: "4",
        title: "Business Leadership Summit",
        description: "Connect with industry leaders and learn about the latest business strategies and leadership techniques.",
        date: new Date("2025-10-10T08:30:00"),
        location: "Business Center, San Francisco",
        organizerId: "org4",
        organizationId: "bizorg1",
        price: 499.99,
        capacity: 300,
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
        category: "Business",
        tags: ["business", "leadership", "networking"],
        // schedule: [
        //     {
        //         time: "8:30 AM",
        //         activity: "Registration"
        //     },
        //     {
        //         time: "9:00 AM",
        //         activity: "Opening Remarks"
        //     },
        //     {
        //         time: "5:00 PM",
        //         activity: "Networking Event"
        //     }
        // ]
    },
    {
        id: "5",
        title: "Fitness & Wellness Expo",
        description: "A day dedicated to health and wellness featuring fitness classes, nutrition workshops, and wellness vendors.",
        date: new Date("2025-08-15T09:00:00"),
        location: "Sports Complex, Los Angeles",
        organizerId: "org5",
        organizationId: "fitnessorg1",
        price: 45.00,
        capacity: 800,
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        category: "Fitness",
        tags: ["fitness", "health", "wellness"],
        // schedule: [
        //     {
        //         time: "9:00 AM",
        //         activity: "Morning Yoga"
        //     },
        //     {
        //         time: "11:00 AM",
        //         activity: "Nutrition Talk"
        //     },
        //     {
        //         time: "2:00 PM",
        //         activity: "HIIT Workshop"
        //     }
        // ]
    }
];



export const mockOrganizations = [
  {
    id: "techorg1",
    name: "Tech Events International",
    description: "Leading technology events organizer",
    logo: "https://example.com/logo1.png"
  },
  {
    id: "musicorg1",
    name: "Global Music Festivals",
    description: "World-class music event management",
    logo: "https://example.com/logo2.png"
  },
  {
    id: "foodorg1",
    name: "Culinary Arts Society",
    description: "Premium food and beverage events",
    logo: "https://example.com/logo3.png"
  }
];


export const mockEventCards = [
  {
    id: "1",
    title: "Summer Music Festival 2025",
    description: "Experience three days of non-stop music featuring top artists from around the world. Multiple stages, food vendors, and unforgettable performances.",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    date: "2025-07-15T14:00:00",
    location: "Central Park, New York",
    price: 149.99,
    category: "Music",
    organizerName: "Global Music Events",
    organizerAvatar: "https://api.dicebear.com/7.x/avatars/svg?seed=GMusic",
    isVerified: true,
    isFeatured: true,
    availableTickets: 250,
    totalTickets: 1000,
    attendees: 750
  },
  {
    id: "2",
    title: "Tech Innovation Summit",
    description: "Join industry leaders and innovators for a deep dive into the future of technology. Featuring keynotes, workshops, and networking opportunities.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    date: "2025-08-20T09:00:00",
    location: "Convention Center, San Francisco",
    price: 299.99,
    category: "Technology",
    organizerName: "TechCon International",
    organizerAvatar: "https://api.dicebear.com/7.x/avatars/svg?seed=TechCon",
    isVerified: true,
    isFeatured: false,
    availableTickets: 5,
    totalTickets: 500,
    attendees: 495
  },
  {
    id: "3",
    title: "Food & Wine Festival",
    description: "Savor exquisite cuisines and fine wines from renowned chefs and wineries. Includes tastings, cooking demonstrations, and wine pairing sessions.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
    date: "2025-09-05T11:00:00",
    location: "Vineyard Gardens, Napa Valley",
    price: 89.99,
    category: "Food & Drinks",
    organizerName: "Culinary Arts Society",
    organizerAvatar: "https://api.dicebear.com/7.x/avatars/svg?seed=CAS",
    isVerified: true,
    isFeatured: true,
    availableTickets: 0,
    totalTickets: 200,
    attendees: 200
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    description: "Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and venture capitalists in this exciting evening.",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
    date: "2025-10-10T18:00:00",
    location: "Innovation Hub, Austin",
    price: 0,
    category: "Business",
    organizerName: "Startup Accelerator",
    organizerAvatar: "https://api.dicebear.com/7.x/avatars/svg?seed=StartupAcc",
    isVerified: false,
    isFeatured: false,
    availableTickets: 45,
    totalTickets: 100,
    attendees: 55
  },
  {
    id: "5",
    title: "Fitness & Wellness Expo",
    description: "Transform your lifestyle with expert-led workshops, fitness classes, and wellness seminars. Learn from top trainers and health professionals.",
    imageUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb",
    date: "2025-06-01T08:00:00",
    location: "Sports Complex, Miami",
    price: 49.99,
    category: "Health",
    organizerName: "Wellness Warriors",
    organizerAvatar: "https://api.dicebear.com/7.x/avatars/svg?seed=WellnessW",
    isVerified: true,
    isFeatured: false,
    availableTickets: 150,
    totalTickets: 300,
    attendees: 150
  }
];