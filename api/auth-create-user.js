const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Verify the caller is the owner (their session token must match OWNER_EMAIL)
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || user?.email !== process.env.OWNER_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email, password, role } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'email and password (min 8 chars) required' });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: role || 'athlete' },
  });

  if (error) {
    // If user already exists, try to look them up
    if (error.message?.includes('already registered')) {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing?.users?.find(u => u.email === email);
      if (found) return res.status(200).json({ authId: found.id });
    }
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ authId: data.user.id });
};
