"use client"
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import nextDynamic from 'next/dynamic';

const LegacyApp = nextDynamic(() => import('../../legacy_core/app/app.js'), {
  ssr: false,
  loading: () => <p>Loading legacy module...</p>,
});

export const dynamic = "force-dynamic";

function LegacyCorePage() {
  return <LegacyApp />;
}

// Protect this page - only authenticated users can access legacy core
export default withPageAuthRequired(LegacyCorePage);
