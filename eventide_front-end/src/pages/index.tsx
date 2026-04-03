// import { Link } from "@heroui/link";
// import { Snippet } from "@heroui/snippet";
// import { Code } from "@heroui/code";
// import { button as buttonStyles } from "@heroui/theme";

// import { siteConfig } from "@/config/site";
// import { title, subtitle } from "@/components/primitives";
// import { GithubIcon } from "@/components/Icons";
// import EventCard from "@/components/events/EventCard";
// import HeroSection from "@/components/home/HeroSection";

// const sampleEvent = {
//   id: "1",
//   title: "React Conference 2024",
//   date: new Date("2024-09-15T09:00:00"),
//   location: "San Francisco, CA",
//   imageUrl:
//     "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
//   price: 99.99,
//   onViewDetails: (id: string) => alert(`View details for event ${id}`),
// };

// const featuredEvents = [
//   {
//     id: "1",
//     title: "Summer Music Festival 2025",
//     date: "July 15-17, 2025",
//     imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
//     location: "Central Park, NY",
//   },
//   {
//     id: "2",
//     title: "Tech Conference 2025",
//     date: "August 20-22, 2025",
//     imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
//     location: "Convention Center, SF",
//   },
//   {
//     id: "3",
//     title: "Food & Wine Expo",
//     date: "September 5-7, 2025",
//     imageUrl: "/images/food-expo.jpg",
//     location: "Grand Hotel, Chicago",
//   },
// ];

// export default function IndexPage() {
//   return (
//     <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//       <HeroSection
//         title="Discover Amazing Events"
//         subtitle="Find and book tickets for the best events happening in your city"
//         primaryCtaText="Explore Events"
//         secondaryCtaText="Create Event"
//         featuredEvents={featuredEvents}
//         onPrimaryCta={() => {}}
//         onSecondaryCta={() => {}}
//       />
//       <div className="inline-block max-w-lg text-center justify-center">
//         <span className={title()}>Make&nbsp;</span>
//         <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
//         <br />
//         <span className={title()}>
//           websites regardless of your design experience.
//         </span>
//         <div className={subtitle({ class: "mt-4" })}>
//           Beautiful, fast and modern React UI library.
//         </div>
//       </div>



//       <div className="flex gap-3">
//         <Link
//           isExternal
//           className={buttonStyles({
//             color: "primary",
//             radius: "full",
//             variant: "shadow",
//           })}
//           href={siteConfig.links.docs}
//         >
//           Documentation
//         </Link>
//         <Link
//           isExternal
//           className={buttonStyles({ variant: "bordered", radius: "full" })}
//           href={siteConfig.links.github}
//         >
//           <GithubIcon size={20} />
//           GitHub
//         </Link>
//       </div>

//       <div className="mt-8">
//         <Snippet hideCopyButton hideSymbol variant="bordered">
//           <span>
//             Get started by editing <Code color="primary">pages/index.tsx</Code>
//           </span>
//         </Snippet>
//       </div>
//     </section>
//   );
// }

// src/pages/Home.tsx - COMPLETED
import { useState, useMemo } from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedSection from '../components/home/FeaturedSection';
import EventGrid from '../components/home/EventGrid';
import CTASection from '../components/home/CTASection';
import { EventCardProps } from '../components/events/EventCard';
import { Navigate, useNavigate } from 'react-router-dom';




const Home = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false); // TODO: Set to true when fetching from API


  const navigate = useNavigate();


  // create URL to pass the search query in the URL 
  const handleSearch = () => {
    const query = encodeURIComponent(searchQuery);
    navigate(`/events?search=${query}&page=1`);
  } 


  // Handlers
  const handleSearchChange = (value: string) => setSearchQuery(value);

  return (
    <>
      <HeroSection searchValue={searchQuery} onSearchChange={handleSearchChange} onSearch={handleSearch} />
      {/* <FeaturedSection events={featuredEvents} isLoading={isLoading} />
      <EventGrid events={gridEvents} isLoading={isLoading} /> */}
      <CTASection />
    </>
  );
};

export default Home;
