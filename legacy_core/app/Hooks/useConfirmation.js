import { useState, useCallback } from "react";

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState(null);

  const confirm = useCallback((text) => {
    return new Promise((resolve, reject) => {
      setConfirmation({
        text,
        onConfirm: () => {
          resolve();
          setConfirmation(null);
        },
        onCancel: () => {
          reject();
          setConfirmation(null);
        },
      });
    });
  }, []);

  return { confirm, confirmation };
}
