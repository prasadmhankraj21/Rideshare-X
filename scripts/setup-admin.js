import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../src/config/adminSecurityConfig.json');

const ADMIN_EMAIL = 'prasadmhankraj21@gmail.com';
const inputPassword = process.argv[2];

if (!inputPassword) {
  console.error('\n❌ Error: Please provide a strong master password.\nUsage: node scripts/setup-admin.js "YourStrongPassword#2026"\n');
  process.exit(1);
}

if (inputPassword.length < 8) {
  console.error('\n❌ Error: Password must be at least 8 characters long.\n');
  process.exit(1);
}

const disallowed = ['admin123', 'admin', 'password', '12345678', 'ridesharex'];
if (disallowed.includes(inputPassword.toLowerCase())) {
  console.error('\n❌ Error: Common or default passwords like "admin123" are strictly prohibited.\n');
  process.exit(1);
}

console.log(`\n🔒 Provisioning Master Admin Account for: ${ADMIN_EMAIL}`);
console.log('• Generating 16-byte cryptographically secure random salt...');
const salt = crypto.randomBytes(16);
const saltHex = salt.toString('hex');

console.log('• Computing PBKDF2-SHA-256 hash (100,000 iterations)...');
const derived = crypto.pbkdf2Sync(inputPassword, salt, 100000, 32, 'sha256');
const hashHex = derived.toString('hex');

const updatedConfig = {
  designatedAdminEmail: ADMIN_EMAIL,
  isProvisioned: true,
  passwordHash: hashHex,
  saltHex: saltHex,
  iterations: 100000,
  algorithm: 'PBKDF2-SHA256',
  authProvider: 'supabase_auth_or_pbkdf2',
  provisionedAt: new Date().toISOString()
};

fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

console.log('✅ Master password securely salted & hashed!');
console.log(`✅ Stored in src/config/adminSecurityConfig.json (Zero plaintext).`);
console.log('✅ Public setup is now PERMANENTLY DISABLED for all public visitors.');
console.log(`\nYou can now log in at the Admin Portal with:`);
console.log(`Email:    ${ADMIN_EMAIL}`);
console.log(`Password: (The password you just entered)\n`);
