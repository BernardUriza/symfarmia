"use client"
import { UserProvider, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import LegacyApp from '../../legacy_core/app/app.js';

export const dynamic = "force-dynamic";

function LegacyCorePage() {
  return (
    <UserProvider>
      <LegacyApp />
    </UserProvider>
  );
}

// Protect this page - only authenticated users can access legacy core
export default withPageAuthRequired(LegacyCorePage);