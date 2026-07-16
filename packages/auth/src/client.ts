import { createLogger } from '@shopping-rescue/shared';

export interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
}

const logger = createLogger({ package: 'auth' });

export function createSupabaseAuthClient(config: SupabaseAuthConfig) {
  logger.info('Supabase auth client placeholder initialized', { url: config.url });

  return {
    signInWithPassword: async (_email: string, _password: string) => {
      throw new Error('Supabase auth integration not yet implemented');
    },
    signOut: async () => {
      throw new Error('Supabase auth integration not yet implemented');
    },
    getSession: async () => null,
  };
}

export type SupabaseAuthClient = ReturnType<typeof createSupabaseAuthClient>;
