import type { ComponentType } from 'npm:react@18.3.1'

import { template as newConnectSubmission } from './new-connect-submission.tsx'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateEntry<P = any> {
  component: ComponentType<P>
  subject: string | ((data: P) => string)
  displayName?: string
  previewData?: P
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'new-connect-submission': newConnectSubmission,
}
