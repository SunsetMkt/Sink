import { z } from 'zod'

export default eventHandler(async (event) => {
  const db = useDB(event)
  const { limit, cursor } = await getValidatedQuery(event, z.object({
    limit: z.coerce.number().max(1024).default(20),
    cursor: z.coerce.number().default(0), // Changed to offset-based pagination
  }).parse)

  const { links, total } = await listLinks(db, limit, cursor)
  
  const hasMore = cursor + limit < total
  const nextCursor = hasMore ? cursor + limit : undefined

  return {
    links,
    list_complete: !hasMore,
    cursor: nextCursor?.toString(),
  }
})
