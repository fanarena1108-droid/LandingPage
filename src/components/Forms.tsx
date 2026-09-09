import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { joinWaitlist, sendSupport, SubmissionError } from '../api';
import { content } from '../content';
import { useMobile } from '../useMobile';

type Values = { email: string; category: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;
type State = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';

export function Forms({
  kind,
  onJoined,
}: {
  kind: 'waitlist' | 'support';
  onJoined?: () => void;
}) {
  const support = kind === 'support';
  const mobile = useMobile();
  const [values, setValues] = useState<Values>({
    email: '',
    category: 'General query',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState('');
  const pending = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const fieldId = (name: keyof Values) => `${kind}-${name}`;
  function update(name: keyof Values, value: string) {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: undefined }));
    if (state !== 'submitting') {
      setState('idle');
      setResult('');
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const next: Errors = {};
    const email = values.email.trim();
    const input = form.current!.elements.namedItem('email') as HTMLInputElement;
    if (!email || !input.validity.valid)
      next.email = 'Enter a valid email address.';
    if (support && !content.support.categories.includes(values.category))
      next.category = 'Choose a category.';
    if (support && !values.message.trim()) next.message = 'Enter your message.';
    setErrors(next);
    if (Object.keys(next).length) {
      setState('idle');
      setResult('');
      document
        .getElementById(fieldId(Object.keys(next)[0] as keyof Values))
        ?.focus({ preventScroll: true });
      return;
    }
    pending.current = true;
    setState('submitting');
    setResult('Sending…');
    try {
      if (support)
        await sendSupport({ ...values, email, message: values.message.trim() });
      else await joinWaitlist(email);
      setState('success');
      setResult(
        support
          ? 'Message sent. Thanks for getting in touch with FanArena.'
          : mobile
            ? 'You’re on the list.'
            : 'You’re on the list! We’ll email you when FanArena is ready.',
      );
      if (!support) onJoined?.();
      requestAnimationFrame(() =>
        status.current?.focus({ preventScroll: true }),
      );
    } catch (error) {
      const duplicate =
        !support &&
        error instanceof SubmissionError &&
        error.kind === 'duplicate';
      setState(duplicate ? 'duplicate' : 'error');
      setResult(
        mobile && !support
          ? duplicate
            ? 'You’re already on the list.'
            : 'Couldn’t join. Please try again.'
          : error instanceof SubmissionError &&
              (error.kind !== 'duplicate' || !support)
            ? error.message
            : 'We couldn’t send this right now. Please try again.',
      );
    } finally {
      pending.current = false;
    }
  }
  const props = (name: keyof Values) => ({
    id: fieldId(name),
    name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${fieldId(name)}-error` : undefined,
    readOnly: state === 'submitting',
    onBlur: () => {
      if (state === 'submitting') return;
      const control = form.current?.elements.namedItem(name) as
        HTMLInputElement | HTMLTextAreaElement | null;
      const message =
        name === 'email'
          ? !values.email.trim() || !control?.validity.valid
            ? 'Enter a valid email address.'
            : undefined
          : support && !values.message.trim()
            ? 'Enter your message.'
            : undefined;
      setErrors((old) => ({ ...old, [name]: message }));
    },
  });
  const errorText = (name: keyof Values) =>
    errors[name] && (
      <p className="field-error" id={`${fieldId(name)}-error`}>
        {errors[name]}
      </p>
    );

  return (
    <form
      ref={form}
      className={support ? 'support-form' : 'waitlist-form'}
      onSubmit={handleSubmit}
      noValidate
      aria-label={support ? 'Contact FanArena' : 'Join the waitlist'}
      aria-busy={state === 'submitting'}
    >
      {support && (
        <div className="form-heading">
          <h3>Send us a message</h3>
          <p>We’ll route it to the right person.</p>
        </div>
      )}
      <div className={support ? 'field' : 'email-capture'}>
        <label className={support ? '' : 'sr-only'} htmlFor={fieldId('email')}>
          Email address
        </label>
        <input
          {...props('email')}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@email.com"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
        />
        {!support && (
          <button
            className="button"
            type="submit"
            disabled={state === 'submitting'}
          >
            {state === 'submitting' ? 'JOINING…' : 'JOIN WAITLIST'}
            <span aria-hidden="true"> →</span>
          </button>
        )}
        {support && errorText('email')}
      </div>
      {!support && errorText('email')}
      {support && (
        <>
          <div className="field">
            <label htmlFor={fieldId('category')}>What is this about?</label>
            <select
              id={fieldId('category')}
              name="category"
              value={values.category}
              onChange={(e) => update('category', e.target.value)}
              required
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? 'support-category-error' : undefined
              }
            >
              {content.support.categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            {errorText('category')}
          </div>
          <div className="field">
            <label htmlFor={fieldId('message')}>Message</label>
            <textarea
              {...props('message')}
              required
              maxLength={5000}
              placeholder="Tell us what happened or how we can help…"
              value={values.message}
              onChange={(e) => update('message', e.target.value)}
            />
            {errorText('message')}
          </div>
          <button
            className="button"
            type="submit"
            disabled={state === 'submitting'}
          >
            {state === 'submitting' ? 'SENDING…' : 'SEND MESSAGE'}
            <span aria-hidden="true"> →</span>
          </button>
        </>
      )}
      {!support && <p className="privacy-note">{content.waitlist.privacy}</p>}
      <p
        ref={status}
        className={`form-status ${state}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
      >
        {result}
      </p>
    </form>
  );
}
