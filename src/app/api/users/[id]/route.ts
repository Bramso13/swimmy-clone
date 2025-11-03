import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur peut accéder à ces informations (soi-même ou admin)
    if (session.user.id !== params.id) {
      // Vérifier si l'utilisateur est owner/admin pour voir d'autres profils
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      
      if (currentUser?.role !== "owner") {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        image: true,
        bio: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const isSelf = session.user.id === params.id;
    const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    const isOwner = current?.role === "owner";

    // Autorisations:
    // - L'utilisateur peut modifier SON propre profil (name, image, avatarUrl)
    // - Un owner peut modifier des champs supplémentaires (email, role) pour n'importe qui
    if (!isSelf && !isOwner) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, avatarUrl, image, bio, dateOfBirth } = body || {};

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (image !== undefined) data.image = image;
    if (bio !== undefined) data.bio = bio;
    if (dateOfBirth !== undefined) {
      try {
        data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      } catch {}
    }
    // Champs réservés aux owners
    if (isOwner) {
      if (email !== undefined) data.email = email;
      if (role !== undefined) data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucun champ modifiable fourni" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, image: true, bio: true, dateOfBirth: true, updatedAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const current = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (current?.role !== "owner") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

