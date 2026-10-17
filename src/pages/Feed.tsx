import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useApp, carTitle } from "../store";
import type { Post, PostType } from "../types";
import { Avatar, Carousel, Comments, IconBookmark, IconComment, IconHeart, IconSend, TypePill, fmt } from "../components/ui";
import { GarageRail } from "../components/GarageRail";

const filters: { id: "all" | PostType; label: string; count: string }[] = [
  { id: "all", label: "All posts", count: "12.4k" },
  { id: "mod", label: "Modifications", count: "5.1k" },
  { id: "repair", label: "Repairs", count: "4.2k" },
  { id: "guide", label: "Guides", count: "3.1k" },
];

const brands = ["BMW", "Audi", "VW", "Mercedes", "Toyota", "Skoda"];

export function Feed() {
  const app = useApp();
  const { postId } = useParams();
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();
  const [type, setType] = useState<(typeof filters)[number]["id"]>("all");
  const [brand, setBrand] = useState<string | null>(null);
  const [tab, setTab] = useState<"following" | "popular" | "near">("following");

  const nearby = app.users.filter(
    (u) => u.id !== app.me.id && u.openToMeet && !app.blocked.includes(u.id) && u.city === app.me.city && u.distance,
  );

  const posts = useMemo(() => {
    let list = app.posts.filter((p) => !app.blocked.includes(p.userId));
    if (postId) list = list.filter((p) => p.id === postId);
    if (type !== "all") list = list.filter((p) => p.type === type);
    if (brand) {
      list = list.filter((p) => app.cars.find((c) => c.id === p.carId)?.make === brand);
    }
    if (!postId && tab === "following") list = list.filter((p) => app.following.includes(p.userId) || p.userId === app.me.id);
    if (!postId && tab === "near") list = list.filter((p) => p.city === app.me.city);
    if (q) {
      list = list.filter((p) => {
        const car = app.cars.find((c) => c.id === p.carId);
        const user = app.users.find((u) => u.id === p.userId);
        const blob = [p.title, p.body, car?.make, car?.model, user?.handle, user?.name, ...p.facts.map((f) => f.value)]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    if (tab === "popular" && !postId) return [...list].sort((a, b) => b.likes - a.likes);
    return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [app, type, brand, tab, q, postId]);

  return (
    <div className="feed-page">
      <aside className="rail">
        <section className="card tight">
          {filters.map((f) => (
            <button key={f.id} type="button" className={`filter-row ${type === f.id ? "on" : ""}`} onClick={() => setType(f.id)}>
              <span>{f.label}</span>
              <em>{f.count}</em>
            </button>
          ))}
        </section>
        <section className="card">
          <h3>Brands</h3>
          <div className="chips">
            {brands.map((b) => (
              <button key={b} type="button" className={`chip ${brand === b ? "on" : ""}`} onClick={() => setBrand(brand === b ? null : b)}>
                {b}
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Open to meet nearby</h3>
          <ul className="people">
            {nearby.map((u) => (
              <li key={u.id}>
                <Link to={`/u/${u.id}`} className="person">
                  <Avatar user={u} size={36} />
                  <span>
                    <strong>{u.name}</strong>
                    <small>
                      {u.carLabel} · {u.distance}
                    </small>
                  </span>
                </Link>
                <button
                  type="button"
                  className="say"
                  disabled={app.saidHi.includes(u.id)}
                  onClick={() => app.sayHi(u.id)}
                >
                  {app.saidHi.includes(u.id) ? "Sent" : "Say hi"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <main className="feed-col">
        {postId ? (
          <Link to="/" className="back">
            ← Back to the feed
          </Link>
        ) : (
          <>
            <section className="card composer-card">
              <div className="composer-top">
                <Avatar user={app.me} />
                <button type="button" className="composer-ghost" onClick={() => app.openComposer(null)}>
                  Share a mod, a repair or a how-to from your car
                </button>
              </div>
              <div className="composer-types">
                <button type="button" onClick={() => app.openComposer("mod")}>
                  Modification
                </button>
                <button type="button" onClick={() => app.openComposer("repair")}>
                  Repair
                </button>
                <button type="button" onClick={() => app.openComposer("guide")}>
                  Guide
                </button>
              </div>
            </section>
            <div className="tabs">
              {(
                [
                  ["following", "Following"],
                  ["popular", "Popular"],
                  ["near", "Near me"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {posts.length === 0 && (
          <section className="card empty">
            <h2>Nothing in this lane yet</h2>
            <p>Try another brand, or post a modification, repair, or guide from your own car.</p>
          </section>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>

      <GarageRail />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const app = useApp();
  const user = app.users.find((u) => u.id === post.userId);
  const car = app.cars.find((c) => c.id === post.carId);
  const [open, setOpen] = useState(false);
  if (!user || !car) return null;
  return (
    <article className="card post" id={`post-${post.id}`}>
      <header className="post-head">
        <Link to={`/u/${user.id}`} className="who">
          <Avatar user={user} />
          <span>
            <strong>{user.handle}</strong>
            <small>
              {carTitle(car)} · {post.time}
            </small>
          </span>
        </Link>
        <TypePill type={post.type} />
      </header>
      <h2>
        {post.guideId ? <Link to={`/guide/${post.guideId}`}>{post.title}</Link> : post.title}
      </h2>
      <Carousel photos={post.photos} alt={post.title} />
      {post.facts.length > 0 && (
        <div className="facts">
          {post.facts.map((f) => (
            <span key={f.label}>
              {f.label}: {f.value}
            </span>
          ))}
        </div>
      )}
      <div className="actions">
        <button type="button" className={post.liked ? "liked" : ""} onClick={() => app.toggleLikePost(post.id)}>
          <IconHeart on={post.liked} /> {fmt(post.likes)}
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)}>
          <IconComment /> {fmt(post.comments.length)}
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(`${window.location.origin}/p/${post.id}`);
            app.toast("Link copied.");
          }}
          aria-label="Copy link"
        >
          <IconSend />
        </button>
        <button type="button" className={`save ${post.saved ? "on" : ""}`} onClick={() => app.toggleSavePost(post.id)} aria-label="Save">
          <IconBookmark on={post.saved} />
        </button>
      </div>
      <p className="caption">
        <Link to={`/u/${user.id}`}>{user.handle}</Link> {post.body}{" "}
        {post.guideId && <Link to={`/guide/${post.guideId}`}>Read the guide</Link>}
      </p>
      {open && <Comments comments={post.comments} users={app.users} onSubmit={(text) => app.addPostComment(post.id, text)} />}
    </article>
  );
}
