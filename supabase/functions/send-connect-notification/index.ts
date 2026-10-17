import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js@0.1.0'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

// Sends the "new connect submission" notification to Josh when someone
// scans the closing QR code and fills in the connect form.
// The recipient is fixed, so anonymous callers can never redirect email
// anywhere else — worst case is the same spam the public form allows anyway.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const RECIPIENT = 'josh@joshpenzell.com'
const FROM = 'Rehearsing the Future <noreply@notify.joshpenzell.com>'
const SENDER_DOMAIN = 'notify.joshpenzell.com'
const TEMPLATE_NAME = 'new-connect-submission'

const trim = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: corsHeaders },
    )
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500, headers: corsHeaders },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: corsHeaders },
    )
  }

  const template = TEMPLATES[TEMPLATE_NAME]
  if (!template) {
    return Response.json(
      { error: 'Template not found' },
      { status: 500, headers: corsHeaders },
    )
  }

  const data = {
    name: trim(body.name, 100),
    email: trim(body.email, 255),
    note: trim(body.note, 1000),
    wantsSlides: body.wantsSlides === true,
    wantsFollowup: body.wantsFollowup === true,
    linkedinClicked: body.linkedinClicked === true,
    submittedAt: trim(body.submittedAt, 40) ?? new Date().toISOString(),
    userAgent: trim(body.userAgent, 300),
  }

  try {
    const element = React.createElement(template.component, data)
    const html = await renderAsync(element)
    const text = await renderAsync(element, { plainText: true })
    const subject =
      typeof template.subject === 'function'
        ? template.subject(data)
        : template.subject

    await sendLovableEmail(
      {
        to: RECIPIENT,
        from: FROM,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        idempotency_key: trim(body.idempotencyKey, 120) ?? crypto.randomUUID(),
        label: TEMPLATE_NAME,
      },
      {
        apiKey,
        sendUrl: Deno.env.get('LOVABLE_SEND_URL'),
      },
    )
  } catch (err) {
    console.error('connect notification send failed:', err)
    return Response.json(
      { error: 'Failed to send notification' },
      { status: 500, headers: corsHeaders },
    )
  }

  return Response.json({ success: true }, { headers: corsHeaders })
})
