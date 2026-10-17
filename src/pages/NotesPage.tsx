import { Logo } from "../components/ui";

export function NotesPage() {
  return (
    <div className="notes-page">
      <header className="notes-head">
        <Logo />
        <h1>RevWheel: notes for the developer</h1>
      </header>
      <p className="notes-lead">
        A social network only for car enthusiasts: Instagram and Threads feel, Drive2-style detail. Everything shared must
        be about a car: modifications, repairs and guides. No general posts. The goals are to share real experience and to
        help people in the same city meet.
      </p>
      <div className="notes-grid">
        <section className="card">
          <h2>Content types (the only 3)</h2>
          <ul>
            <li>Modification: photos, part, brand, cost, install date, linked to a car</li>
            <li>Repair: problem, parts, cost, time, step photos, mileage</li>
            <li>Guide: long article with steps, tools list and photos per step</li>
            <li>No other post type. Every post must be attached to a car card.</li>
          </ul>
        </section>
        <section className="card">
          <h2>Car card</h2>
          <ul>
            <li>Photo, make, model, year, mileage, power, torque, engine, gearbox, drive, fuel, color, package</li>
            <li>Modifications list with category, part, brand, price, date and photos</li>
            <li>Service log with date and mileage</li>
            <li>Gallery, owner, followers, completeness bar</li>
            <li>A user can have several cars; one is shown as the main</li>
          </ul>
        </section>
        <section className="card">
          <h2>Feed</h2>
          <ul>
            <li>Following, Popular, Near me tabs</li>
            <li>Filters by type (mod, repair, guide) and by brand</li>
            <li>Like, comment, share, save on every post</li>
            <li>Post shows tag, car, key facts (parts, cost, time)</li>
            <li>Carousel of up to 12 photos</li>
          </ul>
        </section>
        <section className="card">
          <h2>Map and meetups</h2>
          <ul>
            <li>Map with places: coffee, garage night, drive, advice corner</li>
            <li>Users opt in with “Open to meet”; show approximate area only</li>
            <li>Join an event, message the host</li>
            <li>Filter by type and by city</li>
            <li>Report and block on every profile</li>
          </ul>
        </section>
        <section className="card">
          <h2>Screens in this build</h2>
          <ol>
            <li>Feed (home)</li>
            <li>Car card (my garage)</li>
            <li>Guide page (repair article)</li>
            <li>Map of meetups</li>
            <li>Articles, events list, messages, and the create-post form are in the app</li>
            <li>Still open: sign up, profile settings, a dedicated mobile layout</li>
          </ol>
        </section>
        <section className="card">
          <h2>Open questions for the team</h2>
          <ul>
            <li>Login: email, Google, Apple?</li>
            <li>Photo limits and compression</li>
            <li>Moderation: manual or automatic checks for off-topic posts</li>
            <li>Languages: English first, then others</li>
            <li>Monetization later: parts shops, event partners</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
