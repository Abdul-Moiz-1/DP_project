"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Avatar,
  Divider,
} from "@heroui/react"
import { MapPinIcon, CalendarIcon, ClockIcon, MailIcon } from "lucide-react"

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    description: string
    image?: string
    date: string
    time: string
    location: string
    duration?: string
    highlights?: string[]
    organizerName: string
    organizerAvatar: string
  }
  onReserve?: () => void
}

export function EventDetailModal({ isOpen, onClose, event, onReserve }: EventDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{event.title}</ModalHeader>
            <ModalBody className="gap-6">
              {event.image && (
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <p className="text-gray-600">{event.description}</p>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Date and time</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{event.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Location</h4>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{event.location}</span>
                </div>
              </div>

              {event.highlights && event.highlights.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">About this event</h4>
                  <ul className="space-y-2">
                    {event.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-pink-500 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Divider />

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Organization by</h4>
                <Card className="bg-gray-50 border-0">
                  <CardBody className="gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={event.organizerAvatar} name={event.organizerAvatar} size="md" />
                      <div>
                        <p className="font-semibold text-gray-900">{event.organizerName}</p>
                        {event.organizerName&& (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MailIcon className="w-4 h-4" />
                            {event.organizerName.concat('@gmail.com')}
                          </div>
                        )}
                      </div>
                    </div>
                    {event.organizerName && (
                      <>
                        <Divider />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">About us</p>
                          <p className="text-sm text-gray-600">{event.organizerName}</p>
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="secondary"
                onPress={() => {
                  onReserve?.()
                  onClose()
                }}
              >
                Reserve a spot
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
