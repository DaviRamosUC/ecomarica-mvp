# Prompt para o Claude Code — MVP do EcoMaricá

> Cole este prompt inteiro como a primeira mensagem de uma sessão do Claude Code,
> aberta na raiz da pasta `ecomarica-mvp/` (a mesma que você recebeu em anexo).

---

Você vai continuar o desenvolvimento do MVP do **EcoMaricá**, uma plataforma
mobile-first de incentivo à coleta seletiva de resíduos domiciliares no
município de Maricá (RJ). Trabalhe **dentro deste repositório**, que já
contém um scaffold inicial.

## Contexto do produto

O EcoMaricá conecta três papéis:
- **Doador** — mora na cidade, sinaliza no app quando tem resíduo reciclável disponível, acumula **pontos** por coleta confirmada e pode converter esses pontos em **moeda social** do município ao final do mês.
- **Coletor** — vê no mapa as coletas sinalizadas na sua área, segue uma rota otimizada e confirma cada coleta (com peso real e foto de evidência — camada antifraude).
- **Prefeitura** — gerencia os tipos de resíduo e seus fatores de pontuação, a taxa de conversão em moeda social, homologa coletores e acompanha indicadores de impacto por bairro. Acessado como painel web (não mobile).

## Estado atual do repositório

```
ecomarica-mvp/
├── docker-compose.yml          # serviço "frontend" já configurado
└── frontend/                   # Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
    ├── app/
    │   ├── login/page.tsx       # Tela 1 — Login (PRONTA, use como referência de padrão)
    │   ├── page.tsx             # redireciona "/" → "/login"
    │   └── globals.css          # design tokens (cores) definidos em @theme
    ├── components/
    │   ├── ui/Button.tsx        # variants: primary | secondary | ghost
    │   ├── ui/TextField.tsx     # input com label, erro inline e rightSlot
    │   ├── Logo.tsx             # marca EcoMaricá (SVG)
    │   └── GovBadge.tsx         # selo "Programa oficial da Prefeitura de Maricá"
    └── Dockerfile
```

**Não há back-end ainda.** Todas as telas desta fase devem usar dados
mockados/estado local em memória (arrays/objetos no próprio componente ou em
`lib/mocks/`). Estruture os dados como se viessem de uma API real (mesmo
formato de campos do diagrama de classes do projeto), para facilitar a troca
por chamadas reais depois.

## Restrição de ambiente — **use Docker para tudo**

Esta máquina não tem Node/npm instalados fora de container. Todo comando de
desenvolvimento (instalar dependência, rodar dev server, build, lint) deve
ser executado **dentro do container Docker**, nunca diretamente no host.

```bash
# subir o ambiente de desenvolvimento (hot reload já configurado via volume)
docker compose up -d --build

# rodar comandos npm dentro do container já em execução
docker compose exec frontend npm run lint
docker compose exec frontend npm run build

# instalar uma dependência nova
docker compose exec frontend npm install <pacote>

# ver logs
docker compose logs -f frontend

# derrubar
docker compose down
```

Antes de considerar qualquer tela "pronta", confirme dentro do container que:
1. `npm run build` passa sem erros;
2. `npm run lint` passa sem erros;
3. a rota responde 200 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<rota>`).

## Design system (já definido — reutilize, não reinvente)

Cores (Tailwind, em `app/globals.css`, tema `@theme inline`):
- `brand-500` `#2E7D32` (+ `brand-50/100/400/600/700`) — verde do produto, ação primária
- `gov-blue` `#005CAA`, `gov-navy` `#1D2A44`, `gov-red` `#E30613`, `gov-bg` `#F4F6F9` — paleta institucional da Prefeitura de Maricá, usada com moderação (textos, selo institucional, fundo neutro)

Convenções:
- Mobile-first, largura de conteúdo `max-w-sm` centralizada, pensada para telas de smartphone; os dois painéis da Prefeitura (telas 14 e 15) são a exceção — são web/desktop.
- Botões: `rounded-full`, variantes `primary` (verde, ações principais) / `secondary` (outline) / `ghost`.
- Cards: `rounded-2xl`, `ring-1 ring-gov-navy/5`, `shadow-sm`.
- Ícones: pode usar `lucide-react` (adicione a dependência se ainda não estiver instalada) em vez de emojis — os wireframes usavam emoji só como placeholder de baixa fidelidade.
- Reaproveite `Button`, `TextField`, `Logo`, `GovBadge` de `components/`; crie novos componentes reutilizáveis em `components/ui/` sempre que um padrão se repetir entre telas (ex.: `Card`, `BottomNav`, `StatusPill`, `MapPlaceholder`).

## Regra de execução — **uma tela por vez**

Isto é o mais importante deste prompt:

1. Implemente **apenas uma tela por vez**, seguindo a ordem abaixo.
2. Ao terminar uma tela, rode as validações do Docker acima, faça um resumo
   curto do que foi criado (arquivos, rota, decisões de UX relevantes) e
   **pare — não comece a próxima tela sem minha confirmação explícita**.
3. Se eu pedir ajustes na tela atual, aplique e valide de novo antes de
   perguntar se posso seguir.
4. Não crie rotas, componentes ou dados mockados de telas futuras
   "adiantado" — só o que a tela da vez precisa.

## Ordem das telas a construir

1. ~~Login~~ — já implementada em `app/login/page.tsx`
2. **Cadastro** — seleção de papel (Doador/Coletor), dados pessoais, endereço, senha, aceite de termos
3. **Dashboard do Doador** — saldo de pontos em destaque, botão "Sinalizar resíduo", lista de próximas coletas
4. **Sinalizar Coleta** — seleção de tipo de resíduo (ícones), quantidade estimada, localização, foto opcional
5. **Confirmação da Sinalização** — feedback pós-envio, status e pontos estimados
6. **Meus Pontos & Conversão** — saldo, taxa de conversão, extrato de transações
7. **Histórico de Coletas** (Doador) — lista filtrável por status
8. **Dashboard do Coletor** — mapa (placeholder) com coletas na área, estatísticas do dia, lista
9. **Rota & Detalhe da Coleta** (Coletor) — progresso da rota, parada atual, ações
10. **Confirmar Coleta** (Coletor) — peso real, foto de evidência, toggle de compatibilidade
11. **Perfil & Configurações** — comum a doador/coletor (campos condicionais por papel)
12. **Notificações** — lista de avisos do sistema
13. **Painel da Prefeitura — Dashboard** — indicadores institucionais (web/desktop)
14. **Painel da Prefeitura — Tipos de Resíduo** — tabela editável de fatores de pontuação e taxa de conversão (web/desktop)

Use os wireframes (documento em anexo/consulte comigo se precisar reabrir)
como referência de estrutura de cada tela — layout, hierarquia e conteúdo de
cada uma já foram validados; a decisão em aberto aqui é só a implementação em
código.

## Antes de começar

Confirme comigo que entendeu o estado atual do repositório e a ordem das
telas, e então comece pela **tela 2 — Cadastro**.
