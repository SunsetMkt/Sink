# Deployment on Cloudflare Workers

1. [Fork](https://github.com/ccbikai/Sink/fork) the repository to your GitHub account.
2. Create a [D1 database](https://developers.cloudflare.com/d1/) (under **Storage & Databases** -> **D1**), and copy the database ID.
3. Run the database migrations using Wrangler CLI:
   ```bash
   npx wrangler d1 execute sink --file=./migrations/0001_initial_schema.sql
   ```
4. Update the `d1_databases` database_id in `wrangler.jsonc` with your own database ID.
5. Create a project in [Cloudflare Workers](https://developers.cloudflare.com/workers/).
6. Select the `Sink` repository and use the following build and deploy commands:
   - **Build command**: `pnpm run build` or `npm run build`
   - **Deploy command**: `npx wrangler deploy`

7. Save and deploy the project.
8. After deployment, go to **Settings** -> **Variables and Secrets** -> **Add**, and configure the following environment variables:
   - `NUXT_SITE_TOKEN`: Must be at least **8** characters long. This token grants access to your dashboard.
   - `NUXT_CF_ACCOUNT_ID`: Find your [account ID](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/).
   - `NUXT_CF_API_TOKEN`: Create a [Cloudflare API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with at least `Account.Account Analytics` permission. [See reference.](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/#authentication)

9. Enable Analytics Engine. In **Workers & Pages**, go to **Account details** in the right panel, locate **Analytics Engine**, and click **Set up** to enable the free tier.
10. Redeploy the project.
11. To update your code, refer to the official GitHub documentation: [Syncing a fork branch from the web UI](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui 'GitHub: Syncing a fork').
