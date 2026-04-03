import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "@heroui/react";
import EventGrid from "@/components/home/EventGrid";
import SearchBar from "@/components/home/SearchBar";
import { api } from "@/api/api";

const BASE_API_URL = "http://localhost:3000";

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔹 Read query params
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const searchParam = searchParams.get("search") || "";

  // 🔹 Local state
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0)

  // 🔹 Keep URL in sync with state
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    params.page = currentPage.toString();
    setSearchParams(params);
  }, [searchTerm, currentPage]);

  // 🔹 Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          search: searchTerm,
          page: currentPage.toString(),
        }).toString();

        const res = await api.get(`${BASE_API_URL}/events?${query}`);
        console.log("Events fetched ", res.data)
        const data = await res.data;

        setFilteredEvents(data?.items || []);
        setTotalPages(data?.pages || 1);
        setTotalEvents(data?.total)
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, currentPage]);

  // 🔹 Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // reset to first page
  };

  // 🔹 Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold">All Events</h1>
        <p className="mt-2 text-gray-600">
          Discover and explore amazing events
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        query={searchTerm}
        onChange={handleSearch}
        placeholder="Search events..."
        size="lg"
      />

      {/* Header */}
      <div className="flex justify-between items-center mt-8">
        <div>
          <p className="text-default-500">Showing {filteredEvents.length} events out of {totalEvents}</p>
        </div>
      </div>

      {/* Event Grid */}
      <div className="mt-8">
        <EventGrid events={filteredEvents} isLoading={loading} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showControls
            size="lg"
          />
        </div>
      )}
    </div>
  );
};

export default Events;
