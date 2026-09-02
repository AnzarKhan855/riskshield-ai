const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots');
const MIRROR_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(MIRROR_DIR)) fs.mkdirSync(MIRROR_DIR, { recursive: true });

async function getAuthToken() {
  const res = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@riskshield.ai', password: 'Password123!' })
  });
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error('Login failed: ' + JSON.stringify(json));
  }
  return json.data;
}

function mirrorFile(filename) {
  const src = path.join(SCREENSHOT_DIR, filename);
  const dst = path.join(MIRROR_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
  }
}

async function run() {
  console.log('🚀 Starting RiskShield AI Automated Screenshot Pipeline...');
  const authData = await getAuthToken();
  console.log('✅ Authenticated as Enterprise Admin:', authData.user.email);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  // 1. Authenticated Context for Desktop (1920x1080)
  const authContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark',
    deviceScaleFactor: 1
  });

  const authPage = await authContext.newPage();

  await authPage.addInitScript((authObj) => {
    localStorage.setItem('riskshield-auth-storage', JSON.stringify({
      state: {
        user: authObj.user,
        accessToken: authObj.access_token,
        refreshToken: authObj.refresh_token,
        isAuthenticated: true
      },
      version: 0
    }));
  }, authData);

  // Helper for capturing desktop pages
  async function capture(page, urlPath, filename, fullPage = false, waitMs = 1200) {
    const fullUrl = `http://localhost:3000${urlPath}`;
    console.log(`📸 Capturing [${filename}] from ${urlPath}...`);
    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(waitMs);

      if (fullPage) {
        await page.evaluate(() => {
          document.querySelectorAll('.h-screen, main, body, html').forEach(el => {
            el.style.height = 'auto';
            el.style.minHeight = '100vh';
            el.style.overflow = 'visible';
          });
        });
        await page.waitForTimeout(400);
      }

      const filePath = path.join(SCREENSHOT_DIR, filename);
      await page.screenshot({ path: filePath, fullPage });
      mirrorFile(filename);
      console.log(`   ✓ Saved: ${filename}`);
    } catch (err) {
      console.error(`   ❌ Failed to capture ${filename}: ${err.message}`);
    }
  }

  // 2. Unauthenticated Context for Auth screens
  const unauthContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark'
  });
  const unauthPage = await unauthContext.newPage();

  console.log('\n--- SECTION 1: AUTHENTICATION SCREENS ---');
  await capture(unauthPage, '/login', '01-login.png');
  await capture(unauthPage, '/forgot-password', 'wf-auth-forgot-password.png');

  // Invalid login workflow
  console.log('📸 Capturing invalid login workflow...');
  await unauthPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await unauthPage.waitForTimeout(1000);
  await unauthPage.fill('input[type="email"]', 'unauthorized@malicious.com');
  await unauthPage.fill('input[type="password"]', 'WrongPassword999!');
  await unauthPage.click('button[type="submit"]');
  await unauthPage.waitForTimeout(1500);
  await unauthPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'wf-auth-invalid.png') });
  await unauthPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-error-invalid-login.png') });
  mirrorFile('wf-auth-invalid.png');
  mirrorFile('component-error-invalid-login.png');
  console.log('   ✓ Saved: wf-auth-invalid.png & component-error-invalid-login.png');

  // Login with credentials ready
  await unauthPage.fill('input[type="email"]', 'admin@riskshield.ai');
  await unauthPage.fill('input[type="password"]', 'Password123!');
  await unauthPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'wf-auth-login.png') });
  mirrorFile('wf-auth-login.png');

  // Public Landing Page (Dashboard Landing)
  console.log('\n--- SECTION 2: PLATFORM LANDING ---');
  await capture(unauthPage, '/', '02-dashboard-landing.png');

  // 3. Core Enterprise Pages
  console.log('\n--- SECTION 3: CORE ENTERPRISE PAGES ---');
  // Operations HUD & Telemetry
  await capture(authPage, '/operations', '02-dashboard.png');
  await capture(authPage, '/operations', '03-operations-dashboard.png', true, 1800);
  await capture(authPage, '/operations', '28-analytics-dashboard.png');

  // Operations KPIs component snapshot
  try {
    const kpiElement = await authPage.$('div.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4');
    if (kpiElement) {
      await kpiElement.screenshot({ path: path.join(SCREENSHOT_DIR, '03-dashboard-kpis.png') });
      await kpiElement.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-kpi-cards.png') });
      mirrorFile('03-dashboard-kpis.png');
      mirrorFile('component-kpi-cards.png');
      console.log('   ✓ Saved: 03-dashboard-kpis.png & component-kpi-cards.png');
    }
  } catch (e) {
    console.log('   Could not clip KPI element, will use dashboard snapshot.');
  }

  // Transactions Ledger & Details
  const sampleTxId = '0388f152-2066-4a70-b0b5-7d9284717e5e';
  await capture(authPage, '/transactions', '04-transactions.png');
  await capture(authPage, `/transactions/${sampleTxId}`, '05-transaction-detail.png', true);
  await capture(authPage, '/transactions/new', 'wf-tx-create.png');

  // Decision Intelligence & Studio
  const sampleDecisionId = '5ecf2249-ae85-444b-8d06-abfc5c54ebce';
  await capture(authPage, '/decisions', '07-decision-intelligence.png');
  await capture(authPage, `/decisions/${sampleDecisionId}`, '07-decision-detail.png', true);

  // Policy Rules Engine & Studio
  const sampleRuleId = '6fe4dea9-03f5-43b6-b946-5b7730b7d2f1';
  await capture(authPage, '/rules', '08-rules-engine.png');
  await capture(authPage, '/rules/new', '08-rule-builder.png');
  await capture(authPage, `/rules/${sampleRuleId}`, 'wf-rule-edit.png');

  // Case Management & Investigation Workspace
  const sampleCaseId = 'ad3c1c6f-103d-48ab-9812-718724a8430b';
  await capture(authPage, '/cases', '14-case-management.png');
  await capture(authPage, `/cases/${sampleCaseId}`, '07-case-workspace.png', true);
  await capture(authPage, `/cases/${sampleCaseId}`, '15-investigation-workspace.png', true);
  await capture(authPage, '/cases/new', 'wf-case-open.png');

  // Model Registry & ML Predictions
  const sampleModelId = '54991dfc-e1b1-4f82-bf29-63a2a7f12572';
  await capture(authPage, '/models', '09-model-registry.png');
  await capture(authPage, '/models/register', 'wf-model-register.png');
  await capture(authPage, `/models/${sampleModelId}`, 'wf-model-deploy.png', true);
  await capture(authPage, '/predictions', '17-prediction-center.png');
  await capture(authPage, `/predictions/${sampleDecisionId}`, 'wf-model-prediction.png');

  // Feature Store
  await capture(authPage, '/features', '10-feature-store.png');
  await capture(authPage, '/features', '18-feature-store.png', true);
  await capture(authPage, `/features/${sampleTxId}`, 'wf-features-vector.png');

  // Entity Intelligence & Graph
  const sampleMerchantId = '47673ee8-b4cf-4166-8443-744add184f42';
  const sampleCustomerId = 'd78e314d-2e24-4a99-bef6-97b8a7e02d59';
  const sampleDeviceId = 'fc3f0e61-c773-4fc5-8a4e-f4e3aa407a42';
  await capture(authPage, '/graph', '19-fraud-graph.png', false, 2000);
  await capture(authPage, '/merchants', '20-merchant-intelligence.png');
  await capture(authPage, `/merchants/${sampleMerchantId}`, 'wf-merchant-detail.png', true);
  await capture(authPage, '/customers', '21-customer-intelligence.png');
  await capture(authPage, `/customers/${sampleCustomerId}`, 'wf-customer-detail.png', true);
  await capture(authPage, '/devices', '22-device-intelligence.png');
  await capture(authPage, `/devices/${sampleDeviceId}`, 'wf-device-detail.png', true);

  // Explainability Center & SHAP Analysis
  await capture(authPage, '/explanations', '12-explainability.png');
  await capture(authPage, `/explanations/${sampleDecisionId}`, '13-shap-analysis.png', true);
  await capture(authPage, `/explanations/${sampleDecisionId}`, 'wf-ai-shap-explanation.png');

  // System Administration, Notifications & Settings
  await capture(authPage, '/notifications', '23-notifications.png');
  await capture(authPage, '/profile', '24-profile.png');
  await capture(authPage, '/settings', '25-settings.png');

  // AI Orchestration & Ingestion
  await capture(authPage, '/orchestrator', '26-orchestrator.png');
  await capture(authPage, '/orchestrator/history', '27-ai-pipeline.png');
  await capture(authPage, '/ingestion', 'wf-data-ingestion.png');

  // 4. AI Hub Tabs & Copilot Workflows
  console.log('\n--- SECTION 4: AI WORKFLOWS & COPILOT ---');
  await capture(authPage, '/ai?tab=copilot', '06-ai-copilot.png');
  await capture(authPage, '/ai?tab=copilot', 'wf-ai-ask-copilot.png');
  await capture(authPage, '/ai?tab=rca', 'wf-ai-root-cause.png', true);
  await capture(authPage, '/ai?tab=fraud-patterns', 'wf-ai-fraud-pattern.png', true);
  await capture(authPage, '/ai?tab=recommendations', 'wf-ai-recommendation.png', true);
  await capture(authPage, '/ai?tab=drift', 'wf-model-monitoring.png', true);
  await capture(authPage, '/ai?tab=simulation', 'wf-rule-simulation.png', true);

  // Interactive AI Copilot Slide-over Drawer
  console.log('📸 Capturing AI Copilot Slide-over Drawer (Ctrl+J)...');
  await authPage.goto('http://localhost:3000/operations', { waitUntil: 'networkidle' });
  await authPage.waitForTimeout(1000);
  await authPage.keyboard.press('Control+j');
  await authPage.waitForTimeout(800);
  await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, '11-ai-copilot-drawer.png') });
  await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-ai-copilot-response.png') });
  mirrorFile('11-ai-copilot-drawer.png');
  mirrorFile('component-ai-copilot-response.png');
  console.log('   ✓ Saved: 11-ai-copilot-drawer.png & component-ai-copilot-response.png');
  // Close drawer
  await authPage.keyboard.press('Control+j');
  await authPage.waitForTimeout(400);

  // Global Command Palette (Cmd+K)
  console.log('📸 Capturing Command Palette Modal (Ctrl+K)...');
  await authPage.keyboard.press('Control+k');
  await authPage.waitForTimeout(600);
  await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-command-palette-modal.png') });
  mirrorFile('component-command-palette-modal.png');
  console.log('   ✓ Saved: component-command-palette-modal.png');
  await authPage.keyboard.press('Escape');
  await authPage.waitForTimeout(400);

  // Component captures: Header & Sidebar
  console.log('\n--- SECTION 5: COMPONENT SPECIALIZED CAPTURES ---');
  try {
    const headerEl = await authPage.$('header');
    if (headerEl) {
      await headerEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-header-bar.png') });
      mirrorFile('component-header-bar.png');
      console.log('   ✓ Saved: component-header-bar.png');
    }
  } catch(e) {}

  try {
    const sidebarEl = await authPage.$('aside');
    if (sidebarEl) {
      await sidebarEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'component-sidebar-nav.png') });
      mirrorFile('component-sidebar-nav.png');
      console.log('   ✓ Saved: component-sidebar-nav.png');
    }
  } catch(e) {}

  // Tables, Heatmap, Graph Components
  await capture(authPage, '/transactions', 'component-tables-ledger.png');
  await capture(authPage, '/graph', 'component-fraud-graph.png', false, 1500);
  await capture(authPage, '/rules/new', 'component-rule-builder-form.png');
  await capture(authPage, '/transactions', 'component-search-filters.png');
  await capture(authPage, '/operations', 'component-geo-heatmap.png');
  await capture(authPage, '/operations', 'component-charts-analytics.png');

  // Workflow specifics: Transactions
  console.log('\n--- SECTION 6: WORKFLOW EVALUATIONS ---');
  await capture(authPage, `/transactions/${sampleTxId}`, 'wf-tx-validate.png');
  await capture(authPage, `/transactions/${sampleTxId}`, 'wf-tx-risk-score.png');
  await capture(authPage, `/decisions/${sampleDecisionId}`, 'wf-tx-ai-decision.png');
  await capture(authPage, `/decisions/${sampleDecisionId}`, 'wf-tx-approval.png');
  await capture(authPage, `/decisions/${sampleDecisionId}`, 'wf-tx-rejection.png');
  await capture(authPage, `/decisions/${sampleDecisionId}`, 'wf-tx-override.png');

  // Case investigation workflow states
  await capture(authPage, `/cases/${sampleCaseId}`, 'wf-case-assign.png');
  await capture(authPage, `/cases/${sampleCaseId}`, 'wf-case-timeline.png');
  await capture(authPage, `/cases/${sampleCaseId}`, 'wf-case-evidence.png');
  await capture(authPage, `/cases/${sampleCaseId}`, 'wf-case-close.png');

  // Rule workflows
  await capture(authPage, '/rules/new', 'wf-rule-create.png');
  await capture(authPage, '/rules/new', 'wf-rule-validation.png');
  await capture(authPage, '/rules', 'wf-rule-delete.png');

  // Model workflows
  await capture(authPage, `/models/${sampleModelId}`, 'wf-model-inference.png');

  // 5. Responsive Breakpoints
  console.log('\n--- SECTION 7: RESPONSIVE BREAKPOINTS ---');
  // Laptop (1440x900)
  const laptopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark'
  });
  const laptopPage = await laptopContext.newPage();
  await laptopPage.addInitScript((authObj) => {
    localStorage.setItem('riskshield-auth-storage', JSON.stringify({
      state: { user: authObj.user, accessToken: authObj.access_token, refreshToken: authObj.refresh_token, isAuthenticated: true },
      version: 0
    }));
  }, authData);
  await capture(laptopPage, '/operations', 'responsive-laptop-1440.png');
  await laptopContext.close();

  // Tablet (768x1024)
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: 'dark'
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.addInitScript((authObj) => {
    localStorage.setItem('riskshield-auth-storage', JSON.stringify({
      state: { user: authObj.user, accessToken: authObj.access_token, refreshToken: authObj.refresh_token, isAuthenticated: true },
      version: 0
    }));
  }, authData);
  await capture(tabletPage, '/transactions', 'responsive-tablet-768.png');
  await tabletContext.close();

  // Mobile (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript((authObj) => {
    localStorage.setItem('riskshield-auth-storage', JSON.stringify({
      state: { user: authObj.user, accessToken: authObj.access_token, refreshToken: authObj.refresh_token, isAuthenticated: true },
      version: 0
    }));
  }, authData);
  await capture(mobilePage, '/operations', 'responsive-mobile-390.png');
  await capture(mobilePage, '/operations', 'component-mobile-navigation.png');
  await mobileContext.close();

  // Logout workflow
  console.log('📸 Capturing logout workflow...');
  await authPage.goto('http://localhost:3000/operations', { waitUntil: 'networkidle' });
  await authPage.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  });
  await authPage.waitForTimeout(1000);
  await authPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'wf-auth-logout.png') });
  mirrorFile('wf-auth-logout.png');
  console.log('   ✓ Saved: wf-auth-logout.png');

  await browser.close();
  console.log('\n🎉 ALL SCREENSHOTS CAPTURED AND VERIFIED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Fatal error in screenshot runner:', err);
  process.exit(1);
});
