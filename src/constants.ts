import type { LanguageType } from './types.ts';

export const LOCAL_STORAGE_CODE = 'code';
export const LOCAL_STORAGE_EDITOR_WIDTH = 'editorWidth';
export const LOCAL_STORAGE_DEFAULT_LANGUAGE_ID = 'defaultLanguageId';

export const CODE_RUN_BUTTON_LABEL = 'Run code';
export const MIN_EDITOR_WIDTH = 400;
export const MAX_EDITOR_WIDTH = 1400;
export const DEFAULT_EDITOR_WIDTH = 800;
export const DEFAULT_LANGUAGE_ID = 'javascript';
export const LANGUAGES: LanguageType[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    defaultValue: `function greet(name) {
  return "Hello, " + name;
}

console.log(greet("World"));`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    defaultValue: `function greet(name: string): string {
  return "Hello, " + name;
}

console.log(greet("World"));`,
  },
];
