"use client"
import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client'
import App from './app';

const Page = () => {
  return (
    <UserProvider>
      <App></App>
    </UserProvider>
  );
};

export default Page;
