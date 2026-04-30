import { Avatar } from '@heroui/react';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Review } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList = ({ reviews }: ReviewsListProps) => {
  const { user } = useAuth();

  if (!reviews?.length) {
    return (
      <div className="text-center py-10 text-default-400">
        <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((rev, i) => (
        <div key={rev.id}>
          {i > 0 && <div className="h-px bg-divider mb-5" />}
          <div className="flex items-start gap-3">
            <Avatar name={rev.reviewer.name} size="sm" className="flex-none mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-semibold text-sm">{rev.reviewer.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s <= rev.rating
                            ? 'text-warning fill-warning'
                            : 'text-default-200 fill-default-200'
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-none">
                  <span className="text-xs text-default-400">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  {user?.id === rev.reviewer.id && (
                    <>
                      <button
                        className="p-1 text-default-400 hover:text-default-600 transition-colors rounded"
                        aria-label="Edit review"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        className="p-1 text-default-400 hover:text-danger transition-colors rounded"
                        aria-label="Delete review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-default-600 leading-relaxed">{rev.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
