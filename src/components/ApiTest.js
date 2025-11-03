import React, { useState } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, result) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic connectivity
    try {
      const response = await axios.get('http://180.149.245.93:8090', { timeout: 5000 });
      addResult('Basic Connectivity', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Basic Connectivity', `❌ Failed: ${error.message}`);
    }

    // Test 2: Login endpoint with minimal payload (username/password)
    try {
      const response = await axios.post('http://180.149.245.93:8090/auth/login', {
        username: 'test',
        password: 'test'
      }, { 
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      addResult('Login (username/password)', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Login (username/password)', `❌ Failed: ${error.response?.status || error.message} - ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Login endpoint with employeeId field
    try {
      const response = await axios.post('http://180.149.245.93:8090/auth/login', {
        employeeId: '58071',
        password: 'test'
      }, { 
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      addResult('Login (employeeId/password)', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Login (employeeId/password)', `❌ Failed: ${error.response?.status || error.message} - ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Login endpoint with email field
    try {
      const response = await axios.post('http://180.149.245.93:8090/auth/login', {
        email: '58071',
        password: 'test'
      }, { 
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      addResult('Login (email/password)', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Login (email/password)', `❌ Failed: ${error.response?.status || error.message} - ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Login with form-data content type
    try {
      const formData = new FormData();
      formData.append('username', '58071');
      formData.append('password', 'test');
      
      const response = await axios.post('http://180.149.245.93:8090/auth/login', formData, { 
        timeout: 10000,
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      addResult('Login (form-data)', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Login (form-data)', `❌ Failed: ${error.response?.status || error.message} - ${error.response?.data?.message || error.message}`);
    }

    // Test 6: Login with URL-encoded content type
    try {
      const params = new URLSearchParams();
      params.append('username', '58071');
      params.append('password', 'test');
      
      const response = await axios.post('http://180.149.245.93:8090/auth/login', params, { 
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      addResult('Login (URL-encoded)', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Login (URL-encoded)', `❌ Failed: ${error.response?.status || error.message} - ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Check server health/status endpoint
    try {
      const response = await axios.get('http://180.149.245.93:8090/health', { timeout: 5000 });
      addResult('Health Check', `✅ Success: ${response.status}`);
    } catch (error) {
      addResult('Health Check', `❌ Failed: ${error.response?.status || error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Diagnostic Tool</h2>
      <button 
        onClick={testApiEndpoint} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Run API Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        {results.length === 0 && !loading && (
          <p style={{ color: '#666' }}>Click "Run API Tests" to start diagnostics</p>
        )}
        {results.map((result, index) => (
          <div key={index} style={{
            padding: '10px',
            margin: '5px 0',
            backgroundColor: result.result.includes('✅') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <strong>{result.test}</strong> ({result.timestamp}): {result.result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;