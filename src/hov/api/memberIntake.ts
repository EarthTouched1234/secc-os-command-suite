import type { HOVMember } from '../types/member'

const HOV_WEBHOOK =
  '/n8n/webhook/hov/member-intake'

export async function submitHOVMember(
  member: HOVMember
) {
  const response = await fetch(HOV_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(member),
  })

  if (!response.ok) {
    throw new Error(
      `HOV intake failed: ${response.status}`
    )
  }

  return response.json()
}