// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
        Page not found
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Button
        as={Link}
        to="/"
        color="primary"
        size="lg"
        className="mt-8"
      >
        Go back home
      </Button>
    </div>
  );
};

export default NotFound;