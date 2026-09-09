import { config } from './config';

export class SubmissionError extends Error {
  constructor(
    message: string,
    public kind: 'duplicate' | 'server' = 'server',
  ) {
    super(message);
  }
}

/** Proposed adapter contract, documented in README. No request without configuration. */
async function submit(endpoint: string, payload: Record<string, string>) {
  if (!endpoint)
    throw new SubmissionError(
      'Submissions are not available yet. Please try again later.',
    );
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 409)
    throw new SubmissionError(
      'You’re already on the waitlist. We’ll be in touch!',
      'duplicate',
    );
  if (!response.ok)
    throw new SubmissionError(
      'We couldn’t send this right now. Your details are saved here — please try again.',
    );
}

export const joinWaitlist = (email: string) =>
  submit(config.waitlistEndpoint, { email });
export const sendSupport = (values: Record<string, string>) =>
  submit(config.supportEndpoint, values);

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
