import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// NOTE: In your full project, import these from your redux setup
// import store from '../redux/store';
// import { error, success } from '../redux/actions/messageActions';

// Mock store/actions for standalone demonstration
const store = {
  dispatch: (action: any) => console.log('Redux Dispatch:', action)
};
const error = (message: string) => ({ type: 'ERROR', payload: message });
const success = (message: string) => ({ type: 'SUCCESS', payload: message });

export const API_BASE_URL = "https://mvp.multifolks.com";  // Production
// export const API_BASE_URL = "http://localhost:5000";  // Local for testing

const axios = Axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies for CSRF
});

// Helper function to get CSRF token from cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

axios.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else if (config.headers) {
    // If no token, send Guest ID
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('guest_id', guestId);
    }
    config.headers['X-Guest-ID'] = guestId;
  }

  // Add CSRF token if available
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && config.headers) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response: AxiosResponse) {
  if (response?.data?.status && response?.data?.message) {
    store.dispatch(success(response?.data?.message));
  } else if (response?.data?.status === false && !response?.data?.message) {
    // Silent failure or specific handling
  } else if (!(response?.data?.status || response?.data?.results?.status)) {
    // Optional: Uncomment to show errors for failed API logic
    // store.dispatch(error(response.data.message || 'Something went wrong.'));
  }
  return response;
}, async function (err: AxiosError) {
  const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;

    // Remove invalid token
    localStorage.removeItem('token');

    // Ensure guest ID exists
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('guest_id', guestId);
    }

    // Update headers: Remove Auth, Add Guest ID
    if (originalRequest.headers) {
      delete originalRequest.headers['Authorization'];
      originalRequest.headers['X-Guest-ID'] = guestId;
    }

    // Retry request
    return axios(originalRequest);
  }

  return Promise.reject(err);
});

export const getCityAndState = (pincode: string) => {
  return axios.get(`${API_BASE_URL}/accounts/address/check_pincode/?pincode=${pincode}`);
}

export default axios;