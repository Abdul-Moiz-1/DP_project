import { useEffect, useState, useCallback, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  Select,
  SelectItem,
  Input,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import EventGrid from "@/components/home/EventGrid";
import { api } from "@/api/api";
import {
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
  Search,
  MapPin,
} from "lucide-react";
import EventsResultsMap from "@/components/events/EventsResultsMap";
import { Event } from "@/api/types";
import { calculateDistance, getDistanceColor } from "@/lib/distance";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-default-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const initialSearch = searchParams.get("search") || "";
  const initialCity = searchParams.get("city") || "";
  const initialCountry = searchParams.get("country") || "";
  const initialCategoryId = searchParams.get("categoryId") || "";
  const initialCategoryName = searchParams.get("category") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";
  const initialLatitude = searchParams.get("latitude") || "";
  const initialLongitude = searchParams.get("longitude") || "";
  const initialRadius = searchParams.get("radius") || "50";
  const initialSortBy = searchParams.get("sortBy") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Search: local input (immediate) vs debounced term (triggers fetch)
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Filters
  const [city, setCity] = useState(initialCity);
  const [country, setCountry] = useState(initialCountry);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [radius, setRadius] = useState(initialRadius);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // UI
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Data
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  // Debounce search input → search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load categories; resolve category name → id if coming from hero chips
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const cats: Category[] = res.data;
        setCategories(cats);
        if (initialCategoryName && !initialCategoryId) {
          const decoded = decodeURIComponent(
            initialCategoryName.replace(/\+/g, " ").replace(/%26/g, "&"),
          );
          const match = cats.find(
            (c) => c.name.toLowerCase() === decoded.toLowerCase(),
          );
          if (match) setCategoryId(match.id.toString());
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state → URL params
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
    if (radius && radius !== "50") params.radius = radius;
    if (sortBy) params.sortBy = sortBy;
    params.page = currentPage.toString();
    setSearchParams(params, { replace: true });
  }, [
    searchTerm, city, country, categoryId, startDate, endDate,
    latitude, longitude, radius, sortBy, currentPage, setSearchParams,
  ]);

  // Fetch events
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
      } catch {
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [
    searchTerm, city, country, categoryId, startDate, endDate,
    latitude, longitude, radius, sortBy, currentPage,
  ]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setCity("");
    setCountry("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setLatitude("");
    setLongitude("");
    setRadius("50");
    setSortBy("");
    setLocationError("");
    setCurrentPage(1);
  }, []);

  const useCurrentLocation = useCallback(() => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
        setSortBy("distance");
        setCurrentPage(1);
      },
      () => setLocationError("Location permission denied. Please enable access."),
    );
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Map event data for EventCard
  const cardEvents = filteredEvents.map((event) => {
    let distance: number | undefined;
    let distanceColor: "success" | "warning" | "default" | "danger" = "default";
    if (latitude && longitude && event.location?.latitude && event.location?.longitude) {
      distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        event.location.latitude,
        event.location.longitude,
      );
      distanceColor = getDistanceColor(distance);
    }
    return {
      id: event.id?.toString(),
      title: event.name,
      date: new Date(event.startDate).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      }),
      location: event.location
        ? `${event.location.city}, ${event.location.country}`
        : "Location TBD",
      imageUrl:
        event.images?.[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      price: event.tickets?.length
        ? Math.min(...event.tickets.map((t) => t.price))
        : 0,
      category: event.categories?.[0]?.name,
      distance,
      distanceColor,
    };
  });

  const hasActiveFilters = !!(
    city || country || categoryId || startDate || endDate ||
    (latitude && longitude) || searchTerm
  );

  const filterCount = [
    city, country, categoryId, startDate, endDate,
    latitude && longitude ? "loc" : "",
  ].filter(Boolean).length;

  // Shared filter panel (used in both sidebar and mobile modal)
  const filtersPanel = (
    <div className="space-y-5">
      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryId((prev) =>
                  prev === cat.id.toString() ? "" : cat.id.toString(),
                );
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                categoryId === cat.id.toString()
                  ? "bg-primary text-white"
                  : "bg-default-100 text-default-600 hover:bg-default-200",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-divider" />

      {/* Date range */}
      <FilterSection title="Date Range">
        <div className="space-y-2">
          <Input
            type="date"
            label="From"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            classNames={{
              label: "text-sm font-medium text-default-700",
              inputWrapper:
                "bg-content1 border border-default-300 shadow-none group-data-[focus=true]:border-primary group-data-[hover=true]:border-default-400",
              input: "text-foreground",
            }}
          />
          <Input
            type="date"
            label="To"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            classNames={{
              label: "text-sm font-medium text-default-700",
              inputWrapper:
                "bg-content1 border border-default-300 shadow-none group-data-[focus=true]:border-primary group-data-[hover=true]:border-default-400",
              input: "text-foreground",
            }}
          />
        </div>
      </FilterSection>

      <div className="h-px bg-divider" />

      {/* Location */}
      <FilterSection title="Location">
        <Input
          placeholder="City"
          size="sm"
          value={city}
          onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
        />
        <Input
          placeholder="Country"
          size="sm"
          value={country}
          onChange={(e) => { setCountry(e.target.value); setCurrentPage(1); }}
          className="mt-2"
        />
        <Button
          size="sm"
          variant="flat"
          color="primary"
          startContent={<MapPin size={13} />}
          onPress={useCurrentLocation}
          className="w-full mt-2"
        >
          Use My Location
        </Button>
        {latitude && longitude && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-default-500">Radius (km)</p>
            <Input
              type="number"
              size="sm"
              value={radius}
              min={1}
              onChange={(e) => { setRadius(e.target.value || "50"); setCurrentPage(1); }}
            />
          </div>
        )}
        {locationError && (
          <p className="text-xs text-danger mt-1">{locationError}</p>
        )}
      </FilterSection>
    </div>
  );

  const hasEventsWithCoords = filteredEvents.some(
    (e) => e.location?.latitude && e.location?.longitude,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container-app py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Discover Events
          </h1>
          <p className="text-default-500 mt-1 text-sm">
            Find concerts, conferences, workshops, and more
          </p>
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-stretch sm:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400 pointer-events-none" />
            <input
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-divider bg-content1 text-sm text-foreground placeholder:text-default-400 focus:outline-none focus:border-primary transition-colors"
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Sort */}
          <Select
            size="sm"
            placeholder="Sort: Date"
            aria-label="Sort by"
            className="w-full sm:w-40"
            selectedKeys={sortBy ? [sortBy] : []}
            onSelectionChange={(keys) => {
              setSortBy(Array.from(keys)[0]?.toString() || "");
              setCurrentPage(1);
            }}
          >
            <SelectItem key="date">Date</SelectItem>
            <SelectItem key="price">Price</SelectItem>
            <SelectItem key="distance">Nearby</SelectItem>
          </Select>

          {/* View toggle — desktop */}
          <div className="hidden sm:flex rounded-xl border border-divider overflow-hidden flex-none">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-default-500 hover:bg-default-100",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "text-default-500 hover:bg-default-100",
              )}
              aria-label="Map view"
            >
              <MapIcon size={16} />
            </button>
          </div>

          {/* Mobile filter button */}
          <Button
            size="sm"
            variant="bordered"
            startContent={<SlidersHorizontal size={14} />}
            onPress={() => setIsFilterOpen(true)}
            className="lg:hidden"
          >
            Filters
            {filterCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {filterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {searchTerm && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => { setSearchInput(""); setSearchTerm(""); }}
              >
                Search: {searchTerm}
              </Chip>
            )}
            {categoryId && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => setCategoryId("")}>
                {categories.find((c) => c.id.toString() === categoryId)?.name ?? "Category"}
              </Chip>
            )}
            {city && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => setCity("")}>
                City: {city}
              </Chip>
            )}
            {country && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => setCountry("")}>
                Country: {country}
              </Chip>
            )}
            {startDate && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => setStartDate("")}>
                From: {startDate}
              </Chip>
            )}
            {endDate && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => setEndDate("")}>
                To: {endDate}
              </Chip>
            )}
            {latitude && longitude && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => { setLatitude(""); setLongitude(""); setSortBy(""); }}
              >
                Near me · {radius} km
              </Chip>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-default-400 hover:text-danger transition-colors self-center"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Filter sidebar — desktop only */}
          <aside className="hidden lg:block w-72 flex-none">
            <div className="card-base p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-sm">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {filtersPanel}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results count + mobile view toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-default-500">
                {loading ? (
                  "Loading…"
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{totalEvents}</span>{" "}
                    {totalEvents === 1 ? "event" : "events"} found
                  </>
                )}
              </p>

              {/* View toggle — mobile */}
              <div className="flex sm:hidden rounded-xl border border-divider overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 py-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "text-default-500 hover:bg-default-100",
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "px-3 py-2 transition-colors",
                    viewMode === "map"
                      ? "bg-primary text-white"
                      : "text-default-500 hover:bg-default-100",
                  )}
                  aria-label="Map view"
                >
                  <MapIcon size={15} />
                </button>
              </div>
            </div>

            {/* Grid view */}
            {viewMode === "grid" && (
              <EventGrid events={cardEvents} isLoading={loading} />
            )}

            {/* Map view */}
            {viewMode === "map" && (
              hasEventsWithCoords ? (
                <EventsResultsMap events={filteredEvents} className="h-[560px]" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-default-200 rounded-2xl">
                  <MapIcon size={40} className="text-default-300 mb-3" />
                  <p className="text-sm text-default-400">
                    {loading ? "Loading events…" : "No events with location data to display"}
                  </p>
                </div>
              )
            )}

            {/* Pagination (grid only) */}
            {viewMode === "grid" && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showControls
                  classNames={{
                    base: "gap-2",
                    item: "bg-content1 text-default-600 border border-default-200 shadow-none data-[hover=true]:bg-default-100",
                    cursor: "bg-primary text-white shadow-none",
                    prev: "bg-content1 text-default-500 border border-default-200 data-[hover=true]:bg-default-100",
                    next: "bg-content1 text-default-500 border border-default-200 data-[hover=true]:bg-default-100",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter modal */}
      <Modal
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        placement="bottom"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center justify-between pb-2">
                <span className="font-semibold">Filters</span>
                {hasActiveFilters && (
                  <button
                    onClick={() => { clearFilters(); onClose(); }}
                    className="text-xs text-danger font-medium"
                  >
                    Clear all
                  </button>
                )}
              </ModalHeader>
              <ModalBody>{filtersPanel}</ModalBody>
              <ModalFooter>
                <Button color="primary" className="w-full" onPress={onClose}>
                  Show {loading ? "…" : totalEvents}{" "}
                  {totalEvents === 1 ? "event" : "events"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Events;
