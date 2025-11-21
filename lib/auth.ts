import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const isProd = process.env.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (isBuild ? "build-secret-temporary" : !isProd ? "dev-secret-change-me" : undefined);

// Ne pas lancer d'erreur lors du build, seulement à l'exécution
if (!authSecret && !isBuild) {
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
