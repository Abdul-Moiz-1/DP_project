import { Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, Button } from '@heroui/react';
import { CheckCircle, Calendar, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketType {
  id: number;
  name: string;
  price: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketType | null;
  quantity: number;
  eventName: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export default function BookingModal({
  isOpen,
  onClose,
  ticket,
  quantity,
  eventName,
  onConfirm,
  isLoading = false,
  isSuccess = false,
}: BookingModalProps) {
  const total  = (ticket?.price ?? 0) * quantity;
  const isFree = ticket?.price === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        {isSuccess ? (
          <ModalBody className="py-8 flex flex-col items-center text-center">
            <div className="rounded-full bg-success/10 p-4 mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-default-500 mb-6 max-w-xs">
              Your spot has been reserved for <strong>{eventName}</strong>.
            </p>
            <Button
              as={Link}
              to="/dashboard/my-tickets"
              color="primary"
              className="w-full font-semibold"
              onPress={onClose}
            >
              View my tickets
            </Button>
            <button
              onClick={onClose}
              className="mt-2 text-sm text-default-400 hover:text-foreground transition-colors"
            >
              Stay on this page
            </button>
          </ModalBody>
        ) : (
          <>
            <ModalHeader>
              <h2 className="font-display font-semibold text-lg">Confirm Booking</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="card-base p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar size={15} className="text-default-400 mt-0.5 flex-none" />
                    <div>
                      <p className="text-xs text-default-400">Event</p>
                      <p className="font-semibold text-sm leading-snug">{eventName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Ticket size={15} className="text-default-400 mt-0.5 flex-none" />
                    <div>
                      <p className="text-xs text-default-400">Ticket type</p>
                      <p className="font-semibold text-sm">{ticket?.name}</p>
                    </div>
                  </div>
                  <div className="h-px bg-divider" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">
                      {isFree ? 'Free' : `$${ticket?.price}`} × {quantity}
                    </span>
                    <span className="font-bold text-lg">
                      {isFree ? 'Free' : `$${total}`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-default-400 text-center">
                  By confirming you agree to our Terms of Service.
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button
                variant="flat"
                onPress={onClose}
                isDisabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={onConfirm}
                isLoading={isLoading}
                className="flex-1 font-semibold"
              >
                Confirm Booking
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
