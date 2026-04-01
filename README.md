# PCSP — Delegacia Digital | Sistema Integrado Operacional

Sistema web de painel interno da **Polícia Civil do Estado de São Paulo (PCSP)** com foco em emissão, gestão e execução de mandados de prisão.

---

## ▶ Como rodar localmente

**Pré-requisito:** Node.js 18+

```bash
# 1. Instalar dependências
npm install --legacy-peer-deps

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## 🏗️ Build de produção

```bash
npm run build
npm run preview   # visualizar o build localmente
```

---

## ☁️ Deploy (Vercel)

O projeto está pré-configurado para Vercel. Basta:

1. Fazer o **merge do PR** na branch `main`
2. O Vercel detecta automaticamente e faz o deploy

Configurações já definidas em `vercel.json`:
- Framework: Vite
- Build: `npm run build`
- Install: `npm install --legacy-peer-deps`

---

## 🧭 Módulos do sistema

| Módulo | Descrição |
|---|---|
| 🏠 Dashboard | Visão geral operacional |
| 👤 Indivíduos | Cadastro de investigados |
| 🚔 Veículos | Controle de veículos |
| ⚖️ **Mandados** | **Módulo principal** — Emissão e execução de mandados |
| 📦 Apreensões | Controle de materiais apreendidos |
| 📁 Bens | Bens bloqueados e sequestrados |
| 📡 Monitoramento | Monitoramento eletrônico de alvos |
| 📜 Logs | Registro auditável de todas as ações |

---

## ⚖️ Fluxo do Mandado de Prisão

1. Preencher o formulário (dados do investigado + fundamentação jurídica)
2. Clicar em **"PROTOCOLAR PEDIDO DE PRISÃO"**
3. Acompanhar o processamento em tempo real (animação com etapas)
4. Receber a decisão judicial simulada (DEFERIDO / EM ANÁLISE / INDEFERIDO)
5. Se deferido: visualizar o **documento oficial do mandado**
6. Ações disponíveis: baixar PDF, encaminhar para equipe, marcar como cumprido
