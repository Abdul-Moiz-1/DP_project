import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  ReactNode 
} from 'react';
import { Event } from '@/api/types';
import { fetchMyEvents } from '../services/eventService';
import { useAuth } from './AuthContext'; // Assumes you have this

// 1. Define the Context Type
interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchOrganizerEvents: () => Promise<void>;
}

// 2. Create the Context
const EventContext = createContext<EventContextType | undefined>(undefined);

// 3. Create the Provider
export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth token to ensure user is authenticated
  const { token } = useAuth(); 

  const fetchOrganizerEvents = useCallback(async () => {
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyEvents(); // This is your api-calling function
      setEvents(data);
      console.log('Fetched organizer events:', data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependency on token

  return (
    <EventContext.Provider 
      value={{ events, loading, error, fetchOrganizerEvents }}
    >
      {children}
    </EventContext.Provider>
  );
};

// 4. Create the Custom Hook
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};