import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendEmail({ to, subject, html, from }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');
  if (!to) throw new Error('`to` is required');
  if (!subject) throw new Error('`subject` is required');

  const payload = {
    from: from || process.env.RESEND_FROM_EMAIL || 'Customer Service <customerservice@deftship.site>',
    to,
    subject,
    html,
  };

  const res = await axios.post(RESEND_API_URL, payload, {
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
}

export default { sendEmail };
