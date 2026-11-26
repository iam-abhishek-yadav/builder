export const practiceTags = {
  sheets: "sheets",
  sheet: (slug: string) => `sheet:${slug}`,
  progress: (userId: string) => `practice:${userId}`,
};
