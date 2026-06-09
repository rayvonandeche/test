import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from 'su-flea-market-shared'
import ListingCard from '../../components/ListingCard.jsx'
import LogoutButton from '../../components/LogoutButton.jsx'
import { getListings, getEvents } from '../../services/buyerService.js'

const PAGE_SIZE = 12
const EMPTY_FILTERS = { category: '', eventId: '', minPrice: '', maxPrice: '' }

export default function BuyerHomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [showFilters, setShowFilters] = useState(false)
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ listings: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Debounce the search box (300ms) and reset to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getListings({
      search: debouncedSearch,
      ...filters,
      page,
      pageSize: PAGE_SIZE
    })
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, filters, page])

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  function applyFilters(e) {
    e.preventDefault()
    setFilters(draftFilters)
    setPage(1)
    setShowFilters(false)
  }

  function clearFilters() {
    setDraftFilters(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
    setShowFilters(false)
  }

  const filtersActive = Object.values(filters).some((v) => v !== '')

  return (
    <div className="app-page wide">
      <h1>SU FLEA MARKET</h1>
      <div className="dashboard-top">
        <h2>Flea Market</h2>
        <div className="top-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/buyer/messages')}
          >
            Messages
          </button>
          <LogoutButton />
        </div>
      </div>

      <div className="search-row">
        <input
          type="search"
          className="search-input"
          placeholder="Search listings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search listings"
        />
        <button
          type="button"
          className={`btn ${filtersActive ? 'btn-dark' : 'btn-outline'}`}
          onClick={() => {
            setDraftFilters(filters)
            setShowFilters((s) => !s)
          }}
        >
          Filter
        </button>
      </div>

      {showFilters && (
        <form className="filter-drawer" onSubmit={applyFilters}>
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={draftFilters.category}
            onChange={(e) => setDraftFilters({ ...draftFilters, category: e.target.value })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label htmlFor="filter-event">Event Period</label>
          <select
            id="filter-event"
            value={draftFilters.eventId}
            onChange={(e) => setDraftFilters({ ...draftFilters, eventId: e.target.value })}
          >
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>

          <div className="price-range">
            <div>
              <label htmlFor="filter-min">Min Price (KSh)</label>
              <input
                id="filter-min"
                type="number"
                min="0"
                value={draftFilters.minPrice}
                onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="filter-max">Max Price (KSh)</label>
              <input
                id="filter-max"
                type="number"
                min="0"
                value={draftFilters.maxPrice}
                onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn btn-outline" onClick={clearFilters}>
              Clear
            </button>
            <button type="submit" className="btn btn-dark">
              Apply Filters
            </button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : data.listings.length === 0 ? (
        <p className="muted">No listings found</p>
      ) : (
        <>
          <div className="listing-grid">
            {data.listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ Prev
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
