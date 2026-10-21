import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LiveScorecard from './pages/LiveScorecard';
import SchedulePoints from './pages/SchedulePoints';
import PlayerProfile from './pages/PlayerProfile';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ScoringConsole from './pages/ScoringConsole';

function AppContent() {
  const location = useLocation();

  // Hide global viewer Navbar and Footer on full-screen dashboard/auth screens
  const isDashboardOrAuth =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/scorer') ||
    location.pathname.startsWith('/scoring') ||
    location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardOrAuth && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Viewer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/live-scorecard/:matchId" element={<LiveScorecard />} />
          <Route path="/schedule-points" element={<SchedulePoints />} />
          <Route path="/player/:playerId" element={<PlayerProfile />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Scorer Routes */}
          <Route path="/scorer" element={<Navigate to="/scorer/console/1" replace />} />
          <Route path="/scorer/console/:matchId" element={<ScoringConsole />} />
          <Route path="/scoring-console" element={<Navigate to="/scorer/console/1" replace />} />
          <Route path="/scoring" element={<Navigate to="/scorer/console/1" replace />} />
        </Routes>
      </main>
      {!isDashboardOrAuth && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
