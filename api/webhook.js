const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if(req.method!=='POST')return res.status(405).end();
  const sig=req.headers['stripe-signature'];
  const chunks=[];
  await new Promise((resolve,reject)=>{
    req.on('data',c=>chunks.push(c));
    req.on('end',resolve);
    req.on('error',reject);
  });
  const rawBody=Buffer.concat(chunks);
  let event;
  try{
    event=stripe.webhooks.constructEvent(rawBody,sig,process.env.STRIPE_WEBHOOK_SECRET||'');
  }catch(err){
    return res.status(400).json({error:'Webhook error: '+err.message});
  }
  switch(event.type){
    case'checkout.session.completed':{
      const s=event.data.object;
      if(s.metadata?.itemType){
        console.log('COACHING PURCHASE:',s.customer_email,'item:',s.metadata.itemId,'type:',s.metadata.itemType,'coach:',s.metadata.coachId);
      } else {
        const tier=s.metadata?.tier||'rookie';
        const name=s.metadata?.name||s.customer_email||'';
        console.log('NEW SUBSCRIBER:',s.customer_email,'tier:',tier,'role:',s.metadata?.role);
        // Send payment confirmation email
        const prices={rookie:29,rising:49,pro:79,coach:49};
        fetch(`${process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:''}/api/send-email`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({to:s.customer_email,template:'payment_success',data:{name,tier,amount:prices[tier]||29}}),
        }).catch(()=>{});
      }
      break;
    }
    case'customer.subscription.deleted':
      console.log('CANCELLED:',event.data.object.customer);
      break;
    case'invoice.payment_failed':
      console.log('PAYMENT FAILED:',event.data.object.customer_email);
      break;
  }
  return res.status(200).json({received:true});
};
