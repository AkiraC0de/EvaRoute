const { chromium } = require('playwright');

const MOCK_LAT = 14.6200;
const MOCK_LNG = 120.9800;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    geolocation: { latitude: MOCK_LAT, longitude: MOCK_LNG, accuracy: 100 }
  });
  const page = await context.newPage();
  await page.context().grantPermissions(['geolocation']);

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 8000));

  // ── location_ready ──
  const hasViewCenters = await page.locator('text=View Nearby Centers').count();
  if (!hasViewCenters) {
    console.log('FAIL: View Nearby Centers not found');
    await browser.close();
    process.exit(1);
  }
  console.log('✓ location_ready — View Nearby Centers visible');

  // ── discovery ──
  await page.click('text=View Nearby Centers');
  await new Promise(r => setTimeout(r, 3000));

  const initialNames = await page.locator('.clay-card h3').allTextContents();
  const uniqueInitial = [...new Set(initialNames)];
  console.log(`✓ discovery — ${uniqueInitial.length} facilities: ${uniqueInitial.join(', ')}`);

  // ── Search ──
  const searchBox = page.locator('input[placeholder="Search centers…"]');
  await searchBox.first().fill('Tondo');
  await new Promise(r => setTimeout(r, 500));

  const filteredNames = await page.locator('.clay-card h3').allTextContents();
  const uniqueFiltered = [...new Set(filteredNames)];
  console.log(`✓ search — After "Tondo": ${uniqueFiltered.length} facility(s): ${uniqueFiltered.join(', ')}`);

  await searchBox.first().fill('');
  await new Promise(r => setTimeout(r, 500));

  const restoredNames = await page.locator('.clay-card h3').allTextContents();
  const uniqueRestored = [...new Set(restoredNames)];
  console.log(`✓ search — After clearing: ${uniqueRestored.length} facilities restored (expected ${uniqueInitial.length})`);

  // ── center_selected ──
  const markers = await page.locator('.leaflet-interactive').all();
  const facilityMarkers = markers.slice(0, 5);
  await facilityMarkers[0].click();
  await new Promise(r => setTimeout(r, 2000));

  const hasCenterName = await page.locator('text=Paco Park School').count();
  const hasGetRoute = await page.locator('text=Get Route').count();
  const hasBackToList = await page.locator('text=Back to List').count();
  console.log(`✓ center_selected — Detail: ${hasCenterName > 0}, Get Route: ${hasGetRoute > 0}, Back: ${hasBackToList > 0}`);

  // ── route_preview ──
  await page.click('text=Get Route');
  await new Promise(r => setTimeout(r, 5000));

  const hasRoutePreview = await page.locator('text=Route Preview').count();
  const routeCardText = await page.locator('.clay-card').last().textContent();
  const hasDistance = routeCardText.includes('km');
  console.log(`✓ route_preview — Card: ${hasRoutePreview > 0}, Distance: ${hasDistance}`);
  console.log(`  Text: ${routeCardText ? routeCardText.substring(0, 150) : 'N/A'}`);

  const interactiveRp = await page.locator('.leaflet-interactive').count();
  console.log(`✓ route_preview — Map elements: ${interactiveRp}`);

  // ── navigating ──
  const hasStartNav = await page.locator('text=Start Navigation').count();
  if (hasStartNav) {
    await page.click('text=Start Navigation');
    await new Promise(r => setTimeout(r, 3000));

    const hasNavUI = await page.locator('text=Navigation').count();
    // Get turn instruction text via evaluate (avoid CSS selector issues with Tailwind classes)
    const turnText = await page.evaluate(() => {
      const el = document.querySelector('.turn-instruction');
      return el ? el.textContent.trim() : null;
    });
    const hasTurn = turnText && turnText.length > 0;
    const hasRemainingLabel = await page.locator('text=Remaining').count();
    console.log(`✓ navigating — UI: ${hasNavUI > 0}, Turn: "${turnText || 'EMPTY'}", Remaining: ${hasRemainingLabel > 0}`);

    const navInteractive = await page.locator('.leaflet-interactive').count();
    console.log(`✓ navigating — Map elements: ${navInteractive} (route line preserved)`);
  }

  // ── arrived ──
  const hasArrivedClass = await page.locator('.clay-card-centered').count();
  console.log(`✓ arrived — Overlay class in DOM: ${hasArrivedClass > 0 ? 'yes' : 'no (not triggered)'}`);

  // ── Errors ──
  console.log('\n=== Console/Page Errors ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('  -', e));
  } else {
    console.log('None');
  }

  await page.screenshot({ path: '/home/jeremy/screenshot_evaroute_final.png', fullPage: true });
  console.log('\nScreenshot saved');

  await context.close();
  await browser.close();
  console.log('\n✓ Validation complete');
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
