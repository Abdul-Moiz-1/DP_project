"use client"
import { EventForm } from "@/components/dashboard/create-event/event-form"
import type { EventResponseDto, UpdateEventDto } from "@/lib/dtos"
import { useToast } from "@/components/toast-provider"
import { api } from "@/api/api"
import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

export default function UpdateEventPage() {
  const { success, error } = useToast()
  const [initialData, setInitialData] = React.useState<EventResponseDto | null>(null)
  const [loading, setLoading] = React.useState(false)
  const params = useParams()
  const navigate = useNavigate()
  const eventId = params.id ? parseInt(params.id) : null

  const fetchInitialData = async (eventId: number) => {
    setLoading(true)
    try {
      const response = await api.get(`events/${eventId}`)
      const data = response.data;
      setInitialData(data)
      setLoading(false)
      success("Event data loaded successfully")
    } catch (error: any) {
      console.error("Error fetching event data:", error.message)
      error("Failed to load event data")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchInitialData(eventId)
    } else {
      error("No event ID provided")
      navigate('/dashboard/events')
    }
  }, [eventId])

  const handleSubmit = async (data: UpdateEventDto) => {
    if (!eventId) {
      error("No event ID provided")
      return
    }
    
    try {
      const response = await api.put(`/events/${eventId}`, data)
      
      if (response.status >= 200 && response.status < 300) {
        success(`Event updated successfully!`)
        navigate('/dashboard/events')
      } else {
        throw new Error("Failed to update event")
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
        <h1 className="text-3xl font-bold mb-2">Update Event</h1>
        <p className="text-default-600 mb-8">Modify the details below to update your event</p>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : initialData ? (
          <EventForm onSubmit={handleSubmit} initialData={initialData} isLoading={loading} />
        ) : (
          <div className="text-center text-red-500">Failed to load event data</div>
        )}
      </div>
    </div>
  )
}
