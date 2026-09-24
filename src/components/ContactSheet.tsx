import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { sendSupport, SubmissionError, type MobileContactBody } from '../api';
type Draft = {
  name: string;
  email: string;
  topic: MobileContactBody['topic'] | '';
  message: string;
};
type Errors = Partial<Record<keyof Draft, string>>;
const empty: Draft = { name: '', email: '', topic: '', message: '' };
const messages = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  topic: 'Choose a topic.',
  message: 'Enter your message.',
};
export function ContactSheet() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState('idle');
  const [status, setStatus] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const idempotencyKey = useRef<string | null>(null);
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    if (draft[key] !== value) idempotencyKey.current = null;
    setDraft((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
    if (state === 'error') {
      setState('idle');
      setStatus('');
    }
  }
  const close = () => {
    if (history.state?.fanarenaContact) history.back();
    else setOpen(false);
  };
  useEffect(() => {
    if (!open) return;
    const el = dialog.current!;
    const opener = trigger.current;
    const root = document.getElementById('root')!;
    const position = scrollY;
    const original = document.body.style.cssText;
    root.inert = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${position}px`;
    document.body.style.width = '100%';
    el.showModal();
    el.querySelector<HTMLButtonElement>('.sheet-close')?.focus();
    const viewport = () => {
      el.style.maxHeight = `${visualViewport?.height ?? innerHeight}px`;
      el.style.top = `${visualViewport?.offsetTop ?? 0}px`;
      el.style.bottom = 'auto';
      el.style.marginTop = `${Math.max(0, (visualViewport?.height ?? innerHeight) - el.offsetHeight)}px`;
    };
    const back = () => setOpen(false);
    const resized = () => {
      viewport();
      if (innerWidth >= 768) {
        if (history.state?.fanarenaContact) history.back();
        else setOpen(false);
      }
    };
    viewport();
    const observer = new ResizeObserver(viewport);
    observer.observe(el);
    visualViewport?.addEventListener('resize', viewport);
    visualViewport?.addEventListener('scroll', viewport);
    window.addEventListener('popstate', back);
    window.addEventListener('resize', resized);
    return () => {
      observer.disconnect();
      visualViewport?.removeEventListener('resize', viewport);
      visualViewport?.removeEventListener('scroll', viewport);
      window.removeEventListener('popstate', back);
      window.removeEventListener('resize', resized);
      el.close();
      root.inert = false;
      document.body.style.cssText = original;
      window.scrollTo({ top: position, behavior: 'instant' });
      opener?.focus({ preventScroll: true });
    };
  }, [open]);
  function validate(key: keyof Draft) {
    const value = draft[key].trim();
    return !value ||
      (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ||
      (key === 'topic' && !['Query', 'Feedback', 'Grievance'].includes(value))
      ? messages[key]
      : undefined;
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const next: Errors = {};
    (Object.keys(draft) as (keyof Draft)[]).forEach((key) => {
      const error = validate(key);
      if (error) next[key] = error;
    });
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    pending.current = true;
    setState('sending');
    setStatus('Sending your message…');
    try {
      const payload: MobileContactBody = {
        name: draft.name.trim(),
        email: draft.email.trim(),
        topic: draft.topic as MobileContactBody['topic'],
        message: draft.message.trim(),
      };
      idempotencyKey.current ??= crypto.randomUUID();
      await sendSupport(payload, idempotencyKey.current);
      idempotencyKey.current = null;
      setState('success');
      setStatus('Message sent. Thanks for getting in touch.');
      setDraft(empty);
    } catch (error) {
      setState('error');
      setStatus(
        error instanceof SubmissionError
          ? error.message
          : 'Couldn’t send. Your message is saved here. Try again.',
      );
    } finally {
      pending.current = false;
      requestAnimationFrame(() =>
        dialog.current?.querySelector<HTMLElement>('[role="status"]')?.focus(),
      );
    }
  }
  return (
    <>
      <button
        ref={trigger}
        className="button mobile-only contact-trigger"
        onClick={() => {
          if (state === 'success') setState('idle');
          history.pushState({ ...history.state, fanarenaContact: true }, '');
          setOpen(true);
        }}
      >
        CONTACT US →
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="contact-sheet"
            aria-labelledby="contact-title"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return;
              const controls = [
                ...event.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
                ),
              ];
              const first = controls[0],
                last = controls.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
            onCancel={(e) => {
              e.preventDefault();
              close();
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const r = e.currentTarget.getBoundingClientRect();
                if (
                  e.clientX < r.left ||
                  e.clientX > r.right ||
                  e.clientY < r.top ||
                  e.clientY > r.bottom
                )
                  close();
              }
            }}
          >
            <button className="sheet-close" onClick={close}>
              Close ×
            </button>
            <h2 id="contact-title">
              {state === 'success' ? 'You’re all set.' : 'How can we help?'}
            </h2>
            <p role="status" tabIndex={-1} className={`sheet-status ${state}`}>
              {status}
            </p>
            {state === 'success' ? (
              <button className="button" onClick={close}>
                DONE
              </button>
            ) : (
              <form
                noValidate
                onSubmit={submit}
                aria-label="Contact FanArena mobile"
                aria-busy={state === 'sending'}
              >
                {(Object.keys(draft) as (keyof Draft)[]).map((key) => {
                  const props = {
                    id: `contact-${key}`,
                    name: key,
                    value: draft[key],
                    required: true,
                    'aria-invalid': Boolean(errors[key]),
                    'aria-describedby': errors[key]
                      ? `contact-${key}-error`
                      : undefined,
                    onChange: (
                      e: React.ChangeEvent<
                        | HTMLInputElement
                        | HTMLSelectElement
                        | HTMLTextAreaElement
                      >,
                    ) => update(key, e.target.value as Draft[typeof key]),
                    onBlur: () =>
                      setErrors((old) => ({ ...old, [key]: validate(key) })),
                  };
                  return (
                    <div className="field" key={key}>
                      <label htmlFor={props.id}>
                        {key[0].toUpperCase() + key.slice(1)}
                      </label>
                      {key === 'topic' ? (
                        <select {...props} disabled={pending.current}>
                          <option value="">Select a topic</option>
                          {['Query', 'Feedback', 'Grievance'].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      ) : key === 'message' ? (
                        <textarea
                          {...props}
                          readOnly={pending.current}
                          maxLength={2000}
                          placeholder="Tell us what’s on your mind"
                        />
                      ) : (
                        <input
                          {...props}
                          readOnly={pending.current}
                          type={key === 'email' ? 'email' : 'text'}
                          autoComplete={key === 'email' ? 'email' : 'name'}
                          maxLength={key === 'email' ? 254 : 100}
                          placeholder={
                            key === 'email' ? 'you@email.com' : 'Your name'
                          }
                        />
                      )}
                      {errors[key] && (
                        <p className="field-error" id={`contact-${key}-error`}>
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
                <button className="button" disabled={state === 'sending'}>
                  {state === 'sending'
                    ? 'SENDING…'
                    : state === 'error'
                      ? 'TRY AGAIN'
                      : 'SEND MESSAGE →'}
                </button>
              </form>
            )}
          </dialog>,
          document.body,
        )}
    </>
  );
}
