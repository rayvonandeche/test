import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VendorNav from '../../components/VendorNav.jsx'
import { getConversations } from '../../services/messageService.js'
import { formatWhen } from '../../utils/format.js'

/** Vendor's buyer-inquiry list — one card per conversation. */
export default function InquiriesPage() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app-page">
      <h1>SU FLEA MARKET</h1>
      <h2>Inquiries</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : conversations.length === 0 ? (
        <p className="muted">No inquiries yet.</p>
      ) : (
        <ul className="conv-list">
          {conversations.map((conv) => (
            <li key={conv.conversationId}>
              <button
                type="button"
                className="card conv-card"
                onClick={() => navigate(`/vendor/messages/${conv.conversationId}`)}
              >
                <div className="conv-top">
                  <strong>{conv.otherPartyName}</strong>
                  <span className="muted">{formatWhen(conv.lastMessage.createdAt)}</span>
                </div>
                <span className="muted conv-listing">{conv.listingTitle}</span>
                <div className="conv-bottom">
                  <span className="conv-preview">{conv.lastMessage.content}</span>
                  {conv.unreadCount > 0 && <span className="unread-dot" aria-label="Unread" />}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <VendorNav />
    </div>
  )
}
