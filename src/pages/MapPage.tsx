import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar } from "../components/ui";
import { useApp } from "../store";
import type { MeetEvent } from "../types";

const kinds = ["All", "Coffee", "Garage night", "Drive", "Advice"] as const;

export function MapPage() {
  const app = useApp();
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();
  const [kind, setKind] = useState<(typeof kinds)[number]>("All");
  const [city, setCity] = useState(app.me.city);
  const [selected, setSelected] = useState("ev-coffee");
  const [hostFor, setHostFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const events = useMemo(() => {
    return app.events.filter((e) => {
      if (kind !== "All" && e.type !== kind) return false;
      if (city.trim() && !e.city.toLowerCase().includes(city.trim().toLowerCase())) return false;
      if (q && !`${e.title} ${e.place} ${e.type}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [app.events, kind, city, q]);

  const current = events.find((e) => e.id === selected) ?? events[0];

  return (
    <div className="map-page">
      <aside className="card map-list">
        <h1>Meet car people near you</h1>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city" aria-label="City" />
        <div className="chips">
          {kinds.map((k) => (
            <button key={k} type="button" className={`chip ${kind === k ? "on dark" : ""}`} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <button type="button" className={current?.id === e.id ? "on" : ""} onClick={() => setSelected(e.id)}>
                <span className="num">{e.n}</span>
                <span>
                  <strong>{e.title}</strong>
                  <small>
                    {e.place} · {e.when}
                  </small>
                  <em>
                    {e.going} {e.type === "Coffee" ? "people open to meet" : "going"}
                  </em>
                </span>
              </button>
            </li>
          ))}
          {events.length === 0 && <li className="hint">No meets in that city. People only show up if they opted in.</li>}
        </ul>
      </aside>
      <div className="map-stage">
        <CityMap events={events} selected={current?.id} onSelect={setSelected} />
        <p className="map-note">Locations are approximate. Only people who opted in are shown.</p>
        {current && (
          <article className="map-card">
            <header>
              <h2>{current.title}</h2>
              <span className="badge soft">{current.type.toUpperCase()}</span>
            </header>
            <p>
              {current.place} · {current.when} · hosted by {nameOf(app, current.hostId)}
            </p>
            <p className="blurb">{current.blurb}</p>
            <div className="face-row">
              {current.people
                .filter((id) => !app.blocked.includes(id))
                .map((id) => app.users.find((u) => u.id === id))
                .filter((u) => u && (u.openToMeet || u.id === app.me.id))
                .map((u) => u && <Avatar key={u.id} user={u} size={32} />)}
              <span>{current.open} open to meet</span>
            </div>
            <div className="hero-actions">
              <button type="button" className="btn primary" onClick={() => app.toggleJoin(current.id)}>
                {current.joined ? "Going" : "Join"}
              </button>
              <button type="button" className="btn ghost" onClick={() => setHostFor(current.id)}>
                Message host
              </button>
            </div>
            {hostFor === current.id && (
              <form
                className="comment-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  app.sendMessage(current.hostId, draft.trim(), current.title);
                  setDraft("");
                  setHostFor(null);
                }}
              >
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message the host" aria-label="Message the host" />
                <button type="submit" className="text-btn strong">
                  Send
                </button>
              </form>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

function nameOf(app: ReturnType<typeof useApp>, id: string) {
  return app.users.find((u) => u.id === id)?.name ?? "a member";
}

function CityMap({
  events,
  selected,
  onSelect,
}: {
  events: MeetEvent[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="city-map">
      <svg viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1000" height="760" fill="#e6e0d4" />
        <path d="M0 80h1000M0 210h1000M0 360h1000M0 520h1000M0 660h1000" stroke="#f6f3ee" strokeWidth="22" />
        <path d="M180 0v760M390 0v760M610 0v760M820 0v760" stroke="#f6f3ee" strokeWidth="18" />
        <path d="M40 120 C 180 200, 260 40, 420 160" stroke="#f6f3ee" strokeWidth="10" fill="none" />
        <path d="M700 40 C 760 180, 900 120, 980 240" stroke="#f6f3ee" strokeWidth="10" fill="none" />
        <path d="M0 500 C 180 460, 280 620, 460 560 C 640 500, 760 640, 1000 560 L 1000 760 L 0 760 Z" fill="#c5d5e4" />
        <path d="M620 470 C 700 520, 820 500, 900 560 C 940 590, 980 600, 1000 580 L 1000 760 L 600 760 Z" fill="#d5e2ee" />
        <circle cx="120" cy="640" r="70" fill="#e3ead8" />
        <circle cx="860" cy="120" r="54" fill="#e3ead8" />
      </svg>
      {events.map((e) => (
        <button
          key={e.id}
          type="button"
          className={`pin ${selected === e.id ? "on" : ""}`}
          style={{ left: `${e.x}%`, top: `${e.y}%` }}
          onClick={() => onSelect(e.id)}
          aria-label={e.title}
        >
          {e.n}
        </button>
      ))}
      <Link to="/events" className="map-events-link">
        All events
      </Link>
    </div>
  );
}
