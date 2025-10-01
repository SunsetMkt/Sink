# KV to D1 Migration - Changes Summary

This document summarizes all changes made to migrate Sink from Cloudflare KV to Cloudflare D1.

## Files Modified

### Configuration Files

1. **nuxt.config.ts**
   - Changed `kv: true` to `kv: false`
   - Changed `database: false` to `database: true`
   - This enables D1 support through NuxtHub

2. **wrangler.jsonc**
   - Removed `kv_namespaces` section
   - Added `d1_databases` section with DB binding

### Database Schema

3. **migrations/0001_initial_schema.sql** (new)
   - Created `links` table with all necessary fields
   - Added indexes for `slug`, `created_at`, and `expiration`

### Server Utilities

4. **server/utils/db.ts** (new)
   - `useDB()` - Get D1 database instance
   - `getLinkBySlug()` - Fetch link by slug
   - `createLink()` - Create new link
   - `updateLink()` - Update existing link
   - `deleteLink()` - Delete link by slug
   - `listLinks()` - List links with pagination
   - `searchLinks()` - Search all links
   - `cleanupExpiredLinks()` - Remove expired links

### API Endpoints

5. **server/api/link/create.post.ts**
   - Replaced `KV.get()` with `getLinkBySlug()`
   - Replaced `KV.put()` with `createLink()`
   - Removed KV metadata and expiration parameters

6. **server/api/link/list.get.ts**
   - Replaced `KV.list()` with `listLinks()`
   - Changed cursor-based pagination to offset-based
   - Simplified response structure

7. **server/api/link/query.get.ts**
   - Replaced `KV.getWithMetadata()` with `getLinkBySlug()`
   - Removed metadata merging logic

8. **server/api/link/edit.put.ts**
   - Replaced `KV.get()` with `getLinkBySlug()`
   - Replaced `KV.put()` with `updateLink()`
   - Removed KV metadata handling

9. **server/api/link/delete.post.ts**
   - Replaced `KV.delete()` with `deleteLink()`

10. **server/api/link/upsert.post.ts**
    - Replaced `KV.get()` with `getLinkBySlug()`
    - Replaced `KV.put()` with `createLink()`
    - Removed KV metadata handling

11. **server/api/link/search.get.ts**
    - Replaced `KV.list()` loop with `searchLinks()`
    - Simplified data processing

### Middleware

12. **server/middleware/1.redirect.ts**
    - Replaced `KV.get()` with `getLinkBySlug()`
    - Removed `linkCacheTtl` parameter (caching now handled by D1)

### Documentation

13. **README.md**
    - Updated database technology from "Cloudflare Workers KV" to "Cloudflare D1"
    - Marked "Enhanced Link Management (with Cloudflare D1)" as completed
    - Added migration guide reference

14. **docs/deployment/pages.md**
    - Updated binding instructions from KV to D1
    - Added database migration step

15. **docs/deployment/workers.md**
    - Updated binding instructions from KV to D1
    - Added database creation and migration steps

16. **docs/faqs.md**
    - Updated FAQ #1 from KV to D1 troubleshooting

17. **docs/MIGRATION.md** (new)
    - Complete migration guide for existing users
    - Step-by-step instructions
    - Data migration process
    - Troubleshooting section

### Scripts

18. **scripts/migrate-kv-to-d1.js** (new)
    - Automated script to migrate data from KV to D1
    - Exports KV data and generates SQL import statements

## Key Differences: KV vs D1

### Storage Model
- **KV**: Key-value pairs with optional metadata
- **D1**: Relational database with structured tables

### Data Access
- **KV**: `get()`, `put()`, `delete()`, `list()`
- **D1**: SQL queries with full CRUD operations

### Pagination
- **KV**: Cursor-based with opaque cursors
- **D1**: Offset-based with LIMIT/OFFSET

### Expiration
- **KV**: Built-in TTL with automatic cleanup
- **D1**: Stored as field, requires manual cleanup (can use cron)

### Caching
- **KV**: Built-in `cacheTtl` parameter
- **D1**: Relies on edge caching and query optimization

### Indexes
- **KV**: Prefix-based key scanning
- **D1**: SQL indexes on any column

## Migration Path for Users

1. Create D1 database
2. Run schema migration
3. Update configuration (remove KV, add D1)
4. Optionally migrate existing data using provided script
5. Redeploy application
6. Verify functionality

## Benefits of Migration

1. **Better Performance**: SQL indexes provide faster lookups
2. **More Flexibility**: Complex queries and filtering
3. **Data Integrity**: ACID compliance
4. **Scalability**: Better support for large datasets
5. **Future Features**: Easier to add advanced features

## Testing Considerations

- Tests use the same wrangler.jsonc configuration
- Vitest with `@cloudflare/vitest-pool-workers` provides D1 bindings
- Local D1 database is created automatically for testing
- All existing API tests should pass without modification

## Backward Compatibility

This is a **breaking change** that requires:
- Database reconfiguration
- Potential data migration
- Redeployment

Users must follow the migration guide to upgrade.
