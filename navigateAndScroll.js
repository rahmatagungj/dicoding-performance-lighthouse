import fs from 'fs';
import open from 'open';
import puppeteer from 'puppeteer';
import pkg from 'lighthouse/lighthouse-core/fraggle-rock/api.js';
const {startFlow} = pkg;


async function captureReport() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  // Get a session handle to be able to send protocol commands to the page.
  const session = await page.target().createCDPSession();

  const testUrl = 'https://dicoding.com';
  const flow = await startFlow(page, {name: 'CLS during navigation and on scroll'});

  // Regular Lighthouse navigation.
  await flow.navigate(testUrl, {stepName: 'Navigate only'});

  // Navigate and scroll timespan.
  await flow.startTimespan({stepName: 'Navigate and scroll'});
  await page.goto(testUrl, {waitUntil: 'networkidle0'});
  await session.send('Input.synthesizeScrollGesture', {
    x: 100,
    y: 0,
    yDistance: -2500,
    speed: 1000,
    repeatCount: 2,
    repeatDelayMs: 250,
  });
  await flow.endTimespan();

  await browser.close();

  const report = flow.generateReport();
  fs.writeFileSync('flow.report.html', report);
  open('flow.report.html', {wait: false});
}

captureReport();