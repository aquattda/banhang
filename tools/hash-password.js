const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
    console.log('Usage: node hash-password.js <password>');
    console.log('Example: node hash-password.js admin123');
    process.exit(1);
}

// Hash the password
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n=================================');
console.log('Password:', password);
console.log('Hashed:', hash);
console.log('=================================\n');
console.log('SQL Update Command:');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@banhang.com';`);
console.log('\n');
