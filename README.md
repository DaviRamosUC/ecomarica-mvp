# EcoMaricá — MVP

## Como rodar (via Docker)

```bash
docker compose up
```

Acesse http://localhost:3000 — a rota raiz redireciona para `/login`.

## Estrutura

```
ecomarica-mvp/
├── docker-compose.yml
└── frontend/            # Next.js 15 + TypeScript + Tailwind CSS v4
    ├── app/
    │   ├── login/        # Tela 1 — Login (pronta)
    │   └── page.tsx       # redireciona para /login
    ├── components/
    │   ├── ui/            # Button, TextField (design system)
    │   ├── Logo.tsx
    │   └── GovBadge.tsx
    └── Dockerfile
```

## Paleta de marca (Tailwind, ver `app/globals.css`)

- `brand-500` `#2E7D32` — verde EcoMaricá (ações primárias)
- `gov-blue` `#005CAA`, `gov-navy` `#1D2A44`, `gov-red` `#E30613`, `gov-bg` `#F4F6F9` — paleta institucional da Prefeitura de Maricá

## Próximos passos

Ver `PROMPT_CLAUDE_CODE.md` para o prompt que conduz o restante do build,
tela a tela, dentro do Claude Code.
