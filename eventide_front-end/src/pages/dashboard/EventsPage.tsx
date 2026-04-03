"use client"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@heroui/button"
import { Card, CardBody, CardFooter } from "@heroui/card"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown"
import { Pagination } from "@heroui/pagination"
import { useToast } from "@/components/toast-provider"
import { api } from "@/api/api"
import { Event } from "@/api/types"
import { eventService } from "@/services/eventService"
import { format } from "date-fns"
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { success, error } = useToast()
  const navigate = useNavigate()
  const itemsPerPage = 10

  useEffect(() => {
    fetchEvents()
  }, [currentPage])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await eventService.fetchMyEvents()
      setEvents(response || [])
      // In a real implementation, you would use pagination from the API
      setTotalPages(Math.ceil(response.length / itemsPerPage))
    } catch (err) {
      console.error("Failed to fetch events:", err)
      error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }

    try {
      await api.delete(`/events/${eventId}`)
      success("Event deleted successfully")
      fetchEvents() // Refresh the list
    } catch (err) {
      console.error("Failed to delete event:", err)
      error("Failed to delete event")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Get current events for pagination
  const indexOfLastEvent = currentPage * itemsPerPage
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-default-600">Manage your events</p>
        </div>
        <Button 
          color="primary" 
          as={Link} 
          to="/dashboard/events/create"
          startContent={<Plus size={16} />}
        >
          Create Event
        </Button>
      </div>

      <Card className="w-full">
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-default-600 mb-4">You haven't created any events yet.</p>
              <Button 
                color="primary" 
                as={Link} 
                to="/dashboard/events/create"
                startContent={<Plus size={16} />}
              >
                Create Your First Event
              </Button>
            </div>
          ) : (
            <Table aria-label="Events table">
              <TableHeader>
                <TableColumn>EVENT NAME</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>CAPACITY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {currentEvents.map((event) => {
                  const startDate = new Date(event.startDate)
                  const endDate = new Date(event.endDate)
                  const isActive = new Date() < endDate
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{event.name}</span>
                          <span className="text-xs text-default-500">ID: {event.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(startDate, "MMM d, yyyy")}</span>
                          <span className="text-xs text-default-500">{format(startDate, "h:mm a")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.location.city}, {event.location.country}
                      </TableCell>
                      <TableCell>
                        {event.capacity}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isActive ? 'Active' : 'Ended'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            onPress={() => navigate(`/dashboard/events/update/${event.id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            color="danger"
                            onPress={() => handleDelete(event.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
        {events.length > 0 && (
          <CardFooter className="flex justify-center">
            <Pagination
              total={totalPages}
              initialPage={currentPage}
              onChange={handlePageChange}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  )
}