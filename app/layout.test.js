"use client"
import "./globals.css";

export const metadata = {
  title: "Test App",
  description: "Test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div>Test Layout</div>
        {children}
      </body>
    </html>
  );
}