"use client"

import { useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { Card, CardBody, CardHeader } from "@heroui/react"
import { Input } from "@heroui/react"
import { Button } from "@heroui/react"
import { Textarea } from "@heroui/react"
import { Divider } from "@heroui/react"
import type { CreateEventDto, EventResponseDto, UpdateEventDto } from "@/lib/dtos"
import { useToast } from "@/components/toast-provider"

interface EventFormProps {
  onSubmit: (data: CreateEventDto | UpdateEventDto) => Promise<void>
  initialData?: EventResponseDto
  isLoading?: boolean
}

export function EventForm({ onSubmit, initialData, isLoading = false }: EventFormProps) {
  const { showToast, success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateEventDto | UpdateEventDto | EventResponseDto>({
    defaultValues: initialData || {
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
      },
      tickets: [{ name: "", price: 0, salesStartDate: "", salesEndDate: "" }],
      imageUrls: [],
      categoryIds: [],
    },
  })

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control,
    name: "tickets",
  })

  const handleFormSubmit = async (data: CreateEventDto | UpdateEventDto) => {
    try {
      setIsSubmitting(true)

      // Validate dates
      if (new Date(data.startDate!) >= new Date(data.endDate!)) {
        error("End date must be after start date")
        return
      }

      // Validate capacity
      if (data.capacity! < 1) {
        error("Capacity must be at least 1")
        return
      }

      // Validate tickets
      if (data.tickets && data.tickets.length === 0) {
        error("At least one ticket is required")
        return
      }

      data.tickets?.forEach((ticket, index) => {
        if (new Date(ticket.salesStartDate) >= new Date(ticket.salesEndDate)) {
          error(`Ticket ${index + 1}: Sale end date must be after sale start date`)
          throw new Error("Invalid ticket dates")
        }
      })

      await onSubmit(data)
      success("Event saved successfully!")
    } catch (err) {
      if (err instanceof Error && err.message !== "Invalid ticket dates") {
        error(err.message || "Failed to save event")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Event Information */}
        <Card>
          <CardHeader className="flex flex-col items-start px-4 py-2 bg-default-100">
            <h2 className="text-lg font-semibold">Event Details</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Event name is required",
                minLength: { value: 3, message: "Event name must be at least 3 characters" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Event Name"
                  placeholder="Enter event name"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              rules={{
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Description"
                  placeholder="Enter event description"
                  minRows={4}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description?.message}
                  required
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    label="Start Date"
                    isInvalid={!!errors.startDate}
                    errorMessage={errors.startDate?.message}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    label="End Date"
                    isInvalid={!!errors.endDate}
                    errorMessage={errors.endDate?.message}
                    required
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="capacity"
              rules={{
                required: "Capacity is required",
                min: { value: 1, message: "Capacity must be at least 1" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Capacity"
                  placeholder="Enter event capacity"
                  isInvalid={!!errors.capacity}
                  errorMessage={errors.capacity?.message}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  required
                />
              )}
            />
          </CardBody>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader className="flex flex-col items-start px-4 py-2 bg-default-100">
            <h2 className="text-lg font-semibold">Location</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Controller
              control={control}
              name="location.address"
              rules={{ required: "Address is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Address"
                  placeholder="Enter street address"
                  isInvalid={!!errors.location?.address}
                  errorMessage={errors.location?.address?.message}
                  required
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="location.city"
                rules={{ required: "City is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="City"
                    placeholder="Enter city"
                    isInvalid={!!errors.location?.city}
                    errorMessage={errors.location?.city?.message}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="location.state"
                rules={{ required: "State is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="State"
                    placeholder="Enter state"
                    isInvalid={!!errors.location?.state}
                    errorMessage={errors.location?.state?.message}
                    required
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="location.country"
                rules={{ required: "Country is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Country"
                    placeholder="Enter country"
                    isInvalid={!!errors.location?.country}
                    errorMessage={errors.location?.country?.message}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="location.postalCode"
                rules={{ required: "Postal code is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Postal Code"
                    placeholder="Enter postal code"
                    isInvalid={!!errors.location?.postalCode}
                    errorMessage={errors.location?.postalCode?.message}
                    required
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="location.googleMapsLink"
              render={({ field }) => (
                <Input {...field} label="Google Maps Link (Optional)" placeholder="Enter Google Maps link" type="url" />
              )}
            />
          </CardBody>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader className="flex flex-col items-start px-4 py-2 bg-default-100">
            <h2 className="text-lg font-semibold">Tickets</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            {ticketFields.map((field, index) => (
              <div key={field.id} className="border border-default-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Ticket {index + 1}</h3>
                  {ticketFields.length > 1 && (
                    <Button isIconOnly color="danger" variant="light" size="sm" onClick={() => removeTicket(index)}>
                      ✕
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name={`tickets.${index}.name`}
                    rules={{ required: "Ticket name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Ticket Name"
                        placeholder="e.g., General Admission"
                        isInvalid={!!errors.tickets?.[index]?.name}
                        errorMessage={errors.tickets?.[index]?.name?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`tickets.${index}.price`}
                    rules={{
                      required: "Price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Price"
                        placeholder="0.00"
                        isInvalid={!!errors.tickets?.[index]?.price}
                        errorMessage={errors.tickets?.[index]?.price?.message}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        required
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name={`tickets.${index}.salesStartDate`}
                    rules={{ required: "Sales start date is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="datetime-local"
                        label="Sales Start Date"
                        isInvalid={!!errors.tickets?.[index]?.salesStartDate}
                        errorMessage={errors.tickets?.[index]?.salesStartDate?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`tickets.${index}.salesEndDate`}
                    rules={{ required: "Sales end date is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="datetime-local"
                        label="Sales End Date"
                        isInvalid={!!errors.tickets?.[index]?.salesEndDate}
                        errorMessage={errors.tickets?.[index]?.salesEndDate?.message}
                        required
                      />
                    )}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              color="primary"
              variant="flat"
              onClick={() =>
                appendTicket({
                  name: "",
                  price: 0,
                  salesStartDate: "",
                  salesEndDate: "",
                })
              }
            >
              + Add Ticket
            </Button>
          </CardBody>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3 justify-end">
          <Button variant="bordered" className="px-6">
            Cancel
          </Button>
          <Button color="primary" type="submit" isLoading={isSubmitting || isLoading} className="px-6">
            {initialData ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
