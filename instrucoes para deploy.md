# 🚀 Guia Completo de Deploy na VPS Integrator (ICP Panel)
## Projeto: Portfólio Profissional (meu-site-portifolio)

Guia passo a passo, detalhado e descomplicado para subir o seu **Portfólio** na sua VPS da Integrator usando o painel **ICP (Integrator Container Panel)**.

---

## ❓ Arquitetura e Decisão de Runtime na VPS

> ### 🏆 **Recomendação: Execução Direta via PM2**

Para a sua VPS na Integrator (`vps6663`), onde você já possui outros projetos em `/opt`:

1. **Baixo Consumo de Recursos**:
   - O **PM2** executa o NestJS e o Next.js diretamente sobre o Node.js da VPS, consumindo em média apenas **60MB a 120MB de RAM**.
2. **Integração Nativamente com o ICP Panel**:
   - O painel ICP gerencia o **Proxy Reverso Nginx** com certificado **SSL/HTTPS automático e gratuito** (Let's Encrypt).
3. **Persistência de Arquivos e Banco SQLite**:
   - O banco de dados SQLite (`dev.db`) e os uploads de capas/fotos (`uploads/`) ficam diretamente no disco da VPS, com backup simplificado e sem volumes complexos.

---

## 📋 Mapeamento de Portas e Configurações

> 💡 **Evitando conflitos de portas:**
> - `sep-panel`: portas `3000` / `3001`
> - `personal-tasks`: portas `3003` / `3004`
> - **`meu-site-portifolio`**: definimos as portas **`3005` (Backend)** e **`3006` (Frontend)**.

| Item | Valor / Configuração |
|---|---|
| **Diretório na VPS** | `/opt/meu-site-portifolio` |
| **Backend** | NestJS 10 + Prisma ORM (SQLite) |
| **Porta Backend (Interna)** | `3005` |
| **Frontend** | Next.js 14 (App Router, React 18) |
| **Porta Frontend (Interna)** | `3006` |
| **Repositório GitHub** | `https://github.com/denilsonferreiradearaujo/meu-site-portifolio.git` |
| **Painel ICP** | `https://vps6663.panel.icontainer.run:2090` |
| **Sugestão Subdomínio Frontend** | `https://portifolio.vps6663.panel.icontainer.run` |
| **Sugestão Subdomínio Backend (API)** | `https://portifolio-api.vps6663.panel.icontainer.run` |

---

## 🛠️ Passo a Passo Completo do Primeiro Deploy

---

### 📝 Passo 1 — Criar os Subdomínios e Proxy Reverso no Painel ICP

No painel ICP (`https://vps6663.panel.icontainer.run:2090`):

1. **Subdomínio do Frontend**:
   - Vá em **Websites** (ou **Domains**) ➜ **Create Website / Reverse Proxy**.
   - **Domínio/Subdomínio:** `portifolio.vps6663.panel.icontainer.run` (ou seu domínio próprio).
   - **Target / Destino:** `http://127.0.0.1:3006`
   - Ative o **SSL Let's Encrypt** (HTTPS).

2. **Subdomínio do Backend (API)**:
   - Crie outro Proxy Reverso:
   - **Domínio/Subdomínio:** `portifolio-api.vps6663.panel.icontainer.run`
   - **Target / Destino:** `http://127.0.0.1:3005`
   - Ative o **SSL Let's Encrypt** (HTTPS).

---

### 📝 Passo 2 — Clonar o Projeto na VPS via Terminal

1. Abra o Terminal no ICP (menu **Server ➜ Terminal**) ou acesse via SSH.
2. Navegue até a pasta `/opt`:
```bash
cd /opt
```
3. Clone o repositório:
```bash
git clone https://github.com/denilsonferreiradearaujo/meu-site-portifolio.git meu-site-portifolio
```
4. Entre no diretório:
```bash
cd /opt/meu-site-portifolio
```

---

### 📝 Passo 3 — Configurar o Backend (NestJS)

1. Entre na pasta do backend:
```bash
cd /opt/meu-site-portifolio/backend
```

2. Crie o arquivo `.env` de produção gerando uma chave JWT única e segura:

Gere uma chave criptográfica forte diretamente no terminal da VPS:
```bash
openssl rand -base64 32
```

Copie a chave gerada e crie o seu arquivo `.env`:
```bash
cat > .env << 'EOF'
PORT=3005
NODE_ENV=production
DATABASE_URL="file:./dev.db"

# Cole aqui a chave gerada pelo comando 'openssl rand -base64 32':
JWT_SECRET="COLE_AQUI_A_CHAVE_GERADA_PELO_OPENSSL"

# Suas credenciais de acesso ao painel /admin (escolha seu e-mail e senha):
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD=SuaSenhaForteAqui@2026

# Domínio do Frontend permitido no CORS (ajuste se usar domínio próprio):
CORS_ORIGIN=https://portifolio.vps6663.panel.icontainer.run
EOF
```

> 💡 **Dica de automação rápida:** Se preferir gerar e salvar tudo diretamente em um único comando no terminal da VPS:
> ```bash
> cat > .env << EOF
> PORT=3005
> NODE_ENV=production
> DATABASE_URL="file:./dev.db"
> JWT_SECRET="$(openssl rand -base64 32)"
> ADMIN_EMAIL="seu-email@dominio.com"
> ADMIN_PASSWORD="SuaSenhaForteAqui@2026"
> CORS_ORIGIN=https://portifolio.vps6663.panel.icontainer.run
> EOF
> ```

3. Instale as dependências:
```bash
npm install
```

4. Sincronize o banco de dados com o Prisma:
```bash
npx prisma generate
npx prisma db push
```

5. Execute o seed inicial para criar seu usuário e perfil:
```bash
npm run prisma:seed
```

6. Compile o backend:
```bash
npm run build
```

7. Inicie o backend no PM2:
```bash
pm2 start dist/src/main.js --name "portfolio-backend"
```

---

### 📝 Passo 4 — Configurar o Frontend (Next.js)

1. Entre na pasta do frontend:
```bash
cd /opt/meu-site-portifolio/frontend
```

2. Crie o arquivo `.env.local` apontando para a sua API pública:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://portifolio-api.vps6663.panel.icontainer.run/api
NEXT_PUBLIC_BACKEND_URL=https://portifolio-api.vps6663.panel.icontainer.run
EOF
```

3. Instale as dependências:
```bash
npm install
```

4. Compile o frontend para produção:
```bash
npm run build
```

5. Inicie o frontend no PM2 (na porta 3006):
```bash
pm2 start npm --name "portfolio-frontend" -- start -- -p 3006
```

---

### 📝 Passo 5 — Salvar e Persistir no PM2

Para que ambos os serviços iniciem automaticamente caso a VPS reinicie:
```bash
pm2 save
```

Para verificar se tudo está rodando:
```bash
pm2 status
```
*(Você verá `portfolio-backend` e `portfolio-frontend` com status **online**).*

---

## ⚡ Atualizações Futuras com o Script Automatizado

Sempre que você fizer novos commits e push no GitHub, para atualizar sua VPS basta rodar um único comando:

```bash
cd /opt/meu-site-portifolio
chmod +x deploy.sh
./deploy.sh
```

O script fará automaticamente:
1. `git pull` das últimas alterações do repositório
2. `npm install` no backend e frontend
3. Migração do Prisma no banco de dados
4. Build de produção do NestJS e Next.js
5. Reinício suave no PM2 sem interrupção de serviço
6. Registro de logs com data/hora em `deploy-logs/`

---

## 🔍 Comandos Úteis para Diagnóstico

- Ver logs em tempo real do Backend:
  ```bash
  pm2 logs portfolio-backend
  ```
- Ver logs em tempo real do Frontend:
  ```bash
  pm2 logs portfolio-frontend
  ```
- Reiniciar os serviços manualmente:
  ```bash
  pm2 restart portfolio-backend
  pm2 restart portfolio-frontend
  ```
