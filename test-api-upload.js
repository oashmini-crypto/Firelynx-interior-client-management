const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');

class APIFileUploadTester {
  constructor() {
    this.baseUrl = 'https://89bcf53b-0c81-4b8b-9713-bfec1ed03c04-00-2ys9jceim5pbi.pike.replit.dev/api';
    this.testResults = [];
  }

  async createTestFile(filename, content = null) {
    const filePath = path.join(__dirname, filename);
    const fileContent = content || `Test file for API upload\nTimestamp: ${new Date().toISOString()}`;
    await fs.writeFile(filePath, fileContent);
    console.log(`📝 Created test file: ${filename}`);
    return filePath;
  }

  async testProjectFileUpload() {
    console.log('🧪 Testing project file upload via API...');
    
    try {
      // Create test file
      const testFilePath = await this.createTestFile('api-test-upload.txt');
      
      // Prepare form data
      const formData = new FormData();
      const fileBuffer = await fs.readFile(testFilePath);
      formData.append('files', fileBuffer, {
        filename: 'api-test-upload.txt',
        contentType: 'text/plain'
      });
      formData.append('projectId', '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91'); // Modern Downtown Loft
      formData.append('visibility', 'client');
      
      // Upload file
      console.log('📤 Uploading file via API...');
      const response = await axios.post(`${this.baseUrl}/files`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ File upload successful via API');
        console.log('Response:', response.data);
        this.testResults.push({
          test: 'API Project File Upload',
          status: 'PASS',
          data: response.data
        });
        return response.data;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ API file upload failed:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      this.testResults.push({
        test: 'API Project File Upload',
        status: 'FAIL',
        error: error.message,
        details: error.response?.data
      });
      throw error;
    }
  }

  async testMilestoneFileUpload() {
    console.log('🧪 Testing milestone file upload via API...');
    
    try {
      // First get milestones for the project
      const milestonesResponse = await axios.get(`${this.baseUrl}/milestones?projectId=2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91`);
      
      if (!milestonesResponse.data.data || milestonesResponse.data.data.length === 0) {
        console.log('⚠️ No milestones found, creating one for testing...');
        
        // Create a milestone for testing
        const newMilestone = await axios.post(`${this.baseUrl}/milestones`, {
          projectId: '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91',
          title: 'Test Milestone for Upload',
          description: 'Created for testing file upload functionality',
          expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });
        
        console.log('✅ Created test milestone:', newMilestone.data.data.id);
        var milestoneId = newMilestone.data.data.id;
      } else {
        var milestoneId = milestonesResponse.data.data[0].id;
        console.log(`📋 Using existing milestone: ${milestoneId}`);
      }
      
      // Create test file
      const testFilePath = await this.createTestFile('milestone-test-upload.txt');
      
      // Prepare form data
      const formData = new FormData();
      const fileBuffer = await fs.readFile(testFilePath);
      formData.append('files', fileBuffer, {
        filename: 'milestone-test-upload.txt',
        contentType: 'text/plain'
      });
      formData.append('projectId', '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91');
      formData.append('visibility', 'client');
      
      // Upload file to milestone
      console.log(`📤 Uploading file to milestone ${milestoneId}...`);
      const response = await axios.post(`${this.baseUrl}/milestones/${milestoneId}/files`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ Milestone file upload successful');
        console.log('Response:', response.data);
        this.testResults.push({
          test: 'API Milestone File Upload',
          status: 'PASS',
          milestoneId,
          data: response.data
        });
        return response.data;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Milestone file upload failed:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      this.testResults.push({
        test: 'API Milestone File Upload',
        status: 'FAIL',
        error: error.message,
        details: error.response?.data
      });
      throw error;
    }
  }

  async testFileValidation() {
    console.log('🧪 Testing file validation via API...');
    
    const testCases = [
      {
        name: 'Large file (over limit)',
        filename: 'large-file.txt',
        size: 51 * 1024 * 1024, // 51MB - should fail
        expectedResult: 'FAIL'
      },
      {
        name: 'Invalid file type',
        filename: 'test.exe',
        content: 'This is an executable file',
        expectedResult: 'FAIL'
      },
      {
        name: 'Valid PDF simulation',
        filename: 'test.pdf',
        content: '%PDF-1.4 fake pdf content',
        expectedResult: 'PASS'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\n🔍 Testing: ${testCase.name}`);
        
        // Create test file
        let content = testCase.content;
        if (testCase.size) {
          content = 'A'.repeat(testCase.size); // Create large file
        }
        const testFilePath = await this.createTestFile(testCase.filename, content);
        
        // Prepare form data
        const formData = new FormData();
        const fileBuffer = await fs.readFile(testFilePath);
        formData.append('files', fileBuffer, {
          filename: testCase.filename,
          contentType: testCase.filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
        });
        formData.append('projectId', '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91');
        formData.append('visibility', 'client');
        
        // Upload file
        const response = await axios.post(`${this.baseUrl}/files`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        });
        
        const result = (response.status === 201 || response.status === 200) ? 'PASS' : 'FAIL';
        console.log(`${result === testCase.expectedResult ? '✅' : '❌'} ${testCase.name}: ${result} (Expected: ${testCase.expectedResult})`);
        
        this.testResults.push({
          test: `File Validation - ${testCase.name}`,
          status: result === testCase.expectedResult ? 'PASS' : 'FAIL',
          expected: testCase.expectedResult,
          actual: result
        });
        
        // Clean up
        await fs.unlink(testFilePath);
        
      } catch (error) {
        const result = 'FAIL';
        console.log(`${result === testCase.expectedResult ? '✅' : '❌'} ${testCase.name}: ${result} (Expected: ${testCase.expectedResult})`);
        console.log(`   Error: ${error.message}`);
        
        this.testResults.push({
          test: `File Validation - ${testCase.name}`,
          status: result === testCase.expectedResult ? 'PASS' : 'FAIL',
          expected: testCase.expectedResult,
          actual: result,
          error: error.message
        });
      }
    }
  }

  async verifyUploadedFiles() {
    console.log('🔍 Verifying uploaded files exist...');
    
    try {
      // Get files for the project
      const response = await axios.get(`${this.baseUrl}/files?projectId=2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91`);
      
      if (response.status === 200) {
        const files = response.data.data || [];
        console.log(`📁 Found ${files.length} files in project`);
        
        // Look for our test files
        const testFiles = files.filter(file => 
          file.fileName && (
            file.fileName.includes('api-test-upload') ||
            file.fileName.includes('milestone-test-upload')
          )
        );
        
        console.log(`🎯 Found ${testFiles.length} test files`);
        testFiles.forEach(file => {
          console.log(`   - ${file.fileName} (${file.size} bytes)`);
        });
        
        this.testResults.push({
          test: 'File Verification',
          status: 'PASS',
          filesFound: testFiles.length,
          totalFiles: files.length
        });
        
        return testFiles;
      } else {
        throw new Error(`Failed to get files: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ File verification failed:', error.message);
      this.testResults.push({
        test: 'File Verification',
        status: 'FAIL',
        error: error.message
      });
      throw error;
    }
  }

  async runAllTests() {
    console.log('🎬 Starting API file upload tests...\n');
    
    try {
      // Test project file upload
      await this.testProjectFileUpload();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
      
      // Test milestone file upload
      await this.testMilestoneFileUpload();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test file validation
      await this.testFileValidation();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify uploaded files
      await this.verifyUploadedFiles();
      
      console.log('\n📊 Test Results Summary:');
      console.log('========================');
      this.testResults.forEach(result => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${status} ${result.test}: ${result.status}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
      
      const totalTests = this.testResults.length;
      const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      throw error;
    }
  }
}

// Run tests
async function main() {
  const tester = new APIFileUploadTester();
  try {
    await tester.runAllTests();
    console.log('✅ All API tests completed');
  } catch (error) {
    console.error('❌ API tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = APIFileUploadTester;