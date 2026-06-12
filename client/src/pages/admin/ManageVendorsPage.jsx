import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal.jsx'
import { getVendors, suspendVendor } from '../../services/adminService.js'

export default function ManageVendorsPage() {
  const navigate = useNavigate()

  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [suspending, setSuspending] = useState(null) // vendor in confirm modal
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setVendors(await getVendors())
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

  async function handleSuspend(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await suspendVendor(suspending.uid, reason)
      setSuspending(null)
      setReason('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-page">
      <button type="button" className="back-link" onClick={() => navigate('/admin/dashboard')}>
        ‹ Back
      </button>
      <h2>Manage Vendors</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : vendors.length === 0 ? (
        <p className="muted">No vendors registered yet.</p>
      ) : (
        <ul className="listing-list">
          {vendors.map((v) => (
            <li key={v.uid} className="card vendor-card">
              <div className="conv-top">
                <strong>{v.name}</strong>
                <span className={`badge ${v.accountStatus}`}>{v.accountStatus}</span>
              </div>
              <span className="muted">{v.email}</span>
              {v.accountStatus === 'suspended' && v.suspensionReason && (
                <span className="muted">Reason: {v.suspensionReason}</span>
              )}
              {v.accountStatus === 'active' && (
                <div className="listing-row-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setSuspending(v)}
                  >
                    Suspend
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {suspending && (
        <Modal onClose={() => setSuspending(null)}>
          <form onSubmit={handleSuspend}>
            <h3>Suspend {suspending.name}?</h3>
            <p className="muted">All of their active listings will be deactivated.</p>
            <label htmlFor="suspend-reason">Suspension reason (shown to vendor)</label>
            <textarea
              id="suspend-reason"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <div className="filter-actions">
              <button type="button" className="btn btn-outline" onClick={() => setSuspending(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={busy}>
                Suspend
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
