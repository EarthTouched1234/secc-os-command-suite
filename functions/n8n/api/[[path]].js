export async function onRequest(context) {
  const { request, env, params } = context
  const path = params.path ? params.path.join('/') : ''
  const url = new URL(request.url)
  const target = `https://sunnicommandcenter.app.n8n.cloud/api/${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('X-N8N-API-KEY', env.N8N_API_KEY)
  headers.delete('host')

  return fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  })
}
