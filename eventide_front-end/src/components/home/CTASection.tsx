import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

const CTASection = () => {
  return (
    <div className="gradient-primary rounded-2xl p-10 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">
      <div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">
          Ready to host your own event?
        </h2>
        <p className="text-white/80 text-lg">
          Start for free — get your first 100 tickets on us.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row gap-3 justify-center md:justify-start flex-none">
        <Button
          as={Link}
          to="/register?type=organizer"
          size="lg"
          className="bg-white text-primary font-semibold hover:bg-white/90 px-7"
        >
          Create Event
        </Button>
        <Button
          as={Link}
          to="/about"
          size="lg"
          variant="bordered"
          className="border-white/60 text-white font-semibold hover:bg-white/10 px-7"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default CTASection;
