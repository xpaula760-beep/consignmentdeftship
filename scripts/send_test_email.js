#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Customer Service <customerservice@deftship.site>'
const TO = process.env.TEST_EMAIL || 'thenewageyy@gmail.com';

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY not set in environment');
  process.exit(1);
}

async function send() {
  const templatePath = path.join(process.cwd(), 'src', 'app', 'emails', 'payment-pending.html');
  if (!fs.existsSync(templatePath)) {
    console.error('Template not found:', templatePath);
    process.exit(1);
  }

  let html = fs.readFileSync(templatePath, 'utf8');
  html = html.replace(/{{name}}/g, 'Quinn LeMond')
    .replace(/{{tracking}}/g, 'DFT-DHLD-20260503-QL')
    .replace(/{{fee}}/g, '2550.00')
    .replace(/{{destination}}/g, '1919 Mickle Creek Drive, Houston, TX')
    .replace(/{{pay_url}}/g, 'https://www.deftship.site/paynow')
    .replace(/{{phone}}/g, '832-552-8338')
    .replace(/{{eta}}/g, '6 Days');

  try {
    const res = await axios.post('https://api.resend.com/emails', {
      from: RESEND_FROM_EMAIL,
      to: TO,
      subject: 'Payment Pending - Deftship',
      html
    }, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent:', res.data);
  } catch (err) {
    console.error('Send failed:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

send();
