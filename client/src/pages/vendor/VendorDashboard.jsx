import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VendorNav from '../../components/VendorNav.jsx'
import LogoutButton from '../../components/LogoutButton.jsx'
import {
  getMyListings,
  getUnreadInquiryCount,
  deactivateListing,
  markListingSold
} from '../../services/vendorService.js'

function formatPrice(price) {
  return `KSh ${Number(price).toLocaleString()}`
}

export default function VendorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [listings, setListings] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [myListings, unread] = await Promise.all([
        getMyListings(),
        getUnreadInquiryCount()
      ])
      setListings(myListings)
      setUnreadCount(unread)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAction(id, action) {
    setBusyId(id)
    setMessage('')
    try {
      await action(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <div className="dashboard-top">
        <h2>My Dashboard</h2>
        <LogoutButton />
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="dashboard-top">
        <p className="muted">
          {listings.length} listing{listings.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => navigate('/vendor/listings/new')}
        >
          + Create Listing
        </button>
      </div>

      <button
        type="button"
        className="card inquiries-card"
        onClick={() => navigate('/vendor/inquiries')}
      >
        <span>Inquiries</span>
        <span className="count-badge">{unreadCount}</span>
      </button>

      {loading ? (
        <p>Loading…</p>
      ) : listings.length === 0 ? (
        <p className="muted">No listings yet — create your first one.</p>
      ) : (
        <ul className="listing-list">
          {listings.map((l) => (
            <li key={l.id} className="card listing-row">
              <div className="listing-row-main">
                <strong>{l.title}</strong>
                <span>{formatPrice(l.price)}</span>
              </div>
              <div className="listing-row-badges">
                <span className={`badge ${l.moderationStatus}`}>{l.moderationStatus}</span>
                <span className={`badge ${l.listingStatus}`}>{l.listingStatus}</span>
                <span className="muted">{l.imageCount}/5 images</span>
              </div>
              <div className="listing-row-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/vendor/listings/${l.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={l.listingStatus !== 'active' || busyId === l.id}
                  onClick={() => handleAction(l.id, markListingSold)}
                >
                  Mark Sold
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={l.listingStatus !== 'active' || busyId === l.id}
                  onClick={() => handleAction(l.id, deactivateListing)}
                >
                  Deactivate
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <VendorNav />
    </div>
  )
}
