const { test } = require('@playwright/test');
const { baseURL, derivedURL } = require('../pageobject/base_url.js');
const PageFunctions = require('../pageobject/function.js');
const Logger = require('../pageobject/logger.js');

test.describe('TC_42 All entities - E2E', () => {
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
    await functions.clear_Data();
    await page.close();
    await context.close();
  });

  const openAllEntitiesFromSettings = async () => {
    await functions.open_All_Entities_From_Settings(baseURL, Logger);
  };

  const createAndVerifyEntity = async ({
    createAction,
    listPath,
    listAssertionMessage,
    entityName
  }) => {
    await openAllEntitiesFromSettings();
    await createAction(entityName);
    await functions.verify_Entity_Is_Visible_In_List(listPath, entityName, listAssertionMessage);
    await functions.verify_Entity_Is_Searchable_In_All_Entities(baseURL, entityName, Logger);
  };

  test('TC_42-01 Verify All entities page loads and search filters update URL clearly', async () => {
    test.setTimeout(120000);
    await openAllEntitiesFromSettings();
    await functions.assert_All_Entities_Landing_Controls();
    await functions.verify_All_Entities_Search_Flow();
  });

  test('TC_42-02 Verify each entity type chip navigates correctly and browser back returns to all entities', async () => {
    test.setTimeout(180000);
    await openAllEntitiesFromSettings();

    const typeCases = [
      { label: 'Tables', url: /\/table(\?|$)/ },
      { label: 'Views', url: /\/viewedit(\?|$)/ },
      { label: 'Pages', url: /\/pageedit(\?|$)/ },
      { label: 'Users', url: /\/useradmin(\?|$)/ },
      { label: 'Modules', url: /\/plugins(\?|$)/ },
      { label: 'Triggers', url: /\/entities\?triggers=on/ },
    ];
    await functions.verify_All_Entities_Type_Chip_Navigation(baseURL, Logger, typeCases);
  });

  test('TC_42-03 Verify less more toggles and tag chips keep user on all entities context', async () => {
    test.setTimeout(120000);
    await openAllEntitiesFromSettings();
    await functions.verify_All_Entities_Less_More_And_Tags();
  });

  test('TC_42-04 Verify users table row action menu shows safe admin options without destructive execution', async () => {
    test.setTimeout(120000);
    await openAllEntitiesFromSettings();
    await functions.verify_All_Entities_User_Row_Actions(baseURL);
  });

  test('TC_42-05 Create a table from all entities and confirm it appears in both tables list and entities search', async () => {
    test.setTimeout(120000);
    await createAndVerifyEntity({
      createAction: (name) => functions.create_Table_From_All_Entities(name),
      listPath: `${baseURL}/table`,
      listAssertionMessage: 'Created table should be visible in tables list',
      entityName: `e2e_tbl_${Date.now()}`
    });
  });

  test('TC_42-06 Create a view from all entities and confirm it appears in both views list and entities search', async () => {
    test.setTimeout(150000);
    await createAndVerifyEntity({
      createAction: (name) => functions.create_View_From_All_Entities(name),
      listPath: `${baseURL}/viewedit`,
      listAssertionMessage: 'Created view should be visible in views list',
      entityName: `e2e_view_${Date.now()}`
    });
  });

  test('TC_42-07 Create a page from all entities and confirm it appears in both pages list and entities search', async () => {
    test.setTimeout(120000);
    await createAndVerifyEntity({
      createAction: (name) => functions.create_Page_From_All_Entities(name),
      listPath: `${baseURL}/pageedit`,
      listAssertionMessage: 'Created page should be visible in pages list',
      entityName: `e2e_page_${Date.now()}`
    });
  });

  test('TC_42-08 Create a trigger from all entities and confirm it appears in both triggers list and entities search', async () => {
    test.setTimeout(150000);
    await createAndVerifyEntity({
      createAction: (name) => functions.create_Trigger_From_All_Entities(name),
      listPath: `${baseURL}/actions`,
      listAssertionMessage: 'Created trigger should be visible in triggers list',
      entityName: `e2e_trigger_${Date.now()}`
    });
  });

  test('TC_42-09 Navigate from all entities to views list and validate views table is visible', async () => {
    test.setTimeout(120000);
    await openAllEntitiesFromSettings();
    await functions.open_Views_From_All_Entities();
    await functions.assert_Views_List_Loaded();
  });
});