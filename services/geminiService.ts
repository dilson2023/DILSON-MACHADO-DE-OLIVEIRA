
import { GoogleGenAI } from "@google/genai";
import { SMSLog } from "../types";

/**
 * Generates an SMS template based on a prompt.
 */
export const generateSMSTemplate = async (prompt: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert SMS copywriter. Create a punchy, engaging SMS message (max 160 characters) based on the following request: "${prompt}". 
      Context for the recipients: ${context}. 
      You can use placeholders like {{name}}. Do not include any other text except the SMS message itself.`,
    });
    return response.text?.trim() || "Failed to generate template.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please try again.";
  }
};

/**
 * Generates an AI chatbot response for an incoming SMS message.
 * Understands context from previous messages in the thread.
 */
export const generateChatbotResponse = async (history: SMSLog[], contactName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Format history for context (limiting to last 5 for efficiency)
    const contextStr = history.slice(-5).map(log => 
      `${log.type === 'inbound' ? 'Customer' : 'Business'}: ${log.message}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional AI SMS Support Agent. 
      The customer's name is ${contactName}.
      
      Conversation History:
      ${contextStr}
      
      Respond to the latest message from the Customer.
      Rules:
      1. Response MUST be under 160 characters.
      2. Professional yet conversational tone.
      3. No emojis unless the customer used them.
      4. Answer questions directly using the provided context.
      5. Return ONLY the text of the message.`,
    });

    return response.text?.trim() || "I'm sorry, I'm having trouble processing your request. One of our agents will assist you shortly.";
  } catch (error) {
    console.error("Gemini Chatbot Error:", error);
    return "Thank you for your message. An agent will get back to you shortly.";
  }
};
