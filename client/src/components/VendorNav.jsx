import { NavLink } from 'react-router-dom'

/** Bottom navigation for all vendor pages: Dashboard | Inquiries | Profile. */
export default function VendorNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/vendor/dashboard">Dashboard</NavLink>
      <NavLink to="/vendor/inquiries">Inquiries</NavLink>
      <NavLink to="/vendor/profile">Profile</NavLink>
    </nav>
  )
}
