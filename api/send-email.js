const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'AthleteVault <support@athletevault.org>';

const templates = {
  welcome: ({ name, role }) => ({
    subject: `Welcome to AthleteVault, ${name} 🏆`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#070710;color:#E0F4FF;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#E8B84B,#C49A2A);padding:32px;text-align:center;">
          <div style="font-size:48px;font-weight:900;letter-spacing:4px;color:#070710;">AV</div>
          <div style="font-size:22px;font-weight:700;color:#070710;margin-top:8px;">ATHLETEVAULT</div>
        </div>
        <div style="padding:32px;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;">Welcome, ${name}.</h1>
          <p style="color:#8AAFC4;line-height:1.7;margin-bottom:24px;">
            You're now part of the platform built by a GFL1 player for athletes who got overlooked.
            Your ${role === 'coach' ? 'coach dashboard' : 'athlete vault'} is ready.
          </p>
          ${role === 'athlete' ? `
          <div style="background:#0A1628;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="color:#E8B84B;font-weight:700;margin-bottom:12px;">Start here:</p>
            <ul style="color:#8AAFC4;line-height:2;padding-left:18px;">
              <li>Complete your recruiting profile</li>
              <li>Browse 500+ schools and Euro teams</li>
              <li>Use AI to generate coach outreach</li>
              <li>Track your NIL deals</li>
            </ul>
          </div>` : `
          <div style="background:#0A1628;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="color:#E8B84B;font-weight:700;margin-bottom:12px;">Start here:</p>
            <ul style="color:#8AAFC4;line-height:2;padding-left:18px;">
              <li>Connect Stripe to get paid</li>
              <li>Upload your first coaching video</li>
              <li>Search athletes by sport and region</li>
              <li>Schedule a live session</li>
            </ul>
          </div>`}
          <a href="https://athletevault.org" style="display:inline-block;background:#E8B84B;color:#070710;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">Open My Vault →</a>
          <p style="color:#4A7A9A;font-size:12px;margin-top:28px;line-height:1.6;">
            Questions? Reply to this email or reach out at support@athletevault.org<br>
            — Dennis "Chewy" Barnes, Founder
          </p>
        </div>
      </div>
    `,
  }),

  payment_success: ({ name, tier, amount }) => ({
    subject: `Payment confirmed — ${tier} Plan activated`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#070710;color:#E0F4FF;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#E8B84B,#C49A2A);padding:24px 32px;">
          <div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#070710;">ATHLETEVAULT</div>
        </div>
        <div style="padding:32px;">
          <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;">You're on the ${tier} plan, ${name}.</h1>
          <p style="color:#8AAFC4;line-height:1.7;margin-bottom:20px;">Amount: <strong style="color:#0FFFB0;">$${amount}/mo</strong>. Cancel anytime from your account settings.</p>
          <a href="https://athletevault.org" style="display:inline-block;background:#E8B84B;color:#070710;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;">Access Full Suite →</a>
        </div>
      </div>
    `,
  }),

  message_alert: ({ recipientName, senderName }) => ({
    subject: `${senderName} sent you a message on AthleteVault`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#070710;color:#E0F4FF;border-radius:12px;padding:28px;">
        <div style="font-weight:900;letter-spacing:2px;color:#E8B84B;margin-bottom:16px;">ATHLETEVAULT</div>
        <p style="font-size:15px;">Hey ${recipientName}, <strong>${senderName}</strong> sent you a new message.</p>
        <a href="https://athletevault.org?tab=messages" style="display:inline-block;margin-top:16px;background:#E8B84B;color:#070710;padding:12px 22px;border-radius:8px;font-weight:700;text-decoration:none;">Read Message →</a>
      </div>
    `,
  }),
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'Email not configured' });
  }

  try {
    const { to, template, data } = req.body;
    if (!to || !template) return res.status(400).json({ error: 'Missing to or template' });

    const tpl = templates[template];
    if (!tpl) return res.status(400).json({ error: 'Unknown template: ' + template });

    const { subject, html } = tpl(data || {});

    const result = await resend.emails.send({ from: FROM, to, subject, html });
    return res.status(200).json({ id: result.id });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
