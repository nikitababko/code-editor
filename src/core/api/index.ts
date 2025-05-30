import axios from 'axios';

export * from './execute-code.ts';

export const api = axios.create({
    baseURL: 'https://emkc.org/api/v2/piston',
});
