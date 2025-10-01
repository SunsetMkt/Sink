export default eventHandler(async (event) => {
  const slug = getQuery(event).slug
  if (slug) {
    const db = useDB(event)
    const link = await getLinkBySlug(db, slug as string)
    if (link) {
      return link
    }
  }
  throw createError({
    status: 404,
    statusText: 'Not Found',
  })
})
