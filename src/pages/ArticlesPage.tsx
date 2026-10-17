import { Link, useSearchParams } from "react-router-dom";
import { TypePill } from "../components/ui";
import { useApp, carTitle } from "../store";

export function ArticlesPage() {
  const app = useApp();
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();
  const guides = app.guides.filter((g) => {
    if (app.blocked.includes(g.userId)) return false;
    if (!q) return true;
    const car = app.cars.find((c) => c.id === g.carId);
    return `${g.title} ${g.crumb} ${car ? carTitle(car) : ""}`.toLowerCase().includes(q);
  });
  return (
    <div className="board">
      <header className="board-head">
        <h1>Articles</h1>
        <p>Long guides, the Drive2 kind: steps, tools, and the car they belong to.</p>
      </header>
      <div className="article-grid">
        {guides.map((g) => {
          const car = app.cars.find((c) => c.id === g.carId);
          const author = app.users.find((u) => u.id === g.userId);
          return (
            <Link key={g.id} to={`/guide/${g.id}`} className="article-card">
              <img src={g.cover} alt="" />
              <div>
                <TypePill type={g.type} />
                <h2>{g.title}</h2>
                <p>
                  {author?.name} · {car ? carTitle(car) : ""} · {g.time} · {g.cost}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
