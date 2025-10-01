import { LinkSchema } from '@@/schemas/link'

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)
  const { caseSensitive } = useRuntimeConfig(event)

  if (!caseSensitive) {
    link.slug = link.slug.toLowerCase()
  }

  const db = useDB(event)

  // Check if link exists
  const existingLink = await getLinkBySlug(db, link.slug)

  if (existingLink) {
    // If link exists, return it along with the short link
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
    return { link: existingLink, shortLink, status: 'existing' }
  }

  // If link doesn't exist, create it
  await createLink(db, link)

  setResponseStatus(event, 201)
  const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
  return { link, shortLink, status: 'created' }
})
