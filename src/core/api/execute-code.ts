import { api } from './index.ts';

export const executeCode = (code: string, language: string) => {
  return api.post('/execute', {
    language: language,
    version: '*',
    files: [{ name: 'main.js', content: code }],
  });
};
