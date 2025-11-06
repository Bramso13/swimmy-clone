import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import bcrypt from "bcryptjs";
import { verify as argon2Verify, hash as argon2Hash } from "@node-rs/argon2";

// Changement de mot de passe pour l'utilisateur connecté
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    console.log("Changement mot de passe - User ID:", session.user.id);
    console.log("Champs reçus:", { hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword, newPasswordLength: newPassword?.length });
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    // Récupérer l'utilisateur et son email pour vérifier le mot de passe via Better Auth
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { id: true, email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer le compte pour vérifier et mettre à jour le mot de passe
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id as string,
        password: { not: null },
      },
      select: { id: true, password: true, providerId: true },
    });

    console.log("Compte trouvé:", { hasAccount: !!account, hasPassword: !!account?.password, providerId: account?.providerId });

    if (!account || !account.password) {
      // Vérifier s'il y a des comptes sans mot de passe
      const allAccounts = await prisma.account.findMany({
        where: { userId: session.user.id as string },
        select: { id: true, providerId: true, password: true },
      });
      console.log("Tous les comptes de l'utilisateur:", allAccounts);
      return NextResponse.json({ error: "Aucun compte avec mot de passe trouvé. Vous utilisez peut-être une connexion OAuth (Google, etc.)" }, { status: 400 });
    }

    const stored = account.password as string;
    
    // Log temporaire pour déboguer (à retirer en production)
    const hashPrefix = stored.substring(0, 30);
    console.log("Format hash détecté:", hashPrefix, "Provider:", account.providerId);
    console.log("Longueur du hash:", stored.length);
    
    // Vérifier le mot de passe actuel
    let ok = false;
    let verificationMethod = "none";
    try {
      // Essayer bcrypt d'abord (format le plus courant)
      if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
        verificationMethod = "bcrypt (détecté)";
        ok = await bcrypt.compare(currentPassword, stored);
        console.log("Vérification bcrypt:", ok);
      } 
      // Essayer argon2
      else if (stored.startsWith("$argon2")) {
        verificationMethod = "argon2 (détecté)";
        ok = await argon2Verify(stored, currentPassword);
        console.log("Vérification argon2:", ok);
      }
      // Si le format n'est pas reconnu, essayer quand même bcrypt (au cas où)
      else {
        verificationMethod = "bcrypt (fallback)";
        ok = await bcrypt.compare(currentPassword, stored);
        console.log("Vérification bcrypt (fallback):", ok);
        // Si ça ne fonctionne pas, essayer argon2
        if (!ok) {
          try {
            verificationMethod = "argon2 (fallback)";
            ok = await argon2Verify(stored, currentPassword);
            console.log("Vérification argon2 (fallback):", ok);
          } catch (e) {
            console.error("Erreur argon2 fallback:", e);
          }
        }
      }
    } catch (verifyError: any) {
      console.error("Erreur vérification mot de passe:", verifyError);
      console.error("Méthode utilisée:", verificationMethod);
      ok = false;
    }

    if (!ok) {
      console.log("Échec vérification - Méthode:", verificationMethod, "Hash prefix:", hashPrefix);
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }
    
    console.log("Vérification réussie avec méthode:", verificationMethod);

    // Hasher le nouveau mot de passe avec le même format que l'existant
    let hashed: string;
    if (stored.startsWith("$argon2")) {
      hashed = await argon2Hash(newPassword);
    } else {
      // Par défaut, utiliser bcrypt (format le plus courant avec Better Auth)
      hashed = await bcrypt.hash(newPassword, 10);
    }

    // Mettre à jour le mot de passe
    await prisma.account.update({ 
      where: { id: account.id }, 
      data: { password: hashed } 
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Erreur changement mot de passe:", e);
    return NextResponse.json({ error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}


