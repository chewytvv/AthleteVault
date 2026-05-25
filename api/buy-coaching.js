const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      itemId,       // videoId or sessionId
      itemTitle,
      itemType,     // 'video' or 'session'
      price,        // dollars
      coachStripeId,
      athleteEmail,
      coachId,
      successUrl,
      cancelUrl,
      platformCutPct = 20,
    } = req.body;

    if (!itemId || !itemTitle || !price || !athleteEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    const platformFeeCents = Math.round(priceInCents * (platformCutPct / 100));

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: athleteEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemTitle,
            description: `${itemType === 'video' ? 'Coaching Video' : 'Live Session'} — AthleteVault`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      metadata: {
        itemId: String(itemId),
        itemType,
        coachId: String(coachId),
      },
      success_url: successUrl || `http://localhost:5173?coaching_purchased=${itemId}&type=${itemType}&coach=${coachId}`,
      cancel_url: cancelUrl || 'http://localhost:5173?tab=coaching',
    };

    // If coach has a connected Stripe account, split the payment
    if (coachStripeId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: coachStripeId },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Buy coaching error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
