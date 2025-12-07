import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const professionalizeDescription = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Transforme a seguinte descrição curta e informal de um serviço em uma descrição técnica, profissional e detalhada para um orçamento formal. Mantenha em português do Brasil. Seja conciso mas elegante.
      
      Entrada: "${text}"
      
      Saída (apenas o texto melhorado):`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return text; // Fallback to original text
  }
};

export const estimateServicePrice = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Atue como um especialista em orçamentos para autônomos no Brasil. 
      Baseado em dados de mercado, estime um valor médio único (apenas mão de obra ou serviço padrão) para a seguinte descrição: "${description}".
      
      Considere a complexidade implícita.
      Retorne APENAS o número puro (ex: 150.00). Não use "R$", texto ou faixas de preço. Se não conseguir estimar, retorne "0".`,
      config: {
        temperature: 0.2, // Lower temperature for more deterministic/factual output
      }
    });

    const text = response.text?.trim() || '';
    // Remove any non-numeric characters except dot and comma, then normalize decimal
    const numberStr = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    return numberStr;
  } catch (error) {
    console.error("Erro ao estimar preço:", error);
    return '';
  }
};

export interface BusinessContext {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalClients: number;
  openQuotes: number;
}

export const askBusinessCoach = async (message: string, context?: BusinessContext): Promise<string> => {
  try {
    let systemPrompt = `Você é um consultor de negócios experiente especializado em autônomos e MEI no Brasil. 
    Seu objetivo é ajudar o usuário a lucrar mais, organizar as finanças e crescer profissionalmente.
    Seja direto, prático e motivador. Use emojis ocasionalmente.
    Responda em português do Brasil.`;

    if (context) {
      systemPrompt += `
      
      DADOS DO NEGÓCIO DO USUÁRIO (MÊS ATUAL):
      - Faturamento: R$ ${context.monthlyRevenue.toFixed(2)}
      - Despesas: R$ ${context.monthlyExpenses.toFixed(2)}
      - Lucro Líquido: R$ ${context.monthlyProfit.toFixed(2)}
      - Total de Clientes: ${context.totalClients}
      - Orçamentos em Aberto: ${context.openQuotes}

      Use esses números para dar conselhos específicos. Se o lucro for baixo, sugira cortar gastos ou cobrar mais. Se tiver muitos orçamentos abertos, sugira follow-up.`;
    } else {
      systemPrompt += `
      
      O usuário está no plano Grátis, então você NÃO tem acesso aos números dele.
      Dê conselhos genéricos de boas práticas. 
      Se ele perguntar sobre "meus números" ou "quanto ganhei", explique que você não vê esses dados e SUGIRA que ele assine o Plano Profissional (Pro) para ter análises personalizadas.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nPergunta do Usuário: "${message}"`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Desculpe, estou pensando muito... tente novamente.";
  } catch (error) {
    console.error("Erro no Coach IA:", error);
    return "Tive um problema técnico. Tente novamente em instantes.";
  }
};