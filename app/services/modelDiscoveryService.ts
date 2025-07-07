export interface ModelSuggestion {
  modelName: string;
  useCase: string;
  confidence: number;
  reasoning: string;
  huggingfaceUrl?: string;
  fallbackModels?: string[];
}

export interface ModelDiscoveryResponse {
  primaryModel: ModelSuggestion;
  alternativeModels: ModelSuggestion[];
  searchQuery: string;
  timestamp: Date;
}

export async function validateModelAvailability(modelName: string) {
  try {
    const res = await fetch(`https://huggingface.co/api/models/${modelName}`);
    const info = await res.json();
    return {
      available: res.ok,
      modelInfo: info,
      lastChecked: new Date(),
      status: res.status
    };
  } catch (error: any) {
    return {
      available: false,
      error: (error as Error).message,
      lastChecked: new Date()
    };
  }
}

export async function connectToHuggingFaceModel(
  modelName: string,
  query: string,
  context: Record<string, unknown> = {}
) {
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        },
        body: JSON.stringify({ inputs: query, parameters: context })
      }
    );

    if (!res.ok) {
      throw new Error(`Model ${modelName} failed: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data, modelUsed: modelName };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: (error as Error).message,
        modelName
      }
    };
  }
}

export async function discoverRelevantModels(
  suggestions: ModelSuggestion[],
  query: string
): Promise<ModelDiscoveryResponse> {
  const validated = [] as ModelSuggestion[];
  for (const suggestion of suggestions) {
    const availability = await validateModelAvailability(suggestion.modelName);
    if (availability.available) {
      validated.push(suggestion);
    }
  }

  const primary = validated[0] || suggestions[0];
  return {
    primaryModel: primary,
    alternativeModels: validated.slice(1),
    searchQuery: query,
    timestamp: new Date()
  };
}
