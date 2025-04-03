const { test, expect } = require('@playwright/test');
const { baseURL, derivedURL } = require('../pageobject/base_url.js');
const PageFunctions = require('../pageobject/function.js');
const PageObject = require('../pageobject/locators.js');
const customAssert = require('../pageobject/utils.js');
const Logger = require('../pageobject/logger.js');

test.describe('E2E Test Suite', () => {
  let functions;
  let pageobject;
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    // Initialize the log file
    Logger.initialize();
    // Create a new context and page for all tests
    context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
    page = await context.newPage();

    // Maximize the screen
    await page.setViewportSize({ width: 1500, height: 720 });

    functions = new PageFunctions(page);
    pageobject = new PageObject(page);

    // Navigate to base URL and perform login
    await functions.navigate_To_Base_URL(baseURL, derivedURL);
    await functions.login('myproject19july@mailinator.com', 'myproject19july');
    await functions.submit();
  });

  test.afterAll(async () => {
    // Close the page and context after all test
    await page.close();
    await context.close();
  });

  test('Create a landing Page for Subscription Plans', async () => {
    // Create a new page for landing page
    await functions.create_New_Page('Landing_Page');
    await page.waitForTimeout(2000);
    // Drag and drop the text source
    await customAssert('Click on html code source and drag on landing page', async () => {
      await page.waitForSelector(pageobject.htmlCodeSource);
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.target);
    });
    await page.waitForTimeout(2000);
    await functions.fill_Text(pageobject.htmltextlocator, `
      <div style="text-align: center; padding: 50px; background: linear-gradient(135deg, #6a11cb, #2575fc); color: white; border-radius: 10px;">
        <h1 style="font-size: 2.5em;">🚀 Welcome to Our Premium Plans!</h1>
        <p style="font-size: 1.2em;">Unlock exclusive features & elevate your experience. Choose the perfect plan and enjoy premium benefits!</p>
        <a href="#plans" style="background-color: #ffcc00; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Explore Plans
        </a>
      </div>
    `);
    await functions.drag_And_Drop(pageobject.columnsElement, pageobject.target);
    await functions.fill_Text(pageobject.numbercolumn, '4');
    await customAssert('Click on html code source and drag on column 3', async () => {
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.column1_3);
    });
    await customAssert('Fill html code in html textbox', async () => {
      await functions.fill_Text(pageobject.htmltextlocator, `
    <div style="background-color: #d1ecf1; border: 2px solid #17a2b8; border-radius: 15px; padding: 20px; width: 320px; text-align: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s ease-in-out;" 
     onmouseover="this.style.transform='scale(1.1)'" 
     onmouseout="this.style.transform='scale(1)'">
        <h3 style="color: #0c5460; font-size: 22px; font-weight: bold; margin-bottom: 10px;">Pro Plan</h3>
        <p style="color: #0c5460; font-size: 20px; font-weight: bold;">₹499 / month</p>
        
        <ul style="list-style: none; padding: 0; margin: 15px 0; color: #0c5460; text-align: left;">
            <li>✔ 50GB Storage</li>
            <li>✔ Priority Support</li>
            <li>✔ Access to Exclusive Content</li>
            <li>✔ Free Custom Domain</li>
            <li style="color: red;">❌ Advanced Analytics & Reports</li>
        </ul>
        <a href="https://e2etest.saltcorn.co/page/Payment_Page?plan=Pro&amount=499" style="text-decoration: none;">
        <button style="background-color: #0056b3; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; box-shadow: 1px 1px 5px rgba(0,0,0,0.2);">Subscribe</button>
        </a>
    </div>
`);
    });
    await customAssert('Click on html code source and drag on column 2', async () => {
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.column1_2);
    });
    await functions.fill_Text(pageobject.htmltextlocator, `
      <div style="background-color: #d4edda; border: 2px solid #28a745; border-radius: 15px; padding: 20px; width: 320px; text-align: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s ease-in-out;" 
     onmouseover="this.style.transform='scale(1.1)'" 
     onmouseout="this.style.transform='scale(1)'"> 
          <h3 style="color: #155724; font-size: 22px; font-weight: bold; margin-bottom: 10px;">Basic Plan</h3>
          <p style="color: #155724; font-size: 20px; font-weight: bold;">₹199 / month</p>
          
          <ul style="list-style: none; padding: 0; margin: 15px 0; color: #155724; text-align: left;">
              <li>✔ 10GB Storage</li>
              <li>✔ Basic Support</li>
              <li>✔ Access to Community</li>
              <li style="color: red;">❌ Free Custom Domain & Hosting</li>
              <li style="color: red;">❌ Advanced Analytics & Reports</li>
          </ul>
          <a href="https://e2etest.saltcorn.co/page/Payment_Page?plan=Basic&amount=199" style="text-decoration: none;">
          <button style="background-color: #218838; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; box-shadow: 1px 1px 5px rgba(0,0,0,0.2);">Subscribe</button>
          </a>
      </div>
  `);
    await customAssert('Click on html code source and drag on column 4', async () => {
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.column1_4);
    });
    await functions.fill_Text(pageobject.htmltextlocator, `
  <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 15px; padding: 20px; width: 320px; text-align: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s ease-in-out;" 
     onmouseover="this.style.transform='scale(1.1)'" 
     onmouseout="this.style.transform='scale(1)'">
      <h3 style="color: #856404; font-size: 22px; font-weight: bold; margin-bottom: 10px;">Premium Plan</h3>
      <p style="color: #856404; font-size: 20px; font-weight: bold;">₹999 / month</p>
      
      <ul style="list-style: none; padding: 0; margin: 15px 0; color: #856404; text-align: left;">
          <li>✔ 100GB Storage</li>
          <li>✔ 24/7 Priority Support</li>
          <li>✔ Access to All Exclusive Content</li>
          <li>✔ Free Custom Domain & Hosting</li>
          <li>✔ Advanced Analytics & Reports</li>
      </ul>
      <a href="https://e2etest.saltcorn.co/page/Payment_Page?plan=Premium&amount=999" style="text-decoration: none;">
      <button style="background-color: #d39e00; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; box-shadow: 1px 1px 5px rgba(0,0,0,0.2);">Subscribe</button>
      </a>
  </div>
`);
    await customAssert('Click on html code source and drag on column 1', async () => {
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.column1);
    });
    await functions.fill_Text(pageobject.htmltextlocator, `
      <div style="background-color: #e3f2fd; border: 2px solid #2196f3; border-radius: 15px; padding: 20px; width: 320px; text-align: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s ease-in-out;"
     onmouseover="this.style.transform='scale(1.1)'" 
     onmouseout="this.style.transform='scale(1)'">
          <h3 style="color: #0d47a1; font-size: 22px; font-weight: bold; margin-bottom: 10px;">Free Plan</h3>
          <p style="color: #0d47a1; font-size: 20px; font-weight: bold;">₹0 / month</p>
          
          <ul style="list-style: none; padding: 0; margin: 15px 0; color: #0d47a1; text-align: left;">
              <li>✔ 5GB Storage</li>
              <li>✔ Limited Access to Features</li>
              <li style="color: red;">❌ No Custom Domain & Hosting</li>
              <li style="color: red;">❌ No Advanced Analytics & Reports</li>
              <li style="color: red;">❌ No Priority Support</li>
          </ul>
  
          <button style="background-color: #1976d2; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; box-shadow: 1px 1px 5px rgba(0,0,0,0.2);">Get Started</button>
      </div>
  `);
    await functions.Save_Page_Project();
  });

  test('Create a payment page', async () => {
    // Create a new page for landing page
    await functions.create_New_Page('Payment_Page');
    await page.waitForTimeout(10000);
    // Drag and drop the htmlCodeSource
    await customAssert('Click on html code source and drag on payment page', async () => {
      await page.waitForSelector(pageobject.htmlCodeSource);
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.target);
    });
    await customAssert('Fill html code for payment page in html textbox', async () => {
      await functions.fill_Text(pageobject.htmltextlocator, `
      <div style="display: flex; justify-content: center; align-items: flex-start; height: 100vh; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2); width: 600px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 20px;">Saltcorn Secure Payment</h2>
  
              <form style="width: 100%;" onsubmit="event.preventDefault(); window.location.href='https://e2etest.saltcorn.co/page/Thank_you';">
                  <div style="display: flex; flex-direction: column; margin-bottom: 15px; text-align: left;">
                      <label style="font-weight: bold; margin-bottom: 5px;">Cardholder Name</label>
                      <input type="text" placeholder="Card_Holder_Name" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" required>
                  </div>
  
                  <div style="display: flex; flex-direction: column; margin-bottom: 15px; text-align: left;">
                      <label style="font-weight: bold; margin-bottom: 5px;">Card Number</label>
                      <input type="number" placeholder="1234567890123456" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" required>
                  </div>
  
                  <div style="display: flex; gap: 15px; margin-bottom: 15px; text-align: left;">
                      <div style="display: flex; flex-direction: column; width: 50%;">
                          <label style="font-weight: bold; margin-bottom: 5px;">Expiry Date</label>
                          <input type="text" placeholder="MM/YY" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" required>
                      </div>
  
                      <div style="display: flex; flex-direction: column; width: 50%;">
                          <label style="font-weight: bold; margin-bottom: 5px;">CVV</label>
                          <input type="password" placeholder="123" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" required>
                      </div>
                  </div>
  
                  <button type="submit" style="background: #007bff; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; margin-top: 15px;">
                      Proceed to Pay
                  </button>
              </form>
          </div>
      </div>
  `);
    });
    await functions.Save_Page_Project();
  });

  test('Create a Thank you page', async () => {
    // Create a new page for thank you
    await functions.create_New_Page('Thank_you');
    await page.waitForTimeout(2000);
    // Drag and drop the text source
    await customAssert('Click on html code source and drag on thankyou page', async () => {
      await page.waitForSelector(pageobject.htmlCodeSource);
      await functions.drag_And_Drop(pageobject.htmlCodeSource, pageobject.target);
    });
    await functions.fill_Text(pageobject.htmltextlocator, `
      <div style="display: flex; justify-content: center; align-items: flex-start; height: 100vh; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2); width: 600px; text-align: center;">
              <h2 style="color: #28a745; font-size: 24px; margin-bottom: 10px;">Thank You for Your Payment!</h2>
              <p style="color: #555; font-size: 18px; margin-bottom: 20px;">Your transaction is Processing... A confirmation email will be sent to your email address.</p>
              <a href="/page/Landing_Page" style="background: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block;">
                  Back to Home
              </a>
          </div>
      </div>
  `);
    await functions.Save_Page_Project();
  });

  test('testing for landing page, payemnt page and thank you page', async () => {
    // test the landing page
    await page.click(pageobject.newPage_sidebar);
    await page.click(pageobject.LandingPage);
    await customAssert('Subscribe button on plan card should be visible and clickable', async () => {
      // click on subscribe button
      await page.click(pageobject.SubscribeButton, { force: true });
      await page.waitForTimeout(2000);
    });
    // enter details
    await customAssert('Enter card details on card', async () => {
      await functions.fill_Text(pageobject.CardholderNameInput, 'john doe');
      await functions.fill_Text(pageobject.CardNumberInput, '4111111111111111');
      await functions.fill_Text(pageobject.Exdateinput, '10/36');
      await functions.fill_Text(pageobject.CVVinput, '926');
    });
    await customAssert('Proceed button on payment page should be visible and clickable', async () => {
      await expect(page.locator(pageobject.ProceedToPayButton)).toBeVisible();
      // click to proceed button
      await page.click(pageobject.ProceedToPayButton);
    });
    // click on back to home button
    await page.click(pageobject.LandingPage);
  });
});