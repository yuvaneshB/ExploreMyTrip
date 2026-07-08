import axios from 'axios';

const getBaseApiUrl = () => {
  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (rawBaseUrl && rawBaseUrl !== 'undefined' && rawBaseUrl !== 'null' && rawBaseUrl.trim() !== '') {
    return rawBaseUrl.replace(/\/v1\/?$/, '');
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

export const getCountryDetails = async (countryName) => {
  if (!countryName) return null;

  // Clean name before sending
  const cleanName = countryName.split(' ').find(w => w.length > 3) || countryName;

  try {
    const res = await axios.get(`${BASE_URL}/countries/${encodeURIComponent(cleanName)}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch country details from proxy:', error.message);
    throw error;
  }
};

