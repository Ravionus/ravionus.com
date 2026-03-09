const { chromium } = require('@playwright/test');
const { exec } = require('child_process');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  page.on('pageerror', e => errors.push(e.message.slice(0, 120)));

  const srv = exec('python -m http.server 9878 --directory ../', { cwd: __dirname });
  await new Promise(r => setTimeout(r, 1000));

  await page.goto('http://localhost:9878/tools/json/');
  await new Promise(r => setTimeout(r, 500));

  await page.click('#btnSample');
  await new Promise(r => setTimeout(r, 300));

  const inputVal  = await page.evaluate(() => document.getElementById('inputArea').value.slice(0, 50));
  const outputVal = await page.evaluate(() => document.getElementById('outputArea').value.slice(0, 50));
  const banner    = await page.evaluate(() => document.getElementById('validBanner').className);

  process.stdout.write('INPUT: ' + JSON.stringify(inputVal) + '\n');
  process.stdout.write('OUTPUT: ' + JSON.stringify(outputVal) + '\n');
  process.stdout.write('BANNER: ' + banner + '\n');
  process.stdout.write('ERRORS: ' + (errors.length ? errors[0] : 'none') + '\n');

  srv.kill();
  await browser.close();
})().catch(e => { process.stdout.write('FAIL: ' + e.message + '\n'); process.exit(1); });
