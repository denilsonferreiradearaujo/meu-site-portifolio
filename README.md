# Portfólio Full Stack - Denilson Ferreira

Projeto de portfólio profissional moderno, reestruturado com fidelidade visual absoluta ao design original e arquitetura em camadas de alto padrão:

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + CSS puro com variáveis customizadas, efeitos de revelação (IntersectionObserver), carrossel snap, tema dinâmico e parallax suave.
- **Backend**: NestJS 10 (TypeScript) estruturado em módulos (Auth, Profile, Projects, Upload), arquitetura MVC/camadas com DTOs, validações (`class-validator`), segurança JWT e `bcrypt`.
- **Banco de Dados**: SQLite via Prisma ORM (leve para desenvolvimento local, facilmente portável para PostgreSQL no deploy).
- **Armazenamento de Mídia**: Upload local seguro com validação de extensão/tamanho para fotos de perfil e capas de projetos.

---

## 📁 Estrutura do Projeto

```text
Portifolio/
├── backend/                  # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos (User, Profile, Project)
│   │   └── seed.ts           # Popula o banco com os dados e projetos reais
│   ├── uploads/              # Imagens e PDF do currículo
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticação JWT, Guard, Strategy e DTOs
│   │   │   ├── profile/      # Consulta e atualização de perfil
│   │   │   ├── projects/     # CRUD completo de projetos
│   │   │   └── upload/       # Upload seguro de fotos e capas
│   │   ├── prisma/           # Serviço global de banco de dados
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env
│
├── frontend/                 # Aplicação Next.js
│   ├── public/               # Ativos estáticos e fallbacks
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css   # 100% dos estilos, efeitos e animações originais
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Portfólio público dinâmico
│   │   │   └── admin/        # Painel de configurações protegido por login
│   │   ├── components/       # Componentes modulares (Hero, About, Projects, etc.)
│   │   ├── services/         # Camada de comunicação com a API (api.ts)
│   │   └── types/            # Definições TypeScript
│   └── .env.local
│
└── Portfolio_Denilson_Atualizado_Efeitos_v2.html  # HTML monolítico original preservado
```

---

## 🚀 Como Executar

### 1. Backend (NestJS)
No terminal, dentro da pasta `backend`:
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run start:dev
```
A API iniciará em: `http://localhost:3001/api`

### 2. Frontend (Next.js)
Em outro terminal, dentro da pasta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
O portfólio estará acessível em: `http://localhost:3000`

---

## 🔐 Acesso Administrativo (Configurações)

- Acesse `http://localhost:3000/admin` ou clique no ícone da engrenagem `⚙` no menu lateral.
- **E-mail padrão**: `de.faraujo@hotmail.com`
- **Senha padrão inicial**: `admin123` (configurável no `.env` do backend)
- Permite alterar nome, títulos, biografias, habilidades, links de redes sociais, upload de nova foto e cadastro/edição de projetos com capa em tempo real!
