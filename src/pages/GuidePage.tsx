import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Comments, IconBookmark, IconComment, IconHeart, TypePill, fmt } from "../components/ui";
import { useApp, carTitle } from "../store";

export function GuidePage() {
  const { guideId } = useParams();
  const app = useApp();
  const guide = app.guides.find((g) => g.id === guideId);
  const [open, setOpen] = useState(false);
  if (!guide) return <p className="page-pad">That guide is gone.</p>;
  const author = app.users.find((u) => u.id === guide.userId);
  const car = app.cars.find((c) => c.id === guide.carId);
  const related = guide.related.map((id) => app.guides.find((g) => g.id === id)).filter(Boolean);

  return (
    <div className="split-page guide-page">
      <article className="guide">
        <p className="crumb">
          {guide.crumb} <TypePill type={guide.type} />
        </p>
        <h1>{guide.title}</h1>
        {author && (
          <div className="guide-author">
            <Link to={`/u/${author.id}`} className="who">
              <Avatar user={author} />
              <span>
                <strong>{author.name}</strong>
                <small>
                  {car ? carTitle(car) : author.carLabel} · {author.city}
                </small>
              </span>
            </Link>
            {author.id !== app.me.id && (
              <button type="button" className="btn ghost" onClick={() => app.toggleFollow(author.id)}>
                {app.following.includes(author.id) ? "Following" : "Follow"}
              </button>
            )}
          </div>
        )}
        <div className="stat-row">
          <div>
            <span>Difficulty</span>
            <strong>{guide.difficulty}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{guide.time}</strong>
          </div>
          <div>
            <span>Total cost</span>
            <strong>{guide.cost}</strong>
          </div>
          <div>
            <span>Tools</span>
            <strong>{guide.tools}</strong>
          </div>
        </div>
        <figure className="cover">
          <img src={guide.cover} alt="" />
          <figcaption>Cover photo · the finished job</figcaption>
        </figure>
        <ol className="steps">
          {guide.steps.map((step) => (
            <li key={step.n}>
              <div className="step-h">
                <span>{step.n}</span>
                <h2>{step.title}</h2>
              </div>
              <p>{step.body}</p>
              <div className="step-photos">
                {step.photos.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
            </li>
          ))}
        </ol>
        <footer className="guide-foot">
          <button type="button" className={guide.liked ? "liked" : ""} onClick={() => app.toggleLikeGuide(guide.id)}>
            <IconHeart on={guide.liked} /> {fmt(guide.likes)}
          </button>
          <button type="button" onClick={() => setOpen((v) => !v)}>
            <IconComment /> {fmt(guide.comments.length)}
          </button>
          <button type="button" className={guide.saved ? "on" : ""} onClick={() => app.toggleSaveGuide(guide.id)}>
            <IconBookmark on={guide.saved} /> Save guide
          </button>
        </footer>
        {open && <Comments comments={guide.comments} users={app.users} onSubmit={(text) => app.addGuideComment(guide.id, text)} />}
      </article>

      <aside className="rail">
        <section className="card">
          <h3>Parts and tools</h3>
          <ul className="parts">
            {guide.parts.map((p) => (
              <li key={p.name}>
                <span>{p.name}</span>
                <em>{p.tool ? "tool" : p.meta}</em>
              </li>
            ))}
            {guide.parts.length === 0 && <li className="hint">No parts listed.</li>}
          </ul>
        </section>
        {car && (
          <section className="card car-side">
            <h3>Car in this guide</h3>
            <img src={car.photo} alt={carTitle(car)} />
            <strong>
              {car.make} {car.model}
            </strong>
            <small>
              {car.trim} · {car.year} · {car.power}
            </small>
            <Link to={`/garage/${car.id}`} className="btn dark block">
              Open car card
            </Link>
          </section>
        )}
        <section className="card">
          <h3>More guides for this car</h3>
          <ul className="more-guides">
            {(related.length ? related : app.guides.filter((g) => g.id !== guide.id && g.carId === guide.carId).slice(0, 3)).map(
              (g) =>
                g && (
                  <li key={g.id}>
                    <Link to={`/guide/${g.id}`}>
                      <img src={g.cover} alt="" />
                      <span>{g.title}</span>
                    </Link>
                  </li>
                ),
            )}
          </ul>
        </section>
      </aside>
    </div>
  );
}
