import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination, Select, SelectItem, Input, Button, Chip } from "@heroui/react";
import EventGrid from "@/components/home/EventGrid";
import SearchBar from "@/components/home/SearchBar";
import { api } from "@/api/api";
import { LayoutGrid, List, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const searchParam = searchParams.get("search") || "";
  const cityParam = searchParams.get("city") || "";
  const categoryParam = searchParams.get("categoryId") || "";
  const startDateParam = searchParams.get("startDate") || "";
  const endDateParam = searchParams.get("endDate") || "";

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [city, setCity] = useState(cityParam);
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [startDate, setStartDate] = useState(startDateParam);
  const [endDate, setEndDate] = useState(endDateParam);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (city) params.city = city;
    if (categoryId) params.categoryId = categoryId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    params.page = currentPage.toString();
    setSearchParams(params);
  }, [searchTerm, city, categoryId, startDate, endDate, currentPage]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (city) params.set("city", city);
        if (categoryId) params.set("categoryId", categoryId);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        params.set("page", currentPage.toString());

        const res = await api.get(`/events?${params.toString()}`);
        const data = res.data;
        setFilteredEvents(data?.items || []);
        setTotalPages(data?.pages || 1);
        setTotalEvents(data?.total || 0);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [searchTerm, city, categoryId, startDate, endDate, currentPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setCity("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = city || categoryId || startDate || endDate;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground">Discover Events</h1>
        <p className="mt-2 text-default-500">
          Find concerts, conferences, workshops, and more
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        query={searchTerm}
        onChange={handleSearch}
        placeholder="Search events by name or description..."
        size="lg"
      />

      {/* Filters Row */}
      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-auto min-w-[160px]">
          <Select
            label="Category"
            placeholder="All Categories"
            size="sm"
            selectedKeys={categoryId ? [categoryId] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0]?.toString() || "";
              setCategoryId(val);
              setCurrentPage(1);
            }}
          >
            {categories.map((cat) => (
              <SelectItem key={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-auto min-w-[160px]">
          <Input
            label="City"
            placeholder="Filter by city"
            size="sm"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto min-w-[160px]">
          <Input
            type="date"
            label="Start Date"
            size="sm"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto min-w-[160px]">
          <Input
            type="date"
            label="End Date"
            size="sm"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 ml-auto">
          <Button
            isIconOnly
            size="sm"
            variant={viewMode === "grid" ? "solid" : "flat"}
            color={viewMode === "grid" ? "primary" : "default"}
            onPress={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant={viewMode === "list" ? "solid" : "flat"}
            color={viewMode === "list" ? "primary" : "default"}
            onPress={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-default-500">Filters:</span>
          {city && (
            <Chip size="sm" variant="flat" onClose={() => setCity("")}>
              City: {city}
            </Chip>
          )}
          {categoryId && (
            <Chip size="sm" variant="flat" onClose={() => setCategoryId("")}>
              Category: {categories.find((c) => c.id.toString() === categoryId)?.name || categoryId}
            </Chip>
          )}
          {startDate && (
            <Chip size="sm" variant="flat" onClose={() => setStartDate("")}>
              From: {startDate}
            </Chip>
          )}
          {endDate && (
            <Chip size="sm" variant="flat" onClose={() => setEndDate("")}>
              To: {endDate}
            </Chip>
          )}
          <Button size="sm" variant="light" color="danger" startContent={<X size={14} />} onPress={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-default-500">
          {totalEvents > 0
            ? `Showing ${filteredEvents.length} of ${totalEvents} events`
            : "No events found"}
        </p>
      </div>

      {/* Event Grid */}
      <div className="mt-6">
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
