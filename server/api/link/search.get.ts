export default eventHandler(async (event) => {
  const db = useDB(event)

  try {
    const links = await searchLinks(db)
    return links.map(link => ({
      slug: link.slug,
      url: link.url,
      comment: link.comment,
    }))
  }
  catch (err) {
    console.error('Error fetching link list:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch link list',
    })
  }
})
