import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/ui";
import { useApp } from "../store";

export function MessagesPage() {
  const app = useApp();
  const threads = new Map<string, (typeof app.messages)[number]>();
  for (const m of app.messages) {
    const other = m.fromId === app.me.id ? m.toId : m.fromId;
    if (!threads.has(other)) threads.set(other, m);
  }
  const list = [...threads.entries()];
  const [active, setActive] = useState(list[0]?.[0] ?? "");
  const [text, setText] = useState("");
  const person = app.users.find((u) => u.id === active);
  const history = app.messages.filter((m) => m.fromId === active || m.toId === active).slice().reverse();

  return (
    <div className="messages">
      <aside className="card thread-list">
        <h1>Messages</h1>
        {list.length === 0 && <p className="hint">No messages yet. Say hi to someone nearby, or message a host from the map.</p>}
        {list.map(([id, last]) => {
          const user = app.users.find((u) => u.id === id);
          if (!user) return null;
          return (
            <button key={id} type="button" className={active === id ? "on" : ""} onClick={() => setActive(id)}>
              <Avatar user={user} size={36} />
              <span>
                <strong>{user.name}</strong>
                <small>{last.text}</small>
              </span>
            </button>
          );
        })}
      </aside>
      <section className="card thread">
        {!person && <p className="hint">Pick a conversation.</p>}
        {person && (
          <>
            <header className="who">
              <Avatar user={person} />
              <Link to={`/u/${person.id}`}>
                <strong>{person.name}</strong>
                <small>{person.carLabel}</small>
              </Link>
            </header>
            <div className="bubbles">
              {history.map((m) => (
                <div key={m.id} className={m.fromId === app.me.id ? "bubble mine" : "bubble"}>
                  <p>{m.text}</p>
                  <small>
                    {m.context ? `${m.context} · ` : ""}
                    {m.time}
                  </small>
                </div>
              ))}
            </div>
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                app.sendMessage(person.id, text.trim());
                setText("");
              }}
            >
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write about the car, the meet, or the job" aria-label="Message" />
              <button type="submit" className="btn primary" disabled={!text.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
