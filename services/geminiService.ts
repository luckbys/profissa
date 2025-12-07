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