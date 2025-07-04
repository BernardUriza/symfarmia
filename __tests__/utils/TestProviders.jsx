import React from "react";
import { ThemeProvider } from "../../app/providers/ThemeProvider";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { PatientContextProvider } from "../../app/providers/PatientContextProvider";
import { AppModeProvider } from "../../app/providers/AppModeProvider";

const TestProviders = ({ children }) => (
  <ThemeProvider>
    <I18nProvider>
      <PatientContextProvider>
        <AppModeProvider>{children}</AppModeProvider>
      </PatientContextProvider>
    </I18nProvider>
  </ThemeProvider>
);

export default TestProviders;
