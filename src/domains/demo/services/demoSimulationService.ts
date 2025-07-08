/**
 * Demo Simulation Service
 * 
 * Core service for managing medical demo simulations
 */

import {
  DemoStrategy,
  DemoInput,
  DemoResult,
  DemoSimulation,
  DemoServiceResponse,
  DemoSimulationSettings,
  DemoError,
  DemoStrategyError
} from '../types';

import { HIVPregnancyStrategy } from '../strategies/hivPregnancyStrategy';
import { EmergencyStrategy } from '../strategies/emergencyStrategy';
import { PediatricStrategy } from '../strategies/pediatricStrategy';
import { GeneralMedicineStrategy } from '../strategies/generalMedicineStrategy';

export class DemoSimulationService {
  private strategies = new Map<string, DemoStrategy>();
  private activeSimulations = new Map<string, DemoSimulation>();

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Initialize all available demo strategies
   */
  private initializeStrategies(): void {
    this.registerStrategy('hiv-pregnancy', new HIVPregnancyStrategy());
    this.registerStrategy('emergency', new EmergencyStrategy());
    this.registerStrategy('pediatric', new PediatricStrategy());
    this.registerStrategy('general-medicine', new GeneralMedicineStrategy());
  }

  /**
   * Register a new demo strategy
   */
  registerStrategy(key: string, strategy: DemoStrategy): void {
    this.strategies.set(key, strategy);
  }

  /**
   * Get available strategy keys
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Get strategy by key
   */
  getStrategy(key: string): DemoStrategy | undefined {
    return this.strategies.get(key);
  }

  /**
   * Simulate medical input using specified strategy
   */
  async simulate(
    strategyKey: string,
    input: DemoInput
  ): Promise<DemoServiceResponse<DemoResult>> {
    try {
      const strategy = this.strategies.get(strategyKey);
      if (!strategy) {
        throw new DemoStrategyError(`Strategy not found: ${strategyKey}`);
      }

      // Validate input
      const validation = strategy.validate(input);
      if (!validation.isValid) {
        throw new DemoError(
          `Invalid input: ${validation.errors.join(', ')}`,
          'INVALID_INPUT',
          { validation }
        );
      }

      // Execute strategy
      const result = await strategy.execute(input);

      return {
        success: true,
        data: result,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Create real-time simulation with medical context
   */
  createRealtimeSimulation(
    strategyKey: string,
    settings: Partial<DemoSimulationSettings> = {}
  ): DemoServiceResponse<DemoSimulation> {
    try {
      const strategy = this.strategies.get(strategyKey);
      if (!strategy) {
        throw new DemoStrategyError(`Strategy not found: ${strategyKey}`);
      }

      const simulationId = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const defaultSettings: DemoSimulationSettings = {
        realtimeMode: true,
        medicalValidation: true,
        confidenceSimulation: true,
        patientResponseDelay: 1000,
        autoAdvanceSteps: false,
        showMedicalReasoning: true,
        ...settings
      };

      const simulation: DemoSimulation = {
        id: simulationId,
        strategy,
        state: {
          currentStep: 0,
          completedSteps: [],
          patientResponses: [],
          clinicalFindings: [],
          workingDiagnosis: [],
          treatmentPlan: [],
          isCompleted: false
        },
        history: [],
        results: [],
        isActive: true,
        settings: defaultSettings,
        startTime: new Date(),
        lastUpdate: new Date()
      };

      this.activeSimulations.set(simulationId, simulation);

      return {
        success: true,
        data: simulation,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create simulation',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process input for active simulation
   */
  async processSimulationInput(
    simulationId: string,
    input: DemoInput
  ): Promise<DemoServiceResponse<DemoResult>> {
    try {
      const simulation = this.activeSimulations.get(simulationId);
      if (!simulation) {
        throw new DemoError(`Simulation not found: ${simulationId}`, 'SIMULATION_NOT_FOUND');
      }

      if (!simulation.isActive) {
        throw new DemoError(`Simulation is not active: ${simulationId}`, 'SIMULATION_INACTIVE');
      }

      // Process input with strategy
      const result = await simulation.strategy.execute(input);

      // Update simulation state
      simulation.history.push(input);
      simulation.results.push(result);
      simulation.lastUpdate = new Date();

      // Get next step from strategy
      const nextStep = simulation.strategy.getNextStep(simulation.state);
      
      // Update state based on result
      this.updateSimulationState(simulation, result, nextStep);

      return {
        success: true,
        data: result,
        metadata: {
          simulationId,
          step: simulation.state.currentStep,
          totalSteps: simulation.state.currentStep + 1,
          isCompleted: simulation.state.isCompleted
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process simulation input',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get active simulation
   */
  getSimulation(simulationId: string): DemoSimulation | undefined {
    return this.activeSimulations.get(simulationId);
  }

  /**
   * Get all active simulations
   */
  getActiveSimulations(): DemoSimulation[] {
    return Array.from(this.activeSimulations.values());
  }

  /**
   * Stop simulation
   */
  stopSimulation(simulationId: string): DemoServiceResponse<boolean> {
    try {
      const simulation = this.activeSimulations.get(simulationId);
      if (!simulation) {
        throw new DemoError(`Simulation not found: ${simulationId}`, 'SIMULATION_NOT_FOUND');
      }

      simulation.isActive = false;
      simulation.state.isCompleted = true;
      simulation.lastUpdate = new Date();

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop simulation',
        timestamp: new Date()
      };
    }
  }

  /**
   * Reset simulation
   */
  resetSimulation(simulationId: string): DemoServiceResponse<DemoSimulation> {
    try {
      const simulation = this.activeSimulations.get(simulationId);
      if (!simulation) {
        throw new DemoError(`Simulation not found: ${simulationId}`, 'SIMULATION_NOT_FOUND');
      }

      // Reset simulation state
      simulation.state = {
        currentStep: 0,
        completedSteps: [],
        patientResponses: [],
        clinicalFindings: [],
        workingDiagnosis: [],
        treatmentPlan: [],
        isCompleted: false
      };
      
      simulation.history = [];
      simulation.results = [];
      simulation.isActive = true;
      simulation.startTime = new Date();
      simulation.lastUpdate = new Date();

      return {
        success: true,
        data: simulation,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset simulation',
        timestamp: new Date()
      };
    }
  }

  /**
   * Cleanup inactive simulations
   */
  cleanupSimulations(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [id, simulation] of this.activeSimulations.entries()) {
      const age = now.getTime() - simulation.lastUpdate.getTime();
      
      if (age > maxAge || simulation.state.isCompleted) {
        this.activeSimulations.delete(id);
      }
    }
  }

  // Private helper methods
  private updateSimulationState(
    simulation: DemoSimulation,
    result: DemoResult,
    nextStep: any
  ): void {
    // Update medical findings
    if (result.medicalAnalysis.symptoms.length > 0) {
      simulation.state.clinicalFindings.push(...result.medicalAnalysis.symptoms);
    }

    // Update working diagnosis
    if (result.medicalAnalysis.possibleDiagnoses.length > 0) {
      simulation.state.workingDiagnosis.push(...result.medicalAnalysis.possibleDiagnoses);
    }

    // Advance step if auto-advance is enabled
    if (simulation.settings.autoAdvanceSteps && nextStep) {
      simulation.state.currentStep++;
      simulation.state.completedSteps.push(nextStep.id);
    }

    // Check if simulation is completed
    if (nextStep?.type === 'completed' || simulation.state.currentStep >= 10) {
      simulation.state.isCompleted = true;
      simulation.isActive = false;
    }
  }
}

// Export singleton instance
export const demoSimulationService = new DemoSimulationService();