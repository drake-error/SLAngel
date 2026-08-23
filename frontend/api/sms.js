/**
 * SLAngel — Vercel Serverless SMS Proxy
 * Routes SMS requests through the server to avoid CORS issues with Fast2SMS.
 * Endpoint: POST /api/sms
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, numbers, apiKey } = req.body;

    if (!message || !numbers || !apiKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: message, numbers, apiKey' 
      });
    }

    // Clean phone number — extract last 10 digits
    const cleanedPhone = numbers.replace(/\D/g, '').slice(-10);
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Call Fast2SMS API from server (no CORS issue)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        flash: 0,
        numbers: cleanedPhone,
      }),
    });

    const data = await response.json();

    if (response.ok && data.return) {
      return res.status(200).json({
        success: true,
        message: `SMS delivered to ${cleanedPhone}`,
        gateway_response: data,
      });
    } else {
      return res.status(502).json({
        success: false,
        message: data.message || 'Fast2SMS delivery failed',
        gateway_response: data,
      });
    }
  } catch (err) {
    console.error('SMS Proxy Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while sending SMS',
      error: err.message,
    });
  }
}
