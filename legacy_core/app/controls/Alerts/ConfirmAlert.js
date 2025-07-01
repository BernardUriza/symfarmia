import React from "react";
import { Alert, Button } from "@material-tailwind/react";

export default function ConfirmAlert({ confirmation }) {
  const { text, onConfirm, onCancel } = confirmation || {};

  return (
    <div className={confirmation ? "fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50" : "d-none"}>
      <Alert
        open={Boolean(confirmation)}
        animate={{
          mount: { y: 0 },
          unmount: { y: 100 },
        }}
        className="w-max"
      >
        <div className="text-lg">{text}</div>
        <div className="mt-4 flex justify-end">
          <Button color="red" onClick={onCancel} className="mr-4">
            Cancelar
          </Button>
          <Button color="green" onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </Alert>
    </div>
  );
}
