const bcrypt = require('bcryptjs');

// Script to hash passwords for manual database insertion
// Usage: node scripts/hashPassword.js <password>

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password to hash');
  console.log('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Hashed password:', hash);
  console.log('\nYou can now insert this into MongoDB:');
  console.log('Example Admin:');
  console.log(JSON.stringify({
    email: 'admin@example.com',
    password: hash,
    name: 'Admin User',
    role: 'admin'
  }, null, 2));
  console.log('\nExample Customer:');
  console.log(JSON.stringify({
    email: 'customer@example.com',
    password: hash,
    name: 'Customer User',
    phone: '1234567890',
    address: '123 Main St'
  }, null, 2));
});
