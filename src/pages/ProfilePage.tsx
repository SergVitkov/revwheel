import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, fmt } from "../components/ui";
import { useApp, carTitle } from "../store";

export function ProfilePage() {
  const { userId } = useParams();
  const app = useApp();
  const user = app.users.find((u) => u.id === userId);
  const [menu, setMenu] = useState(false);
  if (!user) return <p className="page-pad">No such driver.</p>;
  const cars = app.cars.filter((c) => c.ownerId === user.id);
  const posts = app.posts.filter((p) => p.userId === user.id);
  const isMe = user.id === app.me.id;
  return (
    <div className="board profile">
      <header className="card profile-head">
        <Avatar user={user} size={72} />
        <div>
          <h1>{user.name}</h1>
          <p>@{user.handle} · {user.city}, area only</p>
          <p>{user.bio}</p>
          {user.openToMeet && <div className="meet-flag">Open to meet: {user.meetNote}</div>}
        </div>
        <div className="profile-actions">
          {!isMe && (
            <>
              <button type="button" className="btn ghost" onClick={() => app.toggleFollow(user.id)}>
                {app.following.includes(user.id) ? "Following" : "Follow"}
              </button>
              <button type="button" className="btn dark" onClick={() => app.sayHi(user.id)} disabled={app.saidHi.includes(user.id)}>
                {app.saidHi.includes(user.id) ? "Said hi" : "Say hi"}
              </button>
              <button type="button" className="text-btn" onClick={() => setMenu((v) => !v)}>
                ···
              </button>
              {menu && (
                <div className="menu static">
                  <button
                    type="button"
                    onClick={() => {
                      app.toast("Reported. A moderator will look at posts that are not about a car.");
                      setMenu(false);
                    }}
                  >
                    Report
                  </button>
                  <button type="button" onClick={() => app.blockUser(user.id)}>
                    Block
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </header>
      <div className="stats inline">
        <div>
          <strong>{fmt(user.followers)}</strong>
          <span>followers</span>
        </div>
        <div>
          <strong>{posts.length}</strong>
          <span>posts</span>
        </div>
        <div>
          <strong>{fmt(user.likes)}</strong>
          <span>likes</span>
        </div>
      </div>
      <div className="profile-cars">
        {cars.map((c) => (
          <Link key={c.id} to={`/garage/${c.id}`} className="card mini-car">
            <img src={c.photo} alt="" />
            <div>
              <strong>{carTitle(c)}</strong>
              <small>
                {c.year} · {c.power} · {c.mods.length} mods
              </small>
            </div>
          </Link>
        ))}
      </div>
      <div className="profile-posts">
        {posts.map((p) => (
          <Link key={p.id} to={p.guideId ? `/guide/${p.guideId}` : `/p/${p.id}`} className="shot">
            <img src={p.photos[0]} alt={p.title} />
            <span>{p.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
