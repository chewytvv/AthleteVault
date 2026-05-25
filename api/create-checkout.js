const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const PRICE_MAP = {
  rookie: process.env.STRIPE_PRICE_ROOKIE || 'price_1TaGF2DfHooSk0bk9eMpudW0',
  rising: process.env.STRIPE_PRICE_RISING || 'price_1TaGG3DfHooSk0bkWMfjLyIE',
  pro:    process.env.STRIPE_PRICE_PRO    || 'price_1TaGGaDfHooSk0bkuAKFCqII',
  coach:  process.env.STRIPE_PRICE_COACH  || 'price_1TaGGvDfHooSk0bkukx3Pn2m',
};

// Validates code against av_discounts_v1 (owner codes) or user referral codes.
// Returns { pct } on success, null if invalid/expired.
async function validateDiscount(code) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const now = new Date().toISOString().slice(0, 10);

    // 1. Owner-created discount codes
    const { data: discData } = await supabase
      .from('kv_store').select('value').eq('key', 'av_discounts_v1').single();
    const discCodes = discData?.value || [];
    const match = discCodes.find(c =>
      c.code?.toUpperCase() === code &&
      (!c.expires || c.expires >= now) &&
      (!c.maxUses || (c.uses || 0) < Number(c.maxUses))
    );
    if (match) {
      // Increment usage (fire and forget)
      const updated = discCodes.map(c =>
        c.code?.toUpperCase() === code ? { ...c, uses: (c.uses || 0) + 1 } : c
      );
      supabase.from('kv_store')
        .upsert({ key: 'av_discounts_v1', value: updated })
        .catch(() => {});
      return { pct: Number(match.pct) };
    }

    // 2. User referral codes
    const [{ data: aData }, { data: cData }] = await Promise.all([
      supabase.from('kv_store').select('value').eq('key', 'av_ath_v1').single(),
      supabase.from('kv_store').select('value').eq('key', 'av_coa_v1').single(),
    ]);
    const allUsers = [...(aData?.value || []), ...(cData?.value || [])];
    const referrer = allUsers.find(u => u.referralCode?.toUpperCase() === code);
    if (referrer) {
      const { data: sData } = await supabase
        .from('kv_store').select('value').eq('key', 'av_set_v1').single();
      const pct = sData?.value?.defaultReferralDiscount || 10;
      return { pct: Number(pct) };
    }

    return null;
  } catch (e) {
    console.error('validateDiscount error:', e.message);
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://athletevault.org');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tier, email, name, role, discountCode } = req.body;
    if (!tier || !email) return res.status(400).json({ error: 'Missing tier or email' });
    const priceId = PRICE_MAP[tier];
    if (!priceId) return res.status(400).json({ error: 'Invalid tier: ' + tier });

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { name: name || '', role: role || 'athlete', tier, discountCode: discountCode || '' },
      success_url: `https://athletevault.org?checkout=success&tier=${tier}&email=${encodeURIComponent(email)}`,
      cancel_url: `https://athletevault.org?checkout=cancelled`,
      subscription_data: { metadata: { name: name || '', role: role || 'athlete', tier } },
    };

    if (discountCode && discountCode.trim()) {
      const code = discountCode.trim().toUpperCase();
      const discount = await validateDiscount(code);
      if (!discount) {
        return res.status(400).json({
          error: `Discount code "${code}" is invalid or expired.`,
        });
      }
      const coupon = await stripe.coupons.create({
        percent_off: discount.pct,
        duration: 'once',
        name: code,
        metadata: { avCode: code },
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
      delete sessionParams.allow_promotion_codes; // mutually exclusive with discounts
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
