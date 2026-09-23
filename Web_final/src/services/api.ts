import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = sessionStorage.getItem('token');
  }
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log(`📤 [${config.method?.toUpperCase()}] ${fullUrl}`, {
    hasToken: !!token,
    params: config.params,
  });
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
    console.log(`✅ [${response.config.method?.toUpperCase()}] ${fullUrl} - Status: ${response.status}`, {
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    const fullUrl = error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'Unknown URL';
    console.error(`❌ [${error.config?.method?.toUpperCase() || 'UNKNOWN'}] ${fullUrl} - Error:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      networkError: error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')
    });
    
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized - Token may be expired or missing');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('🌐 Network Error - API server may be down or unreachable');
      console.error('Check if Laravel server is running on:', error.config?.baseURL || 'http://127.0.0.1:8001');
    }
    
    return Promise.reject(error);
  }
);

export default api;
