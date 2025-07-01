import React from "react";
import { Alert, Progress } from "@material-tailwind/react";
import { useLoading } from "../../providers/LoadingContext";

export default function LoadingAlert() {
  const { loadingState } = useLoading();

  return (
    <div className={loadingState?.open ? "fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50" : "d-none"}>
      <Alert
        open={loadingState?.open}
        animate={{
          mount: { y: 0 },
          unmount: { y: 100 },
        }}
        className="w-90"
      >
        <div className="flex w-full flex-col gap-4">
          <Progress
            size="lg"
            color="green"
            value={loadingState?.progress}
          />
          <p>
            Cargando...
          </p>
        </div>
      </Alert>
    </div>
  );
}
