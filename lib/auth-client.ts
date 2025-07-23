import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [nextCookies()],
});
