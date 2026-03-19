import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    if (!_openai) {
      _openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
      });
    }
    return (_openai as Record<string, unknown>)[prop as string];
  },
});
