-- Migration: Initial schema for Sink
-- Create links table to replace KV storage

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  comment TEXT,
  title TEXT,
  description TEXT,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expiration INTEGER
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_expiration ON links(expiration);
