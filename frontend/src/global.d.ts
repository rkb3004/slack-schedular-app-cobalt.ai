// This file contains global type declarations for the project

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SLACK_CLIENT_ID?: string;
  // Add other environment variables as needed
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declare the env property on import.meta
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
