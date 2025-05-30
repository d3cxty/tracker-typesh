import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id', verifyToken, isAdmin, updateOrder);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);

export default router;
