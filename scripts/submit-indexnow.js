// Script to submit all site URLs to IndexNow via your Next.js API route
// Usage: node scripts/submit-indexnow.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dissolvagum.com';
const API_URL = `${BASE_URL}/api/indexnow`;
const SUBMITTED_URLS_PATH = path.join(__dirname, 'submitted-urls.json');

const urls = [
  `${BASE_URL}/`,
  `${BASE_URL}/about`,
  `${BASE_URL}/faq`,
  `${BASE_URL}/contact`,
  `${BASE_URL}/how-it-works`,
  `${BASE_URL}/legal/terms`,
  `${BASE_URL}/legal/privacy`,
  `${BASE_URL}/legal/accessibility`,
  `${BASE_URL}/business-interest`,
  `${BASE_URL}/support-interest`,
  `${BASE_URL}/sitemap.xml`
];

function getSubmittedUrls() {
  if (fs.existsSync(SUBMITTED_URLS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SUBMITTED_URLS_PATH, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveSubmittedUrls(urls) {
  fs.writeFileSync(SUBMITTED_URLS_PATH, JSON.stringify(urls, null, 2));
}

async function main() {
  const submittedUrls = getSubmittedUrls();
  const newUrls = urls.filter(url => !submittedUrls.includes(url));
  if (newUrls.length === 0) {
    console.log('No new URLs to submit.');
    return;
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: newUrls })
    });
    const data = await res.json();
    if (data.success) {
      console.log('IndexNow submission successful for new URLs!');
      saveSubmittedUrls([...submittedUrls, ...newUrls]);
    } else {
      console.error('IndexNow submission failed:', data);
    }
  } catch (err) {
    console.error('Error submitting to IndexNow:', err);
  }
}

main();
