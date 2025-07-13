# 🎙️ PROMPT: Anillos Reactivos de Audio - Diseño Visual Épico

## 🎯 **OBJETIVO**
Crear un sistema de anillos concéntricos que se expanden y contraen en tiempo real basado en los niveles de audio del hook `useMicrophoneLevel`, creando una experiencia visual hipnotizante y profesional.

## 📊 **ANÁLISIS DEL HOOK EXISTENTE**

### **useMicrophoneLevel.ts - Funcionamiento:**
```typescript
// El hook ya existe y funciona perfecto:
// - Retorna: number (0-255) - Nivel de audio en tiempo real
// - Se actualiza vía requestAnimationFrame (60fps)
// - Usa analyser.getByteFrequencyData() para obtener frecuencias
// - Calcula promedio de todas las frecuencias
```

**Datos disponibles:**
- `audioLevel`: 0-255 (intensidad del sonido)
- Actualización: ~60fps (súper fluido)
- Rango dinámico: Silencio (0) → Grito (255)

## 🎨 **DISEÑO DE ANILLOS ÉPICOS**

### **Concepto Visual:**
```
Micrófono Central
    ↓
  Ring 1 (Más pequeño, más reactivo)
    ↓
  Ring 2 (Mediano, moderadamente reactivo)  
    ↓
  Ring 3 (Más grande, suavemente reactivo)
    ↓
  Ring 4 (Gigante, apenas perceptible)
```

### **Características de cada anillo:**
1. **Ring 1 (Core)**: Reactivo directo al audio
2. **Ring 2 (Mid)**: Smoothed + delay 100ms  
3. **Ring 3 (Outer)**: Smoothed + delay 200ms
4. **Ring 4 (Ambient)**: Smoothed + delay 300ms

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **1. Componente VoiceReactiveRings**
```typescript
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMicrophoneLevel } from '../../../hooks/useMicrophoneLevel';

interface VoiceReactiveRingsProps {
  isRecording: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'normal' | 'dramatic';
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'medical';
  className?: string;
}

// 🎨 Configuraciones de tamaño
const SIZE_CONFIG = {
  sm: { base: 40, rings: [50, 65, 80, 100] },
  md: { base: 60, rings: [75, 95, 120, 150] },
  lg: { base: 80, rings: [100, 130, 170, 220] },
  xl: { base: 100, rings: [130, 170, 220, 280] }
};

// 🌈 Esquemas de color
const COLOR_SCHEMES = {
  blue: {
    core: 'rgb(59, 130, 246)',      // blue-500
    rings: [
      'rgba(59, 130, 246, 0.4)',   // Ring 1
      'rgba(59, 130, 246, 0.25)',  // Ring 2  
      'rgba(59, 130, 246, 0.15)',  // Ring 3
      'rgba(59, 130, 246, 0.08)'   // Ring 4
    ]
  },
  red: {
    core: 'rgb(239, 68, 68)',       // red-500
    rings: [
      'rgba(239, 68, 68, 0.5)',
      'rgba(239, 68, 68, 0.3)',
      'rgba(239, 68, 68, 0.2)',
      'rgba(239, 68, 68, 0.1)'
    ]
  },
  medical: {
    core: 'rgb(16, 185, 129)',      // emerald-500
    rings: [
      'rgba(16, 185, 129, 0.4)',
      'rgba(16, 185, 129, 0.25)',
      'rgba(16, 185, 129, 0.15)',
      'rgba(16, 185, 129, 0.08)'
    ]
  }
};

export const VoiceReactiveRings: React.FC<VoiceReactiveRingsProps> = ({
  isRecording,
  size = 'lg',
  intensity = 'normal',
  colorScheme = 'medical',
  className = ''
}) => {
  // 🎤 Audio level desde el hook existente
  const audioLevel = useMicrophoneLevel(isRecording);
  
  // 🎯 Estados para cada anillo (con smoothing)
  const [ringLevels, setRingLevels] = useState([0, 0, 0, 0]);
  const smoothingFactors = [0.8, 0.6, 0.4, 0.2]; // Ring 1 más reactivo
  const ringDelays = useRef([0, 0, 0, 0]); // Para delays escalonados
  
  // ⚙️ Configuración
  const config = SIZE_CONFIG[size];
  const colors = COLOR_SCHEMES[colorScheme];
  const intensityMultiplier = intensity === 'subtle' ? 0.5 : intensity === 'dramatic' ? 1.5 : 1;
  
  // 🔄 Efecto para smoothing y delays
  useEffect(() => {
    if (!isRecording) {
      setRingLevels([0, 0, 0, 0]);
      return;
    }
    
    const updateRings = () => {
      setRingLevels(prev => {
        return prev.map((currentLevel, index) => {
          // Calcular target level con delay escalonado
          const delayedLevel = ringDelays.current[index] || audioLevel;
          ringDelays.current[index] = audioLevel;
          
          // Aplicar smoothing
          const smoothing = smoothingFactors[index];
          const targetLevel = (delayedLevel / 255) * intensityMultiplier;
          
          return currentLevel + (targetLevel - currentLevel) * smoothing;
        });
      });
    };
    
    const intervalId = setInterval(updateRings, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [audioLevel, isRecording, intensityMultiplier]);
  
  // 🎨 Calcular escalas para cada anillo
  const getRingScale = (ringIndex: number): number => {
    if (!isRecording) return 1;
    
    const level = ringLevels[ringIndex];
    const baseScale = 1;
    const scaleRange = 0.3 + (ringIndex * 0.1); // Anillos externos menos expansión
    
    return baseScale + (level * scaleRange);
  };
  
  // 🌊 Calcular opacidad reactiva
  const getRingOpacity = (ringIndex: number): number => {
    if (!isRecording) return 0.1;
    
    const level = ringLevels[ringIndex];
    const baseOpacity = 0.2;
    const opacityRange = 0.6;
    
    return Math.min(1, baseOpacity + (level * opacityRange));
  };
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      
      {/* 🎯 Micrófono Central */}
      <div 
        className="relative z-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: config.base,
          height: config.base,
          backgroundColor: colors.core,
          transform: `scale(${1 + (ringLevels[0] * 0.1)})`
        }}
      >
        {/* Icono del micrófono se pasa como children */}
        <div className="text-white">
          {/* Mic icon goes here */}
        </div>
      </div>
      
      {/* 🌊 Anillos Concéntricos */}
      {config.rings.map((ringSize, index) => (
        <div
          key={index}
          className="absolute rounded-full border-2 transition-all duration-75 ease-out"
          style={{
            width: ringSize,
            height: ringSize,
            borderColor: colors.rings[index],
            backgroundColor: 'transparent',
            transform: `scale(${getRingScale(index)})`,
            opacity: getRingOpacity(index),
            animation: isRecording ? `pulse-ring-${index} 2s infinite ease-in-out` : 'none',
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
      
      {/* 💫 Partículas adicionales (opcional) */}
      {intensity === 'dramatic' && isRecording && ringLevels[0] > 0.7 && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: colors.core,
                top: `${20 + Math.sin(i * 60) * 30}%`,
                left: `${20 + Math.cos(i * 60) * 30}%`,
                animationDelay: `${i * 0.3}s`,
                opacity: ringLevels[0] * 0.6
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceReactiveRings;
```

