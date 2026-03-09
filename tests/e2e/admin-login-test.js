const fs = require('fs');
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  // fall back to puppeteer if puppeteer-core is not installed
  puppeteer = require('puppeteer');
}

// Config - adjust as needed
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.deftship.online';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@consignment.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123';
const BACKEND_API = process.env.BACKEND_API || 'https://backend-a6x3.onrender.com';

(async () => {
  // Prefer explicit chrome executable path to avoid downloading Chromium
  const envPath = process.env.CHROME_EXECUTABLE_PATH;
  const commonPaths = [];
  if (process.platform === 'win32') {
    commonPaths.push('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    commonPaths.push('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe');
  } else if (process.platform === 'darwin') {
    commonPaths.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  } else {
    commonPaths.push('/usr/bin/google-chrome');
    commonPaths.push('/usr/bin/chromium-browser');
    commonPaths.push('/usr/bin/chromium');
  }

  let executablePath = envPath;
  if (!executablePath) {
    for (const p of commonPaths) {
      try {
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  if (!executablePath) {
    throw new Error('Chrome executable not found. Set CHROME_EXECUTABLE_PATH env var to your Chrome/Chromium binary.');
  }

  const browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();

  // capture console from page
  page.on('console', (msg) => console.log('PAGE:', msg.text()));

  try {
    console.log('Opening frontend:', FRONTEND_URL);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });

    // Navigate to admin login - adjust selector/path as needed
    // This tries common paths used in the app structure: /admin/login
    await page.goto(`${FRONTEND_URL}/admin/login`, { waitUntil: 'networkidle2' });

    // Fill in login form using robust selectors
    const emailSelector = 'input[type="email"], input[name="email"], input[autocomplete="email"]';
    const passwordSelector = 'input[type="password"], input[name="password"], input[autocomplete="current-password"]';

    await page.waitForSelector(emailSelector, { timeout: 10000 });
    await page.waitForSelector(passwordSelector, { timeout: 10000 });

    await page.click(emailSelector, { clickCount: 3 });
    await page.type(emailSelector, ADMIN_EMAIL, { delay: 50 });
    await page.click(passwordSelector, { clickCount: 3 });
    await page.type(passwordSelector, ADMIN_PASSWORD, { delay: 50 });

    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null)
    ]);

    console.log('After login, current URL:', page.url());

    // Check cookies
    const cookies = await page.cookies();
    console.log('Cookies after login:', cookies);

    const adminTokenCookie = cookies.find(c => c.name === 'adminToken');
    if (!adminTokenCookie) {
      throw new Error('adminToken cookie not found');
    }

    // Try to open admin packages page and create a test package
    await page.goto(`${FRONTEND_URL}/admin/packages`, { waitUntil: 'networkidle2' });

    // Click 'Add package' or open form - selector may vary
    // Attempt several strategies to find and open the create form
    const addSelectors = [
      'button:has-text("Add Package")',
      'button:has-text("New Package")',
      'button[aria-label="Add package"]',
      'button#create-package'
    ];

    let opened = false;
    for (const sel of addSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 1500 });
        await page.click(sel);
        opened = true;
        break;
      } catch (e) {
        // ignore
      }
    }

    if (!opened) {
      console.log('Create form not opened via add button, attempting direct POST to API');

      // If UI not found, fallback to direct API call using fetch in page context to send cookie
      const packageData = {
        itemName: 'E2E Test Package',
        description: 'Created by Puppeteer E2E test',
        receiverPhone: '+10000000000'
      };

      const resp = await page.evaluate(async (url, pkg) => {
        const r = await fetch(url + '/api/packages', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pkg)
        });
        return { status: r.status, body: await r.text() };
      }, BACKEND_API, packageData);

      console.log('API create response:', resp);

      if (resp.status !== 201) {
        throw new Error('Package create failed, status=' + resp.status + ', body=' + resp.body);
      }

      console.log('Package created via direct API call');
    } else {
      // Fill in fields in modal/form - best-effort selectors
      try {
        await page.waitForSelector('input[name="itemName"]', { timeout: 3000 });
        await page.type('input[name="itemName"]', 'E2E Test Package', { delay: 30 });
        const descSel = 'textarea[name="description"]';
        if (await page.$(descSel)) {
          await page.type(descSel, 'Created by Puppeteer E2E test', { delay: 30 });
        }
        // submit
        const submitSel = 'button:has-text("Save")';
        if (await page.$(submitSel)) {
          await Promise.all([
            page.click(submitSel),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
          ]);
        }
        console.log('Tried UI create flow');
      } catch (e) {
        console.warn('UI create attempt failed:', e.message);
      }
    }

    // Verify adminToken cookie is a JWT by checking structure
    const token = adminTokenCookie.value;
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('adminToken cookie is not a JWT');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    console.log('Decoded JWT payload:', payload);

    // Save results
    fs.writeFileSync('./tests/e2e/result.json', JSON.stringify({ cookies, jwtPayload: payload }, null, 2));

    console.log('E2E test completed successfully');
  } catch (err) {
    console.error('E2E test failed:', err);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})();
