import { useState } from "react";
import { Link } from "react-router-dom";
import { ME_ID } from "../data";
import { useApp } from "../store";
import type { Car } from "../types";
import { CarForm } from "./CarForm";
import { Modal } from "./ui";

export function GarageRail() {
  const app = useApp();
  const mine = app.cars.filter((c) => c.ownerId === ME_ID);
  const [id, setId] = useState(mine[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const car = mine.find((c) => c.id === id) ?? mine[0];
  const next = app.events.find((e) => e.id === "ev-night") ?? app.events[0];

  if (!car) return null;

  return (
    <aside className="rail right-rail">
      <section className="card garage-card">
        <header className="row-between">
          <h3>My garage</h3>
          <button type="button" className="linkish" onClick={() => setAdding(true)}>
            + Add car
          </button>
        </header>
        <div className="car-switch">
          {mine.map((c) => (
            <button key={c.id} type="button" className={c.id === car.id ? "on" : ""} onClick={() => setId(c.id)}>
              {c.make} {shortModel(c)}
            </button>
          ))}
        </div>
        <div className="dark-car">
          <div className="dark-photo">
            <img src={car.photo} alt={`${car.color} ${car.make} ${car.model}`} />
          </div>
          <div className="dark-body">
            <div className="badge-row">
              <span className="badge orange">{car.trim.toUpperCase()}</span>
              <span className="badge ghost">{car.color}</span>
            </div>
            <h2>
              {car.make} {car.model}
            </h2>
            <p className="sub">
              {car.trim} · {car.mods.length} mod{car.mods.length === 1 ? "" : "s"} · {car.service.length} in the log
            </p>
            <dl className="spec-grid">
              <Spec k="Year" v={car.year} />
              <Spec k="Mileage" v={car.mileage} />
              <Spec k="Power" v={car.power} />
              <Spec k="Torque" v={car.torque} />
              <Spec k="Engine" v={car.engine} />
              <Spec k="Gearbox" v={car.gearbox} />
              <Spec k="Drive" v={car.drive} />
              <Spec k="Fuel" v={car.fuel} />
            </dl>
            <div className="dark-actions">
              <Link to={`/garage/${car.id}`} className="btn light">
                Open car card
              </Link>
              <Link to={`/garage/${car.id}?edit=1`} className="btn ghost-dark">
                Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="row-between">
          <h3>Gallery</h3>
          <Link to={`/garage/${car.id}?tab=gallery`} className="linkish">
            See all {car.gallery.length}
          </Link>
        </header>
        <div className="gallery-mini">
          {car.gallery.slice(0, 6).map((src) => (
            <Link key={src} to={`/garage/${car.id}?tab=gallery`}>
              <img src={src} alt="" />
            </Link>
          ))}
        </div>
      </section>

      {next && (
        <section className="card next-event">
          <h3>Next event</h3>
          <div className="event-row">
            <div className="date-block">
              <span>{next.day}</span>
              <strong>{next.date}</strong>
            </div>
            <div>
              <strong>{next.title}</strong>
              <small>
                {next.time} · {next.going} going
              </small>
            </div>
            <button type="button" className={`btn ${next.joined ? "dark" : "dark"}`} onClick={() => app.toggleJoin(next.id)}>
              {next.joined ? "Going" : "Join"}
            </button>
          </div>
        </section>
      )}

      {adding && (
        <Modal title="Add a car" onClose={() => setAdding(false)} wide>
          <CarForm
            car={blankCar()}
            onCancel={() => setAdding(false)}
            onSave={(nextCar) => {
              app.saveCar(nextCar);
              setId(nextCar.id);
              setAdding(false);
            }}
          />
        </Modal>
      )}
    </aside>
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

function shortModel(car: Car) {
  return car.model.split(" ")[0];
}

function blankCar(): Car {
  return {
    id: `car-${Date.now()}`,
    ownerId: ME_ID,
    make: "",
    model: "",
    year: "",
    mileage: "",
    power: "",
    torque: "",
    engine: "",
    gearbox: "",
    drive: "",
    fuel: "Petrol",
    color: "",
    trim: "",
    photo: "/photos/gt-1.jpg",
    gallery: ["/photos/gt-1.jpg"],
    mods: [],
    service: [],
    story: "",
  };
}
