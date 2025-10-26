
import { LoginCredentials, ApiResponse, User } from '../types/auth.types';

export const getBaseUrl = (): string => {
  // First check localStorage for user-configured URL  
  const storedUrl = localStorage.getItem('baseUrl');
  if (storedUrl) {
    return storedUrl;
  }
  
  // Then check environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Return empty string to force user configuration - no hardcoded localhost
  return '';
};

export const getBaseUrl2 = (): string => {
  // First check localStorage for user-configured URL
  const storedUrl = localStorage.getItem('baseUrl2');
  if (storedUrl) {
    return storedUrl;
  }
  
  // Then check environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL_2;
  if (envUrl) {
    return envUrl;
  }
  
  // Return empty string to force user configuration
  return '';
};

export const getAttendanceUrl = (): string => {
  // First check localStorage for user-configured URL
  const storedUrl = localStorage.getItem('attendanceUrl');
  if (storedUrl) {
    return storedUrl;
  }
  
  // Then check environment variable
  const envUrl = import.meta.env.VITE_ATTENDANCE_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Return empty string to force user configuration
  return '';
};

export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Always get token from localStorage for API calls
  const token = localStorage.getItem('access_token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header added with token');
  } else {
    console.warn('No access token found in localStorage');
  }

  return headers;
};

export const loginUser = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  const baseUrl = getBaseUrl();
  
  console.log('Attempting login with credentials:', { email: credentials.email });
  
  const loginHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const response = await fetch(`${baseUrl}/v2/auth/login`, {
    method: 'POST',
    headers: loginHeaders,
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Store the access token immediately
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    console.log('Access token stored successfully after login');
  } else {
    console.error('No access token received from login response');
  }
  
  return data;
};

export const validateToken = async (): Promise<User> => {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('Validating token with backend...');

  const response = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    headers: getApiHeaders()
  });

  if (!response.ok) {
    // Clear invalid token
    localStorage.removeItem('access_token');
    console.log('Invalid token cleared from localStorage');
    throw new Error('Token validation failed');
  }

  const userData = await response.json();
  console.log('Token validation successful');
  return userData;
};

export const logoutUser = async (): Promise<void> => {
  // Clear all auth-related data from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('org_access_token');
  
  // Clear any other user-related data
  localStorage.removeItem('selectedInstitute');
  localStorage.removeItem('selectedClass');
  localStorage.removeItem('selectedSubject');
  localStorage.removeItem('selectedChild');
  localStorage.removeItem('selectedOrganization');
  
  console.log('All auth tokens and user data cleared from localStorage');
};
