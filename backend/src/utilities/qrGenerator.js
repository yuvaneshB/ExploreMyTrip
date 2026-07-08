import QRCode from 'qrcode';

// Generate QR Code as DataURL
export const generateQRCode = async (text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      color: {
        dark: '#0f172a', // dark blue
        light: '#ffffff' // white background
      },
      width: 250,
      margin: 2
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR Code Generation Error:', err.message);
    throw new Error('Failed to generate QR Code');
  }
};
