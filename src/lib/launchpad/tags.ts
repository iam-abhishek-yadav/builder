/** Cache tags shared by cached queries and the Server Actions that invalidate them. */
export const tags = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  comments: (projectId: string) => `comments:${projectId}`,
  viewer: (userId: string) => `viewer:${userId}`,
};
