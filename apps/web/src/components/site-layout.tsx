import { Link, Outlet } from "react-router-dom";

/** Shared header and footer around every page. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-forest/15">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4" aria-label="Main">
          <Link to="/" className="font-serif text-2xl">
            Hotel Rheinblick
          </Link>
          <Link to="/rooms" className="text-sm uppercase tracking-wide hover:underline">
            Rooms
          </Link>
        </nav>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-forest/15 px-6 py-6 text-center text-sm">
        Hotel Rheinblick, Rheinsprung 1, 4051 Basel. A fictitious hotel for demonstration purposes.
      </footer>
    </div>
  );
}
