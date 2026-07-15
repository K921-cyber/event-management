const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Builds a signed payload for a booking's QR code.
 * The QR encodes { bookingId, sig } where sig = HMAC(bookingId + qrSecret, QR_SECRET).
 * This means the QR cannot be forged without both the server's QR_SECRET
 * and the booking's own per-record qrSecret.
 */
const buildQrPayload = (bookingId, qrSecret) => {
  const sig = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(`${bookingId}:${qrSecret}`)
    .digest('hex');
  return JSON.stringify({ b: bookingId.toString(), s: sig });
};

const verifyQrPayload = (rawPayload, bookingId, qrSecret) => {
  try {
    const { b, s } = JSON.parse(rawPayload);
    if (b !== bookingId.toString()) return false;
    const expected = crypto
      .createHmac('sha256', process.env.QR_SECRET)
      .update(`${bookingId}:${qrSecret}`)
      .digest('hex');
    // Constant-time comparison
    return crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected));
  } catch {
    return false;
  }
};

const generateQrDataUrl = async (bookingId, qrSecret) => {
  const payload = buildQrPayload(bookingId, qrSecret);
  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 320 });
};

module.exports = { buildQrPayload, verifyQrPayload, generateQrDataUrl };
