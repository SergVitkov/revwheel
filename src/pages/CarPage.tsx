import { useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CarForm } from "../components/CarForm";
import { Avatar, Modal, fmt } from "../components/ui";
import { useApp, carTitle, completeness, completenessHint } from "../store";
import type { Modification } from "../types";

const cats = ["All", "Engine", "Suspension", "Brakes", "Wheels", "Exterior"] as const;

export function CarPage() {
  const app = useApp();
  const { carId } = useParams();
  const [params, setParams] = useSearchParams();
  const mine = app.cars.filter((c) => c.ownerId === app.me.id);
  const car = app.cars.find((c) => c.id === carId) ?? mine[0];
  const tab = params.get("tab") ?? "mods";
  const editing = params.get("edit") === "1";
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [adding, setAdding] = useState(false);

  if (!car) return <p className="page-pad">Add a car to open a garage.</p>;
  const owner = app.users.find((u) => u.id === car.ownerId);
  const isMine = car.ownerId === app.me.id;
  const posts = app.posts.filter((p) => p.carId === car.id && !app.blocked.includes(p.userId));
  const score = completeness(car);
  const mods = cat === "All" ? car.mods : car.mods.filter((m) => m.category === cat);

  function setTab(next: string) {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    p.delete("edit");
    setParams(p, { replace: true });
  }

  return (
    <div className="split-page">
      <div className="split-main">
        <section className="hero">
          <div className="hero-photo">
            <img src={car.photo} alt={`${car.color} ${carTitle(car)}`} />
          </div>
          <div className="hero-copy">
            <div className="badge-row">
              <span className="badge orange">{car.trim.toUpperCase()}</span>
              <span className="badge ghost">{car.color}</span>
            </div>
            <h1>
              {car.make} {car.model}
            </h1>
            <dl className="spec-grid light">
              <Spec k="Year" v={car.year} />
              <Spec k="Mileage" v={car.mileage} />
              <Spec k="Power" v={car.power} />
              <Spec k="Torque" v={car.torque} />
              <Spec k="Engine" v={car.engine} />
              <Spec k="Gearbox" v={car.gearbox} />
              <Spec k="Drive" v={car.drive} />
              <Spec k="Fuel" v={car.fuel} />
            </dl>
            {isMine ? (
              <div className="hero-actions">
                <button type="button" className="btn primary" onClick={() => setAdding(true)}>
                  Add modification
                </button>
                <button
                  type="button"
                  className="btn ghost-dark"
                  onClick={() => {
                    const p = new URLSearchParams(params);
                    p.set("edit", "1");
                    setParams(p, { replace: true });
                  }}
                >
                  Edit car card
                </button>
              </div>
            ) : (
              owner && (
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => app.sayHi(owner.id, `Hi ${owner.name.split(" ")[0]} — I was reading the ${carTitle(car)} card.`)}
                >
                  Message owner
                </button>
              )
            )}
          </div>
        </section>

        <section className="card car-panel">
          <div className="car-tabs">
            <Tab on={tab === "mods"} onClick={() => setTab("mods")}>
              Modifications {car.mods.length}
            </Tab>
            <Tab on={tab === "service"} onClick={() => setTab("service")}>
              Service log {car.service.length}
            </Tab>
            <Tab on={tab === "posts"} onClick={() => setTab("posts")}>
              Posts {posts.length}
            </Tab>
            <Tab on={tab === "gallery"} onClick={() => setTab("gallery")}>
              Gallery {car.gallery.length}
            </Tab>
          </div>

          {tab === "mods" && (
            <>
              <div className="chips scroll">
                {cats.map((c) => (
                  <button key={c} type="button" className={`chip ${cat === c ? "on dark" : ""}`} onClick={() => setCat(c)}>
                    {c}
                  </button>
                ))}
              </div>
              {mods.length === 0 && <p className="hint pad">No modifications in this category yet.</p>}
              <div className="mod-grid">
                {mods.map((mod) => (
                  <ModCard key={mod.id} mod={mod} />
                ))}
              </div>
            </>
          )}

          {tab === "service" && (
            <ul className="service full">
              {car.service.length === 0 && <li className="hint">No service entries yet. Add them when you edit the story of the car.</li>}
              {car.service.map((s, i) => (
                <li key={s.id}>
                  <i className={i === 0 ? "hot" : ""} />
                  <div>
                    <strong>{s.title}</strong>
                    <small>
                      {s.when} · {s.mileage}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === "posts" && (
            <ul className="post-links">
              {posts.length === 0 && <li className="hint">No posts on this car yet.</li>}
              {posts.map((p) => (
                <li key={p.id}>
                  <Link to={`/p/${p.id}`}>
                    <img src={p.photos[0]} alt="" />
                    <span>
                      <strong>{p.title}</strong>
                      <small>
                        {p.type} · {p.time} · {fmt(p.likes)} likes
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tab === "gallery" && (
            <div className="gallery-full">
              {car.gallery.map((src) => (
                <img key={src} src={src} alt={`${carTitle(car)} gallery`} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="rail">
        {owner && (
          <section className="card owner-card">
            <div className="who">
              <Avatar user={owner} size={44} />
              <div>
                <Link to={`/u/${owner.id}`}>
                  <strong>{owner.name}</strong>
                </Link>
                <small>Owner · city shown as area only</small>
              </div>
              {!isMine && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => app.toggleFollow(owner.id)}
                >
                  {app.following.includes(owner.id) ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <div className="stats">
              <Stat n={fmt(owner.followers)} l="followers" />
              <Stat n={String(app.posts.filter((p) => p.userId === owner.id).length)} l="posts" />
              <Stat n={fmt(owner.likes)} l="likes" />
            </div>
            {owner.openToMeet ? (
              <div className="meet-flag">Open to meet: {owner.meetNote}</div>
            ) : (
              <div className="meet-flag off">Not open to meet</div>
            )}
            {isMine && (
              <button type="button" className="btn dark block" onClick={() => app.toggleOpenToMeet()}>
                {owner.openToMeet ? "You are open to meet" : "Turn on open to meet"}
              </button>
            )}
            {!isMine && (
              <button type="button" className="btn dark block" onClick={() => app.sayHi(owner.id)}>
                Message
              </button>
            )}
          </section>
        )}

        <section className="card">
          <h3>Service log</h3>
          <ul className="service">
            {car.service.slice(0, 3).map((s, i) => (
              <li key={s.id}>
                <i className={i === 0 ? "hot" : ""} />
                <div>
                  <strong>{s.title}</strong>
                  <small>
                    {s.when} · {s.mileage}
                  </small>
                </div>
              </li>
            ))}
            {car.service.length === 0 && <li className="hint">The service log is empty.</li>}
          </ul>
        </section>

        <section className="card">
          <h3>Card completeness</h3>
          <div className="bar">
            <span style={{ width: `${score}%` }} />
          </div>
          <p className="hint">
            {score}%. {completenessHint(car)}
          </p>
        </section>
      </aside>

      {adding && (
        <AddMod
          onClose={() => setAdding(false)}
          onSave={(mod) => {
            app.addMod(car.id, mod);
            app.toast("Modification added to the car card.");
            setAdding(false);
          }}
        />
      )}

      {editing && isMine && (
        <Modal
          title="Edit car card"
          wide
          onClose={() => {
            const p = new URLSearchParams(params);
            p.delete("edit");
            setParams(p, { replace: true });
          }}
        >
          <CarForm
            car={car}
            onCancel={() => {
              const p = new URLSearchParams(params);
              p.delete("edit");
              setParams(p, { replace: true });
            }}
            onSave={(next) => {
              app.saveCar(next);
              const p = new URLSearchParams(params);
              p.delete("edit");
              setParams(p, { replace: true });
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={on ? "on" : ""} onClick={onClick}>
      {children}
    </button>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <strong>{n}</strong>
      <span>{l}</span>
    </div>
  );
}

function ModCard({ mod }: { mod: Modification }) {
  const inner = (
    <>
      <div className="mod-photo">
        <img src={mod.photo} alt="" />
      </div>
      <div className="mod-copy">
        <span>{mod.category.toUpperCase()}</span>
        <strong>{mod.title}</strong>
        <small>{mod.detail}</small>
        {mod.guideId && <em>Read the install guide</em>}
      </div>
    </>
  );
  if (mod.guideId) {
    return (
      <Link to={`/guide/${mod.guideId}`} className="mod-card">
        {inner}
      </Link>
    );
  }
  return <article className="mod-card">{inner}</article>;
}

function AddMod({ onClose, onSave }: { onClose: () => void; onSave: (mod: Modification) => void }) {
  const [category, setCategory] = useState<Modification["category"]>("Engine");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [photo, setPhoto] = useState("/photos/engine.jpg");
  const cats = ["Engine", "Suspension", "Brakes", "Wheels", "Exterior"] as const;
  return (
    <Modal title="Add modification" onClose={onClose}>
      <label className="field">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as Modification["category"])}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>What you fitted</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="field">
        <span>Detail</span>
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Brand · date" />
      </label>
      <label className="field">
        <span>Photo</span>
        <select value={photo} onChange={(e) => setPhoto(e.target.value)}>
          <option value="/photos/engine.jpg">Engine bay</option>
          <option value="/photos/pex-wheel.jpg">Wheel off</option>
          <option value="/photos/pex-engine.jpg">Under the car</option>
          <option value="/photos/gt-2.jpg">The car</option>
          <option value="/photos/wheel-drive.jpg">Wheel</option>
        </select>
      </label>
      <div className="modal-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!title.trim()}
          onClick={() =>
            onSave({
              id: `mod-${Date.now()}`,
              category,
              title: title.trim(),
              detail: detail.trim() || "Added just now",
              photo,
            })
          }
        >
          Add to card
        </button>
      </div>
    </Modal>
  );
}
