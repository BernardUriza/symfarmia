import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "./utils";

// Card variant system para contextos médicos
const cardVariants = cva(
  "flex flex-col rounded-xl border transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm",
        elevated: "bg-card text-card-foreground shadow-md hover:shadow-lg",
        medical: "bg-card text-card-foreground shadow-sm border-l-4 border-l-medical-primary",
        critical: "bg-card text-card-foreground shadow-sm border-l-4 border-l-destructive",
        success: "bg-card text-card-foreground shadow-sm border-l-4 border-l-green-500",
        warning: "bg-card text-card-foreground shadow-sm border-l-4 border-l-yellow-500",
        ghost: "bg-transparent border-dashed border-muted-foreground/25",
        outline: "bg-transparent border-2 border-border hover:bg-accent/50"
      },
      size: {
        default: "gap-6",
        sm: "gap-4",
        lg: "gap-8",
        compact: "gap-2"
      },
      interactive: {
        none: "",
        hover: "hover:bg-accent/50 cursor-pointer",
        press: "hover:bg-accent/50 active:bg-accent/75 cursor-pointer transform hover:-translate-y-0.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: "none"
    }
  }
);

// Props interfaces con TypeScript strict
interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  truncate?: boolean;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  truncate?: boolean;
}

interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
  maxHeight?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  justify?: "start" | "center" | "end" | "between";
}

// Componente Card principal con forwarded ref
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    
    return (
      <Comp
        ref={ref}
        data-slot="card"
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// Header con soporte para bordes opcionales
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
          bordered && "border-b pb-6",
          className
        )}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

// Title con soporte para diferentes heading levels
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as = "h4", truncate = false, ...props }, ref) => {
    const Comp = as;
    
    return (
      <Comp
        ref={ref}
        data-slot="card-title"
        className={cn(
          "leading-none font-semibold text-foreground",
          truncate && "truncate",
          {
            "text-2xl": as === "h1",
            "text-xl": as === "h2", 
            "text-lg": as === "h3",
            "text-base": as === "h4",
            "text-sm": as === "h5",
            "text-xs": as === "h6"
          },
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

// Description con soporte para truncate
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, truncate = false, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="card-description"
        className={cn(
          "text-muted-foreground text-sm leading-relaxed",
          truncate && "truncate",
          className
        )}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

// Action con posicionamiento flexible
const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, position = "top-right", ...props }, ref) => {
    const positionClasses = {
      "top-right": "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      "top-left": "col-start-1 row-span-2 row-start-1 self-start justify-self-start",
      "bottom-right": "col-start-2 row-span-1 row-start-2 self-end justify-self-end",
      "bottom-left": "col-start-1 row-span-1 row-start-2 self-end justify-self-start"
    };
    
    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={cn(
          positionClasses[position],
          "flex items-center gap-2",
          className
        )}
        {...props}
      />
    );
  }
);
CardAction.displayName = "CardAction";

// Content con soporte para scroll
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, scrollable = false, maxHeight, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn(
          "px-6 [&:last-child]:pb-6",
          scrollable && "overflow-y-auto",
          className
        )}
        style={{ maxHeight: maxHeight }}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

// Footer con justificación flexible
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = false, justify = "start", ...props }, ref) => {
    const justifyClasses = {
      start: "justify-start",
      center: "justify-center", 
      end: "justify-end",
      between: "justify-between"
    };
    
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn(
          "flex items-center px-6 pb-6 gap-2",
          bordered && "border-t pt-6",
          justifyClasses[justify],
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

// Compound component exports
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardActionProps,
  type CardContentProps,
  type CardFooterProps
};

// Utility components para casos médicos específicos
export const MedicalCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "medical", ...props }, ref) => {
    return <Card ref={ref} variant={variant} {...props} />;
  }
);
MedicalCard.displayName = "MedicalCard";

export const CriticalCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "critical", ...props }, ref) => {
    return <Card ref={ref} variant={variant} {...props} />;
  }
);
CriticalCard.displayName = "CriticalCard";

export const PatientCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "elevated", interactive = "hover", ...props }, ref) => {
    return <Card ref={ref} variant={variant} interactive={interactive} {...props} />;
  }
);
PatientCard.displayName = "PatientCard";