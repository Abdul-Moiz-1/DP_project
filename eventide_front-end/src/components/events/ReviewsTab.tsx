// src/components/Event/ReviewsTab.tsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  Divider,
  Button,
  Textarea,
} from "@heroui/react";
import ReviewsList from "./ReviewsList";
import RatingSummary from "./RatingSummary";
import { Review } from "@/api/types";



interface ReviewsTabProps {
  reviews: Review[];
  onSubmitReview: (rating: number, comment: string) => void;
  isUserAuthenticated: boolean;
  onRequireLogin: () => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  onSubmitReview,
  isUserAuthenticated,
  onRequireLogin,
}) => {
  const [reviewDraft, setReviewDraft] = useState({
    rating: 5,
    comment: "",
  });

  const handleSubmit = () => {
    if (!isUserAuthenticated) {
      onRequireLogin();
      return;
    }
    onSubmitReview(reviewDraft.rating, reviewDraft.comment);
    setReviewDraft({ rating: 5, comment: "" });
  };


  return (
    <Card>
      <CardBody className="space-y-6">

        <div className="md:col-span-1">
          <RatingSummary reviews={reviews} />
        </div>

        <Divider />

        {/* Write Review */}
        <div>
          <h3 className="font-bold text-lg mb-4">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewDraft((prev) => ({ ...prev, rating: star }))
                    }
                    className={`text-3xl transition-colors ${
                      star <= reviewDraft.rating
                        ? "text-warning"
                        : "text-default-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Your Review"
              placeholder="Share your experience with this event..."
              value={reviewDraft.comment}
              onChange={(e) =>
                setReviewDraft((prev) => ({ ...prev, comment: e.target.value }))
              }
              minRows={4}
            />
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!reviewDraft.comment.trim()}
            >
              Submit Review
            </Button>
          </div>
        </div>

        <Divider />

        {/* Reviews List */}
        <ReviewsList reviews={reviews} />
      </CardBody>
    </Card>
  );
};

export default ReviewsTab;
