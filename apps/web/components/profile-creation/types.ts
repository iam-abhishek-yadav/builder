export const PROFILE_STORAGE_KEY = "builder_profile";

export type ProfileData = {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  photoDataUrl: string;
};

export const DEFAULT_PROFILE: ProfileData = {
  name: "",
  title: "",
  bio: "",
  linkedin: "",
  photoDataUrl: "",
};

export function loadProfile(): ProfileData {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<ProfileData>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(data: ProfileData) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
}

export const PROFILE_STEPS = [
  {
    id: 1,
    title: "Personal Identity",
    subtitle: "Let's start with the basics. How should people identify you?",
  },
  {
    id: 2,
    title: "Professional Bio",
    subtitle: "Tell your career story in a few sentences.",
  },
  {
    id: 3,
    title: "Social Links",
    subtitle: "Where can people find you online?",
  },
  {
    id: 4,
    title: "Profile Portrait",
    subtitle: "Put a face to the name.",
  },
] as const;
