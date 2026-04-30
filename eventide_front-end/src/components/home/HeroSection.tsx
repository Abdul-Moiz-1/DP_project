import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const QUICK_CATEGORIES = [
  { emoji: '🎵', label: 'Music', query: 'Music' },
  { emoji: '💻', label: 'Tech', query: 'Technology' },
  { emoji: '🎨', label: 'Arts', query: 'Arts+%26+Culture' },
  { emoji: '🍕', label: 'Food', query: 'Food+%26+Drink' },
  { emoji: '⚽', label: 'Sports', query: 'Sports+%26+Fitness' },
  { emoji: '😂', label: 'Comedy', query: 'Comedy+%26+Entertainment' },
];

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({ searchValue, onSearchChange, onSearch }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full gradient-primary opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-3xl animate-pulse" />
      </div>

      <div className="container-app relative z-10 flex flex-col items-center text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Live events near you
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-tight"
        >
          Discover{' '}
          <span className="gradient-text">events</span>
          <br className="hidden md:block" />
          that move you.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-lg md:text-xl text-default-500 max-w-xl leading-relaxed"
        >
          From intimate local workshops to massive global conferences — Eventide curates
          experiences you won't want to miss.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-2xl mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-2 p-2 bg-content1 rounded-xl border border-divider shadow-card">
            <div className="flex-1">
              <SearchBar
                query={searchValue}
                onChange={onSearchChange}
                placeholder="Search events, venues, or organizers..."
                size="lg"
              />
            </div>
            <Button
              size="lg"
              color="primary"
              className="font-semibold px-8 text-white"
              onPress={onSearch}
            >
              Search
            </Button>
          </div>
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={`/events?category=${cat.query}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-default-100 text-default-600 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-default-400 font-medium"
        >
          <span>✨ Curated Experiences</span>
          <span className="hidden sm:inline">·</span>
          <span>🔒 Secure Booking</span>
          <span className="hidden sm:inline">·</span>
          <span>🎯 Smart Recommendations</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
