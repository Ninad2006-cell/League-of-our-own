import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            League Of Our Own
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200 transition">Home</Link>
            <Link to="/schedule-points" className="hover:text-blue-200 transition">Schedule</Link>
            <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
