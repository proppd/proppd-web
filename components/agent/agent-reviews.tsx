'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  listingTitle?: string;
}

interface AgentReviewsProps {
  agentName: string;
  agentArea: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    text: 'Incredibly responsive and knowledgeable about the Sandton market. Helped us find the perfect family home within two weeks.',
    date: '2026-05-20',
    helpful: 12,
    listingTitle: '4-bed house in Sandton',
  },
  {
    id: '2',
    author: 'James K.',
    rating: 4,
    text: 'Professional and honest. Gave us realistic expectations about the market and delivered on time.',
    date: '2026-04-15',
    helpful: 8,
    listingTitle: '2-bed apartment in Rosebank',
  },
  {
    id: '3',
    author: 'Priya N.',
    rating: 5,
    text: 'Made the entire buying process stress-free. Highly recommend for first-time buyers.',
    date: '2026-03-10',
    helpful: 15,
  },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E5E7EB]'}
        />
      ))}
    </div>
  );
}

function AverageRating({ reviews }: { reviews: Review[] }) {
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="flex items-start gap-6">
      <div className="text-center">
        <p className="text-4xl font-bold text-[#1A1A2E]">{avg.toFixed(1)}</p>
        <StarRating rating={Math.round(avg)} size={16} />
        <p className="mt-1 text-xs text-[#9CA3AF]">{reviews.length} reviews</p>
      </div>
      <div className="flex-1 grid gap-1.5">
        {distribution.map(({ star, count, percent }) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right font-bold text-[#9CA3AF]">{star}</span>
            <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-6 text-right text-[#9CA3AF]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentReviews({ agentName, agentArea }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '', author: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load mock reviews + any stored ones
    const stored = localStorage.getItem(`proppd…views:${agentName}`);
    const storedReviews: Review[] = stored ? JSON.parse(stored) : [];
    setReviews([...mockReviews, ...storedReviews]);
  }, [agentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.text.trim() || !newReview.author.trim()) return;

    const review: Review = {
      id: `user-${Date.now()}`,
      author: newReview.author,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
    };

    const updated = [...reviews, review];
    setReviews(updated);

    // Store user reviews
    const stored = localStorage.getItem(`proppd…views:${agentName}`);
    const storedReviews: Review[] = stored ? JSON.parse(stored) : [];
    storedReviews.push(review);
    localStorage.setItem(`proppd…views:${agentName}`, JSON.stringify(storedReviews));

    setNewReview({ rating: 5, text: '', author: '' });
    setShowForm(false);
    setSubmitted(true);
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[#4A3AFF]" />
          <h3 className="text-base font-bold text-[#1A1A2E]">Reviews</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-[#4A3AFF] transition hover:text-[#3A2AE0]"
        >
          {showForm ? 'Cancel' : 'Write a review'}
        </button>
      </div>

      {/* Average rating */}
      <div className="mt-4">
        <AverageRating reviews={reviews} />
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
          <div className="mb-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Your name</label>
            <input
              type="text"
              value={newReview.author}
              onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              placeholder="e.g. John D."
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Rating</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="p-0.5"
                >
                  <Star
                    size={20}
                    className={star <= newReview.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E5E7EB]'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Your review</label>
            <textarea
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:border-[#4A3AFF]"
              rows={3}
              placeholder="Share your experience with this agent..."
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0]"
          >
            Submit review
          </button>
        </form>
      )}

      {submitted && (
        <div className="mt-3 rounded-lg bg-[#E6FBF7] px-4 py-3 text-sm font-bold text-[#00C9A7]">
          Review submitted! Thank you for your feedback.
        </div>
      )}

      {/* Review list */}
      <div className="mt-4 grid gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-[#F3F4F6] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1A1A2E]">{review.author}</span>
                  <StarRating rating={review.rating} />
                </div>
                {review.listingTitle && (
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Re: {review.listingTitle}</p>
                )}
              </div>
              <span className="text-xs text-[#9CA3AF]">
                {new Intl.DateTimeFormat('en-ZA', { month: 'short', year: 'numeric' }).format(new Date(review.date))}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{review.text}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-[#9CA3AF]">
              <ThumbsUp size={12} /> {review.helpful} found this helpful
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
