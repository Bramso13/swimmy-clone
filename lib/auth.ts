import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET est manquant. Ajoutez-le dans vos variables d'environnement pour lancer l'application."
  );
}

export const auth = betterAuth({
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
