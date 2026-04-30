"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Progress,
  Textarea,
} from "@heroui/react";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Plus,
  Ticket,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AxiosError } from "axios";
import { api } from "@/api/api";
import { InteractiveLocationPicker } from "@/components/common/InteractiveLocationPicker";
import type { CreateEventDto, EventResponseDto, UpdateEventDto } from "@/lib/dtos";

interface EventFormProps {
  onSubmit: (data: FormData | CreateEventDto | UpdateEventDto) => Promise<void>;
  initialData?: EventResponseDto;
  isLoading?: boolean;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface PlaceSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface EventFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    googleMapsLink?: string;
  };
  tickets: Array<{
    name: string;
    price: number;
    salesStartDate: string;
    salesEndDate: string;
  }>;
  images: File[];
  categoryIds: number[];
}

const STEPS = [
  { label: "Details", icon: Calendar },
  { label: "Location", icon: MapPin },
  { label: "Tickets", icon: Ticket },
  { label: "Media", icon: ImageIcon },
] as const;

const STEP_FIELDS: Record<number, Array<keyof EventFormData | string>> = {
  0: ["name", "description", "startDate", "endDate", "capacity"],
  1: ["location.address", "location.city", "location.state", "location.country", "location.postalCode"],
  2: ["tickets"],
  3: ["categoryIds"],
};

const DEFAULT_TICKET = {
  name: "",
  price: 0,
  salesStartDate: "",
  salesEndDate: "",
};

const FIELD_CLASS_NAMES = {
  label: "pb-1 text-sm font-medium text-default-700 dark:text-default-300",
  inputWrapper:
    "min-h-12 border border-divider bg-content1 shadow-none transition-colors group-data-[focus=true]:border-primary group-data-[hover=true]:border-default-400",
  input: "text-foreground placeholder:text-default-400",
  description: "text-default-500",
  errorMessage: "text-danger",
};

function formatDateTimeLocal(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toISOString(dateLocalString: string) {
  return new Date(dateLocalString).toISOString();
}

function normalizeLocation(location: EventFormData["location"]) {
  return {
    address: location.address?.trim() ?? "",
    city: location.city?.trim() ?? "",
    state: location.state?.trim() ?? "",
    country: location.country?.trim() ?? "",
    postalCode: location.postalCode?.trim() ?? "",
    latitude: typeof location.latitude === "number" && !Number.isNaN(location.latitude)
      ? location.latitude
      : undefined,
    longitude: typeof location.longitude === "number" && !Number.isNaN(location.longitude)
      ? location.longitude
      : undefined,
    googleMapsLink: location.googleMapsLink?.trim() || undefined,
  };
}

function getBackendErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message ?? error.response?.data?.error;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }

  if (error instanceof Error) return error.message;
  return "Failed to save event. Please try again.";
}

interface NativeDateTimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
}

function NativeDateTimeField({
  label,
  value,
  onChange,
  min,
  max,
  error,
  disabled = false,
}: NativeDateTimeFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-default-700 dark:text-default-300">{label}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={[
          "h-12 w-full rounded-xl border bg-content1 px-3 text-sm text-foreground shadow-none outline-none transition-colors",
          "border-divider focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "[color-scheme:light] dark:[color-scheme:dark]",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
          error ? "border-danger" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}

