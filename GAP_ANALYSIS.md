# Análise de Gaps: App Atual vs. Promessa da Landing Page

Este documento detalha as funcionalidades prometidas na Landing Page (focadas em venda/conversão) que **não estão presentes** ou estão **parcialmente implementadas** na versão atual do aplicativo.

## 🚨 Gaps Críticos (Faltam Recursos Principais)

### 1. "Saiba exatamente quanto entra e sai" (Gestão Financeira)
**Promessa:** Controle financeiro completo (Fluxo de Caixa).
**Estado Atual:** O app apenas gera **documentos** (Orçamentos/Recibos) e calcula receita baseada em agendamentos concluídos.
**O que falta:**
- [ ] **Módulo de Despesas:** Não há lugar para registrar custos (ex: material, transporte, almoço).
- [ ] **Fluxo de Caixa Real:** Uma visão de `Receitas - Despesas = Lucro`.
- [ ] **Status de Pagamento:** Não é possível marcar um orçamento como "Pago" ou "Pendente" independente do agendamento.

### 2. "Meus dados estão seguros?" (Segurança e Backup)
**Promessa:** Segurança e tranquilidade ("Deixe a bagunça para trás").
**Estado Atual:** Dados salvos apenas no **LocalStorage/IndexedDB** do navegador.
**O que falta:**
- [ ] **Backup na Nuvem:** Se o usuário limpar o cache ou perder o celular, **perde tudo**.
- [ ] **Sincronização:** Impossível acessar de outro dispositivo (PC + Celular).
- [ ] **Exportação de Dados:** O usuário não consegue baixar um backup completo do banco de dados (apenas CSV de clientes).

### 3. "Assistente IA que ajuda a tomar decisões"
**Promessa:** Um "parceiro" inteligente para o negócio.
**Estado Atual:** A IA é "funcional": melhora textos e estima preços.
**O que falta:**
- [ ] **Chat/Insights:** Não há um "Chat" onde o usuário possa perguntar "Como posso lucrar mais esse mês?" ou "Estou cobrando barato?".
- [ ] **Análise de Dados:** A IA não lê os dados do usuário para dar dicas (ex: "Você tem 3 clientes inativos").

---

## ⚠️ Gaps de Experiência (Podem ser melhorados)

### 4. "Nunca mais perca um horário" (Agendamento Inteligente)
**Promessa:** Gestão infalível de tempo.
**Estado Atual:** Existe calendário e lista. Notificações dependem do navegador estar aberto/ativo.
**O que falta:**
- [ ] **Confirmação Automática:** Envio automático de msg no WhatsApp 1 dia antes (hoje é manual).
- [ ] **Bloqueio de Conflitos:** O sistema permite marcar dois clientes no mesmo horário sem aviso claro? (Necessário verificar teste de stress).

### 5. "Funciona Offline?"
**Promessa:** Alta disponibilidade.
**Estado Atual:** Sim, PWA funciona offline.
**O que falta:**
- [ ] **Sincronização Pós-Offline:** Como não há backend, isso funciona bem "sozinho", mas se houver backend futuro, a sincronização de conflitos será complexa.

---

## 📋 Tabela Comparativa

| Recurso | Landing Page (Venda) | App Real (Entrega) | Status |
| :--- | :--- | :--- | :--- |
| **Gestão de Clientes** | "Histórico na palma da mão" | ✅ Implementado (CRUD + Histórico) | **OK** |
| **Agendamento** | "Agenda organizada e lembretes" | ⚠️ Parcial (Lembretes locais simples) | **Médio** |
| **Financeiro** | "Entradas e Saídas (Fluxo de Caixa)" | ❌ Apenas Entradas (Docs/Serviços) | **Crítico** |
| **Inteligência Artificial** | "Ajuda a decidir e organizar" | ⚠️ Apenas Ferramenta de Texto/Preço | **Médio** |
| **Segurança** | "Dados seguros e acessíveis" | ❌ Risco Alto (Sem backup nuvem) | **Crítico** |
| **Orçamentos** | "Profissionais e rápidos" | ✅ Implementado (PDF + WhatsApp) | **OK** |

## 🚀 Recomendações Prioritárias

Para que o produto entregue o que a Landing Page vende, recomendo focar nas seguintes implementações imediatas (MVPs):

1.  **Criar Tela de "Movimentações" (Caixa):** Simples tabela de Entradas/Saídas manuais.
2.  **Implementar Exportação/Importação JSON:** Permitir que o usuário faça 'Backup' manual salvando um arquivo `.json` no Google Drive dele. Isso resolve a objeção de "perder dados" sem custo de servidor.
3.  **Ajustar Copy da Landing Page:** Se não formos implementar Expenses agora, mudar a frase "Saiba quanto entra e sai" para "Organize seus ganhos e orçamentos".
