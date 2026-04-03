// src/components/Event/ReviewsList.tsx
import React from "react";
import { Card, CardHeader, CardBody, Avatar, Button } from "@heroui/react";
import { StarIcon } from "../Icons";
import { Review } from "@/api/types";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  const { user } = useAuth();

  const handleEditReview = () => {};
  const handleDeleteReview = () => {};

  if (!reviews?.length) {
    return (
      <div className="text-center text-default-500 py-6">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((rev) => (
        <Card key={rev.id} shadow="sm" className="rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={rev.reviewer.name}
                name={rev.reviewer.name}
                size="sm"
              />
              <div>
                <p className="font-semibold text-default-900">
                  {rev.reviewer.name}
                </p>
                <div className="flex gap-1 text-warning">
                  {[...Array(rev.rating)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-xs text-default-500">
              {new Date(rev.createdAt).toLocaleDateString()}
              {user?.id == rev.reviewer.id && (
                <div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleEditReview}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={handleDeleteReview}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </span>
          </CardHeader>

          <CardBody className="pt-0 text-default-600 text-sm">
            {rev.comment}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
