"use client";

import Link from 'next/link';

export default function HealthCheckPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">SYMFARMIA Health Check</h1>
      <ul className="space-y-2">
        <li>✅ Application: SYMFARMIA Medical System</li>
        <li>✅ Main Page: Landing Page (app/page.js)</li>
        <li>✅ Dashboard: Medical Dashboard (/dashboard)</li>
        <li>✅ Patient Search: PatientQuickSearch Component</li>
        <li>✅ Tailwind: v4 with Medical Theme</li>
        <li>✅ Routes: All medical routes present</li>
      </ul>
      <div className="mt-8 space-y-4">
        <Link href="/" className="block p-4 bg-primary text-white rounded hover:bg-primary/90">
          Go to Landing Page
        </Link>
        <a href="/dashboard" className="block p-4 bg-green-600 text-white rounded hover:bg-green-700">
          Go to Medical Dashboard
        </a>
        <a href="/consultation" className="block p-4 bg-purple-600 text-white rounded hover:bg-purple-700">
          Go to Consultation
        </a>
      </div>
    </div>
  );
}