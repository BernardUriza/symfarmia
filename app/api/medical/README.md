# Medical AI API Endpoints

## Supported Models

Esta API soporta ÚNICAMENTE los siguientes modelos médicos:

### 1. Bio_ClinicalBERT
- **Endpoint Model Key**: `emilyalsentzer/Bio_ClinicalBERT`
- **Tareas**: 
  - Extracción de entidades médicas
  - Clasificación de notas clínicas
  - Análisis de sentimiento médico
  - Generación de resúmenes médicos
  - Sugerencias de códigos ICD-10
- **Tipos de consulta soportados**: `diagnosis`, `prescription`, `soap`, `analytics`

### 2. OpenAI Whisper Medium
- **Endpoint Model Key**: `openai/whisper-medium`
- **Tareas**:
  - Transcripción médica de audio
  - Análisis de tono y emociones
  - Generación de timestamps médicos
  - Corrección de terminología médica
- **Tipos de consulta soportados**: `transcription`

### 3. MedX_v2 (Jivi AI)
- **Endpoint Model Key**: `jiviai/medX_v2`
- **Tareas**:
  - Diagnóstico conversacional
  - Generación de planes de tratamiento
  - Educación al paciente
  - Chatbot médico diagnóstico
- **Tipos de consulta soportados**: `conversation`, `treatment`, `education`

## API Usage

### POST /api/medical

#### Request Body
```json
{
  "query": "Paciente presenta dolor abdominal en cuadrante superior derecho",
  "type": "diagnosis"
}
```

#### Supported Query Types
- `diagnosis` → Uses Bio_ClinicalBERT
- `prescription` → Uses Bio_ClinicalBERT  
- `soap` → Uses Bio_ClinicalBERT
- `analytics` → Uses Bio_ClinicalBERT
- `transcription` → Uses OpenAI Whisper Medium
- `conversation` → Uses MedX_v2
- `treatment` → Uses MedX_v2
- `education` → Uses MedX_v2

#### Success Response (200)
```json
{
  "response": "Análisis médico generado por IA",
  "confidence": 0.85,
  "reasoning": [],
  "suggestions": [],
  "disclaimer": "AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado.",
  "sources": ["emilyalsentzer/Bio_ClinicalBERT"],
  "success": true
}
```

#### Error Response (400) - Unsupported Model
```json
{
  "error": "Modelo no soportado: bert-base-uncased. Modelos válidos: emilyalsentzer/Bio_ClinicalBERT, openai/whisper-medium, jiviai/medX_v2",
  "type": "validation_error"
}
```

#### Error Response (400) - Invalid Query Type
```json
{
  "error": "Unsupported query type: invalid_type",
  "type": "validation_error"
}
```

#### Error Response (500) - Configuration Error
```json
{
  "error": "Hugging Face token not configured",
  "type": "configuration_error",
  "details": ["HUGGINGFACE_TOKEN environment variable is required"]
}
```

## Model Parameters

### Bio_ClinicalBERT
```json
{
  "max_length": 512,
  "temperature": 0.3,
  "do_sample": true,
  "return_all_scores": true
}
```

### OpenAI Whisper Medium
```json
{
  "language": "es",
  "task": "transcribe",
  "return_timestamps": true
}
```

### MedX_v2
```json
{
  "max_length": 1024,
  "temperature": 0.7,
  "do_sample": true,
  "top_p": 0.9
}
```

## Important Notes

⚠️ **STRICT MODEL VALIDATION**: Esta API NO permite fallbacks ni modelos por defecto. Solo se aceptan los tres modelos listados arriba.

⚠️ **NO IMPROVISATION**: La API rechazará cualquier modelo que no esté en la lista de modelos soportados con un error 400.

⚠️ **MEDICAL DISCLAIMER**: Toda respuesta incluye un disclaimer médico obligatorio indicando que la información debe ser validada por un médico certificado.

## Environment Variables Required

```bash
HUGGINGFACE_TOKEN=your-huggingface-token
```

## Testing

Para probar la validación estricta de modelos:

```bash
# Válido
curl -X POST http://localhost:3000/api/medical \
  -H "Content-Type: application/json" \
  -d '{"query": "Paciente con fiebre", "type": "diagnosis"}'

# Inválido - debería retornar error 400
curl -X POST http://localhost:3000/api/medical \
  -H "Content-Type: application/json" \
  -d '{"query": "Paciente con fiebre", "type": "unsupported_type"}'
```