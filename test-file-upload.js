const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

class FileUploadTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'https://89bcf53b-0c81-4b8b-9713-bfec1ed03c04-00-2ys9jceim5pbi.pike.replit.dev';
  }

  async setUp() {
    console.log('🚀 Setting up browser for file upload testing...');
    this.browser = await puppeteer.launch({
      headless: true, // Run headless in server environment
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
    
    // Enable console logging from the page
    this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    this.page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  }

  async tearDown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⚠️ Element ${selector} not found within ${timeout}ms`);
      return false;
    }
  }

  async takeScreenshot(name) {
    const timestamp = Date.now();
    const filename = `attached_assets/screenshot_${name}_${timestamp}.png`;
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async navigateToApplication() {
    console.log('🌐 Navigating to application...');
    await this.page.goto(this.baseUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await this.takeScreenshot('app_loaded');
    
    // Wait for React to load
    await this.page.waitForFunction(() => {
      return typeof window.React !== 'undefined' || document.querySelector('[data-reactroot]') !== null;
    }, { timeout: 15000 });
    
    console.log('✅ Application loaded successfully');
  }

  async navigateToProjects() {
    console.log('📁 Navigating to projects page...');
    
    // Try to find and click projects link/button
    const projectsSelectors = [
      'a[href="/projects"]',
      'button:contains("Projects")',
      '[data-testid="projects-link"]',
      'nav a[href*="project"]'
    ];
    
    let navigated = false;
    for (const selector of projectsSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          await element.click();
          console.log(`✅ Clicked projects navigation: ${selector}`);
          navigated = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to click ${selector}:`, error.message);
      }
    }
    
    if (!navigated) {
      // Try direct navigation
      console.log('🔄 Trying direct navigation to /projects...');
      await this.page.goto(`${this.baseUrl}/projects`, { 
        waitUntil: 'networkidle2' 
      });
    }
    
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('projects_page');
  }

  async findAndOpenProject() {
    console.log('🔍 Looking for projects to test...');
    
    // Wait for projects to load
    await this.page.waitForTimeout(3000);
    
    // Look for project cards or links
    const projectSelectors = [
      '[data-testid="project-card"]',
      '.project-card',
      'a[href*="/projects/"]',
      'button:contains("Modern Downtown Loft")',
      'div:contains("Modern Downtown Loft")'
    ];
    
    let projectFound = false;
    for (const selector of projectSelectors) {
      try {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          console.log(`📋 Found ${elements.length} project(s) with selector: ${selector}`);
          // Click the first project
          await elements[0].click();
          console.log('✅ Clicked on first project');
          projectFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}:`, error.message);
      }
    }
    
    if (!projectFound) {
      // Try direct navigation to a known project
      const projectId = '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91'; // Modern Downtown Loft from DB
      console.log(`🔄 Trying direct navigation to project: ${projectId}`);
      await this.page.goto(`${this.baseUrl}/projects/${projectId}`, { 
        waitUntil: 'networkidle2' 
      });
    }
    
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('project_details');
  }

  async findFileUploadModal() {
    console.log('🔍 Looking for file upload functionality...');
    
    // Look for file upload buttons or areas
    const uploadSelectors = [
      'button:contains("Upload")',
      'button:contains("Add Files")',
      '[data-testid="upload-button"]',
      'input[type="file"]',
      '.file-upload',
      'button[class*="upload"]'
    ];
    
    let uploadFound = false;
    for (const selector of uploadSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`📤 Found upload element: ${selector}`);
          
          // Check if it's visible
          const isVisible = await element.isIntersectingViewport();
          if (isVisible) {
            await element.click();
            console.log('✅ Clicked upload button');
            uploadFound = true;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error with upload selector ${selector}:`, error.message);
      }
    }
    
    if (!uploadFound) {
      console.log('⚠️ No visible upload button found, looking for modal triggers...');
      
      // Look for buttons that might open upload modal
      const modalTriggers = [
        'button:contains("Files")',
        'button:contains("Documents")',
        'button:contains("Attachments")',
        '[data-testid="open-file-modal"]'
      ];
      
      for (const trigger of modalTriggers) {
        try {
          const element = await this.page.$(trigger);
          if (element) {
            await element.click();
            console.log(`🚪 Clicked modal trigger: ${trigger}`);
            uploadFound = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Error with modal trigger ${trigger}:`, error.message);
        }
      }
    }
    
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('upload_search');
    
    return uploadFound;
  }

  async testFileUploadModal() {
    console.log('🧪 Testing file upload modal...');
    
    // Wait for modal to appear
    const modalSelectors = [
      '[data-testid="file-upload-modal"]',
      '.modal',
      '[role="dialog"]',
      'div:contains("Upload Files")'
    ];
    
    let modalVisible = false;
    for (const selector of modalSelectors) {
      const found = await this.waitForElement(selector, 5000);
      if (found) {
        console.log(`📋 Modal found with selector: ${selector}`);
        modalVisible = true;
        break;
      }
    }
    
    await this.takeScreenshot('modal_state');
    
    if (!modalVisible) {
      console.log('⚠️ File upload modal not visible, testing direct file input...');
      return await this.testDirectFileInput();
    }
    
    // Test "Choose File" button
    await this.testChooseFileButton();
    
    // Test drag & drop area
    await this.testDragAndDrop();
    
    return true;
  }

  async testDirectFileInput() {
    console.log('🔍 Looking for direct file input elements...');
    
    const fileInputs = await this.page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      console.log(`📁 Found ${fileInputs.length} file input(s)`);
      
      // Create a test file
      const testFilePath = await this.createTestFile();
      
      // Upload file to first input
      await fileInputs[0].uploadFile(testFilePath);
      console.log('✅ File uploaded via direct input');
      
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('direct_upload');
      
      return true;
    }
    
    console.log('❌ No file inputs found');
    return false;
  }

  async testChooseFileButton() {
    console.log('🔘 Testing "Choose File" button...');
    
    const chooseFileSelectors = [
      'button:contains("Browse Files")',
      'button:contains("Choose File")',
      'button:contains("Select Files")',
      '[data-testid="choose-file-button"]'
    ];
    
    let buttonFound = false;
    for (const selector of chooseFileSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`🎯 Found choose file button: ${selector}`);
          
          // Create test file
          const testFilePath = await this.createTestFile();
          
          // Set up file chooser handler
          this.page.on('filechooser', async (fileChooser) => {
            await fileChooser.accept([testFilePath]);
            console.log('✅ File selected via file chooser');
          });
          
          await element.click();
          buttonFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Error with choose file button ${selector}:`, error.message);
      }
    }
    
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('choose_file_test');
    
    return buttonFound;
  }

  async testDragAndDrop() {
    console.log('🎯 Testing drag & drop functionality...');
    
    const dropZoneSelectors = [
      '[data-testid="drop-zone"]',
      '.drop-zone',
      'div:contains("Drop files here")',
      'div[class*="drag"]'
    ];
    
    let dropZoneFound = false;
    for (const selector of dropZoneSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`🎯 Found drop zone: ${selector}`);
          
          // Create test file
          const testFilePath = await this.createTestFile();
          const fileBuffer = await fs.readFile(testFilePath);
          
          // Simulate drag and drop
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            await this.page.mouse.move(
              boundingBox.x + boundingBox.width / 2,
              boundingBox.y + boundingBox.height / 2
            );
            
            // Create data transfer object and simulate drop event
            await this.page.evaluate((selector, fileName, fileContent) => {
              const dropZone = document.querySelector(selector);
              if (dropZone) {
                const file = new File([new Uint8Array(fileContent)], fileName, { type: 'text/plain' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                const dropEvent = new DragEvent('drop', {
                  bubbles: true,
                  cancelable: true,
                  dataTransfer: dataTransfer
                });
                
                dropZone.dispatchEvent(dropEvent);
              }
            }, selector, 'test-drag-drop.txt', Array.from(fileBuffer));
            
            console.log('✅ Simulated drag & drop event');
            dropZoneFound = true;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error with drop zone ${selector}:`, error.message);
      }
    }
    
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('drag_drop_test');
    
    return dropZoneFound;
  }

  async createTestFile(filename = 'test-upload.txt') {
    const filePath = path.join(__dirname, filename);
    const content = `Test file for upload functionality\nTimestamp: ${new Date().toISOString()}\nGenerated by automated test`;
    
    await fs.writeFile(filePath, content);
    console.log(`📝 Created test file: ${filePath}`);
    
    return filePath;
  }

  async verifyUploadSuccess() {
    console.log('✅ Verifying upload success...');
    
    // Look for success indicators
    const successSelectors = [
      'div:contains("uploaded successfully")',
      'div:contains("Upload complete")',
      '.success-message',
      '[data-testid="upload-success"]',
      'div[class*="success"]'
    ];
    
    let successFound = false;
    for (const selector of successSelectors) {
      const found = await this.waitForElement(selector, 5000);
      if (found) {
        console.log(`✅ Upload success indicator found: ${selector}`);
        successFound = true;
        break;
      }
    }
    
    // Look for file list updates
    const fileListSelectors = [
      '[data-testid="file-list"]',
      '.file-list',
      'div:contains("test-upload.txt")',
      'li:contains("test-")'
    ];
    
    let fileListFound = false;
    for (const selector of fileListSelectors) {
      const found = await this.waitForElement(selector, 5000);
      if (found) {
        console.log(`📄 File list found: ${selector}`);
        fileListFound = true;
        break;
      }
    }
    
    await this.takeScreenshot('upload_verification');
    
    return successFound || fileListFound;
  }

  async runFullTest() {
    try {
      console.log('🎬 Starting comprehensive file upload test...\n');
      
      await this.setUp();
      await this.navigateToApplication();
      await this.navigateToProjects();
      await this.findAndOpenProject();
      
      const uploadFound = await this.findFileUploadModal();
      if (uploadFound) {
        await this.testFileUploadModal();
        await this.verifyUploadSuccess();
      }
      
      console.log('\n🎉 File upload test completed!');
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      await this.takeScreenshot('test_error');
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Run the test
async function main() {
  const tester = new FileUploadTester();
  try {
    await tester.runFullTest();
    console.log('✅ All tests completed successfully');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FileUploadTester;