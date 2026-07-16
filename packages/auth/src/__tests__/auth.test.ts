import { describe, it, expect } from 'vitest';
import { createSupabaseAuthClient } from '../client.js';

describe('createSupabaseAuthClient', () => {
  it('returns a client with auth methods', () => {
    const client = createSupabaseAuthClient({
      url: 'https://example.supabase.co',
      anonKey: 'test-key',
    });

    expect(client).toHaveProperty('signInWithPassword');
    expect(client).toHaveProperty('signOut');
    expect(client).toHaveProperty('getSession');
  });
});
