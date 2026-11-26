export const roadmapTags = {
  roadmaps: "roadmaps",
  roadmap: (slug: string) => `roadmap:${slug}`,
  progress: (userId: string) => `roadmap-progress:${userId}`,
};
