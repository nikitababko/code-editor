import type { OnMount } from '@monaco-editor/react';

export type LanguageType = {
  id: string;
  name: string;
  defaultValue: string;
};

export type EditorInstanceType = Parameters<OnMount>[0];

export type MonacoType = Parameters<OnMount>[1];
