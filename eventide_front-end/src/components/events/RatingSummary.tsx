import { Star } from 'lucide-react';

interface Review {
  rating: number;
}

interface RatingSummaryProps {
  reviews: Review[];
}

function StarBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-right text-xs text-default-500">{stars}</span>
      <Star size={11} className="text-warning fill-warning flex-none" />
      <div className="flex-1 h-1.5 bg-default-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-warning rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-default-400">{count}</span>
    </div>
  );
}

const RatingSummary = ({ reviews }: RatingSummaryProps) => {
  const total = reviews.length;
  if (total === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });

  return (
    <div className="flex gap-6 items-start">
      {/* Big score */}
      <div className="text-center flex-none">
        <p className="font-display text-5xl font-bold leading-none">{avg.toFixed(1)}</p>
        <div className="flex justify-center gap-0.5 my-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={12}
              className={
                s <= Math.round(avg)
                  ? 'text-warning fill-warning'
                  : 'text-default-200 fill-default-200'
              }
            />
          ))}
        </div>
        <p className="text-xs text-default-400">{total} {total === 1 ? 'review' : 'reviews'}</p>
      </div>

      {/* Bar breakdown */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((s) => (
          <StarBar key={s} stars={s} count={counts[s] ?? 0} total={total} />
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;
