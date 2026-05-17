declare const __DEV__: boolean;

export const HTTP_BASE = __DEV__
  ? 'http://localhost:8787'
  : 'https://quiz-croc-do.zoltan-szeg.workers.dev';

export const WS_BASE = __DEV__
  ? 'ws://localhost:8787'
  : 'wss://quiz-croc-do.zoltan-szeg.workers.dev';
