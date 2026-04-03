// src/components/Event/BookingModal.tsx
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider, Input } from '@heroui/react';
import TicketCard from './TicketsCard';


interface TicketType {
  id: number;
  name: string;
  price: number;
  salesStartDate: Date | string;
  salesEndDate: Date | string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketTypes: TicketType[];
  onPurchase: (ticketId: string) => void;
}




export default function BookingModal({ isOpen, onClose, ticketTypes, onPurchase }: BookingModalProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const ticket = ticketTypes.find(t => t.id.toString() === selectedTicket);

  const subtotal = (ticket?.price || 0) * quantity;
  const total = subtotal + 5;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader><h2 className="text-2xl font-bold">Book Your Tickets</h2></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-default-500 mb-2">Select Ticket Type</p>
              {ticketTypes.filter(t => t.salesStartDate <  t.salesEndDate).map(t => (
                <TicketCard key={t.id} {...t} selected={selectedTicket===t.id.toString()} onSelect={setSelectedTicket} available={100} />
              ))}
            </div>

            {selectedTicket && (
              <>
                {/* <div>
                  <label className="block text-sm font-medium mb-2">Number of Tickets</label>
                  <Input type="number" min={1} max={10} value={quantity.toString()} onChange={(e:any) => setQuantity(Math.max(1, Number(e.target.value)||1))} />
                </div> */}

                <div className="p-4 bg-default-100 rounded-xl">
                  <div className="flex justify-between mb-2"><span>Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between mb-2"><span>Service Fee</span><span className="font-semibold">$5.00</span></div>
                  <Divider className="my-2" />
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>Cancel</Button>
          <Button color="primary" onPress={() => { if (selectedTicket) onPurchase(selectedTicket); }} isDisabled={!selectedTicket}>Proceed to Checkout</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
