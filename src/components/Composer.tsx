import { useMemo, useState } from "react";
import { libraryPhotos } from "../data";
import { useApp } from "../store";
import type { Modification, Post, PostType } from "../types";
import { ME_ID } from "../data";
import { Modal } from "./ui";

const types: { id: PostType; label: string; hint: string }[] = [
  { id: "mod", label: "Modification", hint: "A part you fitted: wheels, tune, aero, suspension." },
  { id: "repair", label: "Repair", hint: "Something you fixed, with the cost and the time." },
  { id: "guide", label: "Guide", hint: "A how-to someone with the same car can follow." },
];

export function Composer() {
  const app = useApp();
  const mine = app.cars.filter((c) => c.ownerId === ME_ID);
  const [type, setType] = useState<PostType | null>(app.composer.type);
  const [carId, setCarId] = useState(mine[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [parts, setParts] = useState("");
  const [cost, setCost] = useState("");
  const [time, setTime] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [onCard, setOnCard] = useState(true);
  const [category, setCategory] = useState<Modification["category"]>("Engine");

  const ready = Boolean(type && carId && title.trim() && photos.length);
  const car = mine.find((c) => c.id === carId);

  const facts = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    if (parts.trim()) list.push({ label: "Parts", value: parts.trim() });
    if (cost.trim()) list.push({ label: "Cost", value: cost.trim() });
    if (time.trim()) list.push({ label: "Time", value: time.trim() });
    return list;
  }, [parts, cost, time]);

  function togglePhoto(src: string) {
    setPhotos((prev) => {
      if (prev.includes(src)) return prev.filter((p) => p !== src);
      if (prev.length >= 12) return prev;
      return [...prev, src];
    });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || "");
        if (url) setPhotos((prev) => (prev.length >= 12 || prev.includes(url) ? prev : [...prev, url]));
      };
      reader.readAsDataURL(file);
    });
  }

  function publish() {
    if (!type || !car || !ready) return;
    const id = `post-${Date.now()}`;
    let guideId: string | undefined;
    if (type === "guide") {
      guideId = `guide-${Date.now()}`;
      app.addGuide({
        id: guideId,
        type: "guide",
        userId: ME_ID,
        carId: car.id,
        title: title.trim(),
        crumb: "Guides / Yours",
        difficulty: "Medium",
        time: time.trim() || "—",
        cost: cost.trim() || "—",
        tools: "See steps",
        cover: photos[0],
        photos,
        parts: parts.trim() ? [{ name: parts.trim(), meta: cost.trim() || "—" }] : [],
        steps: [
          {
            n: 1,
            title: title.trim(),
            body: body.trim() || "Photos from the job.",
            photos,
          },
        ],
        likes: 0,
        liked: false,
        saved: false,
        comments: [],
        related: [],
      });
    }
    const post: Post = {
      id,
      type,
      userId: ME_ID,
      carId: car.id,
      title: title.trim(),
      body: body.trim(),
      photos,
      facts,
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
      createdAt: new Date().toISOString(),
      time: "just now",
      guideId,
      city: app.me.city,
    };
    if (type === "mod" && onCard) {
      app.addMod(car.id, {
        id: `mod-${Date.now()}`,
        category,
        title: title.trim(),
        detail: [parts.trim(), time.trim()].filter(Boolean).join(" · ") || "Just fitted",
        photo: photos[0],
        guideId,
      });
    }
    app.publishPost(post);
  }

  return (
    <Modal title="New post" onClose={app.closeComposer} wide>
      <p className="lede">
        RevWheel only takes a modification, a repair, or a guide. Every post stays attached to one of your cars.
      </p>
      <div className="type-pick">
        {types.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`type-card ${type === item.id ? "on" : ""}`}
            onClick={() => setType(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </div>
      <label className="field">
        <span>Car</span>
        <select value={carId} onChange={(e) => setCarId(e.target.value)}>
          {mine.map((c) => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What you fitted, fixed, or explained" />
      </label>
      <label className="field">
        <span>What happened</span>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Parts, the order you did them, and what you would tell a friend with the same car."
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Parts</span>
          <input value={parts} onChange={(e) => setParts(e.target.value)} placeholder="KW V3" />
        </label>
        <label className="field">
          <span>Cost</span>
          <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="1,240" />
        </label>
        <label className="field">
          <span>Time</span>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="6 h" />
        </label>
      </div>
      {type === "mod" && (
        <>
          <label className="field">
            <span>Category on the car card</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as Modification["category"])}>
              {(["Engine", "Suspension", "Brakes", "Wheels", "Exterior"] as const).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={onCard} onChange={(e) => setOnCard(e.target.checked)} />
            Add this modification to the car card
          </label>
        </>
      )}
      <div className="field">
        <span>Photos · {photos.length}/12 · real shots only</span>
        <label className="upload">
          <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
          Upload from your camera roll
        </label>
        <div className="pick-grid">
          {libraryPhotos.map((src) => (
            <button
              type="button"
              key={src}
              className={`pick ${photos.includes(src) ? "on" : ""}`}
              onClick={() => togglePhoto(src)}
            >
              <img src={src} alt="" />
              {photos.includes(src) && <em>{photos.indexOf(src) + 1}</em>}
            </button>
          ))}
          {photos
            .filter((src) => !libraryPhotos.includes(src))
            .map((src) => (
              <button type="button" key={src} className="pick on" onClick={() => togglePhoto(src)}>
                <img src={src} alt="" />
              </button>
            ))}
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn primary" disabled={!ready} onClick={publish}>
          Publish
        </button>
        {!ready && <span className="hint">Choose a type, a car, a title, and at least one photo.</span>}
      </div>
    </Modal>
  );
}
