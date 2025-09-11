const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveFileUploadTester {
  constructor() {
    this.baseUrl = 'https://89bcf53b-0c81-4b8b-9713-bfec1ed03c04-00-2ys9jceim5pbi.pike.replit.dev';
    this.apiUrl = `${this.baseUrl}/api`;
    this.projectId = '2a5ca839-a1df-43bf-bcf5-71e7b2ea2a91'; // Modern Downtown Loft
    this.milestoneId = '525aa3e3-665a-471c-a4f8-873c6796f4bb'; // Space Planning milestone
    this.testResults = [];
  }

  async createTestFile(filename, content = null, size = null) {
    const filePath = path.join(__dirname, filename);
    
    if (size) {
      // Create file of specific size
      const buffer = Buffer.alloc(size, 'A');
      await fs.writeFile(filePath, buffer);
    } else {
      const fileContent = content || `Test file: ${filename}\nTimestamp: ${new Date().toISOString()}\nTest scenario: File upload functionality`;
      await fs.writeFile(filePath, fileContent);
    }
    
    console.log(`📝 Created test file: ${filename} (${size ? `${Math.round(size/1024)}KB` : 'text content'})`);
    return filePath;
  }

  async uploadFileToEndpoint(endpoint, filePath, additionalFields = {}) {
    const formData = new FormData();
    
    const fileBuffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    
    formData.append('files', fileBuffer, {
      filename,
      contentType: filename.endsWith('.txt') ? 'text/plain' : 
                   filename.endsWith('.pdf') ? 'application/pdf' :
                   filename.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream'
    });
    
    // Add additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await axios.post(endpoint, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    });
    
    return response;
  }

  async testGeneralFileUpload() {
    console.log('🧪 Testing general file upload endpoint (/api/files/upload)...');
    
    try {
      const testFilePath = await this.createTestFile('general-upload-test.txt');
      
      const response = await this.uploadFileToEndpoint(
        `${this.apiUrl}/files/upload`,
        testFilePath,
        {
          projectId: this.projectId,
          visibility: 'client'
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ General file upload successful');
        console.log('   Response:', response.data);
        
        this.testResults.push({
          test: 'General File Upload',
          status: 'PASS',
          endpoint: '/api/files/upload',
          response: response.data
        });
        
        await fs.unlink(testFilePath).catch(() => {});
        return response.data;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ General file upload failed:', error.message);
      if (error.response) {
        console.error('   Error details:', error.response.data);
      }
      
      this.testResults.push({
        test: 'General File Upload',
        status: 'FAIL',
        endpoint: '/api/files/upload',
        error: error.message,
        details: error.response?.data
      });
      
      return false;
    }
  }

  async testMilestoneFileUpload() {
    console.log('🎯 Testing milestone file upload...');
    
    try {
      const testFilePath = await this.createTestFile('milestone-upload-test.txt');
      
      const response = await this.uploadFileToEndpoint(
        `${this.apiUrl}/milestones/${this.milestoneId}/files`,
        testFilePath,
        {
          projectId: this.projectId,
          visibility: 'client'
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ Milestone file upload successful');
        console.log('   Response:', response.data);
        
        this.testResults.push({
          test: 'Milestone File Upload',
          status: 'PASS',
          endpoint: `/api/milestones/${this.milestoneId}/files`,
          response: response.data
        });
        
        await fs.unlink(testFilePath).catch(() => {});
        return response.data;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Milestone file upload failed:', error.message);
      if (error.response) {
        console.error('   Error details:', error.response.data);
      }
      
      this.testResults.push({
        test: 'Milestone File Upload',
        status: 'FAIL',
        endpoint: `/api/milestones/${this.milestoneId}/files`,
        error: error.message,
        details: error.response?.data
      });
      
      return false;
    }
  }

  async testFileValidationScenarios() {
    console.log('🔍 Testing file validation scenarios...');
    
    const testCases = [
      {
        name: 'Valid text file',
        filename: 'valid-test.txt',
        content: 'This is a valid text file for testing',
        expectedStatus: 'PASS'
      },
      {
        name: 'Valid image file (simulated)',
        filename: 'test-image.jpg',
        content: 'Simulated JPEG content - in real scenario this would be binary image data',
        expectedStatus: 'PASS'
      },
      {
        name: 'Invalid file type',
        filename: 'invalid-file.exe',
        content: 'This should be rejected',
        expectedStatus: 'FAIL'
      },
      {
        name: 'Large file (over 50MB)',
        filename: 'large-file.txt',
        size: 52 * 1024 * 1024, // 52MB - should fail
        expectedStatus: 'FAIL'
      },
      {
        name: 'Edge case - exactly 50MB',
        filename: 'max-size-file.txt', 
        size: 50 * 1024 * 1024, // Exactly 50MB - should pass
        expectedStatus: 'PASS'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\n🔬 Testing: ${testCase.name}`);
        
        const testFilePath = await this.createTestFile(
          testCase.filename, 
          testCase.content,
          testCase.size
        );
        
        const response = await this.uploadFileToEndpoint(
          `${this.apiUrl}/files/upload`,
          testFilePath,
          {
            projectId: this.projectId,
            visibility: 'client'
          }
        );
        
        const actualStatus = (response.status === 201 || response.status === 200) ? 'PASS' : 'FAIL';
        const testPassed = actualStatus === testCase.expectedStatus;
        
        console.log(`${testPassed ? '✅' : '❌'} ${testCase.name}: ${actualStatus} (Expected: ${testCase.expectedStatus})`);
        
        this.testResults.push({
          test: `File Validation - ${testCase.name}`,
          status: testPassed ? 'PASS' : 'FAIL',
          expected: testCase.expectedStatus,
          actual: actualStatus,
          filename: testCase.filename
        });
        
        await fs.unlink(testFilePath).catch(() => {});
        
      } catch (error) {
        const actualStatus = 'FAIL';
        const testPassed = actualStatus === testCase.expectedStatus;
        
        console.log(`${testPassed ? '✅' : '❌'} ${testCase.name}: ${actualStatus} (Expected: ${testCase.expectedStatus})`);
        console.log(`   Error: ${error.message}`);
        
        this.testResults.push({
          test: `File Validation - ${testCase.name}`,
          status: testPassed ? 'PASS' : 'FAIL',
          expected: testCase.expectedStatus,
          actual: actualStatus,
          error: error.message,
          filename: testCase.filename
        });
      }
    }
  }

  async testFileRetrieval() {
    console.log('📁 Testing file retrieval after upload...');
    
    try {
      // Get milestone files
      const milestoneFilesResponse = await axios.get(
        `${this.apiUrl}/milestones/${this.milestoneId}/files`,
        { timeout: 15000 }
      );
      
      if (milestoneFilesResponse.status === 200) {
        const files = milestoneFilesResponse.data.data || [];
        console.log(`✅ Retrieved ${files.length} files from milestone`);
        
        // Look for our test files
        const testFiles = files.filter(file => 
          file.fileName && file.fileName.includes('test')
        );
        
        console.log(`   Found ${testFiles.length} test files:`);
        testFiles.forEach(file => {
          console.log(`     - ${file.fileName} (${file.size} bytes, Status: ${file.status})`);
        });
        
        this.testResults.push({
          test: 'File Retrieval',
          status: 'PASS',
          totalFiles: files.length,
          testFiles: testFiles.length,
          files: testFiles.map(f => ({ name: f.fileName, size: f.size, status: f.status }))
        });
        
        return files;
      } else {
        throw new Error(`Failed to retrieve files: ${milestoneFilesResponse.status}`);
      }
      
    } catch (error) {
      console.error('❌ File retrieval failed:', error.message);
      
      this.testResults.push({
        test: 'File Retrieval',
        status: 'FAIL',
        error: error.message
      });
      
      return false;
    }
  }

  async testUIComponentStructure() {
    console.log('🎨 Testing UI component structure...');
    
    try {
      // Read and analyze the FileUploadModal component
      const modalContent = await fs.readFile('src/components/modals/FileUploadModal.jsx', 'utf-8');
      
      const criticalFeatures = [
        { name: 'File input handling', pattern: /input.*type.*file|fileInputRef/i },
        { name: 'Drag & Drop support', pattern: /drag.*drop|handleDrop|dragActive/i },
        { name: 'File validation', pattern: /validateFile|allowedTypes|fileSize/i },
        { name: 'Upload progress', pattern: /uploadProgress|progress.*upload/i },
        { name: 'Error handling', pattern: /error.*upload|setErrors/i },
        { name: 'Multiple file support', pattern: /multiple|files\[|selectedFiles/i },
        { name: 'File preview', pattern: /preview|thumbnail|getFileIcon/i },
        { name: 'Upload confirmation', pattern: /uploadFiles|handleUpload/i }
      ];
      
      const foundFeatures = criticalFeatures.filter(feature => 
        feature.pattern.test(modalContent)
      );
      
      console.log(`✅ UI Component Analysis: ${foundFeatures.length}/${criticalFeatures.length} critical features found`);
      foundFeatures.forEach(feature => console.log(`   ✓ ${feature.name}`));
      
      const missingFeatures = criticalFeatures.filter(feature => 
        !feature.pattern.test(modalContent)
      );
      if (missingFeatures.length > 0) {
        console.log('   Missing features:');
        missingFeatures.forEach(feature => console.log(`   ✗ ${feature.name}`));
      }
      
      this.testResults.push({
        test: 'UI Component Structure',
        status: foundFeatures.length >= criticalFeatures.length * 0.8 ? 'PASS' : 'FAIL',
        foundFeatures: foundFeatures.length,
        totalFeatures: criticalFeatures.length,
        features: foundFeatures.map(f => f.name),
        missing: missingFeatures.map(f => f.name)
      });
      
      return foundFeatures.length >= criticalFeatures.length * 0.8;
      
    } catch (error) {
      console.error('❌ UI component analysis failed:', error.message);
      
      this.testResults.push({
        test: 'UI Component Structure',
        status: 'FAIL',
        error: error.message
      });
      
      return false;
    }
  }

  async runFullTestSuite() {
    console.log('🎬 Starting Comprehensive File Upload Test Suite...\n');
    console.log(`📋 Testing Configuration:`);
    console.log(`   Project ID: ${this.projectId}`);
    console.log(`   Milestone ID: ${this.milestoneId}`);
    console.log(`   Base URL: ${this.baseUrl}\n`);
    
    const tests = [
      { name: 'UI Component Structure', test: () => this.testUIComponentStructure() },
      { name: 'General File Upload', test: () => this.testGeneralFileUpload() },
      { name: 'Milestone File Upload', test: () => this.testMilestoneFileUpload() },
      { name: 'File Validation', test: () => this.testFileValidationScenarios() },
      { name: 'File Retrieval', test: () => this.testFileRetrieval() }
    ];
    
    let passedTests = 0;
    
    for (const { name, test } of tests) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📝 Running: ${name}`);
      console.log(`${'='.repeat(50)}`);
      
      try {
        const result = await test();
        if (result !== false) passedTests++;
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      } catch (error) {
        console.error(`❌ Test '${name}' failed with error:`, error.message);
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎯 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log(`${'='.repeat(60)}`);
    
    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.test}: ${result.status}`);
      
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
      if (result.features && result.features.length > 0) {
        console.log(`     Features: ${result.features.join(', ')}`);
      }
      if (result.foundFeatures) {
        console.log(`     Coverage: ${result.foundFeatures}/${result.totalFeatures} features`);
      }
    });
    
    const totalTests = tests.length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`\n🏆 FINAL RESULTS:`);
    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Status: ${successRate >= 80 ? '🎉 EXCELLENT' : successRate >= 60 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
    
    return this.testResults;
  }
}

// Execute the comprehensive test suite
async function main() {
  const tester = new ComprehensiveFileUploadTester();
  
  try {
    const results = await tester.runFullTestSuite();
    console.log('\n🎊 Comprehensive file upload testing completed successfully!');
    return results;
  } catch (error) {
    console.error('❌ Test suite execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveFileUploadTester;