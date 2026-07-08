import axios from 'axios';

const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.replace(/\/$/, '');
    if (cleanUrl.endsWith('/api/v1')) {
      return cleanUrl.replace(/\/v1$/, '');
    }
    if (cleanUrl.endsWith('/api')) {
      return cleanUrl;
    }
    return `${cleanUrl}/api`;
  }
  try {
    const { protocol, hostname } = window.location;
    if (hostname && (hostname === 'localhost' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname))) {
      const cleanProtocol = protocol && protocol.includes(':') ? protocol : 'http:';
      return `${cleanProtocol}//${hostname}:4000/api`;
    }
  } catch (e) {}
  return 'https://exploremytrip.onrender.com/api';
};

const BASE_URL = getBaseApiUrl();

export const getDiscoverDetails = async (query) => {
  if (!query) return null;
  try {
    const res = await axios.get(`${BASE_URL}/discover`, {
      params: { q: query }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch global discovery guide details:', error.message);
    throw error;
  }
};

