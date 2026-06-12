import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal.jsx'
import {
  getAdminEvents,
  createEvent,
  activateEvent,
  closeEvent
} from '../../services/adminService.js'

function formatRange(start, end) {
  const opts = { month: 'short', day: 'numeric' }
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString([], opts)} – ${e.toLocaleDateString([], { ...opts, year: 'numeric' })}`
}

const EMPTY_FORM = { name: '', startDate: '', endDate: '' }

export default function ManageEventsPage() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [closing, setClosing] = useState(null) // event pending close confirm

  const load = useCallback(async () => {
    try {
      setEvents(await getAdminEvents())
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

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await createEvent(form)
      setCreating(false)
      setForm(EMPTY_FORM)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleActivate(id) {
    setBusyId(id)
    setError('')
    try {
      await activateEvent(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleClose() {
    setBusyId(closing.id)
    setError('')
    try {
      await closeEvent(closing.id)
      setClosing(null)
      await load()
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

      <div className="dashboard-top">
        <h2>Manage Events</h2>
        <button type="button" className="btn btn-dark" onClick={() => setCreating(true)}>
          + New Event
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : events.length === 0 ? (
        <p className="muted">No events yet — create the first one.</p>
      ) : (
        <ul className="listing-list">
          {events.map((ev) => (
            <li key={ev.id} className="card event-card">
              <div className="conv-top">
                <strong>{ev.name}</strong>
                <span className={`badge ${ev.status}`}>{ev.status}</span>
              </div>
              <span className="muted">{formatRange(ev.startDate, ev.endDate)}</span>
              <span className="muted">
                {ev.listingCount} listing{ev.listingCount === 1 ? '' : 's'}
              </span>
              <div className="listing-row-actions">
                {ev.status !== 'active' && (
                  <button
                    type="button"
                    className="btn btn-approve"
                    disabled={busyId === ev.id}
                    onClick={() => handleActivate(ev.id)}
                  >
                    Activate
                  </button>
                )}
                {ev.status === 'active' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busyId === ev.id}
                    onClick={() => setClosing(ev)}
                  >
                    Close
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <Modal onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate}>
            <h3>New Event</h3>
            <label htmlFor="event-name">Name</label>
            <input
              id="event-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Founder's Week Flea Market"
              required
            />
            <label htmlFor="event-start">Start date</label>
            <input
              id="event-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <label htmlFor="event-end">End date</label>
            <input
              id="event-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
            <div className="filter-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-dark">
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}

      {closing && (
        <Modal onClose={() => setClosing(null)}>
          <h3>Close "{closing.name}"?</h3>
          <p className="muted">
            Vendors will no longer be able to create listings for this event.
          </p>
          <div className="filter-actions">
            <button type="button" className="btn btn-outline" onClick={() => setClosing(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busyId === closing.id}
              onClick={handleClose}
            >
              Close Event
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
