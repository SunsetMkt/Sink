import type { H3Event } from 'h3'
import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'

export type Link = z.infer<typeof LinkSchema>

export interface D1Database {
  prepare: (query: string) => D1PreparedStatement
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>
  exec: (query: string) => Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement
  first: <T = unknown>(colName?: string) => Promise<T | null>
  run: () => Promise<D1Result>
  all: <T = unknown>() => Promise<D1Result<T>>
}

export interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  meta?: {
    duration?: number
    size_after?: number
    rows_read?: number
    rows_written?: number
  }
  error?: string
}

export interface D1ExecResult {
  count: number
  duration: number
}

/**
 * Get D1 database instance from event context
 */
export function useDB(event: H3Event): D1Database {
  const { cloudflare } = event.context
  return cloudflare.env.DB as D1Database
}

/**
 * Get a link by slug from D1
 */
export async function getLinkBySlug(db: D1Database, slug: string): Promise<Link | null> {
  const result = await db
    .prepare('SELECT * FROM links WHERE slug = ? LIMIT 1')
    .bind(slug)
    .first<{
      id: string
      slug: string
      url: string
      comment?: string
      title?: string
      description?: string
      image?: string
      created_at: number
      updated_at: number
      expiration?: number
    }>()

  if (!result) return null

  return {
    id: result.id,
    slug: result.slug,
    url: result.url,
    comment: result.comment,
    title: result.title,
    description: result.description,
    image: result.image,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    expiration: result.expiration,
  }
}

/**
 * Create a new link in D1
 */
export async function createLink(db: D1Database, link: Link): Promise<void> {
  await db
    .prepare(
      'INSERT INTO links (id, slug, url, comment, title, description, image, created_at, updated_at, expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      link.id,
      link.slug,
      link.url,
      link.comment || null,
      link.title || null,
      link.description || null,
      link.image || null,
      link.createdAt,
      link.updatedAt,
      link.expiration || null,
    )
    .run()
}

/**
 * Update an existing link in D1
 */
export async function updateLink(db: D1Database, link: Link): Promise<void> {
  await db
    .prepare(
      'UPDATE links SET url = ?, comment = ?, title = ?, description = ?, image = ?, updated_at = ?, expiration = ? WHERE slug = ?',
    )
    .bind(
      link.url,
      link.comment || null,
      link.title || null,
      link.description || null,
      link.image || null,
      link.updatedAt,
      link.expiration || null,
      link.slug,
    )
    .run()
}

/**
 * Delete a link by slug from D1
 */
export async function deleteLink(db: D1Database, slug: string): Promise<void> {
  await db.prepare('DELETE FROM links WHERE slug = ?').bind(slug).run()
}

/**
 * List all links with pagination
 */
export async function listLinks(
  db: D1Database,
  limit: number = 20,
  offset: number = 0,
): Promise<{ links: Link[], total: number }> {
  // Get total count
  const countResult = await db
    .prepare('SELECT COUNT(*) as count FROM links')
    .first<{ count: number }>()

  const total = countResult?.count || 0

  // Get paginated results
  const result = await db
    .prepare('SELECT * FROM links ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all<{
      id: string
      slug: string
      url: string
      comment?: string
      title?: string
      description?: string
      image?: string
      created_at: number
      updated_at: number
      expiration?: number
    }>()

  const links = (result.results || []).map(row => ({
    id: row.id,
    slug: row.slug,
    url: row.url,
    comment: row.comment,
    title: row.title,
    description: row.description,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiration: row.expiration,
  }))

  return { links, total }
}

/**
 * Search links by URL or comment
 */
export async function searchLinks(db: D1Database): Promise<Link[]> {
  const result = await db
    .prepare('SELECT * FROM links ORDER BY created_at DESC')
    .all<{
      id: string
      slug: string
      url: string
      comment?: string
      title?: string
      description?: string
      image?: string
      created_at: number
      updated_at: number
      expiration?: number
    }>()

  return (result.results || []).map(row => ({
    id: row.id,
    slug: row.slug,
    url: row.url,
    comment: row.comment,
    title: row.title,
    description: row.description,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiration: row.expiration,
  }))
}

/**
 * Clean up expired links
 */
export async function cleanupExpiredLinks(db: D1Database): Promise<number> {
  const now = Math.floor(Date.now() / 1000)
  const result = await db
    .prepare('DELETE FROM links WHERE expiration IS NOT NULL AND expiration < ?')
    .bind(now)
    .run()

  return result.meta?.rows_written || 0
}
