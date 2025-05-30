import { pool } from '../config/db.js';

// Create a new product (admin-only)
export const createProduct = async (req, res) => {
  const { name, price, category, quantity } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, price, category, quantity) VALUES (?, ?, ?, ?)',
      [name, price, category, quantity]
    );
    res.status(201).json({ id: result.insertId, name, price, category, quantity });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all products (public)
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.execute('SELECT * FROM products');
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single product by ID (public)
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(products[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a product (admin-only)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category, quantity } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, price = ?, category = ?, quantity = ? WHERE id = ?',
      [name, price, category, quantity, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a product (admin-only)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
