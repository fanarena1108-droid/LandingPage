import { config } from './config';

export class SubmissionError extends Error {
  constructor(
    message: string,
    public kind:
      'duplicate' | 'server' | 'rate_limit' | 'validation' = 'server',
    public retryAfterSeconds: number | null = null,
  ) {
    super(message);
  }
}

/** Proposed adapter contract, documented in README. No request without configuration. */
async function submit(
  endpoint: string,
  payload: Record<string, string>,
  waitlist = false,
  key?: string,
) {
  if (!endpoint)
    throw new SubmissionError(
      'Submissions are not available yet. Please try again later.',
    );
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (waitlist && response.status === 409)
    throw new SubmissionError(
      'You’re already on the waitlist. We’ll be in touch!',
      'duplicate',
    );
  if (response.status === 429) {
    const header = response.headers.get('Retry-After');
    const seconds = header && /^\d+$/.test(header) ? Number(header) : null;
    throw new SubmissionError(
      seconds
        ? `Please try again in ${seconds} seconds.`
        : 'Please wait before trying again.',
      'rate_limit',
      seconds,
    );
  }
  if (response.status === 400)
    throw new SubmissionError(
      'Please check your details and try again.',
      'validation',
    );
  if (!response.ok)
    throw new SubmissionError(
      'We couldn’t send this right now. Your details remain in this form — please try again.',
    );
}

export const joinWaitlist = (email: string) =>
  submit(config.waitlistEndpoint, { email }, true);
export type SupportPayload =
  | {
      email: string;
      category: 'General query' | 'Feedback' | 'Grievance';
      message: string;
    }
  | {
      name: string;
      email: string;
      topic: 'Query' | 'Feedback' | 'Grievance';
      message: string;
    };
export const sendSupport = (values: SupportPayload, key: string) =>
  submit(config.supportEndpoint, values, false, key);

export async function getWaitlistTotal(
  signal: AbortSignal,
): Promise<number | null> {
  if (!config.counterEndpoint) return null;
  const response = await fetch(config.counterEndpoint, { signal });
  if (!response.ok) throw new Error('Counter unavailable');
  const data: unknown = await response.json();
  if (
    typeof data === 'object' &&
    data !== null &&
    'total' in data &&
    typeof data.total === 'number' &&
    Number.isSafeInteger(data.total) &&
    data.total >= 0
  )
    return data.total;
  throw new Error('Counter response must contain a non-negative integer total');
}
