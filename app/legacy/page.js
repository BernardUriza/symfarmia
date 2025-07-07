"use client"
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import LegacyApp from '../../legacy_core/app/app.js';

export const dynamic = "force-dynamic";

function LegacyCorePage() {
  return <LegacyApp />;
}

// Protect this page - only authenticated users can access legacy core
export default withPageAuthRequired(LegacyCorePage);
