import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LiveScores from './pages/LiveScores';
import Tournaments from './pages/Tournaments';
import Teams from './pages/Teams';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import SchedulePoints from './pages/SchedulePoints';
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
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      {!isDashboardOrAuth && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Main Viewer Navigation Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/live-scores" element={<LiveScores />} />
          <Route path="/live-scorecard" element={<Navigate to="/live-scores" replace />} />
          <Route path="/live-scorecard/:matchId" element={<LiveScores />} />

          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/players" element={<Players />} />
          <Route path="/player/:playerId" element={<PlayerProfile />} />
          <Route path="/schedule-points" element={<SchedulePoints />} />

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
