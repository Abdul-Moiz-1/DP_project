// src/components/home/HeroSection.tsx
import { Button } from '@heroui/react';
import SearchBar from './SearchBar';

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({ searchValue, onSearchChange, onSearch }: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white py-20 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Discover Amazing Events Near You
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Find concerts, conferences, workshops, and more. Book tickets in seconds.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              query={searchValue}
              onChange={onSearchChange}
              placeholder="Search for events..."
              size="md"
            />
            <Button
              size="lg"
              color="secondary"
              className="font-semibold px-8"
              onPress={onSearch}
            >
              Search
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/80">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white/80">Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm text-white/80">Organizers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;