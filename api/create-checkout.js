const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  rookie: process.env.STRIPE_PRICE_ROOKIE || 'price_1TaGF2DfHooSk0bk9eMpudW0',
  rising: process.env.STRIPE_PRICE_RISING || 'price_1TaGG3DfHooSk0bkWMfjLyIE',
  pro:    process.env.STRIPE_PRICE_PRO    || 'price_1TaGGaDfHooSk0bkuAKFCqII',
  coach:  process.env.STRIPE_PRICE_COACH  || 'price_1TaGGvDfHooSk0bkukx3Pn2m',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','https://athletevault.org');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const{tier,email,name,role}=req.body;
    if(!tier||!email)return res.status(400).json({error:'Missing tier or email'});
    const priceId=PRICE_MAP[tier];
    if(!priceId)return res.status(400).json({error:'Invalid tier: '+tier});
    const session=await stripe.checkout.sessions.create({
      mode:'subscription',
      payment_method_types:['card'],
      customer_email:email,
      line_items:[{price:priceId,quantity:1}],
      metadata:{name:name||'',role:role||'athlete',tier},
      success_url:`https://athletevault.org?checkout=success&tier=${tier}&email=${encodeURIComponent(email)}`,
      cancel_url:`https://athletevault.org?checkout=cancelled`,
      subscription_data:{metadata:{name:name||'',role:role||'athlete',tier}},
    });
    return res.status(200).json({url:session.url,sessionId:session.id});
  }catch(err){
    console.error('Stripe error:',err.message);
    return res.status(500).json({error:err.message});
  }
};
