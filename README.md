# Portfólio Full Stack - Aplicação Moderna (Next.js + NestJS)

Projeto de portfólio profissional moderno, desenvolvido com arquitetura em camadas de alto padrão, desacoplada e componentizada:

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + CSS puro com variáveis customizadas, efeitos de revelação (IntersectionObserver), carrossel snap, tema dinâmico e parallax suave.
- **Backend**: NestJS 10 (TypeScript) estruturado em módulos (Auth, Profile, Projects, Upload), arquitetura modular com DTOs, validações (`class-validator`), segurança JWT e criptografia `bcrypt`.
- **Banco de Dados**: SQLite via Prisma ORM (leve para desenvolvimento local, facilmente portável para PostgreSQL/MySQL em produção).
- **Armazenamento de Mídia**: Upload local seguro com validação de formato e tamanho para fotos de perfil e capas de projetos.
- **Painel Administrativo**: Interface interativa em `/admin` para personalização completa de dados, fotos, redes sociais e projetos em tempo real.

---

## 📁 Estrutura do Projeto

```text
meu-site-portifolio/
├── backend/                  # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos do banco (User, Profile, Project)
│   │   └── seed.ts           # Script de inicialização dos dados e usuário admin
│   ├── uploads/              # Imagens e arquivos enviados
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticação JWT, Guard, Strategy e DTOs
│   │   │   ├── profile/      # Consulta e atualização de perfil
│   │   │   ├── projects/     # CRUD completo de projetos
│   │   │   └── upload/       # Upload seguro de fotos e capas
│   │   ├── prisma/           # Serviço global de banco de dados
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example          # Modelo de variáveis de ambiente do backend
│   └── package.json
│
├── frontend/                 # Aplicação Next.js
│   ├── public/               # Ativos estáticos e fallbacks
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css   # Estilos globais, efeitos e variáveis de tema
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Portfólio público dinâmico
│   │   │   └── admin/        # Painel de configurações protegido por login
│   │   ├── components/       # Componentes modulares (Hero, About, Projects, etc.)
│   │   ├── services/         # Camada de comunicação com a API (api.ts)
│   │   └── types/            # Definições TypeScript
│   ├── .env.example          # Modelo de variáveis de ambiente do frontend
│   └── package.json
│
├── deploy.sh                 # Script bash para automação de deploy na VPS com PM2
└── instrucoes para deploy.md # Guia completo passo a passo de deploy
```

---

## 🚀 Como Clonar e Executar

### 1. Clonar o Repositório
```bash
git clone https://github.com/denilsonferreiradearaujo/meu-site-portifolio.git
cd meu-site-portifolio
```

### 2. Configurar e Iniciar o Backend (NestJS)

1. Entre na pasta `backend` e instale as dependências:
   ```bash
   cd backend
   npm install
   ```

2. Crie o seu arquivo `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. No arquivo `.env`, configure suas variáveis e **defina o seu e-mail e a senha de administrador**:
   ```env
   PORT=3001
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="sua-chave-secreta-forte-aqui"
   CORS_ORIGIN="http://localhost:3000"

   # Credenciais do Administrador
   ADMIN_EMAIL="seu-email@dominio.com"
   ADMIN_PASSWORD="SuaSenhaSuperSegura"
   ```

4. *(Opcional)* Se desejar personalizar previamente os textos iniciais, bio e projetos padrão antes de inicializar o banco, edite o arquivo `backend/prisma/seed.ts`.

5. Gere o banco de dados e execute o **seed** com suas credenciais:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

6. Inicie o backend:
   ```bash
   npm run start:dev
   ```
   A API iniciará em: `http://localhost:3001/api`

---

### 3. Configurar e Iniciar o Frontend (Next.js)

1. Em outro terminal, na raiz do projeto, acesse a pasta `frontend` e instale as dependências:
   ```bash
   cd frontend
   npm install
   ```

2. Crie o seu arquivo `.env.local` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   *(Verifique se a variável `NEXT_PUBLIC_API_URL` aponta para `http://localhost:3001/api`).*

3. Inicie o servidor frontend:
   ```bash
   npm run dev
   ```
   O portfólio estará acessível em: `http://localhost:3000`

---

## 🔐 Acesso Administrativo (Painel de Configurações)

- Acesse a rota: `http://localhost:3000/admin` *(ou faça 3 cliques consecutivos no monograma `DA` no menu lateral)*.
- **E-mail**: Informe o e-mail que você cadastrou no seu `.env` (`ADMIN_EMAIL`).
- **Senha**: Digite a senha definida no seu `.env` (`ADMIN_PASSWORD`).
- Uma vez autenticado, você terá acesso completo para:
  - Alterar nome, títulos, biografia profissional, anos de experiência e habilidades.
  - Atualizar foto de perfil e anexar um novo currículo em PDF.
  - Adicionar, editar e remover links de redes sociais (LinkedIn, GitHub, WhatsApp, etc.).
  - Gerenciar projetos cadastrados (adicionar novo projeto via modal, editar informações, atualizar fotos de capa e ordenar exibição).
