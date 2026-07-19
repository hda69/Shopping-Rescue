-- Password auth: store password hashes on users

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Reuse login_tokens for password-reset emails (purpose column)
ALTER TABLE login_tokens
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'password_reset';
