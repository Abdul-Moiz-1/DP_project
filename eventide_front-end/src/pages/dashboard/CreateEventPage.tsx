"use client"
import { EventForm } from "@/components/dashboard/create-event/event-form"
import type {CreateEventDto, UpdateEventDto} from "@/lib/dtos"
import { useToast } from "@/components/toast-provider"
import { api } from "@/api/api"
import { useNavigate } from "react-router-dom"

export default function CreateEventPage() {
  const { success, error } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateEventDto | UpdateEventDto) => {
    try {
      const response = await api.post("/events", data)
      
      if (response.status >= 200 && response.status < 300) {
        const result = response.data
        success(`Event "${result.name}" created successfully!`)
        // Redirect to events page
        navigate('/dashboard/events')
      } else {
        throw new Error("Failed to create event")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      error(errorMessage)
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-default-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-default-600 mb-8">Fill in the details below to create a new event</p>
        <EventForm onSubmit={handleSubmit}/>
      </div>
    </div>
  )
}
