import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SearchForm } from "../components/search-form";
import { useScrollReveal } from "../lib/use-scroll-reveal";
import { roomImageSrcSet } from "../lib/room-images";

const rooms = [
  { name: "Rhine Penthouse Suite", image: "/rooms/rhine-penthouse-suite-1200.webp", imageHeight: 800, description: "A top-floor suite with a private terrace.", price: 450 },
  { name: "Rhine View Double", image: "/rooms/rhine-view-double-1200.webp", imageHeight: 800, description: "A double room with a balcony over the Rhine.", price: 240 },
  { name: "Classic Double", image: "/rooms/classic-double-1200.webp", imageHeight: 900, description: "A queen bed, rain shower and views over the old town.", price: 180 },
] as const;

function Arrow() {
  return <svg viewBox="0 0 32 16" fill="none" aria-hidden="true"><path d="M0 8h30m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

export function HomePage() {
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);
  const [selectedRoom, setSelectedRoom] = useState(0);
  const room = rooms[selectedRoom] ?? rooms[0];

  return (
    <main ref={rootRef} id="main-content" className="residence-home">
      <section className="arrival-scene" aria-labelledby="arrival-title">
        <div className="arrival-photograph">
          <img src="/images/basel-1280.webp" srcSet="/images/basel-640.webp 640w, /images/basel-1280.webp 1280w, /images/basel-1920.webp 1920w" sizes="100vw" decoding="async" alt="The Rhine promenade and bridge in Basel" fetchPriority="high" width="2000" height="2500" />
        </div>
        <div className="arrival-copy">
          <h1 id="arrival-title">A slower kind<br />of stay.</h1>
          <p>Ten rooms. The Rhine. A little more time.<br />Your boutique residence in Basel.</p>
          <a href="#your-stay" className="text-link light-link">Find your room <Arrow /></a>
        </div>
        <a href="#the-residence" className="arrival-scroll">Step inside <span aria-hidden="true">↓</span></a>
        <span className="arrival-location">Rheinblick · Basel, Switzerland</span>
      </section>

      <section id="your-stay" className="stay-search" aria-label="Plan your stay">
        <SearchForm />
      </section>

      <section id="the-residence" className="residence-intro editorial-frame" aria-labelledby="residence-title">
        <div data-reveal="copy" className="intro-title"><h2 id="residence-title">Ten rooms.<br />A world of its own.</h2></div>
        <div data-reveal="copy" className="intro-story">
          <p>Above the Rhine, in the heart of Basel’s old town, Rheinblick brings together just ten rooms and suites. A personal place to return to, with the city at your doorstep.</p>
          <p>Open the window. Let the river set the pace. Here, the best part of the day is having time to enjoy it.</p>
          <a href="#rooms" className="text-link">Meet your room <Arrow /></a>
        </div>
        <figure className="intro-wide"><img data-reveal="photo" src="/images/old-town-1280.webp" srcSet="/images/old-town-640.webp 640w, /images/old-town-1280.webp 1280w, /images/old-town-1920.webp 1920w" sizes="(max-width: 700px) 74vw, 60vw" decoding="async" alt="A quiet lane in Basel’s old town" loading="lazy" width="1600" height="2133" /></figure>
        <figure className="intro-detail"><img data-reveal="photo" src="/rooms/classic-double-1200.webp" srcSet={roomImageSrcSet("/rooms/classic-double-1200.webp")} sizes="(max-width: 700px) 44vw, 25vw" decoding="async" alt="Illustrative interior of the Classic Double" loading="lazy" width="1200" height="900" /><figcaption>A quieter place to come back to.</figcaption></figure>
        <p data-reveal="copy" className="intro-note">Outside, the city.<br />Inside, your own rhythm.</p>
      </section>

      <section id="moments" className="daily-moments" aria-labelledby="moments-title">
        <div className="moments-gallery editorial-frame">
          <figure className="moment-breakfast"><img data-reveal="photo" src="/images/breakfast-1280.webp" srcSet="/images/breakfast-640.webp 640w, /images/breakfast-1280.webp 1280w, /images/breakfast-1920.webp 1920w" sizes="(max-width: 700px) 67vw, (min-width: 1280px) 455px, 36vw" decoding="async" alt="Illustrative breakfast of eggs on toast with tomatoes" loading="lazy" width="1600" height="1067" /><figcaption>Mornings, without the hurry.</figcaption></figure>
          <figure className="moment-room"><img data-reveal="photo" src="/rooms/rhine-view-double-1200.webp" srcSet={roomImageSrcSet("/rooms/rhine-view-double-1200.webp")} sizes="(max-width: 700px) 78vw, (min-width: 1280px) 637px, 51vw" decoding="async" alt="Illustrative room with a balcony and water views" loading="lazy" width="1200" height="800" /><figcaption>Somewhere to do a little less.</figcaption></figure>
        </div>
        <div data-reveal="copy" className="moments-copy">
          <h2 id="moments-title">The little things.</h2>
          <p>A long breakfast. An afternoon with no plans.<br />An evening that belongs to you. Stay for the feeling.</p>
          <a href="#your-stay" className="text-link">Plan a few days away <Arrow /></a>
        </div>
      </section>

      <section id="rooms" className="room-collection editorial-frame" aria-labelledby="rooms-title">
        <div data-reveal="copy" className="collection-heading"><h2 id="rooms-title">Find your favourite.</h2><p>Rooms &amp; suites for your time in Basel.<br />Ten individual spaces. One intimate residence.</p></div>
        <div className="room-selector" role="group" aria-label="Preview a room">
          {rooms.map((item, index) => <button key={item.name} type="button" aria-pressed={index === selectedRoom} onClick={() => setSelectedRoom(index)}>{item.name}</button>)}
        </div>
        <div className="room-preview">
          <figure className="room-preview-image"><img data-reveal="photo" src={room.image} srcSet={roomImageSrcSet(room.image)} sizes="(max-width: 700px) 88vw, 58vw" decoding="async" alt={`Illustrative interior for the ${room.name}`} loading="lazy" width="1200" height={room.imageHeight} /></figure>
          <div data-reveal="copy" className="room-preview-copy" aria-live="polite" aria-atomic="true"><h3>{room.name}</h3><p>{room.description}</p><p className="room-rate">From {room.price} CHF <span>/ night</span></p><Link className="text-link" to="/rooms">View all availability <Arrow /></Link></div>
        </div>
        <div data-reveal="copy" className="collection-close"><p>A room for a weekend.<br />A residence for a little longer.</p><Link to="/rooms" className="solid-link">Explore all rooms <Arrow /></Link></div>
      </section>

      <section className="stay-invitation" aria-labelledby="invitation-title">
        <div className="invitation-photo"><img data-reveal="photo" src="/rooms/rhine-penthouse-suite-1200.webp" srcSet={roomImageSrcSet("/rooms/rhine-penthouse-suite-1200.webp")} sizes="(max-width: 700px) 100vw, 50vw" decoding="async" alt="Illustrative suite with a dining area and a separate bedroom" loading="lazy" width="1200" height="800" /></div>
        <div data-reveal="copy" className="invitation-copy"><h2 id="invitation-title">Basel is calling.</h2><p>The river, the old town, the art.<br />And a room to make your own.</p><a href="#your-stay" className="text-link light-link">Let’s make it a stay <Arrow /></a></div>
      </section>
    </main>
  );
}
