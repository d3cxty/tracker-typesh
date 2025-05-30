
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function registerCustomer(req, res) {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const password = req.body.password
    const hashedPassword = await bcrypt.hash(password,10)

    const [result] = await pool.query(
      'INSERT INTO customers (name, email, password, address) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, address || null]
    );

    const token = jwt.sign({ id: result.insertId, email, is_admin: false }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'Customer registered successfully',
      customer: { id: result.insertId, name, email, address },
      token,
    });
  } catch (err) {
    console.error('Error registering customer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Login a customer
export async function loginCustomer(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT id, name, email, address, password, is_admin FROM customers WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: customer.id, email: customer.email, is_admin: customer.is_admin }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      message: 'Login successful',
      customer: { id: customer.id, name: customer.name, email: customer.email, address: customer.address, is_admin: customer.is_admin },
      token,
    });
  } catch (err) {
    console.error('Error logging in customer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all customers (admin-only)
export async function getAllCustomers(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, email, address, is_admin, created_at FROM customers');
    res.json({ customers: rows });
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get a single customer by ID (self or admin)
export async function getCustomerById(req, res) {
  const { id } = req.params;
  const user = req.user;

  try {
    const [rows] = await pool.query('SELECT id, name, email, address, is_admin, created_at FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = rows[0];
    if (customer.id !== user.id && !user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ customer });
  } catch (err) {
    console.error('Error fetching customer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update a customer (self or admin)
export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, email, address } = req.body;
  const user = req.user;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    if (Number(id) !== user.id && !user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [existing] = await pool.query('SELECT id FROM customers WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const fields = [];
    const values = [];
    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer: { id, name, email, address },
    });
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete a customer (admin-only)
export async function deleteCustomer(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}