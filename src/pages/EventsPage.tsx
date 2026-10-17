import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../store";

export function EventsPage() {
  const app = useApp();
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();
  const events = [...app.events]
    .filter((e) => !q || `${e.title} ${e.place} ${e.city} ${e.type}`.toLowerCase().includes(q))
    .sort((a, b) => Number(a.date) - Number(b.date));
  return (
    <div className="board">
      <header className="board-head">
        <h1>Events</h1>
        <p>Coffee, garage nights, drives, and advice corners. Approximate places, opt-in people.</p>
      </header>
      <div className="event-list">
        {events.map((e) => (
          <article key={e.id} className="card event-card">
            <div className="date-block big">
              <span>{e.day}</span>
              <strong>{e.date}</strong>
            </div>
            <div>
              <span className="badge soft">{e.type}</span>
              <h2>{e.title}</h2>
              <p>
                {e.place} · {e.city} · {e.time}
              </p>
              <p className="blurb">{e.blurb}</p>
            </div>
            <div className="event-actions">
              <strong>{e.going} going</strong>
              <button type="button" className="btn primary" onClick={() => app.toggleJoin(e.id)}>
                {e.joined ? "Going" : "Join"}
              </button>
              <Link to="/map" className="btn ghost">
                On the map
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
