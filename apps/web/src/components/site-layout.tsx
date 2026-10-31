import { useSmoothScroll } from "../lib/use-smooth-scroll";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CursorHalo } from "./cursor-halo";

export function SiteLayout() {
  useSmoothScroll();
  const isHome = useLocation().pathname === "/";
  return (
    <div className={`site-shell${isHome ? " is-home" : ""}`}>
      <CursorHalo />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="residence-header">
        <nav className="residence-nav" aria-label="Main navigation">
          <div className="nav-explore"><NavLink to="/" end>The residence</NavLink><NavLink to="/rooms">Rooms &amp; suites</NavLink><NavLink to="/bookings">Reservations</NavLink></div>
          <Link to="/" className="residence-wordmark" aria-label="Rheinblick, home"><span>Rheinblick</span><small>Residence · Basel</small></Link>
          <Link to="/rooms" className="nav-reserve">Find a room <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      <div className="site-content"><Outlet /></div>
      <footer className="residence-footer">
        <div className="footer-top"><p className="footer-goodbye">Until we meet<br />by the Rhine.</p><nav aria-label="Footer navigation"><Link to="/">The residence</Link><Link to="/rooms">Rooms &amp; suites</Link><Link to="/bookings">Reservations</Link>{isHome && <a href="#your-stay">Plan your stay</a>}</nav><div className="footer-address"><p>Rheinsprung 1<br />4051 Basel, Switzerland</p><p>A fictitious address<br />for a real demonstration.</p></div></div>
        <p className="footer-wordmark" aria-hidden="true">Rheinblick</p>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} Rheinblick · Demo hotel</p><p>Fictitious data only. No real payments.<br />Every booking requires explicit confirmation.</p><details><summary>About this demo &amp; imagery</summary><p>Built for the MCP creator demonstration. Hotel details are fictitious. Illustrative photos do not depict a real Rheinblick hotel. Basel photography: <a href="https://unsplash.com/photos/Q9V1CfZ3634">Basil Minhaj</a> and <a href="https://unsplash.com/photos/O3zgu2tPe7g">Darya Skorokhod</a>.</p></details></div>
      </footer>
    </div>
  );
}
