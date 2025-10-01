#!/usr/bin/env node

/**
 * Migration Script: KV to D1
 *
 * This script helps migrate data from Cloudflare KV to D1.
 * It reads links from KV and generates SQL statements to import them into D1.
 *
 * Usage:
 *   node scripts/migrate-kv-to-d1.js <namespace-id> > import_links.sql
 *   wrangler d1 execute sink --file=./import_links.sql
 */

import { execSync } from 'node:child_process'
import * as process from 'node:process'

const namespaceId = process.argv[2]

if (!namespaceId) {
  console.error('Usage: node scripts/migrate-kv-to-d1.js <namespace-id>')
  console.error('')
  console.error('Example:')
  console.error('  node scripts/migrate-kv-to-d1.js abc123def456 > import_links.sql')
  console.error('  wrangler d1 execute sink --file=./import_links.sql')
  process.exit(1)
}

console.log('-- Generated SQL migration from KV to D1')
console.log('-- Generated at:', new Date().toISOString())
console.log('')

try {
  // List all keys with link: prefix
  const keysOutput = execSync(
    `wrangler kv:key list --namespace-id=${namespaceId} --prefix="link:"`,
    { encoding: 'utf-8' },
  )

  const keys = JSON.parse(keysOutput)

  if (!Array.isArray(keys) || keys.length === 0) {
    console.log('-- No links found in KV namespace')
    process.exit(0)
  }

  console.log(`-- Found ${keys.length} links to migrate`)
  console.log('')

  // Process each key
  for (const key of keys) {
    try {
      const slug = key.name.replace('link:', '')

      // Get the value
      const valueOutput = execSync(
        `wrangler kv:key get "${key.name}" --namespace-id=${namespaceId}`,
        { encoding: 'utf-8' },
      )

      const link = JSON.parse(valueOutput)

      // Generate INSERT statement
      const sql = `INSERT INTO links (id, slug, url, comment, title, description, image, created_at, updated_at, expiration) VALUES (
  ${escapeSql(link.id || '')},
  ${escapeSql(slug)},
  ${escapeSql(link.url)},
  ${link.comment ? escapeSql(link.comment) : 'NULL'},
  ${link.title ? escapeSql(link.title) : 'NULL'},
  ${link.description ? escapeSql(link.description) : 'NULL'},
  ${link.image ? escapeSql(link.image) : 'NULL'},
  ${link.createdAt || Math.floor(Date.now() / 1000)},
  ${link.updatedAt || Math.floor(Date.now() / 1000)},
  ${link.expiration || 'NULL'}
);`

      console.log(sql)
      console.log('')
    }
    catch (error) {
      console.error(`-- Error processing key ${key.name}:`, error.message)
    }
  }

  console.log(`-- Migration complete: ${keys.length} links`)
}
catch (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

/**
 * Escape SQL string values
 */
function escapeSql(value) {
  if (value === null || value === undefined)
    return 'NULL'
  return `'${String(value).replace(/'/g, '\'\'')}'`
}
