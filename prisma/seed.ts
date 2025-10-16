import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' }
  });

  if (existingAdmin) {
    console.log('✅ L\'utilisateur admin existe déjà');
    return;
  }

  // Créer l'utilisateur admin directement dans la base de données
  // Note: Le mot de passe sera géré par better-auth lors de la première connexion
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      name: 'Administrateur',
      role: 'admin',
      emailVerified: true,
    }
  });

  console.log('✅ Utilisateur admin créé avec succès!');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nom:', admin.name);
  console.log('🔑 Rôle:', admin.role);
  console.log('');
  console.log('⚠️  IMPORTANT: Vous devez maintenant:');
  console.log('1. Aller sur la page d\'inscription');
  console.log('2. Utiliser l\'email admin@admin.com');
  console.log('3. Définir le mot de passe admin1234');
  console.log('4. Better-auth mettra à jour le compte existant');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
