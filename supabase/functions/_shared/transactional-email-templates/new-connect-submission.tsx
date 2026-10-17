import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string | null
  email?: string | null
  note?: string | null
  wantsSlides?: boolean
  wantsFollowup?: boolean
  linkedinClicked?: boolean
  submittedAt?: string
  userAgent?: string
}

const fmtDate = (iso?: string) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

const Email = ({
  name,
  email,
  note,
  wantsSlides,
  wantsFollowup,
  linkedinClicked,
  submittedAt,
  userAgent,
}: Props) => {
  const interests: string[] = []
  if (wantsSlides) interests.push('Wants the slides when they go live')
  if (wantsFollowup) interests.push('Wants a follow-up conversation')
  if (linkedinClicked) interests.push('Clicked LinkedIn connect')

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        New connection from {name || email || 'a presentation attendee'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New connection from Rehearsing the Future</Heading>
          <Text style={subtitle}>
            Someone just submitted the /connect form.
          </Text>

          <Section style={card}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name || '—'}</Text>

            <Text style={label}>Email</Text>
            <Text style={value}>{email || '—'}</Text>

            <Text style={label}>Interests</Text>
            <Text style={value}>
              {interests.length ? interests.join(' · ') : '—'}
            </Text>

            {note ? (
              <>
                <Text style={label}>Note</Text>
                <Text style={value}>{note}</Text>
              </>
            ) : null}
          </Section>

          <Hr style={hr} />
          <Text style={meta}>Submitted: {fmtDate(submittedAt)}</Text>
          {userAgent ? <Text style={meta}>User agent: {userAgent}</Text> : null}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Props) =>
    `New connection: ${data.name || data.email || 'attendee'}`,
  displayName: 'New connect submission',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    note: 'Loved the section on directing AI. Would love to chat about QA enablement.',
    wantsSlides: true,
    wantsFollowup: true,
    linkedinClicked: false,
    submittedAt: new Date().toISOString(),
    userAgent: 'Mozilla/5.0',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}
const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 24px',
}
const h1 = {
  fontSize: '24px',
  lineHeight: '1.3',
  color: '#0f0a1f',
  margin: '0 0 8px',
}
const subtitle = {
  fontSize: '14px',
  color: '#6b6680',
  margin: '0 0 24px',
}
const card = {
  backgroundColor: '#faf8ff',
  border: '1px solid #ece6ff',
  borderRadius: '12px',
  padding: '20px 24px',
}
const label = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#8b5cf6',
  fontWeight: 600,
  margin: '12px 0 2px',
}
const value = {
  fontSize: '15px',
  color: '#1a1430',
  margin: '0 0 8px',
}
const hr = {
  borderColor: '#ece6ff',
  margin: '24px 0 16px',
}
const meta = {
  fontSize: '12px',
  color: '#9b96ad',
  margin: '4px 0',
}
