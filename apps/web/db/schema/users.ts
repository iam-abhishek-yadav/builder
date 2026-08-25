import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").unique(),
  username: text("username").unique(),
  ...timestamps,
});
