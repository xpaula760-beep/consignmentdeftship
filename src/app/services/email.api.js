const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function sendTemplateEmail({ to, subject, template = 'payment-pending', data = {} }) {
  const url = (API_BASE ? API_BASE.replace(/\/$/, '') : '') + '/api/email';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, template, data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send email');
  }

  return res.json();
}

export default { sendTemplateEmail };
