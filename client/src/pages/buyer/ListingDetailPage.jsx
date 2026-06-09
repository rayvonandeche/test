import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getListing, submitReport } from '../../services/buyerService.js'

function formatPrice(price) {
  return `KSh ${Number(price).toLocaleString()}`
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    getListing(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleReport(e) {
    e.preventDefault()
    setReportError('')
    setReportSending(true)
    try {
      await submitReport({ listingId: id, reason: reportReason })
      setReportDone(true)
    } catch (err) {
      setReportError(err.message)
    } finally {
      setReportSending(false)
    }
  }

  function closeReportModal() {
    setReportOpen(false)
    setReportReason('')
    setReportDone(false)
    setReportError('')
  }

  if (loading) {
    return (
      <div className="app-page">
        <h1>SU FLEA MARKET</h1>
        <p>Loading…</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="app-page">
        <h1>SU FLEA MARKET</h1>
        <p className="error">{error || 'Listing not found'}</p>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/buyer')}>
          ‹ Back to listings
        </button>
      </div>
    )
  }

  const sold = listing.listingStatus === 'sold'
  const images = listing.images || []
  const mainImage = images[activeImage]

  return (
    <div className="app-page">
      <button type="button" className="back-link" onClick={() => navigate('/buyer')}>
        ‹ Back
      </button>

      <div className="gallery">
        <div className="gallery-main">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={listing.title}
              onClick={() => setLightboxOpen(true)}
            />
          ) : (
            <div className="listing-card-img placeholder gallery-placeholder" aria-hidden="true" />
          )}
          {sold && <div className="sold-overlay">SOLD</div>}
        </div>
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={`gallery-thumb ${i === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img.url} alt={`${listing.title} ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-head">
        <h2>{listing.title}</h2>
        <p className="detail-price">{formatPrice(listing.price)}</p>
        <div className="listing-row-badges">
          <span className="badge category">{listing.category}</span>
          <span className={`badge ${listing.listingStatus}`}>{listing.listingStatus}</span>
        </div>
      </div>

      {listing.vendor && (
        <div className="card vendor-strip">
          <span>
            Vendor: <strong>{listing.vendor.name}</strong>
          </span>
          <Link to={`/buyer/vendors/${listing.vendorId}`}>View Profile</Link>
        </div>
      )}

      <p className="detail-description">{listing.description}</p>

      {!sold && (
        <button
          type="button"
          className="btn btn-dark"
          onClick={() =>
            navigate(`/buyer/messages/new?listingId=${id}&vendorId=${listing.vendorId}`)
          }
        >
          Message Vendor
        </button>
      )}

      <button type="button" className="report-link" onClick={() => setReportOpen(true)}>
        Report Listing
      </button>

      {lightboxOpen && mainImage && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <img src={mainImage.url} alt={listing.title} />
        </div>
      )}

      {reportOpen && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {reportDone ? (
              <>
                <p className="success">Report submitted</p>
                <button type="button" className="btn btn-dark" onClick={closeReportModal}>
                  Close
                </button>
              </>
            ) : (
              <form onSubmit={handleReport}>
                <h3>Report Listing</h3>
                <label htmlFor="report-reason">Reason</label>
                <textarea
                  id="report-reason"
                  rows="4"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this listing?"
                  required
                />
                {reportError && <p className="error">{reportError}</p>}
                <div className="filter-actions">
                  <button type="button" className="btn btn-outline" onClick={closeReportModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark" disabled={reportSending}>
                    {reportSending ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
