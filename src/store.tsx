import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cars as seedCars,
  events as seedEvents,
  guides as seedGuides,
  initialFollowing,
  messages as seedMessages,
  ME_ID,
  posts as seedPosts,
  users as seedUsers,
} from "./data";
import type { Car, DirectMessage, Guide, MeetEvent, Post, PostType, User } from "./types";

const STORAGE_KEY = "revwheel-state-v1";

export type AppState = {
  users: User[];
  cars: Car[];
  posts: Post[];
  guides: Guide[];
  events: MeetEvent[];
  messages: DirectMessage[];
  following: string[];
  blocked: string[];
  saidHi: string[];
};

type ComposerState = { open: boolean; type: PostType | null };

type Store = AppState & {
  me: User;
  composer: ComposerState;
  toasts: { id: string; text: string }[];
  openComposer: (type?: PostType | null) => void;
  closeComposer: () => void;
  toast: (text: string) => void;
  toggleLikePost: (id: string) => void;
  toggleSavePost: (id: string) => void;
  addPostComment: (id: string, text: string) => void;
  toggleLikeGuide: (id: string) => void;
  toggleSaveGuide: (id: string) => void;
  addGuideComment: (id: string, text: string) => void;
  toggleFollow: (userId: string) => void;
  sayHi: (userId: string, text?: string) => void;
  sendMessage: (toId: string, text: string, context?: string) => void;
  toggleJoin: (eventId: string) => void;
  toggleOpenToMeet: () => void;
  blockUser: (userId: string) => void;
  publishPost: (post: Post) => void;
  saveCar: (car: Car) => void;
  addMod: (carId: string, mod: Car["mods"][number]) => void;
  addGuide: (guide: Guide) => void;
};

const StoreContext = createContext<Store | null>(null);

function seed(): AppState {
  return {
    users: seedUsers,
    cars: seedCars,
    posts: seedPosts,
    guides: seedGuides,
    events: seedEvents,
    messages: seedMessages,
    following: initialFollowing,
    blocked: [],
    saidHi: [],
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.posts || !parsed.cars || !parsed.users) return seed();
    return { ...seed(), ...parsed };
  } catch {
    return seed();
  }
}

export function carTitle(car: Car) {
  return `${car.make} ${car.model}`;
}

export function completeness(car: Car) {
  const specs = [
    car.year,
    car.mileage,
    car.power,
    car.torque,
    car.engine,
    car.gearbox,
    car.drive,
    car.fuel,
    car.color,
    car.trim,
  ];
  const specScore = specs.filter(Boolean).length * 4;
  const photoScore = Math.min(car.gallery.length, 12) * 3;
  const serviceScore = Math.min(car.service.length, 5) * 3;
  const modScore = car.mods.length > 0 ? 5 : 0;
  const storyScore = car.story.trim() ? 4 : 0;
  return Math.min(100, specScore + photoScore + serviceScore + modScore + storyScore);
}

