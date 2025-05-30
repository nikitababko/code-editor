import { api } from './index.ts';

export const executeCode = (code: string) => {
    return api.post('/execute', {
        language: 'javascript',
        version: '*',
        files: [{ name: 'main.js', content: code }],
    });
};
