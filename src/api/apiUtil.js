import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_URL;
const device_uid = process.env.REACT_APP_DEVICE_UID;
const app_id = process.env.REACT_APP_APP_ID;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    device_uid,
    app_id,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authLocalStorage = localStorage.getItem('credentials');
    if (!authLocalStorage) {
      return config;
    }

    const token = JSON.parse(authLocalStorage).access_token;
    if (token && config && config.headers) {
      config.headers['Authorization'] = 'Bearer ' + token; // for Node.js Express back-end
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    if (response.status === 200 || response.status === 201) {
      const res = response.data;

      return res.data;
    }
    return response;
  },
  async (err) => {
    console.error(err);
    return Promise.reject(err);
  },
);

export default axiosInstance;
