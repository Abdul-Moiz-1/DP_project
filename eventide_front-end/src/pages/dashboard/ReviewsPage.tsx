"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Divider,
} from "@heroui/react";
import {
  Calendar,
  Edit2,
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Review, Booking } from "@/api/types";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/toast-provider";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableBookings, setReviewableBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, warning } = useToast();

  // Edit modal state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Write review modal state
  const [writingFor, setWritingFor] = useState<Booking | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewsData, bookingsData] = await Promise.all([
        eventService.fetchMyReviews(),
        eventService.fetchMyBookings(),
      ]);
      setReviews(reviewsData);

      const now = new Date();
      const reviewedEventIds = new Set(reviewsData.map((r: Review) => r.event.id));
      const eligible = (bookingsData?.items || []).filter(
        (b: Booking) =>
          b.status === "CONFIRMED" &&
          new Date(b.event.endDate) < now &&
          !reviewedEventIds.has(b.event.id)
      );
      setReviewableBookings(eligible);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview || editRating === 0 || !editComment.trim()) {
      warning("Please provide a rating and comment");
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await eventService.updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? updated : r))
      );
      setEditingReview(null);
      success("Review updated");
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to update review");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await eventService.deleteReview(deletingId);
      setReviews((prev) => prev.filter((r) => r.id !== deletingId));
      success("Review deleted");
      loadData();
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitNew = async () => {
    if (!writingFor || newRating === 0 || !newComment.trim()) {
      warning("Please provide a rating and comment");
      return;
    }
    setSubmitting(true);
    try {
      await eventService.createReview(writingFor.event.id, newRating, newComment.trim());
      success("Review submitted!");
      setWritingFor(null);
      setNewRating(0);
      setNewComment("");
      loadData();
    } catch (error: any) {
      warning(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    onRate,
    size = "md",
  }: {
    rating: number;
    onRate?: (r: number) => void;
    size?: "sm" | "md";
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          className={`${onRate ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${size === "sm" ? "w-4 h-4" : "w-6 h-6"} ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-default-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
        <p className="text-default-400 mt-1">
          Manage your event reviews and write new ones
        </p>
      </div>

      {/* Reviewable Events */}
      {reviewableBookings.length > 0 && (
        <Card className="border border-primary/20 shadow-sm bg-primary/5">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Events Awaiting Your Review
                </h2>
                <p className="text-default-400 text-sm">
                  Share your experience from past events
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-5">
            <div className="space-y-3">
              {reviewableBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-default-200"
                >
                  <div className="flex items-center gap-3">
                    {booking.event.images?.[0]?.imageUrl ? (
                      <img
                        src={booking.event.images[0].imageUrl}
                        alt={booking.event.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-default-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-default-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{booking.event.name}</p>
                      <p className="text-sm text-default-400">
                        {new Date(booking.event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<Star className="w-4 h-4" />}
                    onPress={() => {
                      setWritingFor(booking);
                      setNewRating(0);
                      setNewComment("");
                    }}
                  >
                    Write Review
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Existing Reviews */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 pt-5 pb-0">
          <h2 className="text-xl font-bold text-foreground">
            Your Reviews ({reviews.length})
          </h2>
        </CardHeader>
        <CardBody className="px-6 pb-5">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">You haven't written any reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-default-200 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.event.images?.[0]?.imageUrl ? (
                        <img
                          src={review.event.images[0].imageUrl}
                          alt={review.event.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-default-100 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-default-400" />
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/events/${review.event.id}`}
                          className="font-bold hover:text-primary transition-colors"
                        >
                          {review.event.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-default-400">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(review)}
                        title="Edit review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => setDeletingId(review.id)}
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-default-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Write Review Modal */}
      <Modal isOpen={!!writingFor} onClose={() => setWritingFor(null)} size="lg">
        <ModalContent>
          {writingFor && (
            <>
              <ModalHeader>
                Review: {writingFor.event.name}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-default-500 mb-2">Your Rating</p>
                    <StarRating rating={newRating} onRate={setNewRating} />
                  </div>
                  <Textarea
                    label="Your Review"
                    placeholder="Share your experience..."
                    value={newComment}
                    onValueChange={setNewComment}
                    minRows={3}
                    maxRows={6}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setWritingFor(null)}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={submitting}
                  isDisabled={newRating === 0 || !newComment.trim()}
                  onPress={handleSubmitNew}
                >
                  Submit Review
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Review Modal */}
      <Modal isOpen={!!editingReview} onClose={() => setEditingReview(null)} size="lg">
        <ModalContent>
          {editingReview && (
            <>
              <ModalHeader>Edit Review</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-default-500 mb-2">Rating</p>
                    <StarRating rating={editRating} onRate={setEditRating} />
                  </div>
                  <Textarea
                    label="Your Review"
                    value={editComment}
                    onValueChange={setEditComment}
                    minRows={3}
                    maxRows={6}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setEditingReview(null)}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={savingEdit}
                  isDisabled={editRating === 0 || !editComment.trim()}
                  onPress={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)}>
        <ModalContent>
          <ModalHeader>Delete Review</ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
