// controllers/inventory.controller.js
import { pool } from '../config/db.js';

// Create an inventory entry (admin-only)
export async function createInventory(req, res) {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 0) {
    return res.status(400).json({ error: 'Product ID and non-negative quantity are required' });
  }

  try {
    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO inventory (product_id, stock_level) VALUES (?, ?)',
      [product_id, quantity]
    );

    res.status(201).json({
      message: 'Inventory entry created successfully',
      inventory: { id: result.insertId, product_id, quantity },
    });
  } catch (err) {
    console.error('Error creating inventory:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all inventory entries (admin-only)
export async function getAllInventory(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT i.id, i.product_id, p.name, i.stock_level AS quantity, i.last_updated FROM inventory i JOIN products p ON i.product_id = p.id'
    );
    res.json({ inventory: rows });
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get inventory by ID (admin-only)
export async function getInventoryById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT i.id, i.product_id, p.name, i.stock_level AS quantity, i.last_updated FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }
    res.json({ inventory: rows[0] });
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update inventory (admin-only)
export async function updateInventory(req, res) {
  const { id } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 0) {
    return res.status(400).json({ error: 'Product ID and non-negative quantity are required' });
  }

  try {
    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [result] = await pool.query(
      'UPDATE inventory SET product_id = ?, stock_level = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [product_id, quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }

    res.json({
      message: 'Inventory updated successfully',
      inventory: { id, product_id, quantity },
    });
  } catch (err) {
    console.error('Error updating inventory:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete inventory (admin-only)
export async function deleteInventory(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }
    res.json({ message: 'Inventory entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}