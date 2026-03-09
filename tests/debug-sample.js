const { chromium } = require('@playwright/test');
const { exec } = require('child_process');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PageError: ' + e.message));

  const srv = exec('python -m http.server 9877 --directory ../', { cwd: __dirname });
  await new Promise(r => setTimeout(r, 1000));

  await page.goto('http://localhost:9877/tools/json/');
  await new Promise(r => setTimeout(r, 500));

  console.log('Errors on load:', errors.length ? errors : 'none');
  errors.length = 0;

  const before = await page.evaluate(() => document.getElementById('inputArea').value);
  console.log('Input before:', JSON.stringify(before.slice(0, 50)));

  await page.click('#btnSample');
  await new Promise(r => setTimeout(r, 300));

  const inputVal  = await page.evaluate(() => document.getElementById('inputArea').value);
  const outputVal = await page.evaluate(() => document.getElementById('outputArea').value);
  const treeHtml  = await page.evaluate(() => document.getElementById('treeView').innerHTML);
  const banner    = await page.evaluate(() => document.getElementById('validBanner').className);

  console.log('Input after:', JSON.stringify(inputVal.slice(0, 80)));
  console.log('Output after:', JSON.stringify(outputVal.slice(0, 80)));
  console.log('Tree length:', treeHtml.length);
  console.log('Valid banner class:', banner);
  console.log('Errors after click:', errors.length ? errors : 'none');

  srv.kill();
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
