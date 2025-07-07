import { PrismaClient } from '@prisma/client';
import { medicalAIService } from './MedicalAIService.js';

const prisma = new PrismaClient();

export interface AssistantConfig {
  name: string;
  description?: string;
  instructions: string;
  modelProvider?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AssistantResponse {
  message: string;
  modelUsed: string;
  tokensUsed?: number;
  fallbackUsed: boolean;
}

export class CustomGPTService {
  async createAssistant(userId: string, config: AssistantConfig) {
    return prisma.customAssistant.create({ data: { ...config, userId } });
  }

  async updateAssistant(assistantId: string, updates: Partial<AssistantConfig>) {
    return prisma.customAssistant.update({ where: { id: assistantId }, data: updates });
  }

  async deleteAssistant(assistantId: string) {
    await prisma.customAssistant.delete({ where: { id: assistantId } });
  }

  async getUserAssistant(userId: string) {
    return prisma.customAssistant.findUnique({ where: { userId } });
  }

  async sendMessage(assistantId: string, message: string): Promise<AssistantResponse> {
    const assistant = await prisma.customAssistant.findUnique({ where: { id: assistantId }, include: { conversations: { take: 1, orderBy: { createdAt: 'desc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } }, attachments: true } });
    if (!assistant) throw new Error('Assistant not found');

    // Build context from recent messages (simplified)
    const history = assistant.conversations[0]?.messages.map(m => ({ role: m.role, content: m.content })) || [];

    const payload = {
      model: assistant.modelName,
      messages: [
        { role: 'system', content: assistant.instructions },
        ...history,
        { role: 'user', content: message }
      ],
      temperature: assistant.temperature,
      max_tokens: assistant.maxTokens
    };

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      await this.storeMessage(assistant.id, 'assistant', content, assistant.modelName, data.usage?.total_tokens, false);
      return { message: content, modelUsed: assistant.modelName, tokensUsed: data.usage?.total_tokens, fallbackUsed: false };
    } catch (err) {
      // Fallback to internal service
      const result = await medicalAIService.processQuery({ query: message, type: 'diagnosis' });
      await this.storeMessage(assistant.id, 'assistant', result.response, 'internal', undefined, true);
      return { message: result.response, modelUsed: 'internal', fallbackUsed: true };
    }
  }

  async createNewConversation(assistantId: string) {
    return prisma.assistantConversation.create({ data: { assistantId } });
  }

  async getConversationHistory(conversationId: string) {
    return prisma.assistantMessage.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  }

  private async storeMessage(assistantId: string, role: string, content: string, modelUsed?: string, tokensUsed?: number, fallbackUsed = false) {
    const conversation = await this.createNewConversation(assistantId);
    await prisma.assistantMessage.create({ data: { conversationId: conversation.id, role, content, modelUsed, tokensUsed, fallbackUsed } });
  }
}

export const customGPTService = new CustomGPTService();
