import { Avatar, Button } from '@heroui/react';

interface OrganizerCardProps {
  organizer: {
    id: number;
    name: string;
    organizerProfile?: { organizationName?: string };
  };
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollow?: () => void;
}

export default function OrganizerCard({
  organizer,
  isFollowing = false,
  followLoading = false,
  onFollow,
}: OrganizerCardProps) {
  const orgName = organizer.organizerProfile?.organizationName;

  return (
    <div className="card-base p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-default-400 mb-3">
        Organizer
      </h3>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={organizer.name} size="md" color="primary" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{organizer.name}</p>
          {orgName && (
            <p className="text-xs text-default-400 truncate">{orgName}</p>
          )}
        </div>
      </div>
      <Button
        variant={isFollowing ? 'solid' : 'bordered'}
        color={isFollowing ? 'primary' : 'default'}
        size="sm"
        className="w-full"
        isLoading={followLoading}
        onPress={onFollow}
      >
        {isFollowing ? 'Following' : 'Follow organizer'}
      </Button>
    </div>
  );
}
