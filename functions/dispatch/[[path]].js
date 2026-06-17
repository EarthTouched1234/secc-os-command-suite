export async function onRequest(context) {
  const { request, env, params } = context
  const path = params.path ? params.path.join('/') : ''
  const target = `https://sunnicommandcenter.app.n8n.cloud/${path}`

  const headers = new Headers(request.headers)
  headers.set('x-horhanis-key', env.HORHANIS_KEY)
  headers.set('Content-Type', 'application/json')
  headers.delete('host')

  return fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  })
}
