import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ListingCard from '../../components/ListingCard.jsx'
import { getVendorProfile } from '../../services/buyerService.js'

/** Read-only public vendor profile — buyer-facing. */
export default function VendorProfilePage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getVendorProfile(vendorId)
      .then((data) => {
        setVendor(data.vendor)
        setListings(data.listings)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [vendorId])

  return (
    <div className="app-page wide">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ‹ Back
      </button>

      {loading ? (
        <p>Loading…</p>
      ) : error || !vendor ? (
        <p className="error">{error || 'Vendor not found'}</p>
      ) : (
        <>
          <h2>{vendor.name}</h2>
          {vendor.description && <p className="muted">{vendor.description}</p>}

          <h3>Listings</h3>
          {listings.length === 0 ? (
            <p className="muted">No active listings</p>
          ) : (
            <div className="listing-grid">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
