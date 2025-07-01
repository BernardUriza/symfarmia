"use client"
import { UserProvider } from '@auth0/nextjs-auth0/client';
import LegacyApp from '../../legacy_core/app/app.js';

export default function LegacyCorePage() {
  return (
    <UserProvider>
      <LegacyApp />
    </UserProvider>
  );
}