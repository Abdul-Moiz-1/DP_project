import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({ searchValue, onSearchChange, onSearch }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background with overlapping gradients */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply opacity-70 animate-blob" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-secondary/20 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-success/15 blur-[100px] mix-blend-multiply opacity-50 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Discover the extraordinary
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-display font-extrabold tracking-tight text-foreground dark:text-white max-w-5xl leading-tight"
        >
          Unforgettable moments, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            starting near you.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-xl text-default-500 max-w-2xl mx-auto leading-relaxed"
        >
          From intimate local workshops to massive global conferences, Eventide curates experiences you won't want to miss.
        </motion.p>

        {/* Global Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-2xl mt-10 relative group"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
           <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-background/80 backdrop-blur-xl rounded-2xl border border-default-200 shadow-2xl">
              <div className="flex-1">
                <SearchBar
                  query={searchValue}
                  onChange={onSearchChange}
                  placeholder="What are you looking for?"
                  size="lg"
                />
              </div>
              <Button
                size="lg"
                color="primary"
                className="font-semibold px-8 shadow-primary/30 shadow-lg text-white"
                onPress={onSearch}
              >
                Explore Events
              </Button>
           </div>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.6 }}
           className="mt-16 flex items-center justify-center gap-8 text-default-400 text-sm font-medium"
        >
          <span>✨ Curated Experiences</span>
          <span>•</span>
          <span>🔒 Secure Booking</span>
          <span>•</span>
          <span>🎯 Smart Recommendations</span>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;