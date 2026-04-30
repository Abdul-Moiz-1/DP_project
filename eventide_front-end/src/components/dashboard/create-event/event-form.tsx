"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { Card, CardBody, CardHeader, Input, Button, Textarea, Divider, Progress, Chip } from "@heroui/react"
import { Calendar, MapPin, Ticket, Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import type { CreateEventDto, EventResponseDto, UpdateEventDto } from "@/lib/dtos"
import { useToast } from "@/components/toast-provider"
import { useNavigate } from "react-router-dom"
import { api } from "@/api/api"
import { InteractiveLocationPicker } from "@/components/common/InteractiveLocationPicker"

interface EventFormProps {
  onSubmit: (data: CreateEventDto | UpdateEventDto) => Promise<void>
  initialData?: EventResponseDto
  isLoading?: boolean
}

interface CategoryOption {
  id: number
  name: string
}

interface PlaceSuggestion {
  displayName: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

const STEPS = [
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "location", label: "Location", icon: MapPin },
  { key: "tickets", label: "Tickets", icon: Ticket },
  { key: "media", label: "Media & Review", icon: ImageIcon },
]

interface FormValues extends Omit<CreateEventDto, 'startDate' | 'endDate' | 'tickets'> {
  startDate: string;
  endDate: string;
  tickets: {
    name: string;
    price: number;
    salesStartDate: string;
    salesEndDate: string;
  }[];
}

export function EventForm({ onSubmit, initialData, isLoading = false }: EventFormProps) {
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [placesError, setPlacesError] = useState("")
  const [ticketUpdateDisabled, setTicketUpdateDisabled] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Helper to format ISO strings for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateStr: string | Date | undefined) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    } catch {
      return ""
    }
  }

  const parseNumber = (value: string, fallback = 0) => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
  }

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      capacity: 100,
      location: { address: "", city: "", state: "", country: "", postalCode: "" },
      tickets: [{ name: "", price: 0, salesStartDate: "", salesEndDate: "" }],
      imageUrls: [],
      categoryIds: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      // Check if event has confirmed bookings - if so, disable ticket updates
      if (initialData.bookings && initialData.bookings > 0) {
        setTicketUpdateDisabled(true)
      }

      const formattedData: FormValues = {
        name: initialData.name || "",
        description: initialData.description || "",
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
        capacity: initialData.capacity || 0,
        location: {
          address: initialData.location?.address || "",
          city: initialData.location?.city || "",
          state: initialData.location?.state || "",
          country: initialData.location?.country || "",
          postalCode: initialData.location?.postalCode || "",
          latitude: initialData.location?.latitude,
          longitude: initialData.location?.longitude,
          googleMapsLink: initialData.location?.googleMapsLink || "",
        },
        tickets: (initialData.tickets || []).map((t) => ({
          name: t.name || "",
          price: Number(t.price) || 0,
          salesStartDate: formatDateForInput(t.salesStartDate),
          salesEndDate: formatDateForInput(t.salesEndDate),
        })),
        categoryIds: initialData.categories?.map((c) => c.id) || [],
        imageUrls: initialData.images?.map((img) => img.imageUrl) || [],
      }
      reset(formattedData)
      setSelectedCategoryIds(formattedData.categoryIds || [])
      setPreviewUrls(formattedData.imageUrls || [])
    }
  }, [initialData, reset])

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({ control, name: "tickets" })

  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  const stepFields: Record<number, string[]> = {
    0: ["name", "description", "startDate", "endDate", "capacity"],
    1: ["location.address", "location.city", "location.state", "location.country", "location.postalCode"],
    2: ["tickets"],
    3: [],
  }

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const fields = stepFields[stepIndex] as any[]
    return fields.length > 0 ? await trigger(fields) : true
  }

  const goNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const goToStep = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
      return
    }
    if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        const isValid = await validateStep(i)
        if (!isValid) return
      }
      setCompletedSteps(prev => {
        const updated = new Set(prev)
        for (let i = currentStep; i < stepIndex; i++) {
          updated.add(i)
        }
        return updated
      })
      setCurrentStep(stepIndex)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // Check total images won't exceed 5
    const newTotal = uploadedFiles.length + files.length
    if (newTotal > 5) {
      error(`Maximum 5 images allowed. You can upload ${5 - uploadedFiles.length} more.`)
      return
    }
    
    // Add new files
    setUploadedFiles(prev => [...prev, ...files])
    
    // Create preview URLs for new files only
    const newUrls = files.map((f) => URL.createObjectURL(f))
    setPreviewUrls(prev => [...prev, ...newUrls])
    
    // Reset file input
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    const urlToRemove = previewUrls[index]
    
    // If it's a blob URL, it's a new file - remove from uploadedFiles
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove)
      // Find the correct index in uploadedFiles by counting blob URLs before this position
      const newFileIndex = previewUrls.slice(0, index).filter(url => url.startsWith("blob:")).length
      setUploadedFiles(prev => prev.filter((_, i) => i !== newFileIndex))
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleFinalSubmit = async () => {
    const isValid = await validateStep(currentStep)
    if (!isValid) return
    
    // Trigger the form submission via React Hook Form
    await handleSubmit(handleFormSubmit)()
  }

  const handleFormSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      // Validation: Check that dates are not empty
      if (!data.startDate || !data.endDate) {
        error("Please select both start and end dates")
        setIsSubmitting(false)
        return
      }

      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const now = new Date()

      // Check if start date is in the future
      if (startDate <= now) {
        error("Event start date must be in the future")
        setIsSubmitting(false)
        return
      }

      if (startDate >= endDate) {
        error("End date must be after start date")
        setIsSubmitting(false)
        return
      }

      // Validate capacity
      if (!data.capacity || data.capacity < 1) {
        error("Event capacity must be at least 1")
        setIsSubmitting(false)
        return
      }

      // For NEW events or updates without ticket restrictions: validate tickets
      if (!initialData || !ticketUpdateDisabled) {
        if (!data.tickets || data.tickets.length === 0) {
          error("At least one ticket type is required")
          setIsSubmitting(false)
          return
        }

        for (let i = 0; i < data.tickets.length; i++) {
          const t = data.tickets[i]
          
          // Validate ticket fields
          if (!t.name || t.name.trim() === "") {
            error(`Ticket ${i + 1}: Please enter a ticket name`)
            setIsSubmitting(false)
            return
          }
          
          if (typeof t.price !== 'number' || t.price < 0) {
            error(`Ticket ${i + 1}: Price must be a valid number >= 0`)
            setIsSubmitting(false)
            return
          }
          
          if (!t.salesStartDate || !t.salesEndDate) {
            error(`Ticket ${i + 1}: Please select both sale start and end dates`)
            setIsSubmitting(false)
            return
          }
          
          if (new Date(t.salesStartDate) >= new Date(t.salesEndDate)) {
            error(`Ticket ${i + 1}: Sale end date must be after start date`)
            setIsSubmitting(false)
            return
          }
        }
      }

      data.categoryIds = selectedCategoryIds

      const formatIso = (dateStr: string | undefined | null) => {
        if (!dateStr) return null
        try {
          const d = new Date(dateStr)
          return isNaN(d.getTime()) ? null : d.toISOString()
        } catch {
          return null
        }
      }

      // Format dates first and validate they're not empty
      const formattedStartDate = formatIso(data.startDate)
      const formattedEndDate = formatIso(data.endDate)
      
      if (!formattedStartDate || !formattedEndDate) {
        error("Invalid date format. Please ensure dates are properly selected.")
        setIsSubmitting(false)
        return
      }

      // For UPDATE: Only send changed fields
      if (initialData) {
        console.log("Updating event. ticketUpdateDisabled:", ticketUpdateDisabled)
        console.log("Initial data bookings:", initialData.bookings)
        const updateData: any = {}
        let hasChanges = false

        // Check each field for changes
        if (data.name !== initialData.name) { updateData.name = data.name; hasChanges = true }
        if (data.description !== initialData.description) { updateData.description = data.description; hasChanges = true }
        
        const oldStartDate = initialData.startDate ? new Date(initialData.startDate).toISOString() : null
        if (formattedStartDate !== oldStartDate) { updateData.startDate = formattedStartDate; hasChanges = true }
        
        const oldEndDate = initialData.endDate ? new Date(initialData.endDate).toISOString() : null
        if (formattedEndDate !== oldEndDate) { updateData.endDate = formattedEndDate; hasChanges = true }
        
        if (data.capacity !== initialData.capacity) { updateData.capacity = data.capacity; hasChanges = true }

        // Location
        if (JSON.stringify(data.location) !== JSON.stringify(initialData.location)) {
          updateData.location = data.location
          hasChanges = true
        }

        // Categories
        if (JSON.stringify(selectedCategoryIds) !== JSON.stringify(initialData.categories?.map(c => c.id))) {
          updateData.categoryIds = selectedCategoryIds
          hasChanges = true
        }

        // Tickets - only if not disabled
        if (!ticketUpdateDisabled) {
          const newTickets = data.tickets.map((t, idx) => {
            const sStart = formatIso(t.salesStartDate)
            const sEnd = formatIso(t.salesEndDate)
            
            if (!sStart || !sEnd) {
              throw new Error(`Ticket ${idx + 1}: Invalid date format`)
            }
            
            return {
              name: t.name,
              price: typeof t.price === 'number' ? t.price : parseFloat(String(t.price)) || 0,
              salesStartDate: sStart,
              salesEndDate: sEnd,
            }
          })
          updateData.tickets = newTickets
          hasChanges = true
          console.log("Adding tickets to update")
        } else {
          console.log("Skipping tickets update because ticketUpdateDisabled is true")
        }

        // Images - only send if there are changes
        const retainedImages = previewUrls.filter(url => !url.startsWith("blob:"))
        const oldImages = initialData.images?.map(img => img.imageUrl) || []
        if (JSON.stringify(retainedImages) !== JSON.stringify(oldImages) || uploadedFiles.length > 0) {
          updateData.imageUrls = retainedImages
          hasChanges = true
        }

        if (!hasChanges && uploadedFiles.length === 0) {
          error("No changes to update")
          setIsSubmitting(false)
          return
        }

        // If there are new files, use FormData
        if (uploadedFiles.length > 0) {
          const formData = new FormData()
          
          // Add only changed fields
          Object.entries(updateData).forEach(([key, value]) => {
            if (key === "location") {
              formData.append(key, JSON.stringify(value))
            } else if (key === "tickets" || key === "categoryIds" || key === "imageUrls") {
              formData.append(key, JSON.stringify(value))
            } else if (value !== undefined && value !== null) {
              formData.append(key, String(value))
            }
          })
          
          // Append new files
          uploadedFiles.forEach((f) => formData.append("files", f))
          
          console.log("Sending update with files. FormData entries:", Array.from(formData.entries()))
          await onSubmit(formData as any)
        } else {
          // Send as JSON for updates without files
          console.log("Sending update (no files):", updateData)
          await onSubmit(updateData as any)
        }
      } else {
        // For CREATE: Send all fields with values in FormData if images exist, otherwise JSON
        
        // Validate and format all ticket dates
        const formattedTickets = data.tickets.map((t, idx) => {
          const sStart = formatIso(t.salesStartDate)
          const sEnd = formatIso(t.salesEndDate)
          
          if (!sStart || !sEnd) {
            throw new Error(`Ticket ${idx + 1}: Invalid date format. Please check date fields.`)
          }
          
          return {
            name: t.name,
            price: typeof t.price === 'number' ? t.price : parseFloat(String(t.price)) || 0,
            salesStartDate: sStart,
            salesEndDate: sEnd,
          }
        })
        
        const createData: any = {
          name: data.name,
          description: data.description,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          capacity: data.capacity,
          location: data.location,
          tickets: formattedTickets,
          categoryIds: selectedCategoryIds,
          imageUrls: previewUrls.filter(url => !url.startsWith("blob:")),
        }

        // Remove empty imageUrls for new events
        if (!createData.imageUrls || createData.imageUrls.length === 0) {
          createData.imageUrls = []
        }

        // If there are files, use FormData; otherwise use JSON
        if (uploadedFiles.length > 0) {
          const formData = new FormData()
          formData.append("name", createData.name)
          formData.append("description", createData.description)
          formData.append("startDate", createData.startDate)
          formData.append("endDate", createData.endDate)
          formData.append("capacity", String(createData.capacity))
          formData.append("location", JSON.stringify(createData.location))
          formData.append("tickets", JSON.stringify(createData.tickets))
          formData.append("categoryIds", JSON.stringify(createData.categoryIds))
          
          // Add files
          uploadedFiles.forEach((f) => formData.append("files", f))
          
          console.log("Creating event with FormData. Data:", {
            name: createData.name,
            startDate: createData.startDate,
            endDate: createData.endDate,
            capacity: createData.capacity,
            location: createData.location,
            tickets: createData.tickets,
            categoryIds: createData.categoryIds,
            filesCount: uploadedFiles.length,
          })
          
          await onSubmit(formData as any)
        } else {
          // Send as plain JSON for creates without files
          console.log("Creating event with JSON. Data:", createData)
          await onSubmit(createData as any)
        }
      }

      success("Event saved successfully!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save event"
      console.error("Event submission error:", errorMsg, err)
      
      // Try to extract more detailed error info from axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as any
        console.error("Backend response status:", axiosErr.response?.status)
        console.error("Backend response data:", axiosErr.response?.data)
        
        // Extract detailed error message from backend
        const backendMessage = axiosErr.response?.data?.message || errorMsg
        if (backendMessage.includes("Failed to create event")) {
          error(backendMessage)
        } else if (errorMsg.includes("Cannot update tickets when bookings exist")) {
          console.warn("Ticket update disabled due to bookings. Setting flag.")
          setTicketUpdateDisabled(true)
          error("This event has bookings. You can only update images and categories.")
        } else if (errorMsg !== "Invalid ticket dates") {
          error(backendMessage)
        }
      } else {
        error(errorMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressValue = ((currentStep + 1) / STEPS.length) * 100
  const currentLocation = watch("location")
  const addressLabel = [currentLocation.address, currentLocation.city, currentLocation.country]
    .filter(Boolean)
    .join(", ")

  const applyPlaceSuggestion = useCallback((place: PlaceSuggestion) => {
    setValue("location.address", place.address || currentLocation.address || "", { shouldDirty: true })
    setValue("location.city", place.city || "", { shouldDirty: true })
    setValue("location.state", place.state || "", { shouldDirty: true })
    setValue("location.country", place.country || "", { shouldDirty: true })
    setValue("location.postalCode", place.postalCode || "", { shouldDirty: true })
    setValue("location.latitude", place.latitude, { shouldDirty: true })
    setValue("location.longitude", place.longitude, { shouldDirty: true })
    setPlaceSuggestions([])
    setPlacesError("")
  }, [currentLocation.address, setValue])

  useEffect(() => {
    if (currentStep !== 1) return

    const query = [currentLocation.address, currentLocation.city, currentLocation.country]
      .filter(Boolean)
      .join(", ")
      .trim()

    if (query.length < 6) {
      setPlaceSuggestions([])
      setPlacesError("")
      return
    }

    const timeoutId = window.setTimeout(async () => {
      setPlacesLoading(true)
      setPlacesError("")
      try {
        const response = await api.get<PlaceSuggestion[]>("/geo/search", {
          params: { query, limit: 5 },
        })
        setPlaceSuggestions(response.data || [])
      } catch {
        setPlacesError("Could not load place suggestions right now.")
      } finally {
        setPlacesLoading(false)
      }
    }, 450)

    return () => window.clearTimeout(timeoutId)
  }, [currentLocation.address, currentLocation.city, currentLocation.country, currentStep])

  const reverseFillFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
    try {
      const response = await api.get<PlaceSuggestion>("/geo/reverse", {
        params: { latitude, longitude },
      })
      const place = response.data
      setValue("location.address", place.address || currentLocation.address || "", { shouldDirty: true })
      setValue("location.city", place.city || currentLocation.city || "", { shouldDirty: true })
      setValue("location.state", place.state || currentLocation.state || "", { shouldDirty: true })
      setValue("location.country", place.country || currentLocation.country || "", { shouldDirty: true })
      setValue("location.postalCode", place.postalCode || currentLocation.postalCode || "", { shouldDirty: true })
    } catch {
      // Keep manual fields untouched if reverse geocoding fails.
    }
  }, [currentLocation.address, currentLocation.city, currentLocation.country, currentLocation.postalCode, currentLocation.state, setValue])

  function toggleCategory(id: number): void {
    setSelectedCategoryIds(prev => 
      prev.includes(id) 
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            const isActive = idx === currentStep
            const isCompleted = idx < currentStep
            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(idx)}
                  disabled={!isActive && !isCompleted && !completedSteps.has(idx - 1)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 cursor-pointer"
                      : completedSteps.has(idx - 1) || idx === 0
                      ? "bg-default-100 text-default-600 cursor-pointer hover:bg-default-200"
                      : "bg-default-100 text-default-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? "bg-success" : "bg-default-200"}`} />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={progressValue} color="primary" size="sm" />
      </div>

      <form className="space-y-6" noValidate>
        {/* Step 1: Event Details */}
        {currentStep === 0 && (
          <Card>
            <CardHeader className="flex items-center gap-3 px-6 py-4">
              <Calendar className="text-primary" size={20} />
              <div>
                <h2 className="text-lg font-semibold">Event Details</h2>
                <p className="text-sm text-default-500">Basic information about your event</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 px-6 py-6">
              <Controller
                control={control}
                name="name"
                rules={{ required: "Event name is required", minLength: { value: 3, message: "Min 3 characters" } }}
                render={({ field }) => (
                  <Input {...field} label="Event Name" placeholder="e.g., Summer Music Festival" isInvalid={!!errors.name} errorMessage={errors.name?.message} variant="bordered" size="lg" />
                )}
              />
              <Controller
                control={control}
                name="description"
                rules={{ required: "Description is required", minLength: { value: 10, message: "Min 10 characters" } }}
                render={({ field }) => (
                  <Textarea {...field} label="Description" placeholder="Describe your event in detail..." minRows={4} isInvalid={!!errors.description} errorMessage={errors.description?.message} variant="bordered" />
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller control={control} name="startDate" rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Input {...field} type="datetime-local" label="Start Date & Time" isInvalid={!!errors.startDate} errorMessage={errors.startDate?.message} variant="bordered" />
                  )}
                />
                <Controller control={control} name="endDate" rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Input {...field} type="datetime-local" label="End Date & Time" isInvalid={!!errors.endDate} errorMessage={errors.endDate?.message} variant="bordered" />
                  )}
                />
              </div>
              <Controller control={control} name="capacity" rules={{ required: "Required", min: { value: 1, message: "Min 1" } }}
                render={({ field }) => (
                  <Input 
                    {...field} 
                    value={String(field.value)}
                    type="number" 
                    label="Event Capacity" 
                    placeholder="e.g., 500" 
                    isInvalid={!!errors.capacity} 
                    errorMessage={errors.capacity?.message} 
                    variant="bordered" 
                    onChange={(e) => field.onChange(parseNumber(e.target.value, 1))} 
                    className="max-w-xs" 
                  />
                )}
              />
            </CardBody>
          </Card>
        )}

        {/* Step 2: Location */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="flex items-center gap-3 px-6 py-4">
              <MapPin className="text-primary" size={20} />
              <div>
                <h2 className="text-lg font-semibold">Event Location</h2>
                <p className="text-sm text-default-500">Where will your event take place?</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 px-6 py-6">
              <Controller control={control} name="location.address" rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <Input {...field} label="Street Address" placeholder="e.g., 123 Main Street" isInvalid={!!errors.location?.address} errorMessage={errors.location?.address?.message} variant="bordered" />
                )}
              />
              {(placesLoading || placeSuggestions.length > 0 || placesError) && (
                <div className="rounded-xl border border-default-200 bg-default-50 px-3 py-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-default-400 mb-2">
                    Suggested places
                  </div>
                  {placesLoading && <p className="text-sm text-default-500">Searching open map data...</p>}
                  {!placesLoading && placeSuggestions.length > 0 && (
                    <div className="space-y-2">
                      {placeSuggestions.map((place) => (
                        <button
                          key={`${place.latitude}-${place.longitude}-${place.displayName}`}
                          type="button"
                          onClick={() => applyPlaceSuggestion(place)}
                          className="w-full rounded-lg border border-default-200 bg-background px-3 py-3 text-left transition-colors hover:border-primary hover:bg-primary-50/30"
                        >
                          <div className="font-medium text-foreground">{place.displayName}</div>
                          <div className="text-sm text-default-500">
                            {[place.address, place.city, place.country].filter(Boolean).join(", ")}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!placesLoading && !placeSuggestions.length && placesError && (
                    <p className="text-sm text-danger">{placesError}</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller control={control} name="location.city" rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <Input {...field} label="City" placeholder="e.g., New York" isInvalid={!!errors.location?.city} errorMessage={errors.location?.city?.message} variant="bordered" />
                  )}
                />
                <Controller control={control} name="location.state" rules={{ required: "State is required" }}
                  render={({ field }) => (
                    <Input {...field} label="State / Province" placeholder="e.g., NY" isInvalid={!!errors.location?.state} errorMessage={errors.location?.state?.message} variant="bordered" />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller control={control} name="location.country" rules={{ required: "Country is required" }}
                  render={({ field }) => (
                    <Input {...field} label="Country" placeholder="e.g., United States" isInvalid={!!errors.location?.country} errorMessage={errors.location?.country?.message} variant="bordered" />
                  )}
                />
                <Controller control={control} name="location.postalCode" rules={{ required: "Postal code is required" }}
                  render={({ field }) => (
                    <Input {...field} label="Postal Code" placeholder="e.g., 10001" isInvalid={!!errors.location?.postalCode} errorMessage={errors.location?.postalCode?.message} variant="bordered" />
                  )}
                />
              </div>
              <Controller control={control} name="location.googleMapsLink"
                render={({ field }) => (
                  <Input {...field} label="Google Maps Link (Optional)" placeholder="https://maps.google.com/..." type="url" variant="bordered" />
                )}
              />
              <InteractiveLocationPicker
                addressLabel={addressLabel}
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                onChange={({ latitude, longitude }) => {
                  setValue("location.latitude", latitude, { shouldDirty: true })
                  setValue("location.longitude", longitude, { shouldDirty: true })
                  void reverseFillFromCoordinates(latitude, longitude)
                }}
              />
            </CardBody>
          </Card>
        )}

        {/* Step 3: Tickets */}
        {currentStep === 2 && (
          <>
            {ticketUpdateDisabled && initialData && (
              <Card className="bg-warning-50 dark:bg-warning-900/20 border-warning mb-4">
                <CardBody className="gap-2 px-6 py-4">
                  <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                    ⚠️ This event has bookings, so you cannot modify tickets. You can still update other event details or cancel existing bookings to make ticket changes.
                  </p>
                </CardBody>
              </Card>
            )}
            <Card>
            <CardHeader className="flex items-center gap-3 px-6 py-4">
              <Ticket className="text-primary" size={20} />
              <div>
                <h2 className="text-lg font-semibold">Ticket Types</h2>
                <p className="text-sm text-default-500">Define ticket tiers and pricing</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 px-6 py-6">
              {ticketFields.map((field, index) => (
                <Card key={field.id} className={ticketUpdateDisabled && initialData ? "border border-default-200 shadow-none opacity-60 pointer-events-none" : "border border-default-200 shadow-none"}>
                  <CardBody className="gap-4 p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">Ticket {index + 1}</h3>
                      {ticketFields.length > 1 && (
                        <Button isIconOnly color="danger" variant="light" size="sm" onPress={() => removeTicket(index)} aria-label="Remove ticket">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller control={control} name={`tickets.${index}.name`} rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input {...field} label="Ticket Name" placeholder="e.g., General Admission" isInvalid={!!errors.tickets?.[index]?.name} errorMessage={errors.tickets?.[index]?.name?.message} variant="bordered" />
                        )}
                      />
                      <Controller control={control} name={`tickets.${index}.price`} rules={{ required: "Required", min: { value: 0, message: "Min 0" } }}
                        render={({ field }) => (
                          <Input 
                            {...field} 
                            value={String(field.value)}
                            type="number" 
                            label="Price ($)" 
                            placeholder="0.00" 
                            isInvalid={!!errors.tickets?.[index]?.price} 
                            errorMessage={errors.tickets?.[index]?.price?.message} 
                            variant="bordered" 
                            onChange={(e) => field.onChange(parseNumber(e.target.value, 0))} 
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller control={control} name={`tickets.${index}.salesStartDate`} rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input {...field} type="datetime-local" label="Sales Start" isInvalid={!!errors.tickets?.[index]?.salesStartDate} errorMessage={errors.tickets?.[index]?.salesStartDate?.message} variant="bordered" />
                        )}
                      />
                      <Controller control={control} name={`tickets.${index}.salesEndDate`} rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input {...field} type="datetime-local" label="Sales End" isInvalid={!!errors.tickets?.[index]?.salesEndDate} errorMessage={errors.tickets?.[index]?.salesEndDate?.message} variant="bordered" />
                        )}
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
              {!ticketUpdateDisabled && (
                <Button type="button" color="primary" variant="flat" startContent={<Plus size={16} />}
                  onPress={() => appendTicket({ name: "", price: 0, salesStartDate: "", salesEndDate: "" })}>
                  Add Another Ticket Type
                </Button>
              )}
            </CardBody>
          </Card>
          </>
        )}

        {/* Step 4: Media & Categories */}
        {currentStep === 3 && (
          <>
            {ticketUpdateDisabled && initialData && (
              <Card className="bg-info-50 dark:bg-info-900/20 border-info mb-6">
                <CardBody className="gap-2 px-6 py-4">
                  <p className="text-sm font-medium text-info-700 dark:text-info-400">
                    ℹ️ This event has bookings. Changes are limited to images and categories only.
                  </p>
                </CardBody>
              </Card>
            )}
            <div className="space-y-6">
            <Card>
              <CardHeader className="flex items-center gap-3 px-6 py-4">
                <ImageIcon className="text-primary" size={20} />
                <div>
                  <h2 className="text-lg font-semibold">Event Images</h2>
                  <p className="text-sm text-default-500">Upload up to 5 images for your event</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden aspect-video bg-default-100">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {previewUrls.length < 5 && (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-default-300 rounded-lg aspect-video cursor-pointer hover:border-primary hover:bg-primary-50/10 transition-colors">
                      <Plus size={24} className="text-default-400 mb-1" />
                      <span className="text-xs text-default-400">Add Image</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <p className="text-sm text-default-500">Select categories that best describe your event</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="px-6 py-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Chip
                      key={cat.id}
                      variant={selectedCategoryIds.includes(cat.id) ? "solid" : "bordered"}
                      color={selectedCategoryIds.includes(cat.id) ? "primary" : "default"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.name}
                    </Chip>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-default-400 text-sm">No categories available</p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Summary */}
            <Card className="bg-primary-50/30 dark:bg-primary-900/10 border-none">
              <CardBody className="px-6 py-6">
                <h2 className="text-lg font-semibold mb-3">Review Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-500">Event Name</p>
                    <p className="font-medium text-foreground">{watch("name") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Capacity</p>
                    <p className="font-medium text-foreground">{watch("capacity") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Location</p>
                    <p className="font-medium text-foreground">
                      {watch("location.city") ? `${watch("location.city")}, ${watch("location.country")}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Tickets</p>
                    <p className="font-medium text-foreground">{ticketFields.length} type(s)</p>
                  </div>
                  <div>
                    <p className="text-default-500">Images</p>
                    <p className="font-medium text-foreground">{previewUrls.length} uploaded</p>
                  </div>
                  <div>
                    <p className="text-default-500">Categories</p>
                    <p className="font-medium text-foreground">{selectedCategoryIds.length} selected</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="bordered"
            startContent={currentStep === 0 ? undefined : <ArrowLeft size={16} />}
            onPress={currentStep === 0 ? () => navigate("/dashboard/events") : goBack}
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" color="primary" endContent={<ArrowRight size={16} />} onPress={goNext}>
                Continue
              </Button>
            ) : (
              <Button 
                type="button" 
                color="primary" 
                isLoading={isSubmitting || isLoading} 
                startContent={<Check size={16} />}
                onPress={handleFinalSubmit}
              >
                {initialData ? "Update Event" : "Create Event"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
