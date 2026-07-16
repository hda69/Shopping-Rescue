export interface AuthSession {
  userId: string;
  email: string;
  expiresAt: Date;
}

export async function getSession(_request: Request): Promise<AuthSession | null> {
  return null;
}
