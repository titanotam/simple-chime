import axiosInstance from './apiUtil';

const endpoint = process.env.REACT_APP_AUTH_URL;

export function login(username, password) {
  return axiosInstance.post(endpoint, {
    username,
    password,
    grant_type: 'password',
  });
}
