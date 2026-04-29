import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sendEmail } from '@/lib/resend';

export const runtime = 'nodejs';

function renderTemplate(html, data = {}) {
  return html
    .replace(/{{name}}/g, data.name || '')
    .replace(/{{tracking}}/g, data.tracking || '')
    .replace(/{{fee}}/g, data.fee || '')
    .replace(/{{destination}}/g, data.destination || '')
    .replace(/{{pay_url}}/g, data.pay_url || '')
    .replace(/{{phone}}/g, data.phone || '')
    .replace(/{{eta}}/g, data.eta || '');
}

export async function POST(request) {
  try {
    // optional internal key protection
    if (process.env.RESEND_INTERNAL_KEY) {
      const key = request.headers.get('x-internal-key');
      if (!key || key !== process.env.RESEND_INTERNAL_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
    }

    const body = await request.json();
    const { to, subject, template = 'payment-pending', data = {} } = body || {};

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: 'Missing to or subject' }), { status: 400 });
    }

    const templatePath = path.join(process.cwd(), 'src', 'app', 'emails', `${template}.html`);
    const raw = readFileSync(templatePath, 'utf8');
    const html = renderTemplate(raw, data);

    const result = await sendEmail({ to, subject, html, from: process.env.RESEND_FROM_EMAIL });

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (err) {
    console.error('Email route error', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed' }), { status: 500 });
  }
}
