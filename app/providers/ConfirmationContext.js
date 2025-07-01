import React, { useContext, createContext } from "react";

const ConfirmationContext = createContext();

export function useConfirmationContext() {
  return useContext(ConfirmationContext);
}

export default function ConfirmationProvider({ children }) {
  const [confirmation, setConfirmation] = React.useState(null);

  const confirm = React.useCallback(
    (text) => {
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
    },
    []
  );

  return (
    <ConfirmationContext.Provider value={{ confirm, confirmation }}>
      {children}
    </ConfirmationContext.Provider>
  );
}
