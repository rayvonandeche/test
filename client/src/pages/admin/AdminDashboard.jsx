import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../../services/adminService.js'
import LogoutButton from '../../components/LogoutButton.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <div className="dashboard-top">
        <h2>Admin Panel</h2>
        <LogoutButton />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stat-cards">
        <div className="card stat-card">
          <span className="stat-value">{stats ? stats.pendingListings : '–'}</span>
          <span className="muted">Pending listings</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{stats ? stats.totalListings : '–'}</span>
          <span className="muted">Total listings</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{stats ? stats.openReports : '–'}</span>
          <span className="muted">Open reports</span>
        </div>
      </div>

      <nav className="admin-nav">
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/listings')}>
          Review Listings
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/reports')}>
          Review Reports
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/events')}>
          Manage Events
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/vendors')}>
          Manage Vendors
        </button>
      </nav>
    </div>
  )
}
