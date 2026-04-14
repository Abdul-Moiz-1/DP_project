import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination, Select, SelectItem, Input, Button, Chip } from "@heroui/react";
import EventGrid from "@/components/home/EventGrid";
import SearchBar from "@/components/home/SearchBar";
import { api } from "@/api/api";
import { LayoutGrid, List, X } from "lucide-react";
import EventsResultsMap from "@/components/events/EventsResultsMap";
import { Event } from "@/api/types";
import { calculateDistance, getDistanceColor } from "@/lib/distance";

interface Category {
  id: number;
  name: string;
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const searchParam = searchParams.get("search") || "";
  const cityParam = searchParams.get("city") || "";
  const countryParam = searchParams.get("country") || "";
  const categoryParam = searchParams.get("categoryId") || "";
  const startDateParam = searchParams.get("startDate") || "";
  const endDateParam = searchParams.get("endDate") || "";
  const latitudeParam = searchParams.get("latitude") || "";
  const longitudeParam = searchParams.get("longitude") || "";
  const radiusParam = searchParams.get("radius") || "";
  const sortByParam = searchParams.get("sortBy") || "";

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [city, setCity] = useState(cityParam);
  const [country, setCountry] = useState(countryParam);
  const [categoryId, setCategoryId] = useState(categoryParam);
  const [startDate, setStartDate] = useState(startDateParam);
  const [endDate, setEndDate] = useState(endDateParam);
  const [latitude, setLatitude] = useState(latitudeParam);
  const [longitude, setLongitude] = useState(longitudeParam);
  const [radius, setRadius] = useState(radiusParam || "50");
  const [sortBy, setSortBy] = useState(sortByParam);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (city) params.city = city;
    if (country) params.country = country;
    if (categoryId) params.categoryId = categoryId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (latitude) params.latitude = latitude;
    if (longitude) params.longitude = longitude;
    if (radius) params.radius = radius;
    if (sortBy) params.sortBy = sortBy;
    params.page = currentPage.toString();
    setSearchParams(params);
  }, [searchTerm, city, country, categoryId, startDate, endDate, latitude, longitude, radius, sortBy, currentPage, setSearchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (city) params.set("city", city);
        if (country) params.set("country", country);
        if (categoryId) params.set("categoryId", categoryId);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (latitude) params.set("latitude", latitude);
        if (longitude) params.set("longitude", longitude);
        if (radius) params.set("radius", radius);
        if (sortBy) params.set("sortBy", sortBy);
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
  }, [searchTerm, city, country, categoryId, startDate, endDate, latitude, longitude, radius, sortBy, currentPage]);

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
    setCountry("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setLatitude("");
    setLongitude("");
    setRadius("50");
    setSortBy("");
    setLocationError("");
    setCurrentPage(1);
  };

  const useCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setSortBy("distance");
        setCurrentPage(1);
      },
      () => setLocationError("Location permission denied. Please enable access to search nearby events."),
    );
  };

  const hasActiveFilters = city || country || categoryId || startDate || endDate || (latitude && longitude);

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
            label="Country"
            placeholder="Filter by country"
            size="sm"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
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

        <div className="w-full sm:w-auto min-w-[140px]">
          <Input
            type="number"
            label="Radius (km)"
            size="sm"
            value={radius}
            min={1}
            onChange={(e) => {
              setRadius(e.target.value || "50");
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto min-w-[180px]">
          <Select
            label="Sort By"
            placeholder="Date"
            size="sm"
            selectedKeys={sortBy ? [sortBy] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0]?.toString() || "";
              setSortBy(val);
              setCurrentPage(1);
            }}
          >
            <SelectItem key="date">Date</SelectItem>
            <SelectItem key="price">Price</SelectItem>
            <SelectItem key="distance">Distance</SelectItem>
          </Select>
        </div>

        <Button size="sm" variant="flat" color="primary" onPress={useCurrentLocation}>
          Use My Location
        </Button>

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
          {country && (
            <Chip size="sm" variant="flat" onClose={() => setCountry("")}>
              Country: {country}
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
          {latitude && longitude && (
            <Chip size="sm" variant="flat" onClose={() => { setLatitude(""); setLongitude(""); setSortBy(""); }}>
              Near me: {radius} km
            </Chip>
          )}
          <Button size="sm" variant="light" color="danger" startContent={<X size={14} />} onPress={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {locationError && (
        <p className="mt-3 text-sm text-danger">{locationError}</p>
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
      <div className="mt-6 space-y-6">
        <EventsResultsMap events={filteredEvents} />
        <EventGrid 
          events={filteredEvents.map((event) => {
            let distance: number | undefined;
            let distanceColor: 'success' | 'warning' | 'default' | 'danger' = 'default';

            // Calculate distance if user location and event location are available
            if (latitude && longitude && event.location?.latitude && event.location?.longitude) {
              const userLat = parseFloat(latitude);
              const userLng = parseFloat(longitude);
              distance = calculateDistance(userLat, userLng, event.location.latitude, event.location.longitude);
              distanceColor = getDistanceColor(distance);
            }

            return {
              id: event.id?.toString(),
              title: event.name,
              date: new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
              location: event.location ? `${event.location.city}, ${event.location.country}` : 'Location TBD',
              imageUrl: event.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
              price: event.tickets && event.tickets.length > 0 ? Math.min(...event.tickets.map((t) => t.price)) : 0,
              distance,
              distanceColor,
            };
          })} 
          isLoading={loading} 
        />
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
