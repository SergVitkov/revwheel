export type PostType = "mod" | "repair" | "guide";

export type Fact = { label: string; value: string };

export type Comment = {
  id: string;
  userId: string;
  text: string;
  time: string;
};

export type User = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  city: string;
  area: string;
  carLabel: string;
  distance?: string;
  followers: number;
  likes: number;
  openToMeet: boolean;
  meetNote: string;
  bio: string;
};

export type Modification = {
  id: string;
  category: "Engine" | "Suspension" | "Brakes" | "Wheels" | "Exterior";
  title: string;
  detail: string;
  photo: string;
  guideId?: string;
};

export type ServiceEntry = {
  id: string;
  title: string;
  when: string;
  mileage: string;
};

export type Car = {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  power: string;
  torque: string;
  engine: string;
  gearbox: string;
  drive: string;
  fuel: string;
  color: string;
  trim: string;
  photo: string;
  gallery: string[];
  mods: Modification[];
  service: ServiceEntry[];
  story: string;
};

export type Post = {
  id: string;
  type: PostType;
  userId: string;
  carId: string;
  title: string;
  body: string;
  photos: string[];
  facts: Fact[];
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
  createdAt: string;
  time: string;
  guideId?: string;
  city: string;
};

export type GuideStep = {
  n: number;
  title: string;
  body: string;
  photos: string[];
};

export type GuidePart = { name: string; meta: string; tool?: boolean };

export type Guide = {
  id: string;
  type: PostType;
  userId: string;
  carId: string;
  title: string;
  crumb: string;
  difficulty: string;
  time: string;
  cost: string;
  tools: string;
  cover: string;
  photos: string[];
  parts: GuidePart[];
  steps: GuideStep[];
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
  related: string[];
};

export type MeetEvent = {
  id: string;
  n: number;
  title: string;
  place: string;
  when: string;
  day: string;
  date: string;
  time: string;
  type: "Coffee" | "Garage night" | "Drive" | "Advice";
  city: string;
  hostId: string;
  going: number;
  joined: boolean;
  open: number;
  people: string[];
  x: number;
  y: number;
  blurb: string;
};

export type DirectMessage = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  time: string;
  context?: string;
};
