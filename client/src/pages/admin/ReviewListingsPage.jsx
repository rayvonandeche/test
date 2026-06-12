import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal.jsx'
import {
  getPendingListings,
  approveListing,
  rejectListing
} from '../../services/adminService.js'

function formatPrice(price) {
  return `KSh ${Number(price).toLocaleString()}`
}

export default function ReviewListingsPage() {
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [rejecting, setRejecting] = useState(null) // listing being rejected
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    getPendingListings()
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(id) {
    setBusyId(id)
    setError('')
    try {
      await approveListing(id)
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(e) {
    e.preventDefault()
    setBusyId(rejecting.id)
    setError('')
    try {
      await rejectListing(rejecting.id, rejectReason)
      setListings((prev) => prev.filter((l) => l.id !== rejecting.id))
      setRejecting(null)
      setRejectReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="app-page">
      <button type="button" className="back-link" onClick={() => navigate('/admin/dashboard')}>
        ‹ Back
      </button>
      <h2>Review Listings</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : listings.length === 0 ? (
        <p className="muted">No listings pending review</p>
      ) : (
        <ul className="listing-list">
          {listings.map((l) => (
            <li key={l.id} className="card review-card">
              <div className="review-card-main">
                <div className="review-info">
                  <strong>{l.title}</strong>
                  <span className="muted">
                    {l.vendorName} · {l.eventName}
                  </span>
                  <span className="listing-card-price">{formatPrice(l.price)}</span>
                  {l.description && (
                    <p className="review-description muted">{l.description}</p>
                  )}
                </div>
              </div>
              {l.images && l.images.length > 0 ? (
                <div className="review-images">
                  {l.images.map((img) => (
                    <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                      <img className="review-thumb" src={img.url} alt={l.title} />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: '0.8rem' }}>No images uploaded</p>
              )}
              <div className="listing-row-actions">
                <button
                  type="button"
                  className="btn btn-approve"
                  disabled={busyId === l.id}
                  onClick={() => handleApprove(l.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busyId === l.id}
                  onClick={() => setRejecting(l)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rejecting && (
        <Modal onClose={() => setRejecting(null)}>
          <form onSubmit={handleReject}>
            <h3>Reject "{rejecting.title}"</h3>
            <label htmlFor="reject-reason">Rejection reason</label>
            <textarea
              id="reject-reason"
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            <div className="filter-actions">
              <button type="button" className="btn btn-outline" onClick={() => setRejecting(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={busyId === rejecting.id}>
                Reject
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
