import axios from 'axios';

export * from './execute-code.ts';

export const api = axios.create({
  baseURL: 'https://api.nikitababko.com',
});
