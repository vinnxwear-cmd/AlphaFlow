import { GoogleGenAI } from "@google/genai";
import { Appointment, FinancialRecord } from "../types";

const apiKey = process.env.API_KEY || ''; // Safe fallback if env not set
const ai = new GoogleGenAI({ apiKey });

export const getFinancialAnalysis = async (records: FinancialRecord[]) => {
  if (!apiKey) return "API Key not configured.";

  const prompt = `
    Analise os seguintes registros financeiros de um estabelecimento (SaaS de Barbearia/Clínica).
    Dados JSON: ${JSON.stringify(records)}
    
    Por favor, forneça:
    1. Um resumo curto do fluxo de caixa.
    2. Identifique picos ou quedas anormais.
    3. Uma sugestão de ação para melhorar o lucro.
    
    Responda em formato de texto simples, curto e direto, usando formatação Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao analisar dados financeiros com IA.";
  }
};

export const getSmartSchedulingSuggestion = async (appointments: Appointment[], date: string) => {
  if (!apiKey) return "API Key not configured.";

  const prompt = `
    Atue como um assistente de agendamento inteligente.
    Aqui estão os agendamentos para o dia ${date}: ${JSON.stringify(appointments)}
    
    Sugira:
    1. Qual o melhor horário livre para encaixar um novo cliente de 45 minutos.
    2. Uma mensagem curta para enviar via WhatsApp para clientes antigos convidando para preencher horários vazios.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar sugestão de agendamento.";
  }
};

export const chatWithAI = async (message: string, context: string) => {
  if (!apiKey) return "API Key not configured.";

  const prompt = `
    Você é a NeonFlow AI, uma assistente virtual especializada em gestão de Barbearias e Clínicas.
    Contexto do sistema: ${context}
    
    Pergunta do usuário: ${message}
    
    Responda de forma profissional, moderna e prestativa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, estou indisponível no momento.";
  }
};
