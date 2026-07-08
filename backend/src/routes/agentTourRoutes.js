import express from 'express';
import {
  createAgentTour,
  getAgentTours,
  getAgentTourById,
  updateAgentTour,
  deleteAgentTour
} from '../controllers/agentTourController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Require both authentication (protect) and authorization (Agent only)
router.use(protect);
router.use(authorize('Agent'));

router.route('/')
  .post(createAgentTour)
  .get(getAgentTours);

router.route('/:id')
  .get(getAgentTourById)
  .put(updateAgentTour)
  .delete(deleteAgentTour);

export default router;
