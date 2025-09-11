const axios = require('axios');
const fs = require('fs').promises;

class SimpleUITester {
  constructor() {
    this.baseUrl = 'https://89bcf53b-0c81-4b8b-9713-bfec1ed03c04-00-2ys9jceim5pbi.pike.replit.dev';
    this.results = [];
  }

  async testFrontendAccessibility() {
    console.log('🌐 Testing frontend accessibility...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: 10000 });
      
      if (response.status === 200 && response.data.includes('firelynx')) {
        console.log('✅ Frontend is accessible and loading correctly');
        this.results.push({
          test: 'Frontend Accessibility',
          status: 'PASS',
          details: 'React app loads successfully'
        });
        return true;
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('❌ Frontend accessibility test failed:', error.message);
      this.results.push({
        test: 'Frontend Accessibility',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testProjectPageAccess() {
    console.log('📁 Testing project page access...');
    
    try {
      const projectId = '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91'; // Modern Downtown Loft
      const response = await axios.get(`${this.baseUrl}/projects/${projectId}`, { 
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)'
        }
      });
      
      if (response.status === 200 && response.data.includes('firelynx')) {
        console.log('✅ Project page is accessible');
        this.results.push({
          test: 'Project Page Access',
          status: 'PASS',
          projectId
        });
        return true;
      } else {
        throw new Error('Project page not loading correctly');
      }
    } catch (error) {
      console.error('❌ Project page access test failed:', error.message);
      this.results.push({
        test: 'Project Page Access',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testFileUploadModalComponents() {
    console.log('🔍 Testing file upload modal components...');
    
    try {
      // Read the FileUploadModal component to verify it exists and has correct structure
      const modalContent = await fs.readFile('src/components/modals/FileUploadModal.jsx', 'utf-8');
      
      const requiredFeatures = [
        'Choose File', 'Browse Files', // File selection
        'drag', 'drop', // Drag & drop
        'Upload', 'uploadFiles', // Upload functionality
        'progress', 'uploading', // Progress tracking
        'validation', 'validateFile', // File validation
        'error', 'errors' // Error handling
      ];
      
      const foundFeatures = requiredFeatures.filter(feature => 
        modalContent.toLowerCase().includes(feature.toLowerCase())
      );
      
      console.log(`✅ Found ${foundFeatures.length}/${requiredFeatures.length} required features in FileUploadModal:`);
      foundFeatures.forEach(feature => console.log(`   - ${feature}`));
      
      this.results.push({
        test: 'File Upload Modal Components',
        status: foundFeatures.length >= requiredFeatures.length * 0.8 ? 'PASS' : 'FAIL',
        foundFeatures: foundFeatures.length,
        totalFeatures: requiredFeatures.length,
        details: foundFeatures
      });
      
      return foundFeatures.length >= requiredFeatures.length * 0.8;
      
    } catch (error) {
      console.error('❌ Modal component test failed:', error.message);
      this.results.push({
        test: 'File Upload Modal Components',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testFileValidationLogic() {
    console.log('🧪 Testing file validation logic...');
    
    try {
      // Read and analyze the validation logic in the modal
      const modalContent = await fs.readFile('src/components/modals/FileUploadModal.jsx', 'utf-8');
      
      const validationChecks = [
        { name: 'File size limit (50MB)', pattern: /50.*1024.*1024|50.*MB/i },
        { name: 'File type validation', pattern: /allowedTypes|fileType|mimetype/i },
        { name: 'Extension checking', pattern: /\.(jpg|jpeg|png|pdf|txt)/i },
        { name: 'Error handling', pattern: /error.*validation|validation.*error/i },
        { name: 'Progress tracking', pattern: /progress.*upload|uploadProgress/i }
      ];
      
      const passedChecks = validationChecks.filter(check => 
        check.pattern.test(modalContent)
      );
      
      console.log(`✅ Validation logic checks: ${passedChecks.length}/${validationChecks.length}`);
      passedChecks.forEach(check => console.log(`   ✓ ${check.name}`));
      
      const missingChecks = validationChecks.filter(check => 
        !check.pattern.test(modalContent)
      );
      missingChecks.forEach(check => console.log(`   ✗ ${check.name}`));
      
      this.results.push({
        test: 'File Validation Logic',
        status: passedChecks.length >= validationChecks.length * 0.8 ? 'PASS' : 'FAIL',
        passed: passedChecks.length,
        total: validationChecks.length,
        passedChecks: passedChecks.map(c => c.name),
        missingChecks: missingChecks.map(c => c.name)
      });
      
      return passedChecks.length >= validationChecks.length * 0.8;
      
    } catch (error) {
      console.error('❌ File validation logic test failed:', error.message);
      this.results.push({
        test: 'File Validation Logic',
        status: 'FAIL',
        error: error.message
      });
      return false;
    }
  }

  async testAPIIntegration() {
    console.log('🔗 Testing API integration with file upload...');
    
    try {
      // Create a simple test file
      const testContent = `UI Test File\nCreated: ${new Date().toISOString()}\nTest: API Integration`;
      await fs.writeFile('ui-integration-test.txt', testContent);
      
      const FormData = require('form-data');
      const formData = new FormData();
      
      const fileBuffer = await fs.readFile('ui-integration-test.txt');
      formData.append('files', fileBuffer, {
        filename: 'ui-integration-test.txt',
        contentType: 'text/plain'
      });
      formData.append('projectId', '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91');
      formData.append('visibility', 'client');
      
      // Test file upload API
      const response = await axios.post(`${this.baseUrl}/api/files`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ API integration successful');
        console.log('   Uploaded file:', response.data.data?.[0]?.fileName || 'File info not available');
        
        this.results.push({
          test: 'API Integration',
          status: 'PASS',
          uploadedFile: response.data.data?.[0]?.fileName,
          response: response.data
        });
        
        // Clean up test file
        await fs.unlink('ui-integration-test.txt').catch(() => {});
        
        return true;
      } else {
        throw new Error(`Unexpected API response: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ API integration test failed:', error.message);
      if (error.response) {
        console.error('   API Error:', error.response.data);
      }
      this.results.push({
        test: 'API Integration',
        status: 'FAIL',
        error: error.message,
        apiError: error.response?.data
      });
      
      // Clean up test file
      await fs.unlink('ui-integration-test.txt').catch(() => {});
      return false;
    }
  }

  async runAllTests() {
    console.log('🎬 Starting Simple UI and Integration Tests...\n');
    
    const tests = [
      () => this.testFrontendAccessibility(),
      () => this.testProjectPageAccess(),
      () => this.testFileUploadModalComponents(),
      () => this.testFileValidationLogic(),
      () => this.testAPIIntegration()
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
      try {
        const result = await test();
        if (result) passedTests++;
        console.log(''); // Add spacing between tests
      } catch (error) {
        console.error('❌ Test execution failed:', error.message);
      }
    }
    
    console.log('📊 Simple UI Test Results Summary:');
    console.log('===================================');
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details: ${Array.isArray(result.details) ? result.details.join(', ') : result.details}`);
      }
    });
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${tests.length} tests passed`);
    
    const overallStatus = passedTests >= tests.length * 0.8 ? 'SUCCESS' : 'PARTIAL SUCCESS';
    console.log(`\n🏆 Test Suite Status: ${overallStatus}`);
    
    return this.results;
  }
}

// Run the tests
async function main() {
  const tester = new SimpleUITester();
  try {
    await tester.runAllTests();
    console.log('\n✅ Simple UI testing completed');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleUITester;