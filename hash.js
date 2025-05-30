// hashPassword.js
import bcrypt from 'bcrypt';

const password = 'admin123'; // Change this to your desired admin password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err.message);
    return;
  }
  console.log('Hashed password:', hash);
});