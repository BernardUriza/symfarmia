import "./globals.css";
import ErrorBoundary from "../src/components/ErrorBoundary";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { AppModeProvider } from "./providers/AppModeProvider";
import DemoModeBanner from "./components/DemoModeBanner";
import { ThemeProvider } from "./providers/ThemeProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { PatientContextProvider } from "./providers/PatientContextProvider";
import MedicalAssistant from "./components/MedicalAssistantWrapper";
import VersionInfo from "./components/VersionInfo";
import { SITE_CONFIG } from "./lib/site-config";

const CriticalCSS = `
  .hero-section { padding-top: 5rem; }
  .loading-spinner { animation: spin 1s linear infinite; }
  .main-nav { position: fixed; top: 0; width: 100%; }
`;

export const metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  icons: {
    icon: SITE_CONFIG.favicon,
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.image,
        width: 1200,
        height: 630,
        alt: "SYMFARMIA - Plataforma médica inteligente",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.image],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: CriticalCSS }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { const s = localStorage.getItem('theme'); const m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; const t = s || m; document.documentElement.setAttribute('data-theme', t); document.documentElement.classList.toggle('dark', t === 'dark'); })();`,
          }}
        />
      </head>
      <body className="font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ErrorBoundary>
            <Auth0Provider>
              <I18nProvider>
                <PatientContextProvider>
                  <AppModeProvider>
                    <DemoModeBanner />
                    {children}
                    <MedicalAssistant />

                    {/* Version Info Footer */}
                    <div className="fixed bottom-2 left-2 z-40">
                      <VersionInfo />
                    </div>
                  </AppModeProvider>
                </PatientContextProvider>
              </I18nProvider>
            </Auth0Provider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
