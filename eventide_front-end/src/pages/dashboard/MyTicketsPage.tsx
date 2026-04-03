"use client"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "@heroui/react"
import { Card, CardBody, CardFooter } from "@heroui/react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react"
import { Pagination } from "@heroui/react"
import { Badge } from "@heroui/badge"
import { useToast } from "@/components/toast-provider"
import { Booking } from "@/api/types"
import { eventService } from "@/services/eventService"
import { format } from "date-fns"
import { Download, Calendar, MapPin, Ticket } from "lucide-react"

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { success, error } = useToast()
  const location = useLocation()
  const itemsPerPage = 5

  useEffect(() => {
    fetchBookings()
    
    // Check if we have a successful booking from navigation state
    if (location.state?.bookingSuccess) {
      success("Booking completed successfully!")
      // Clear the state to prevent showing the message on page refresh
      window.history.replaceState({}, document.title)
    }
  }, [currentPage])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await eventService.fetchMyBookings()
      setBookings(response?.items || [])
      console.log("Bookings in MyTicketsPage:", response?.items)
      setTotalPages(Math.ceil(response.pages / itemsPerPage))
    } catch (err) {
      console.error("Failed to fetch bookings:", err)
      error("Failed to load your tickets")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * itemsPerPage
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking)

  // Function to generate a ticket PDF (mock function)
  const downloadTicket = (bookingId: number) => {
    success("Ticket download started")
    // In a real app, this would generate and download a PDF ticket
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-default-600">View and manage your event tickets</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="w-full">
          <CardBody className="text-center py-10">
            <div className="mx-auto mb-4 bg-default-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
              <Ticket size={24} className="text-default-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
            <p className="text-default-600 mb-4">You haven't booked any events yet.</p>
            <Button 
              color="primary" 
              href="/events"
            >
              Browse Events
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentBookings.map((booking) => {
            const eventDate = new Date(booking.event.startDate)
            const isPastEvent = eventDate < new Date()
            
            return (
              <Card key={booking.id} className="w-full">
                <CardBody className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 h-48 md:h-auto">
                      <img 
                        src={booking.event.images[0]?.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} 
                        alt={booking.event.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{booking.event.name}</h3>
                          <Badge color={isPastEvent ? "default" : "success"}>
                            {isPastEvent ? "Past" : "Upcoming"}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center text-default-600">
                            <Calendar size={16} className="mr-2" />
                            <span>{format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <div className="flex items-center text-default-600">
                            <MapPin size={16} className="mr-2" />
                            <span>{booking.event.city}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-default-500">Ticket Type</p>
                            <p className="font-medium">{booking.ticket.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-default-500">Quantity</p>
                            <p className="font-medium">1</p>
                          </div>
                          <div>
                            <p className="text-sm text-default-500">Price</p>
                            <p className="font-medium">${booking.ticket.price}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          color="primary" 
                          variant="flat"
                          startContent={<Download size={16} />}
                          onClick={() => downloadTicket(booking.id)}
                        >
                          Download Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
          
          {bookings.length > itemsPerPage && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}