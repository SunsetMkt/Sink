# Migration Guide: Cloudflare KV to D1

This guide helps you migrate your existing Sink installation from Cloudflare KV to Cloudflare D1.

## Prerequisites

- Existing Sink deployment using Cloudflare KV
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account with D1 access

## Step 1: Create D1 Database

1. Create a new D1 database:
   ```bash
   wrangler d1 create sink
   ```

2. Note the database ID from the output. You'll need this for configuration.

## Step 2: Run Database Migration

Run the initial schema migration:

```bash
wrangler d1 execute sink --file=./migrations/0001_initial_schema.sql
```

This creates the `links` table with all necessary indexes.

## Step 3: Update Configuration

### For Workers Deployment

1. Update `wrangler.jsonc`:
   - Remove the `kv_namespaces` section
   - Add the `d1_databases` section with your database ID:
     ```json
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "sink",
         "database_id": "your-database-id-here"
       }
     ]
     ```

2. Redeploy: `wrangler deploy`

### For Pages Deployment

1. Go to your Pages project settings
2. Navigate to **Settings** → **Bindings**
3. Remove the KV namespace binding (`KV`)
4. Add a D1 database binding:
   - Variable name: `DB`
   - D1 database: Select your `sink` database
5. Redeploy your project

## Step 4: Migrate Data (Optional)

If you have existing links in KV that you want to migrate to D1, you can use the Wrangler CLI to export and import:

### Export from KV

```bash
# List all keys with the link: prefix
wrangler kv:key list --namespace-id=your-kv-namespace-id --prefix="link:"

# Export individual keys (you may need to script this)
wrangler kv:key get "link:your-slug" --namespace-id=your-kv-namespace-id
```

### Import to D1

Create a migration script to insert your existing links into D1. Here's an example:

```sql
-- Example: Insert a link
INSERT INTO links (id, slug, url, comment, title, description, image, created_at, updated_at, expiration)
VALUES ('abc123', 'example', 'https://example.com', 'Example link', NULL, NULL, NULL, 1234567890, 1234567890, NULL);
```

Save your import SQL and run:
```bash
wrangler d1 execute sink --file=./import_links.sql
```

## Step 5: Verify Migration

1. Test creating a new link through your dashboard
2. Test redirecting to an existing link
3. Verify link listing works correctly
4. Check that link editing and deletion work

## Key Differences

### Data Storage
- **KV**: Key-value pairs with metadata
- **D1**: Relational database with structured tables

### Expiration Handling
- **KV**: Built-in TTL (Time To Live) feature
- **D1**: Expiration stored as a field; requires manual cleanup (you can create a cron job)

### Query Capabilities
- **KV**: Limited to key-based lookups and prefix scans
- **D1**: Full SQL queries with indexes for better performance

## Troubleshooting

### "Cannot find binding DB"
- Ensure you've added the D1 binding in your Cloudflare dashboard or wrangler.jsonc
- Variable name must be exactly `DB` (uppercase)

### "Table links does not exist"
- Run the migration script: `wrangler d1 execute sink --file=./migrations/0001_initial_schema.sql`

### Links not appearing
- Check if migration completed successfully
- Verify D1 database contains data: `wrangler d1 execute sink --command="SELECT COUNT(*) FROM links"`

## Rollback Plan

If you need to rollback to KV:

1. Keep your KV namespace active during migration
2. Re-add the KV binding to wrangler.jsonc or Pages settings
3. Revert code changes by checking out the previous commit
4. Redeploy

## Benefits of D1 Migration

- **Better Performance**: Indexed queries for faster lookups
- **More Flexible Queries**: Full SQL support
- **Better Data Integrity**: ACID compliance
- **Future Enhancements**: Easier to add features like search, filtering, and analytics

## Support

If you encounter issues during migration, please:
1. Check the [documentation](../README.md)
2. Review [FAQs](faqs.md)
3. Open an issue on [GitHub](https://github.com/ccbikai/Sink/issues)
