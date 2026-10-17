import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { ArticlesPage } from "./pages/ArticlesPage";
import { CarPage } from "./pages/CarPage";
import { EventsPage } from "./pages/EventsPage";
import { Feed } from "./pages/Feed";
import { GuidePage } from "./pages/GuidePage";
import { MapPage } from "./pages/MapPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotesPage } from "./pages/NotesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AppProvider } from "./store";

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Feed />} />
            <Route path="/p/:postId" element={<Feed />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/garage" element={<CarPage />} />
            <Route path="/garage/:carId" element={<CarPage />} />
            <Route path="/guide/:guideId" element={<GuidePage />} />
            <Route path="/u/:userId" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
