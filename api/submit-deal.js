const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'AthleteVault <support@athletevault.org>';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { brand, category, payout, sport, description, contact, minFollowers } = req.body;
    if (!brand || !payout || !contact) {
      return res.status(400).json({ error: 'Missing required fields: brand, payout, contact' });
    }

    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) return res.status(503).json({ error: 'Owner email not configured' });

    const html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#070710;color:#E0F4FF;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#E8B84B,#C49A2A);padding:24px 32px;">
          <div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#070710;">ATHLETEVAULT</div>
          <div style="font-size:14px;color:#070710;margin-top:4px;opacity:.8;">New Brand Deal Submission</div>
        </div>
        <div style="padding:28px;">
          <h2 style="font-size:20px;margin-bottom:20px;">🤝 New Deal: ${brand}</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            ${[
              ['Brand', brand],
              ['Category', category || '—'],
              ['Payout', payout],
              ['Sport', sport || 'All'],
              ['Min Followers', minFollowers ? Number(minFollowers).toLocaleString() : '0'],
              ['Contact', contact],
            ].map(([k, v]) => `
              <tr style="border-bottom:1px solid #0A1628;">
                <td style="padding:8px 0;color:#4A7A9A;font-size:13px;width:140px;">${k}</td>
                <td style="padding:8px 0;color:#E0F4FF;font-size:13px;font-weight:600;">${v}</td>
              </tr>
            `).join('')}
          </table>
          ${description ? `<div style="background:#0A1628;border-radius:10px;padding:16px;margin-bottom:20px;"><div style="color:#E8B84B;font-size:11px;letter-spacing:2px;margin-bottom:8px;">DESCRIPTION</div><p style="color:#8AAFC4;line-height:1.7;margin:0;">${description}</p></div>` : ''}
          <p style="color:#4A7A9A;font-size:12px;margin-top:16px;">Login to your Owner dashboard → Brand Manager to approve and add this deal.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: FROM,
      to: ownerEmail,
      subject: `New deal submission: ${brand} (${payout})`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('submit-deal error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
