import express from 'express';
import {
  getFinanceOverview,
  exportRevenueExcel,
  requestRefund,
  processRefund,
  getAllRefunds,
  getDashboardAnalytics,
  getStaffList
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Finance logs
router.get('/finance', protect, authorize('Finance', 'Manager'), getFinanceOverview);
router.get('/finance/export', protect, authorize('Finance', 'Manager'), exportRevenueExcel);

// Refund processing
router.post('/refunds/request', protect, requestRefund);
router.get('/refunds', protect, getAllRefunds);
router.put('/refunds/:refundId/process', protect, authorize('Finance', 'Manager'), processRefund);

// Admin KPIs & staff
router.get('/dashboard', protect, authorize('Manager'), getDashboardAnalytics);
router.get('/staff', protect, authorize('Manager'), getStaffList);

export default router;