export function EventForm({ onSubmit, initialData, isLoading = false }: EventFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchResults, setSearchResults] = useState<PlaceSuggestion[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [ticketUpdateDisabled, setTicketUpdateDisabled] = useState(false);

  const nowMin = useMemo(() => formatDateTimeLocal(new Date()), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    getValues,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      capacity: 100,
      location: {
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
        googleMapsLink: "",
      },
      tickets: [DEFAULT_TICKET],
      images: [],
      categoryIds: [],
    },
    mode: "onTouched",
  });

  const {
    fields: ticketFields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "tickets",
  });

  const watchedStartDate = watch("startDate");
  const watchedLocation = watch("location");
  const watchedCategoryIds = watch("categoryIds");
  const watchedImages = watch("images");
  const watchedTickets = watch("tickets");

  useEffect(() => {
    api.get("/categories")
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newImagePreviews]);

  useEffect(() => {
    if (!initialData) return;

    reset({
      name: initialData.name ?? "",
      description: initialData.description ?? "",
      startDate: formatDateTimeLocal(initialData.startDate),
      endDate: formatDateTimeLocal(initialData.endDate),
      capacity: initialData.capacity ?? 100,
      location: {
        address: initialData.location?.address ?? "",
        city: initialData.location?.city ?? "",
        state: initialData.location?.state ?? "",
        country: initialData.location?.country ?? "",
        postalCode: initialData.location?.postalCode ?? "",
        latitude: initialData.location?.latitude,
        longitude: initialData.location?.longitude,
        googleMapsLink: initialData.location?.googleMapsLink ?? "",
      },
      tickets:
        initialData.tickets?.map((ticket) => ({
          name: ticket.name,
          price: Number(ticket.price),
          salesStartDate: formatDateTimeLocal(ticket.salesStartDate),
          salesEndDate: formatDateTimeLocal(ticket.salesEndDate),
        })) || [DEFAULT_TICKET],
      images: [],
      categoryIds: initialData.categories?.map((category) => category.id) || [],
    });

    replace(
      initialData.tickets?.map((ticket) => ({
        name: ticket.name,
        price: Number(ticket.price),
        salesStartDate: formatDateTimeLocal(ticket.salesStartDate),
        salesEndDate: formatDateTimeLocal(ticket.salesEndDate),
      })) || [DEFAULT_TICKET],
    );

    setExistingImages(initialData.images?.map((image) => image.imageUrl) || []);
    setTicketUpdateDisabled(Boolean(initialData.bookings && initialData.bookings > 0));
    setSubmitError(null);
  }, [initialData, replace, reset]);

  useEffect(() => {
    const query = watchedLocation.address?.trim();
    if (!query || query.length < 3) {
      setSearchResults([]);
      setPlaceSearchError("");
      setSearchingPlaces(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearchingPlaces(true);
      setPlaceSearchError("");
      try {
        const response = await api.get("/geo/search", {
          params: { query, limit: 5 },
        });
        setSearchResults(response.data || []);
      } catch {
        setSearchResults([]);
        setPlaceSearchError("Could not load place suggestions.");
      } finally {
        setSearchingPlaces(false);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [watchedLocation.address]);

  const addressLabel = [
    watchedLocation.address,
    watchedLocation.city,
    watchedLocation.state,
    watchedLocation.country,
  ]
    .filter(Boolean)
    .join(", ");

  const allPreviewImages = useMemo(
    () => [
      ...existingImages.map((url) => ({ url, kind: "existing" as const })),
      ...newImagePreviews.map((url) => ({ url, kind: "new" as const })),
    ],
    [existingImages, newImagePreviews],
  );

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  const setLocationSuggestion = (place: PlaceSuggestion) => {
    setValue("location.address", place.address || place.displayName, { shouldDirty: true, shouldValidate: true });
    setValue("location.city", place.city || "", { shouldDirty: true, shouldValidate: true });
    setValue("location.state", place.state || "", { shouldDirty: true, shouldValidate: true });
    setValue("location.country", place.country || "", { shouldDirty: true, shouldValidate: true });
    setValue("location.postalCode", place.postalCode || "", { shouldDirty: true, shouldValidate: true });
    setValue("location.latitude", place.latitude, { shouldDirty: true });
    setValue("location.longitude", place.longitude, { shouldDirty: true });
    setSearchResults([]);
    setPlaceSearchError("");
  };

  const reverseFillLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await api.get("/geo/reverse", {
        params: { latitude, longitude },
      });
      const place = response.data as PlaceSuggestion;
      if (place) {
        setLocationSuggestion({ ...place, latitude, longitude });
      }
    } catch {
      setValue("location.latitude", latitude, { shouldDirty: true });
      setValue("location.longitude", longitude, { shouldDirty: true });
    }
  };

  const handleImageSelection = (filesList: FileList | null) => {
    const selectedFiles = Array.from(filesList || []);
    if (!selectedFiles.length) return;

    const currentImageCount = existingImages.length + (getValues("images")?.length || 0);
    if (currentImageCount + selectedFiles.length > 5) {
      setSubmitError("You can upload up to 5 images total.");
      return;
    }

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setSubmitError("Only PNG and JPEG images are supported.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError(`"${file.name}" is larger than 2MB.`);
        return;
      }
    }

    const nextFiles = [...(getValues("images") || []), ...selectedFiles];
    setValue("images", nextFiles, { shouldDirty: true, shouldValidate: true });
    setNewImagePreviews((prev) => [...prev, ...selectedFiles.map((file) => URL.createObjectURL(file))]);
    setSubmitError(null);
  };

  const removeImageAtIndex = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
      return;
    }

    const newIndex = index - existingImages.length;
    const files = [...(getValues("images") || [])];
    const previews = [...newImagePreviews];

    const [removedPreview] = previews.splice(newIndex, 1);
    if (removedPreview) URL.revokeObjectURL(removedPreview);
    files.splice(newIndex, 1);

    setValue("images", files, { shouldDirty: true, shouldValidate: true });
    setNewImagePreviews(previews);
  };

  const toggleCategory = (categoryId: number) => {
    const current = getValues("categoryIds") || [];
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];

    setValue("categoryIds", next, { shouldDirty: true, shouldValidate: true });
  };

  const handleNext = async () => {
    setSubmitError(null);
    const fields = STEP_FIELDS[currentStep] as never[];
    const valid = await trigger(fields);
    if (valid && currentStep < STEPS.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const submitForm = async (data: EventFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const normalizedLocation = normalizeLocation(data.location);
      if (!normalizedLocation.address || !normalizedLocation.city || !normalizedLocation.country) {
        setSubmitError("Please complete the location fields before publishing your event.");
        setCurrentStep(1);
        return;
      }

      const payload = new FormData();

      payload.append("name", data.name.trim());
      payload.append("description", data.description.trim());
      payload.append("startDate", toISOString(data.startDate));
      payload.append("endDate", toISOString(data.endDate));
      payload.append("capacity", String(data.capacity));
      payload.append("location", JSON.stringify(normalizedLocation));

      if (!ticketUpdateDisabled) {
        payload.append(
          "tickets",
          JSON.stringify(
            data.tickets.map((ticket) => ({
              ...ticket,
              price: Number(ticket.price),
              salesStartDate: toISOString(ticket.salesStartDate),
              salesEndDate: toISOString(ticket.salesEndDate),
            })),
          ),
        );
      }

      payload.append("categoryIds", JSON.stringify(data.categoryIds));

      if (initialData) {
        payload.append("imageUrls", JSON.stringify(existingImages));
      }

      data.images.forEach((file) => payload.append("files", file));

      await onSubmit(payload);
    } catch (error) {
      setSubmitError(getBackendErrorMessage(error));
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="rounded-3xl border border-divider bg-content1 p-5 shadow-card sm:p-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.label} className="flex flex-1 items-center gap-2 last:flex-none">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    index < currentStep && "bg-primary text-white",
                    index === currentStep && "bg-primary text-white ring-4 ring-primary/20",
                    index > currentStep && "bg-default-100 text-default-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {index < currentStep ? <Check size={14} /> : index + 1}
                </div>
                <span
                  className={[
                    "hidden text-sm sm:block",
                    index === currentStep ? "font-semibold text-foreground" : "text-default-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 ${index < currentStep ? "bg-primary" : "bg-default-200"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressValue} color="primary" className="max-w-full" />
        </div>

        {currentStep === 0 && (
          <Card className="border border-divider shadow-none">
            <CardHeader className="gap-3 px-6 py-4">
              <Calendar className="text-primary" size={20} />
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Event Details</h2>
                <p className="text-sm text-default-500">Start with the event basics.</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 px-6 py-6">
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Event name is required",
                  minLength: { value: 3, message: "Event name must be at least 3 characters" },
                  maxLength: { value: 100, message: "Event name must be under 100 characters" },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Event Name"
                    labelPlacement="outside"
                    placeholder="e.g. Summer Music Festival"
                    variant="bordered"
                    classNames={FIELD_CLASS_NAMES}
                    isInvalid={Boolean(errors.name)}
                    errorMessage={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Description is required",
                  minLength: { value: 10, message: "Description must be at least 10 characters" },
                }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Description"
                    labelPlacement="outside"
                    placeholder="Tell attendees what makes this event worth joining."
                    variant="bordered"
                    minRows={5}
                    classNames={FIELD_CLASS_NAMES}
                    isInvalid={Boolean(errors.description)}
                    errorMessage={errors.description?.message}
                  />
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="startDate"
                  control={control}
                  rules={{
                    required: "Start date is required",
                    validate: (value) =>
                      new Date(value) > new Date() || "Start date must be in the future",
                  }}
                  render={({ field }) => (
                    <NativeDateTimeField
                      label="Start Date & Time"
                      value={field.value}
                      onChange={field.onChange}
                      min={nowMin}
                      error={errors.startDate?.message}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  rules={{
                    required: "End date is required",
                    validate: (value) => {
                      if (!watchedStartDate) return "Choose a start date first";
                      return new Date(value) > new Date(watchedStartDate) || "End date must be after start date";
                    },
                  }}
                  render={({ field }) => (
                    <NativeDateTimeField
                      label="End Date & Time"
                      value={field.value}
                      onChange={field.onChange}
                      min={watchedStartDate || nowMin}
                      error={errors.endDate?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="capacity"
                control={control}
                rules={{
                  required: "Capacity is required",
                  min: { value: 1, message: "Capacity must be at least 1" },
                  max: { value: 100000, message: "Capacity must be below 100000" },
                }}
                render={({ field }) => (
                  <Input
                    label="Capacity"
                    labelPlacement="outside"
                    placeholder="500"
                    type="number"
                    variant="bordered"
                    classNames={FIELD_CLASS_NAMES}
                    className="max-w-xs"
                    value={String(field.value ?? "")}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    isInvalid={Boolean(errors.capacity)}
                    errorMessage={errors.capacity?.message}
                  />
                )}
              />
            </CardBody>
          </Card>
        )}

        {currentStep === 1 && (
          <Card className="border border-divider shadow-none">
            <CardHeader className="gap-3 px-6 py-4">
              <MapPin className="text-primary" size={20} />
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Location</h2>
                <p className="text-sm text-default-500">Search a place or pin the venue on the map.</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 px-6 py-6">
              <Controller
                name="location.address"
                control={control}
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Street Address"
                    labelPlacement="outside"
                    placeholder="123 Main Street"
                    variant="bordered"
                    classNames={FIELD_CLASS_NAMES}
                    isInvalid={Boolean(errors.location?.address)}
                    errorMessage={errors.location?.address?.message}
                  />
                )}
              />

              {(searchingPlaces || searchResults.length > 0 || placeSearchError) && (
                <div className="rounded-2xl border border-divider bg-default-50 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-default-400">Suggested places</p>
                  {searchingPlaces && <p className="text-sm text-default-500">Searching places...</p>}
                  {!searchingPlaces && searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((place) => (
                        <button
                          key={`${place.latitude}-${place.longitude}-${place.displayName}`}
                          type="button"
                          onClick={() => setLocationSuggestion(place)}
                          className="w-full rounded-xl border border-divider bg-content1 px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <p className="font-medium text-foreground">{place.displayName}</p>
                          <p className="text-sm text-default-500">
                            {[place.address, place.city, place.country].filter(Boolean).join(", ")}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searchingPlaces && !searchResults.length && placeSearchError && (
                    <p className="text-sm text-danger">{placeSearchError}</p>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="location.city"
                  control={control}
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="City"
                      labelPlacement="outside"
                      variant="bordered"
                      classNames={FIELD_CLASS_NAMES}
                      isInvalid={Boolean(errors.location?.city)}
                      errorMessage={errors.location?.city?.message}
                    />
                  )}
                />

                <Controller
                  name="location.state"
                  control={control}
                  rules={{ required: "State is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="State / Province"
                      labelPlacement="outside"
                      variant="bordered"
                      classNames={FIELD_CLASS_NAMES}
                      isInvalid={Boolean(errors.location?.state)}
                      errorMessage={errors.location?.state?.message}
                    />
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="location.country"
                  control={control}
                  rules={{ required: "Country is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Country"
                      labelPlacement="outside"
                      variant="bordered"
                      classNames={FIELD_CLASS_NAMES}
                      isInvalid={Boolean(errors.location?.country)}
                      errorMessage={errors.location?.country?.message}
                    />
                  )}
                />

                <Controller
                  name="location.postalCode"
                  control={control}
                  rules={{ required: "Postal code is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Postal Code"
                      labelPlacement="outside"
                      variant="bordered"
                      classNames={FIELD_CLASS_NAMES}
                      isInvalid={Boolean(errors.location?.postalCode)}
                      errorMessage={errors.location?.postalCode?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="location.googleMapsLink"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Google Maps Link"
                    labelPlacement="outside"
                    placeholder="Optional"
                    variant="bordered"
                    classNames={FIELD_CLASS_NAMES}
                  />
                )}
              />

              <InteractiveLocationPicker
                addressLabel={addressLabel}
                latitude={watchedLocation.latitude}
                longitude={watchedLocation.longitude}
                onChange={({ latitude, longitude }) => {
                  setValue("location.latitude", latitude, { shouldDirty: true, shouldValidate: true });
                  setValue("location.longitude", longitude, { shouldDirty: true, shouldValidate: true });
                  void reverseFillLocation(latitude, longitude);
                }}
              />
            </CardBody>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            {ticketUpdateDisabled && initialData && (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning-700 dark:text-warning-300">
                Tickets cannot be modified because this event already has bookings.
              </div>
            )}

            <Card className="border border-divider shadow-none">
              <CardHeader className="gap-3 px-6 py-4">
                <Ticket className="text-primary" size={20} />
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Tickets</h2>
                  <p className="text-sm text-default-500">Set pricing and ticket sale windows.</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 px-6 py-6">
                {ticketFields.map((ticket, index) => (
                  <div key={ticket.id} className="rounded-2xl border border-divider p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-medium text-foreground">Ticket Type {index + 1}</h3>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => remove(index)}
                        isDisabled={ticketFields.length === 1 || ticketUpdateDisabled}
                        aria-label={`Remove ticket type ${index + 1}`}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Controller
                        name={`tickets.${index}.name`}
                        control={control}
                        rules={{ required: "Ticket name is required" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Ticket Name"
                            labelPlacement="outside"
                            variant="bordered"
                            classNames={FIELD_CLASS_NAMES}
                            isDisabled={ticketUpdateDisabled}
                            isInvalid={Boolean(errors.tickets?.[index]?.name)}
                            errorMessage={errors.tickets?.[index]?.name?.message}
                          />
                        )}
                      />

                      <Controller
                        name={`tickets.${index}.price`}
                        control={control}
                        rules={{
                          required: "Price is required",
                          min: { value: 0, message: "Price cannot be negative" },
                        }}
                        render={({ field }) => (
                          <Input
                            label="Price"
                            labelPlacement="outside"
                            type="number"
                            variant="bordered"
                            classNames={FIELD_CLASS_NAMES}
                            isDisabled={ticketUpdateDisabled}
                            value={String(field.value ?? 0)}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                            isInvalid={Boolean(errors.tickets?.[index]?.price)}
                            errorMessage={errors.tickets?.[index]?.price?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Controller
                        name={`tickets.${index}.salesStartDate`}
                        control={control}
                        rules={{
                          required: "Sales start date is required",
                          validate: (value) => {
                            const ticketEnd = getValues(`tickets.${index}.salesEndDate`);
                            if (!ticketEnd) return true;
                            return new Date(value) < new Date(ticketEnd) || "Sales start must be before sales end";
                          },
                        }}
                        render={({ field }) => (
                          <NativeDateTimeField
                            label="Sales Start"
                            value={field.value}
                            onChange={field.onChange}
                            min={nowMin}
                            disabled={ticketUpdateDisabled}
                            error={errors.tickets?.[index]?.salesStartDate?.message}
                          />
                        )}
                      />

                      <Controller
                        name={`tickets.${index}.salesEndDate`}
                        control={control}
                        rules={{
                          required: "Sales end date is required",
                          validate: (value) => {
                            const ticketStart = getValues(`tickets.${index}.salesStartDate`);
                            if (ticketStart && new Date(value) <= new Date(ticketStart)) {
                              return "Sales end must be after sales start";
                            }
                            if (watchedStartDate && new Date(value) > new Date(watchedStartDate)) {
                              return "Ticket sales must end before the event starts";
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <NativeDateTimeField
                            label="Sales End"
                            value={field.value}
                            onChange={field.onChange}
                            min={getValues(`tickets.${index}.salesStartDate`) || nowMin}
                            max={watchedStartDate || undefined}
                            disabled={ticketUpdateDisabled}
                            error={errors.tickets?.[index]?.salesEndDate?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}

                {!ticketUpdateDisabled && (
                  <Button variant="flat" color="primary" startContent={<Plus size={16} />} onPress={() => append(DEFAULT_TICKET)}>
                    Add ticket type
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="border border-divider shadow-none">
              <CardHeader className="gap-3 px-6 py-4">
                <ImageIcon className="text-primary" size={20} />
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Media</h2>
                  <p className="text-sm text-default-500">Upload up to 5 JPEG or PNG images.</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 px-6 py-6">
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-divider bg-default-50 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <Upload className="mb-2 text-default-400" size={20} />
                  <p className="font-medium text-foreground">Drag images here or click to browse</p>
                  <p className="mt-1 text-sm text-default-500">Max 5 images, 2MB each, PNG or JPEG.</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    className="hidden"
                    onChange={(event) => handleImageSelection(event.target.files)}
                  />
                </label>

                {allPreviewImages.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {allPreviewImages.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="group relative overflow-hidden rounded-2xl border border-divider bg-default-100">
                        <img src={image.url} alt={`Event preview ${index + 1}`} className="h-36 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageAtIndex(index)}
                          className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="border border-divider shadow-none">
              <CardHeader className="px-6 py-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Categories</h2>
                  <p className="text-sm text-default-500">Choose at least one category.</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="px-6 py-6">
                <Controller
                  name="categoryIds"
                  control={control}
                  rules={{
                    validate: (value) => value.length > 0 || "Select at least one category",
                  }}
                  render={() => (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                          const selected = watchedCategoryIds.includes(category.id);
                          return (
                            <Chip
                              key={category.id}
                              variant={selected ? "solid" : "bordered"}
                              color={selected ? "primary" : "default"}
                              className="cursor-pointer border-default-300 px-1"
                              onClick={() => toggleCategory(category.id)}
                            >
                              {category.name}
                            </Chip>
                          );
                        })}
                      </div>
                      {errors.categoryIds && (
                        <p className="mt-3 text-sm text-danger">{errors.categoryIds.message}</p>
                      )}
                    </>
                  )}
                />
              </CardBody>
            </Card>

            <Card className="border border-primary/15 bg-primary/5 shadow-none">
              <CardHeader className="px-6 py-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Review Summary</h2>
              </CardHeader>
              <CardBody className="grid gap-4 px-6 py-6 text-sm md:grid-cols-2">
                <div>
                  <p className="text-default-500">Event Name</p>
                  <p className="font-medium text-foreground">{watch("name") || "—"}</p>
                </div>
                <div>
                  <p className="text-default-500">Capacity</p>
                  <p className="font-medium text-foreground">{watch("capacity") || "—"}</p>
                </div>
                <div>
                  <p className="text-default-500">Schedule</p>
                  <p className="font-medium text-foreground">
                    {watch("startDate") ? new Date(watch("startDate")).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Location</p>
                  <p className="font-medium text-foreground">{addressLabel || "—"}</p>
                </div>
                <div>
                  <p className="text-default-500">Tickets</p>
                  <p className="font-medium text-foreground">{watchedTickets.length} type(s)</p>
                </div>
                <div>
                  <p className="text-default-500">Images</p>
                  <p className="font-medium text-foreground">{allPreviewImages.length} selected</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-default-500">Categories</p>
                  <p className="font-medium text-foreground">
                    {watchedCategoryIds.length > 0
                      ? categories
                          .filter((category) => watchedCategoryIds.includes(category.id))
                          .map((category) => category.name)
                          .join(", ")
                      : "—"}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {submitError && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-danger/10 p-4 text-sm text-danger">
            <AlertCircle size={16} className="mt-0.5 flex-none" />
            <p>{submitError}</p>
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-divider pt-6">
          <Button variant="flat" onPress={handleBack} isDisabled={currentStep === 0}>
            <ChevronLeft size={16} />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button color="primary" onPress={handleNext}>
              Continue
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button color="primary" type="submit" isLoading={submitting || isLoading}>
              {initialData ? "Update Event" : "Publish Event"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