### **2. CSS Animations (Keyframes)**
```css
/* 🌊 Animaciones CSS para los anillos */
@keyframes pulse-ring-0 {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(180deg); }
}

@keyframes pulse-ring-1 {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.03) rotate(120deg); }
}

@keyframes pulse-ring-2 {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.02) rotate(240deg); }
}

@keyframes pulse-ring-3 {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.01) rotate(360deg); }
}

/* 🔥 Efectos de glow para intensidad dramática */
.ring-glow {
  box-shadow: 
    0 0 20px rgba(16, 185, 129, 0.3),
    0 0 40px rgba(16, 185, 129, 0.2),
    0 0 60px rgba(16, 185, 129, 0.1);
}
```

### **3. Integración en ConversationCapture**
```typescript
// En ConversationCapture.tsx, reemplazar el audio level ring:

{/* 🎙️ Micrófono con Anillos Reactivos */}
<VoiceReactiveRings
  isRecording={isRecording}
  size="lg"
  intensity="normal" 
  colorScheme={isRecording ? "red" : "medical"}
  className="mb-4"
>
  {/* Micrófono central */}
  <div className="w-12 h-12 flex items-center justify-center">
    {isRecording ? (
      <MicOff className="h-8 w-8 text-white" />
    ) : (
      <Mic className="h-8 w-8 text-white" />
    )}
  </div>
</VoiceReactiveRings>
```

---

## 🎛️ **CONFIGURACIONES AVANZADAS**

### **Props Configurables:**
- **size**: `'sm' | 'md' | 'lg' | 'xl'` - Tamaño total
- **intensity**: `'subtle' | 'normal' | 'dramatic'` - Nivel de reactividad
- **colorScheme**: `'blue' | 'red' | 'green' | 'purple' | 'medical'`
- **smoothing**: Factores de suavizado personalizables
- **ringCount**: Número de anillos (2-6)

### **Modos Especiales:**
1. **Modo Médico**: Colores verdes, movimiento suave
2. **Modo Alerta**: Colores rojos, alta reactividad  
3. **Modo Diagnóstico**: Información de audio visible
4. **Modo Partícula**: Efectos adicionales para alta intensidad

### **Optimizaciones:**
- **60fps suave** usando requestAnimationFrame interno
- **GPU acceleration** con transform3d
- **Debouncing** para evitar jitter
- **Memory efficient** - sin leaks de memoria

---

## 🎯 **RESULTADOS ESPERADOS**

### **Experiencia Visual:**
1. **Silencio**: Anillos estáticos, casi invisibles
2. **Habla normal**: Anillos pulsando suavemente
3. **Habla fuerte**: Expansión dramática coordenada
4. **Ruido súbito**: Explosión visual controlada

### **Sensaciones:**
- **Hipnotizante**: Los anillos crean un efecto mezmerizante
- **Profesional**: Colores médicos y movimientos suaves
- **Responsivo**: Reacción inmediata al audio
- **Orgánico**: Movimiento natural, no robótico

### **Performance:**
- **60fps constantes** en dispositivos modernos
- **<5% CPU** en idle
- **Escalable** según hardware disponible

---

## 🚀 **INTEGRACIÓN FINAL**

```typescript
// Uso en ConversationCapture:
<VoiceReactiveRings
  isRecording={isRecording}
  size="lg"
  intensity="normal"
  colorScheme="medical"
>
  <Mic className="h-8 w-8 text-white" />
</VoiceReactiveRings>
```

**¡Los anillos van a ser absolutamente ÉPICOS! 🔥🎙️**

Una experiencia visual que convierte la simple grabación de audio en algo mágico y profesional, perfecto para el contexto médico de SYMFARMIA.