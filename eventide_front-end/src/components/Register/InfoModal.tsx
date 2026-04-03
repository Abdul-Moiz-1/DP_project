// src/components/auth/InfoModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Organization Verification</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600 mb-4">
            We require organization details to ensure safety and authenticity.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-success text-xl">✓</span>
              <div>
                <p className="font-semibold text-sm">Build Trust</p>
                <p className="text-xs text-default-500">
                  Verified organizations increase attendee confidence
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-success text-xl">✓</span>
              <div>
                <p className="font-semibold text-sm">Prevent Fraud</p>
                <p className="text-xs text-default-500">
                  Verification protects users from fraudulent events
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-success text-xl">✓</span>
              <div>
                <p className="font-semibold text-sm">Premium Features</p>
                <p className="text-xs text-default-500">
                  Verified organizations get priority listing and badges
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InfoModal;