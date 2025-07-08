import React from "react";
import { useLoading } from "../../providers/LoadingContext";
import { Progress } from "../../components/ui/progress";

export default function LoadingAlert() {
  const { loadingState } = useLoading();

  if (!loadingState?.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg border p-6 shadow-lg w-[350px] space-y-4">
        <Progress value={loadingState?.progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          Cargando...
        </p>
      </div>
    </div>
  );
}