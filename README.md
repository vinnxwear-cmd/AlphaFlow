# AlphaFlow

Next.js 15 + Tailwind + Supabase base para SaaS.

## Como rodar localmente

1. Copie `.env.example` para `.env.local` e adicione as chaves do Supabase.
2. Instale dependências:

```bash
npm install
```

3. Rode o servidor:

```bash
npm run dev
```

4. Deploy:
   - Faça push no GitHub
   - Conecte na Vercel
   - Configure variáveis:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```