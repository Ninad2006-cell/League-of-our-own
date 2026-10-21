import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import LiveScorecard from './pages/LiveScorecard'
import SchedulePoints from './pages/SchedulePoints'
import PlayerProfile from './pages/PlayerProfile'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ScoringConsole from './pages/ScoringConsole'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Scorer Routes */}
            <Route path="/scorer/console/:matchId" element={<ScoringConsole />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
