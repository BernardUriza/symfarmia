import { generateMockPatient } from '../utils/mockDataGenerator';

export class DemoDataService {
  private static instance: DemoDataService;
  
  private constructor() {}
  
  static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService();
    }
    return DemoDataService.instance;
  }

  async getPatients() {
    await this.simulateDelay();
    return Array.from({ length: 10 }, (_, i) => generateMockPatient(i + 1));
  }

  async getPatient(id: string) {
    await this.simulateDelay();
    return generateMockPatient(parseInt(id));
  }

  async createPatient(data: any) {
    await this.simulateDelay();
    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
  }

  async updatePatient(id: string, data: any) {
    await this.simulateDelay();
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  }

  async deletePatient(id: string) {
    await this.simulateDelay();
    return { success: true, id };
  }

  private simulateDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const demoDataService = DemoDataService.getInstance();