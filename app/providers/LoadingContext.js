// LoadingContext.js
import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function useLoading() {
  return useContext(LoadingContext);
}

export default function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({ open: false, progress: 0 });

  const showLoading = () => {
    setLoadingState({ open: true, progress: 0 });
  };

  const hideLoading = () => {
    setLoadingState({ open: false, progress: 0 });
  };

  const showLoadingWithProgress = (progress = 0) => {
    setLoadingState({ open: true, progress });
  };

  return (
    <LoadingContext.Provider value={{ loadingState, showLoading, hideLoading, showLoadingWithProgress }}>
      {children}
    </LoadingContext.Provider>
  );
}
