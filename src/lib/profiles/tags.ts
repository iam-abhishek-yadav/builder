export const profileTags = {
  /** Any profile changed (handles, names): used by queries that render maker links. */
  profiles: "profiles",
  profile: (userId: string) => `profile:${userId}`,
};
