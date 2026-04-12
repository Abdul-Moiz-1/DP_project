import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";

import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import DashboardHome from "./pages/dashboard/index";
import DashboardLayout from "./components/dashboard/layout/DashboardLayout";
import DashboardOrders from "./pages/dashboard/DasboardOrders";
import DashboardEvents from "./pages/dashboard/DasboardEvents";
import CreateEventPage from "./pages/dashboard/CreateEventPage";
import UpdateEventPage from "./pages/dashboard/UpdateEventPage";
import MyTicketsPage from "./pages/dashboard/MyTicketsPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import SavedEventsPage from "./pages/dashboard/SavedEventsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import EventAnalyticsPage from "./pages/dashboard/EventAnalyticsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route element={<IndexPage />} path="/" />

        {/* Public Routes */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes - Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="events" element={<DashboardEvents />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="event/:id" element={<UpdateEventPage />} />
          <Route path="event/:id/analytics" element={<EventAnalyticsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
          <Route path="saved-events" element={<SavedEventsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
