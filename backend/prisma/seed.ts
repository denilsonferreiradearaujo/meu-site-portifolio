import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * ====================================================================
 * INSTRUÇÃO DE INICIALIZAÇÃO DE USUÁRIO (SEED)
 * ====================================================================
 * Para garantir a segurança do seu projeto no GitHub, nenhuma senha
 * ou e-mail pessoal é mantido hardcoded neste arquivo.
 *
 * Ao realizar o deploy na sua VPS (Integrator):
 * 1. Crie seu arquivo .env na pasta 'backend/' a partir de .env.example
 * 2. Defina suas credenciais desejadas:
 *      ADMIN_EMAIL=seu-email@exemplo.com
 *      ADMIN_PASSWORD=sua-senha-super-segura
 * 3. Execute: npm run prisma:seed
 * ====================================================================
 */
async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'MudeEstaSenha@2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log('----------------------------------------------------------');
  console.log(`🔐 Configurando usuário administrador: ${adminEmail}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('⚠️ AVISO: Variável ADMIN_PASSWORD não encontrada no .env.');
    console.log('Defina ADMIN_EMAIL e ADMIN_PASSWORD no seu .env para personalizar.');
  }
  console.log('----------------------------------------------------------');

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      name: 'Denilson Ferreira',
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      name: 'Denilson Ferreira',
    },
  });

  console.log('Seeding profile data...');
  await prisma.profile.upsert({
    where: { id: 'default-profile' },
    update: {},
    create: {
      id: 'default-profile',
      name: 'Denilson Ferreira de Araujo',
      role: 'Desenvolvedor de Software e Soluções',
      status: 'Disponível para novos projetos',
      title: 'Transformando visão em realidade com código e experiência.',
      intro:
        'Desenvolvedor de soluções digitais com experiência em operações, logística, indicadores e aplicações corporativas. Projetos feitos para resolver problemas reais do negócio.',
      aboutTitle: 'Tecnologia com visão de negócio.',
      aboutSide:
        'Uma carreira construída entre operação, análise e desenvolvimento de soluções.',
      aboutText:
        'Minha trajetória combina experiência profissional com desenvolvimento de software, automação, dados e melhoria contínua.',
      years: '20+',
      skills:
        'HTML, CSS, JavaScript, React, Node.js, NestJS, PostgreSQL, MySQL, Power BI, Excel, Dashboards, Logística',
      cv: '/uploads/CV_Denilson_Ferreira_de_Araujo_Desenvolvedor_2026_ (1).pdf',
      contact: 'Tem uma ideia? Vamos transformar em projeto.',
      photo: '/FotoPerfil.png',
      linkedin: '',
      github: '',
      instagram: '',
      email: process.env.ADMIN_EMAIL || '',
      whatsapp: 'https://wa.me/5519999486552',
      customSocials: '[]',
    },
  });

  console.log('Seeding projects...');
  const count = await prisma.project.count();
  if (count === 0) {
    const defaultProjects = [
      {
        title: 'Agendador de Tarefas',
        category: 'Kanban e Gantt',
        description: 'Organização de atividades com visualizações em Kanban e Gantt.',
        url: 'https://personaltasks.vps6663.panel.icontainer.run/',
        image: '/uploads/Designer.png',
        orderIndex: 1,
      },
      {
        title: 'Monitoramento de Estoque',
        category: 'Dashboard corporativo',
        description: 'Painel de cadastro e monitoramento de estoque para centros de distribuição.',
        url: 'https://dashestoque.vps6663.panel.icontainer.run/',
        image: '',
        orderIndex: 2,
      },
      {
        title: 'Gerenciamento de Riscos',
        category: 'Governança e controle',
        description: 'Aplicação para registrar riscos e acompanhar planos de ação.',
        url: 'https://gestorcrises.vps6663.panel.icontainer.run/',
        image: '/uploads/Gestor risco.PNG',
        orderIndex: 3,
      },
    ];

    for (const proj of defaultProjects) {
      await prisma.project.create({
        data: proj,
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
