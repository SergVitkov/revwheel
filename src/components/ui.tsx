import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Comment, User } from "../types";

export function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function Logo({ wordmark = true }: { wordmark?: boolean }) {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 78 64" aria-hidden="true">
        <path d="M2 20h14M5 32h12M2 44h14" stroke="#b7b2ab" strokeWidth="3" strokeLinecap="round" />
        <circle cx="46" cy="33" r="18" fill="none" stroke="#2a2a2a" strokeWidth="7" />
        <circle cx="46" cy="33" r="10.5" fill="#ff5a1f" />
        <circle cx="46" cy="28.2" r="1.55" fill="#1a1a1a" />
        <circle cx="50.6" cy="31.6" r="1.55" fill="#1a1a1a" />
        <circle cx="48.8" cy="36.6" r="1.55" fill="#1a1a1a" />
        <circle cx="43.2" cy="36.6" r="1.55" fill="#1a1a1a" />
        <circle cx="41.4" cy="31.6" r="1.55" fill="#1a1a1a" />
        <path d="M54 12c8 1.2 16 8 14 18-5-2-9-1.2-12 3 1.2-8-.4-16-2-21z" fill="#ff5a1f" />
      </svg>
      {wordmark && (
        <span className="logo-word">
          <span className="rev">REV</span>
          <span className="wheel">WHEEL</span>
        </span>
      )}
    </span>
  );
}

export function Avatar({
  user,
  size = 36,
}: {
  user: Pick<User, "initials" | "color" | "name">;
  size?: number;
}) {
  return (
    <span
      className="avatar"
      style={{ background: user.color, width: size, height: size, fontSize: Math.max(10, size * 0.34) }}
      aria-hidden="true"
    >
      {user.initials}
    </span>
  );
}

export function TypePill({ type }: { type: "mod" | "repair" | "guide" }) {
  const label = type === "mod" ? "MOD" : type === "repair" ? "REPAIR" : "GUIDE";
  return <span className={`pill type-${type}`}>{label}</span>;
}

export function IconHeart({ on }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 20.2s-6.8-4.2-6.8-8.7A3.7 3.7 0 0 1 12 8.6a3.7 3.7 0 0 1 6.8 2.9c0 4.5-6.8 8.7-6.8 8.7z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconComment() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M6 16.5 4 20l4.2-1.6A8 8 0 1 0 6 16.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSend() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 12 20 4l-6 16-2.2-6.2L4 12z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBookmark({ on }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Carousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const list = photos.length ? photos : [];
  const index = Math.min(i, Math.max(0, list.length - 1));
  if (!list.length) return null;
  const prev = () => setI((n) => (n - 1 + list.length) % list.length);
  const next = () => setI((n) => (n + 1) % list.length);
  return (
    <div className="carousel">
      <img src={list[index]} alt={`${alt}, photo ${index + 1} of ${list.length}`} onClick={() => setOpen(true)} />
      {list.length > 1 && (
        <>
          <button type="button" className="car-nav prev" onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <button type="button" className="car-nav next" onClick={next} aria-label="Next photo">
            ›
          </button>
          <div className="car-count">
            {index + 1} / {list.length}
          </div>
        </>
      )}
      {open && <Lightbox photos={list} start={index} alt={alt} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function Lightbox({
  photos,
  start,
  alt,
  onClose,
}: {
  photos: string[];
  start: number;
  alt: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((n) => (n + 1) % photos.length);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt}>
      <button type="button" className="lightbox-x" onClick={onClose} aria-label="Close">
        Close
      </button>
      <button
        type="button"
        className="car-nav prev light"
        onClick={(e) => {
          e.stopPropagation();
          setI((n) => (n - 1 + photos.length) % photos.length);
        }}
        aria-label="Previous photo"
      >
        ‹
      </button>
      <img src={photos[i]} alt={`${alt}, photo ${i + 1}`} onClick={(e) => e.stopPropagation()} />
      <button
        type="button"
        className="car-nav next light"
        onClick={(e) => {
          e.stopPropagation();
          setI((n) => (n + 1) % photos.length);
        }}
        aria-label="Next photo"
      >
        ›
      </button>
      <div className="car-count light">
        {i + 1} / {photos.length}
      </div>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Comments({
  comments,
  users,
  onSubmit,
}: {
  comments: Comment[];
  users: User[];
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="comments">
      {comments.map((c) => {
        const user = users.find((u) => u.id === c.userId);
        if (!user) return null;
        return (
          <div key={c.id} className="comment">
            <Link to={`/u/${user.id}`}>
              <Avatar user={user} size={28} />
            </Link>
            <div>
              <div className="comment-meta">
                <Link to={`/u/${user.id}`}>{user.handle}</Link>
                <span>{c.time}</span>
              </div>
              <p>{c.text}</p>
            </div>
          </div>
        );
      })}
      <form
        className="comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSubmit(text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment about the car, the part, or the job"
          aria-label="Comment"
        />
        <button type="submit" className="text-btn strong" disabled={!text.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}

export function userById(users: User[], id: string) {
  return users.find((u) => u.id === id);
}
