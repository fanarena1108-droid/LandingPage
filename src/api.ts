import { config } from './config';

export class SubmissionError extends Error {
  constructor(
    message: string,
    public kind:
      'duplicate' | 'validation' | 'rate_limit' | 'server' = 'server',
    public retryAfterSeconds: number | null = null,
  ) {
    super(message);
  }
}

export type DesktopContactBody = {
  email: string;
  category: 'General query' | 'Feedback' | 'Grievance';
  message: string;
};

export type MobileContactBody = {
  name: string;
  email: string;
  topic: 'Query' | 'Feedback' | 'Grievance';
  message: string;
};

type PublicError = { code?: unknown; retry_after_seconds?: unknown };

async function readPublicError(response: Response): Promise<PublicError> {
  try {
    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null || !('error' in body))
      return {};
    const error = body.error;
    return typeof error === 'object' && error !== null ? error : {};
  } catch {
    return {};
  }
}

/** Public requests use only the configured API; no client credentials are sent. */
async function submit(
  endpoint: string,
  payload: object,
  operation: 'waitlist' | 'contact',
  idempotencyKey?: string,
) {
  if (!endpoint)
    throw new SubmissionError(
      'Submissions are not available yet. Please try again later.',
    );
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (operation === 'contact' && idempotencyKey)
    headers['Idempotency-Key'] = idempotencyKey;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (response.ok) return;

  const error = await readPublicError(response);
  if (
    operation === 'waitlist' &&
    response.status === 409 &&
    error.code === 'WAITLIST_ALREADY_REGISTERED'
  )
    throw new SubmissionError(
      'You’re already on the waitlist. We’ll be in touch!',
      'duplicate',
    );
  if (response.status === 400 || error.code === 'VALIDATION_ERROR')
    throw new SubmissionError(
      'Please check your details and try again.',
      'validation',
    );
  if (response.status === 429) {
    const seconds = error.retry_after_seconds;
    const retryAfterSeconds =
      typeof seconds === 'number' &&
      Number.isSafeInteger(seconds) &&
      seconds > 0
        ? seconds
        : null;
    throw new SubmissionError(
      retryAfterSeconds
        ? `Too many attempts. Please try again in ${retryAfterSeconds} seconds.`
        : 'Too many attempts. Please try again shortly.',
      'rate_limit',
      retryAfterSeconds,
    );
  }
  throw new SubmissionError(
    'We couldn’t send this right now. Your details are saved here — please try again.',
  );
}

export const joinWaitlist = (email: string) =>
  submit(config.waitlistEndpoint, { email }, 'waitlist');
export const sendSupport = (
  values: DesktopContactBody | MobileContactBody,
  idempotencyKey: string,
) => submit(config.supportEndpoint, values, 'contact', idempotencyKey);

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
