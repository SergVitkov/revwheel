import { useState } from "react";
import { libraryPhotos } from "../data";
import type { Car } from "../types";

const fields: { key: keyof Car; label: string }[] = [
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "mileage", label: "Mileage" },
  { key: "power", label: "Power" },
  { key: "torque", label: "Torque" },
  { key: "engine", label: "Engine" },
  { key: "gearbox", label: "Gearbox" },
  { key: "drive", label: "Drive" },
  { key: "fuel", label: "Fuel" },
  { key: "color", label: "Color" },
  { key: "trim", label: "Package" },
];

export function CarForm({ car, onSave, onCancel }: { car: Car; onSave: (car: Car) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Car>(car);
  function set<K extends keyof Car>(key: K, value: Car[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  const ready = draft.make.trim() && draft.model.trim() && draft.photo;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        const gallery = draft.gallery.includes(draft.photo) ? draft.gallery : [draft.photo, ...draft.gallery];
        onSave({ ...draft, gallery });
      }}
    >
      <div className="form-grid">
        {fields.map((f) => (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            <input
              value={String(draft[f.key] ?? "")}
              onChange={(e) => set(f.key, e.target.value as never)}
            />
          </label>
        ))}
      </div>
      <label className="field">
        <span>Story</span>
        <textarea rows={3} value={draft.story} onChange={(e) => set("story", e.target.value)} placeholder="What this car is for." />
      </label>
      <div className="field">
        <span>Cover photo</span>
        <div className="pick-grid">
          {libraryPhotos.map((src) => (
            <button
              type="button"
              key={src}
              className={`pick ${draft.photo === src ? "on" : ""}`}
              onClick={() => setDraft((d) => ({ ...d, photo: src, gallery: d.gallery.includes(src) ? d.gallery : [src, ...d.gallery] }))}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={!ready}>
          Save car card
        </button>
      </div>
    </form>
  );
}
