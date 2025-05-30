import express from 'express';
import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from '../controllers/inventory.controlller.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

router.post('/', verifyToken, isAdmin, createInventory);
router.get('/', verifyToken, isAdmin, getAllInventory);
router.get('/:id', verifyToken, isAdmin, getInventoryById);
router.put('/:id', verifyToken, isAdmin, updateInventory);
router.delete('/:id', verifyToken, isAdmin, deleteInventory);

export default router;
