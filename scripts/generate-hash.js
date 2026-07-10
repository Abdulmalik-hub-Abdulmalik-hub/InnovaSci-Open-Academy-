// Script to generate bcrypt hash for password
// Usage: node scripts/generate-hash.js

const bcrypt = require('bcryptjs')

async function generateHash() {
  const password = 'Ummuhani12345'
  const saltRounds = 12
  
  console.log('============================================')
  console.log('Bcrypt Hash Generator')
  console.log('============================================')
  console.log('Library: bcryptjs v3.0.3')
  console.log('Password:', password)
  console.log('Salt rounds:', saltRounds)
  console.log('============================================')
  
  const hash = await bcrypt.hash(password, saltRounds)
  
  console.log('\nGenerated Hash:')
  console.log(hash)
  
  console.log('\n============================================')
  console.log('SQL to update password in database:')
  console.log('============================================')
  console.log(`UPDATE public.users SET password_hash = '${hash}' WHERE email = 'YOUR_ADMIN_EMAIL@example.com';`)
  console.log('\n============================================')
}

generateHash().catch(console.error)
