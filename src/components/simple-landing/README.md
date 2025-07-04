# Simple Landing Page Components

## 📐 Architecture

Esta implementación sigue el patrón **Atomic Design** para máxima reutilización y mantenibilidad:

### 🔬 Atoms (Componentes Básicos)
- **Logo**: Logo de la marca con variantes de tamaño y color
- **Button**: Botón reutilizable con múltiples variantes y tamaños
- **Typography**: Componentes `Heading` y `Text` con tipos consistentes
- **Card**: Contenedor base con variantes de estilo

### 🧪 Molecules (Componentes Compuestos)
- **FeatureCard**: Card para mostrar características con ícono
- **StatCard**: Card para estadísticas con números prominentes
- **TestimonialCard**: Card para testimonios de usuarios
- **PricingCard**: Card para planes de precios con features

### 🧬 Organisms (Secciones Completas)
- **HeroSection**: Sección hero principal
- **ProblemSection**: Presenta el problema médico
- **SolutionSection**: Muestra las soluciones de SYMFARMIA
- **TrustSection**: Características de seguridad y confianza
- **TestimonialsSection**: Testimonios de doctores
- **PricingSection**: Planes y precios
- **ContactSection**: Formulario de contacto
- **Footer**: Pie de página con links

## 🚀 Beneficios vs Versión Animada

### Performance
- **Sin animaciones complejas**: Elimina re-renders innecesarios
- **Carga más rápida**: No requiere librerías de animación pesadas
- **Menor uso de CPU**: Sin cálculos de transformaciones continuas
- **Mejor SEO**: Contenido visible inmediatamente

### Mantenibilidad
- **Componentes atómicos**: Fácil de modificar y reutilizar
- **Sin dependencias de Framer Motion**: Menos complejidad
- **Código más limpio**: Lógica separada por responsabilidad
- **Testing más fácil**: Componentes puros sin estado animado

### Accesibilidad
- **Sin motion sickness**: Mejor para usuarios sensibles al movimiento
- **Contenido estático**: Fácil de leer para screen readers
- **Focus management**: Navegación por teclado más predecible

## 📊 Estructura de Archivos

```
simple-landing/
├── atoms/                 # Componentes básicos
│   ├── Logo.jsx
│   ├── Button.jsx
│   ├── Typography.jsx
│   └── Card.jsx
├── molecules/             # Componentes compuestos
│   ├── FeatureCard.jsx
│   ├── StatCard.jsx
│   ├── TestimonialCard.jsx
│   └── PricingCard.jsx
├── sections/              # Secciones completas
│   ├── HeroSection.jsx
│   ├── ProblemSection.jsx
│   ├── SolutionSection.jsx
│   ├── TrustSection.jsx
│   ├── TestimonialsSection.jsx
│   ├── PricingSection.jsx
│   ├── ContactSection.jsx
│   └── Footer.jsx
├── index.js               # Barrel exports
└── README.md              # Esta documentación
```

## 🎨 Design System

### Colores
- **Primary**: `teal-500`, `teal-600`
- **Secondary**: `blue-500`, `purple-500` 
- **Background**: `slate-900`, `slate-800`, `slate-700`
- **Text**: `white`, `gray-300`, `gray-600`

### Tipografía
- **Headings**: `text-4xl` → `text-6xl` responsive
- **Body**: `text-base`, `text-lg`, `text-xl`
- **Weights**: `font-normal`, `font-semibold`, `font-bold`

### Espaciado
- **Sections**: `py-20` (80px vertical)
- **Cards**: `p-6`, `p-8` (24px, 32px)
- **Grid gaps**: `gap-8` (32px)

## 🛠️ Uso

```jsx
import SimpleLandingPage from './components/SimpleLandingPage';

// O importar componentes individuales
import { HeroSection, Button, Logo } from './components/simple-landing';

function App() {
  return <SimpleLandingPage />;
}
```

## 🔧 Personalización

### Modificar Colores
```jsx
// En Button.jsx
const variants = {
  primary: 'bg-teal-600 hover:bg-teal-700', // Cambiar aquí
  // ...
};
```

### Añadir Nuevas Variantes
```jsx
// En Card.jsx
const variants = {
  // existentes...
  custom: 'bg-purple-900 border-purple-700', // Nueva variante
};
```

### Responsive Breakpoints
- **Mobile**: Base styles
- **Tablet**: `md:` prefixes (768px+)
- **Desktop**: `lg:` prefixes (1024px+)

## 📱 Responsive Design

Todos los componentes son **mobile-first** con breakpoints:
- Grid layouts se adaptan automáticamente
- Tipografía escala según pantalla
- Espaciado optimizado para móviles

## ♿ Accesibilidad

- **Color contrast**: Cumple WCAG AA
- **Focus states**: Anillos de focus visibles
- **Semantic HTML**: Headings jerárquicos
- **Alt text**: En todos los íconos decorativos
- **Form labels**: Placeholders accesibles

## 🧪 Testing

Componentes diseñados para testing fácil:
```jsx
// Ejemplo de test
test('Button renders with correct variant', () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-teal-600');
});
```

## 🔄 Migración desde Versión Animada

1. **Reemplazar imports**:
   ```jsx
   // Antes
   import CinematicLandingPage from './CinematicLandingPage';
   
   // Después  
   import SimpleLandingPage from './SimpleLandingPage';
   ```

2. **Mantener funcionalidad**: Todos los textos y contenido se preservan
3. **Mejor performance**: Inmediata mejora en métricas de carga