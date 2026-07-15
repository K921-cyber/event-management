import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CheckInScanner from './pages/CheckInScanner';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/my-tickets"
          element={<ProtectedRoute><MyTickets /></ProtectedRoute>}
        />
        <Route
          path="/organizer"
          element={<ProtectedRoute roles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/organizer/checkin"
          element={<ProtectedRoute roles={['organizer', 'admin']}><CheckInScanner /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
}
