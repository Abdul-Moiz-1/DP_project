"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { Card, CardBody, CardHeader, Input, Button, Textarea, Divider, Progress, Chip } from "@heroui/react"
import { Calendar, MapPin, Ticket, Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import type { CreateEventDto, EventResponseDto, UpdateEventDto } from "@/lib/dtos"
import { useToast } from "@/components/toast-provider"
import { useNavigate } from "react-router-dom"
import { api } from "@/api/api"

interface EventFormProps {
  onSubmit: (data: CreateEventDto | UpdateEventDto) => Promise<void>
  initialData?: EventResponseDto
  isLoading?: boolean
}

interface CategoryOption {
  id: number
  name: string
}

const STEPS = [
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "location", label: "Location", icon: MapPin },
  { key: "tickets", label: "Tickets", icon: Ticket },
  { key: "media", label: "Media & Review", icon: ImageIcon },
]

export function EventForm({ onSubmit, initialData, isLoading = false }: EventFormProps) {
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.categories?.map((c) => c.id) || []
  )
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.imageUrl) || []
  )

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateEventDto | UpdateEventDto | EventResponseDto>({
    defaultValues: initialData || {
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

  const goNext = async () => {
    const fields = stepFields[currentStep] as any[]
    const valid = fields.length > 0 ? await trigger(fields) : true
    if (valid && currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...uploadedFiles, ...files].slice(0, 5)
    setUploadedFiles(newFiles)
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
  }

  const removeImage = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
  }

  const handleFormSubmit = async (data: CreateEventDto | UpdateEventDto) => {
    try {
      setIsSubmitting(true)

      if (new Date(data.startDate!) >= new Date(data.endDate!)) {
        error("End date must be after start date")
        return
      }

      if (!data.tickets || data.tickets.length === 0) {
        error("At least one ticket type is required")
        return
      }

      for (let i = 0; i < data.tickets.length; i++) {
        const t = data.tickets[i]
        if (new Date(t.salesStartDate) >= new Date(t.salesEndDate)) {
          error(`Ticket ${i + 1}: Sale end date must be after start date`)
          return
        }
      }

      data.categoryIds = selectedCategoryIds

      if (!initialData && uploadedFiles.length > 0) {
        const formData = new FormData()
        uploadedFiles.forEach((f) => formData.append("files", f))

        const eventFormData = new FormData()
        eventFormData.append("name", data.name!)
        eventFormData.append("description", data.description!)
        eventFormData.append("startDate", data.startDate!)
        eventFormData.append("endDate", data.endDate!)
        eventFormData.append("capacity", String(data.capacity))
        eventFormData.append("location", JSON.stringify(data.location))
        eventFormData.append("tickets", JSON.stringify(data.tickets))
        eventFormData.append("categoryIds", JSON.stringify(selectedCategoryIds))
        uploadedFiles.forEach((f) => eventFormData.append("files", f))

        await onSubmit(data)
      } else {
        await onSubmit(data)
      }

      success("Event saved successfully!")
    } catch (err) {
      if (err instanceof Error && err.message !== "Invalid ticket dates") {
        error(err.message || "Failed to save event")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressValue = ((currentStep + 1) / STEPS.length) * 100

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
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 cursor-pointer"
                      : "bg-default-100 text-default-500"
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

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  <Input {...field} type="number" label="Event Capacity" placeholder="e.g., 500" isInvalid={!!errors.capacity} errorMessage={errors.capacity?.message} variant="bordered" onChange={(e) => field.onChange(parseInt(e.target.value))} className="max-w-xs" />
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
            </CardBody>
          </Card>
        )}

        {/* Step 3: Tickets */}
        {currentStep === 2 && (
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
                <Card key={field.id} className="border border-default-200 shadow-none">
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
                          <Input {...field} type="number" label="Price ($)" placeholder="0.00" isInvalid={!!errors.tickets?.[index]?.price} errorMessage={errors.tickets?.[index]?.price?.message} variant="bordered" onChange={(e) => field.onChange(parseFloat(e.target.value))} />
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
              <Button type="button" color="primary" variant="flat" startContent={<Plus size={16} />}
                onPress={() => appendTicket({ name: "", price: 0, salesStartDate: "", salesEndDate: "" })}>
                Add Another Ticket Type
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Step 4: Media & Categories */}
        {currentStep === 3 && (
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
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="bordered"
            startContent={currentStep === 0 ? undefined : <ArrowLeft size={16} />}
            onPress={currentStep === 0 ? () => navigate("/dashboard/events") : goBack}
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 ? (
              <Button color="primary" endContent={<ArrowRight size={16} />} onPress={goNext}>
                Continue
              </Button>
            ) : (
              <Button color="primary" type="submit" isLoading={isSubmitting || isLoading} startContent={<Check size={16} />}>
                {initialData ? "Update Event" : "Create Event"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
