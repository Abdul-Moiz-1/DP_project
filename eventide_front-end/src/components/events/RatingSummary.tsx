
import { Card, CardHeader, CardBody, Progress } from "@heroui/react";
import { StarIcon } from "lucide-react";

// Keep the same interfaces
interface Review {
  rating: number;
}

interface RatingSummaryProps {
  reviews: Review[];
}

const RatingSummary = ({ reviews }: RatingSummaryProps) => {
  // Calculate basic stats
  const totalReviews = reviews.length;
  
  // Calculate average rating
  const averageRating = totalReviews === 0 
    ? 0 
    : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  // Count ratings for each star level (5 to 1 stars)
  const ratingCounts = Array(5).fill(0);
  reviews.forEach(review => {
    ratingCounts[5 - review.rating]++;
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="w-full flex justify-between items-center">
          {/* Left side - Title and total count */}
          <div>
            <h3 className="text-lg font-bold">Ratings & Reviews</h3>
            <p className="text-sm text-default-500">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Right side - Average rating */}
          <div className="flex items-center gap-1 text-warning">
            <span className="text-xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <StarIcon className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Rating bars */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[5 - stars];
            const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3">
                {/* Star count */}
                <div className="flex items-center w-12">
                  <span className="text-sm">{stars}</span>
                  <StarIcon className="w-4 h-4 text-warning ml-1" />
                </div>

                {/* Progress bar */}
                <Progress 
                  value={percentage}
                  color="warning"
                  className="flex-1"
                />

                {/* Review count */}
                <span className="text-sm text-default-500 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default RatingSummary;