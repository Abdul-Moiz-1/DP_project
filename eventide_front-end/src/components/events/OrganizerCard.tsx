// src/components/Event/OrganizerCard.tsx
import React from 'react';
import { Card, CardBody, Avatar, Chip, Button } from '@heroui/react';

interface OrganizerCardProps {
  avatar: string;
  name: string;
  bio?: string;
  isVerified?: boolean;
  onFollow?: () => void;
}

const OrganizerCard: React.FC<OrganizerCardProps> = ({
  avatar,
  name,
  bio,
  isVerified = false,
  onFollow,
}) => {
  return (
    <Card>
      <CardBody>
        <h3 className="font-bold text-lg mb-4">Organized By</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src={avatar}
            name={name}
            size="lg"
            isBordered
            color="primary"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">{name}</p>
              {isVerified && (
                <Chip size="sm" color="success" variant="flat">
                  ✓ Verified
                </Chip>
              )}
            </div>
            {bio && <p className="text-sm text-default-500">{bio}</p>}
          </div>
          <Button variant="bordered" size="sm" onPress={onFollow}>
            Follow
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrganizerCard;
