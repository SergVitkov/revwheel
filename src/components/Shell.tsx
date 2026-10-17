import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../store";
import { Composer } from "./Composer";
import { Avatar, IconSearch, Logo } from "./ui";

const links = [
  { to: "/", label: "Feed", end: true },
  { to: "/articles", label: "Articles", end: false },
  { to: "/events", label: "Events", end: false },
  { to: "/map", label: "Map", end: false },
  { to: "/garage", label: "My garage", end: false },
];

export function Shell() {
  const app = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [menu, setMenu] = useState(false);
  const unread = app.messages.length;

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
    }, 180);
    return () => window.clearTimeout(t);
  }, [q, params, setParams]);

  return (
    <div className="app">
      <header className="topnav">
        <button type="button" className="logo-btn" onClick={() => navigate("/")} aria-label="RevWheel home">
          <Logo />
        </button>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "nav-link on" : "nav-link")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <label className="search">
          <IconSearch />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cars, parts, guides"
            aria-label="Search cars, parts, guides"
          />
        </label>
        <div className="nav-end">
          <button type="button" className="btn primary" onClick={() => app.openComposer(null)}>
            + New post
          </button>
          <button type="button" className="avatar-btn" onClick={() => setMenu((v) => !v)} aria-label="Your account">
            <Avatar user={app.me} size={36} />
          </button>
          {menu && (
            <div className="menu">
              <div className="menu-id">
                <strong>{app.me.name}</strong>
                <span>@{app.me.handle}</span>
              </div>
              <button type="button" onClick={() => { setMenu(false); navigate("/garage"); }}>
                My garage
              </button>
              <button type="button" onClick={() => { setMenu(false); navigate("/messages"); }}>
                Messages {unread ? `(${unread})` : ""}
              </button>
              <button type="button" onClick={() => { setMenu(false); navigate("/notes"); }}>
                Notes for the team
              </button>
              <button type="button" onClick={() => app.toggleOpenToMeet()}>
                {app.me.openToMeet ? "Open to meet · on" : "Open to meet · off"}
              </button>
            </div>
          )}
        </div>
      </header>
      <Outlet />
      {app.composer.open && <Composer />}
      <div className="toasts" aria-live="polite">
        {app.toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
