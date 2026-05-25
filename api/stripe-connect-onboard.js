const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { coachId, email, name, refreshUrl, returnUrl } = req.body;
    if (!coachId || !email) return res.status(400).json({ error: 'Missing coachId or email' });

    // Create a Stripe Express account for this coach
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: { email },
      metadata: { coachId: String(coachId), name: name || '' },
    });

    // Build return URL with the real account ID — client sends a template with ACCOUNT_ID placeholder
    const baseReturn = (returnUrl || 'http://localhost:5173').split('?')[0];
    const actualReturnUrl = `${baseReturn}?stripe_connected=${account.id}&coach=${coachId}`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || 'http://localhost:5173?stripe_refresh=1',
      return_url: actualReturnUrl,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url, accountId: account.id });
  } catch (err) {
    console.error('Stripe Connect onboard error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
