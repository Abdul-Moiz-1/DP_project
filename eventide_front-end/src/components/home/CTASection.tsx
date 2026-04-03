// src/components/home/CTASection.tsx
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-display font-bold mb-6">
          Ready to Create Your Own Event? 🎭
        </h2>
        <p className="text-xl mb-8 text-white/90">
          Join thousands of organizers who trust EventHub to manage their events
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            to="/register?type=organizer"
            size="lg"
            color="secondary"
            className="font-semibold px-8"
          >
            Become an Organizer
          </Button>
          <Button
            as={Link}
            to="/about"
            size="lg"
            variant="bordered"
            className="font-semibold px-8 border-white text-white hover:bg-white/10"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;