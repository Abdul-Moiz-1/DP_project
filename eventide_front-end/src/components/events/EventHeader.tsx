import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  PUBLISHED: { text: 'Upcoming',  cls: 'bg-success/80' },
  COMPLETED: { text: 'Completed', cls: 'bg-black/50'   },
  CANCELLED: { text: 'Cancelled', cls: 'bg-danger/80'  },
  DRAFT:     { text: 'Draft',     cls: 'bg-warning/80' },
};

interface EventHeaderProps {
  images: string[];
  title: string;
  categories: { id: number; name: string }[];
  status?: string;
  startDate: string;
  location: { city: string; country: string };
  onBack: () => void;
}

export default function EventHeader({
  images,
  title,
  categories,
  status,
  startDate,
  location,
  onBack,
}: EventHeaderProps) {
  const [selected, setSelected] = useState(0);
  const src = images[selected] || FALLBACK;

  const date = new Date(startDate);
  const now = Date.now();
  const isToday = new Date().toDateString() === date.toDateString();
  const isSoon  = date.getTime() > now && date.getTime() < now + 7 * 86_400_000;
  const statusCfg = status ? STATUS_LABEL[status] : null;

  return (
    <div>
      {/* Breadcrumb — desktop only */}
      <div className="hidden md:block container-app py-3">
        <nav className="flex items-center gap-1.5 text-xs text-default-400">
          <Link to="/events" className="hover:text-foreground transition-colors">Events</Link>
          {categories[0] && (
            <>
              <span>/</span>
              <Link
                to={`/events?category=${encodeURIComponent(categories[0].name)}`}
                className="hover:text-foreground transition-colors"
              >
                {categories[0].name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{title}</span>
        </nav>
      </div>

      {/* Hero image */}
      <div className="relative h-72 sm:h-80 md:h-[420px] overflow-hidden bg-default-900">
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Overlaid title + meta */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2.5 py-1 bg-primary/80 backdrop-blur-sm text-white text-xs font-medium rounded-full"
              >
                {cat.name}
              </span>
            ))}
            {statusCfg && (
              <span
                className={cn(
                  'px-2.5 py-1 backdrop-blur-sm text-white text-xs font-medium rounded-full',
                  statusCfg.cls,
                )}
              >
                {isToday ? 'Today' : isSoon ? 'This week' : statusCfg.text}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              {date.toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} />
              {location.city}, {location.country}
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-5 right-5 flex gap-2">
            {images.slice(0, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  'w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                  selected === i
                    ? 'border-primary scale-110'
                    : 'border-white/40 opacity-60 hover:opacity-100',
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
