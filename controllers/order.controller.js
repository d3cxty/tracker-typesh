// controllers/order.controller.js
import { pool } from '../config/db.js';

// Create an order (authenticated users)
export async function createOrder(req, res) {
  const { customer_id, total_amount, status } = req.body;
  const user = req.user;

  if (!customer_id || !total_amount || total_amount < 0) {
    return res.status(400).json({ error: 'Customer ID and non-negative total amount are required' });
  }

  if (customer_id !== user.id && !user.is_admin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const [customer] = await pool.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const validStatuses = ['pending', 'completed', 'canceled'];
    const orderStatus = validStatuses.includes(status) ? status : 'pending';

    const [result] = await pool.query(
      'INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)',
      [customer_id, total_amount, orderStatus]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: { id: result.insertId, customer_id, total_amount, status: orderStatus },
    });
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all orders (admin-only)
export async function getAllOrders(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT o.id, o.customer_id, c.email, o.total_amount, o.status, o.created_at FROM orders o JOIN customers c ON o.customer_id = c.id'
    );
    res.json({ orders: rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get an order by ID (order owner or admin)
export async function getOrderById(req, res) {
  const { id } = req.params;
  const user = req.user;

  try {
    const [rows] = await pool.query(
      'SELECT o.id, o.customer_id, c.email, o.total_amount, o.status, o.created_at FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];
    if (order.customer_id !== user.id && !user.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update an order (admin-only)
export async function updateOrder(req, res) {
  const { id } = req.params;
  const { total_amount, status } = req.body;

  if (!total_amount || total_amount < 0) {
    return res.status(400).json({ error: 'Non-negative total amount is required' });
  }

  try {
    const validStatuses = ['pending', 'completed', 'canceled'];
    const orderStatus = validStatuses.includes(status) ? status : 'pending';

    const [result] = await pool.query(
      'UPDATE orders SET total_amount = ?, status = ? WHERE id = ?',
      [total_amount, orderStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order updated successfully',
      order: { id, total_amount, status: orderStatus },
    });
  } catch (err) {
    console.error('Error updating order:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete an order (admin-only)
export async function deleteOrder(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}