import { useNavigate } from 'react-router-dom'

function formatPrice(price) {
  return `KSh ${Number(price).toLocaleString()}`
}

/** Grid card for the buyer feed and vendor public profile. */
export default function ListingCard({ listing }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="listing-card"
      onClick={() => navigate(`/buyer/listings/${listing.id}`)}
    >
      {listing.firstImage ? (
        <img className="listing-card-img" src={listing.firstImage.url} alt={listing.title} />
      ) : (
        <div className="listing-card-img placeholder" aria-hidden="true" />
      )}
      <div className="listing-card-body">
        <strong className="listing-card-title">{listing.title}</strong>
        <span className="listing-card-price">{formatPrice(listing.price)}</span>
        <span className="badge category">{listing.category}</span>
      </div>
    </button>
  )
}
