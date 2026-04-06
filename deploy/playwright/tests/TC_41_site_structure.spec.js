const { test } = require('@playwright/test');
const { baseURL, derivedURL } = require('../pageobject/base_url.js');
const PageFunctions = require('../pageobject/function.js');
const Logger = require('../pageobject/logger.js');

test.describe('TC_41 Site structure - E2E', () => {
  let functions;
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    Logger.initialize();
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
    await page.setViewportSize({ width: 1350, height: 720 });

    functions = new PageFunctions(page);
    await functions.navigate_To_Base_URL(baseURL, derivedURL);
    await functions.login('myproject19july@mailinator.com', 'myproject19july');
    await functions.submit();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('TC_41-01 Tabs default + navigation', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_site_structure_tabs_default_and_navigation(Logger, baseURL);
  });

  test('TC_41-02 Menu tab controls', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_menu_tab_controls(Logger, baseURL);
  });

  test('TC_41-03 Search tab configuration controls', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_search_tab_controls(Logger, baseURL);
  });

  test('TC_41-04 Library tab table headers + breadcrumb', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_library_tab_table_headers(Logger, baseURL);
  });

  test('TC_41-05 Languages add language + upload CSV', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_languages_tab_add_language_and_upload_csv(Logger, baseURL);
  });

  test('TC_41-06 Pagegroups strategy controls + navigation', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_pagegroups_tab_controls(Logger, baseURL);
  });

  test('TC_41-07 Tags create + delete', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_tags_tab_controls(Logger, baseURL);
  });

  test('TC_41-08 Diagram filters + New dropdown', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_diagram_tab_controls(Logger, baseURL);
  });

  test('TC_41-09 Registry editor search + entity link', async () => {
    test.setTimeout(120000);
    await functions.tc41_assert_registry_editor_tab_controls(Logger, baseURL);
  });
});