export function completenessHint(car: Car) {
  const missing: string[] = [];
  const photosLeft = Math.max(0, 12 - car.gallery.length);
  const serviceLeft = Math.max(0, 5 - car.service.length);
  if (serviceLeft) missing.push("the service history");
  if (photosLeft) missing.push(`${photosLeft} more photo${photosLeft === 1 ? "" : "s"}`);
  if (!car.story.trim()) missing.push("a short story about the car");
  if (!missing.length) return "The card is full. People can trust what they see.";
  return `Add ${missing.join(" and ")} to reach 100%.`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [composer, setComposer] = useState<ComposerState>({ open: false, type: null });
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo<Store>(() => {
    const me = state.users.find((u) => u.id === ME_ID) ?? state.users[0];
    const toast = (text: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, text }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
    };
    const patchUser = (id: string, fn: (u: User) => User) =>
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? fn(u) : u)) }));

    return {
      ...state,
      me,
      composer,
      toasts,
      openComposer: (type = null) => setComposer({ open: true, type }),
      closeComposer: () => setComposer({ open: false, type: null }),
      toast,
      toggleLikePost: (id) =>
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
          ),
        })),
      toggleSavePost: (id) =>
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
        })),
      addPostComment: (id, text) =>
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    { id: `c-${Date.now()}`, userId: ME_ID, text, time: "just now" },
                  ],
                }
              : p,
          ),
        })),
      toggleLikeGuide: (id) =>
        setState((s) => ({
          ...s,
          guides: s.guides.map((g) =>
            g.id === id ? { ...g, liked: !g.liked, likes: g.likes + (g.liked ? -1 : 1) } : g,
          ),
        })),
      toggleSaveGuide: (id) =>
        setState((s) => ({
          ...s,
          guides: s.guides.map((g) => (g.id === id ? { ...g, saved: !g.saved } : g)),
        })),
      addGuideComment: (id, text) =>
        setState((s) => ({
          ...s,
          guides: s.guides.map((g) =>
            g.id === id
              ? {
                  ...g,
                  comments: [
                    ...g.comments,
                    { id: `gc-${Date.now()}`, userId: ME_ID, text, time: "just now" },
                  ],
                }
              : g,
          ),
        })),
      toggleFollow: (userId) =>
        setState((s) => {
          const on = s.following.includes(userId);
          return {
            ...s,
            following: on ? s.following.filter((id) => id !== userId) : [...s.following, userId],
            users: s.users.map((u) =>
              u.id === userId ? { ...u, followers: Math.max(0, u.followers + (on ? -1 : 1)) } : u,
            ),
          };
        }),
      sayHi: (userId, text) => {
        const user = state.users.find((u) => u.id === userId);
        const body = text?.trim() || `Hi ${user?.name.split(" ")[0] ?? ""} — I drive a ${me.carLabel} nearby and would like to trade notes.`;
        setState((s) => ({
          ...s,
          saidHi: s.saidHi.includes(userId) ? s.saidHi : [...s.saidHi, userId],
          messages: [
            {
              id: `m-${Date.now()}`,
              fromId: ME_ID,
              toId: userId,
              text: body,
              time: "just now",
              context: "Say hi",
            },
            ...s.messages,
          ],
        }));
        toast(`Said hi to ${user?.name ?? "them"}.`);
      },
      sendMessage: (toId, text, context) => {
        const user = state.users.find((u) => u.id === toId);
        setState((s) => ({
          ...s,
          messages: [
            { id: `m-${Date.now()}`, fromId: ME_ID, toId, text, time: "just now", context },
            ...s.messages,
          ],
        }));
        toast(`Message sent to ${user?.name ?? "them"}.`);
      },
      toggleJoin: (eventId) =>
        setState((s) => ({
          ...s,
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, joined: !e.joined, going: e.going + (e.joined ? -1 : 1) }
              : e,
          ),
        })),
      toggleOpenToMeet: () => {
        const next = !me.openToMeet;
        patchUser(ME_ID, (u) => ({ ...u, openToMeet: next }));
        toast(next ? "You are open to meet. Only your area is shown." : "Open to meet is off. You are hidden from the map.");
      },
      blockUser: (userId) => {
        const user = state.users.find((u) => u.id === userId);
        setState((s) => ({
          ...s,
          blocked: s.blocked.includes(userId) ? s.blocked : [...s.blocked, userId],
          following: s.following.filter((id) => id !== userId),
        }));
        toast(`${user?.name ?? "This person"} is blocked. Their posts are hidden.`);
      },
      publishPost: (post) => {
        setState((s) => ({ ...s, posts: [post, ...s.posts] }));
        setComposer({ open: false, type: null });
        toast("Posted. Only mods, repairs, and guides go on RevWheel.");
      },
      saveCar: (car) => {
        setState((s) => {
          const exists = s.cars.some((c) => c.id === car.id);
          return { ...s, cars: exists ? s.cars.map((c) => (c.id === car.id ? car : c)) : [car, ...s.cars] };
        });
        toast("Car card saved.");
      },
      addMod: (carId, mod) =>
        setState((s) => ({
          ...s,
          cars: s.cars.map((c) => (c.id === carId ? { ...c, mods: [mod, ...c.mods] } : c)),
        })),
      addGuide: (guide) => setState((s) => ({ ...s, guides: [guide, ...s.guides] })),
    };
  }, [state, composer, toasts]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
