import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { createGroup, deleteGroup, getToday, getHistory, getHistoryDates, createTask, toggleTask, deleteTask } from '../controllers/taskController';

const router = Router();

router.use(requireAuth);

router.get('/today', getToday);
router.get('/history', getHistory);
router.get('/dates', getHistoryDates);
router.post('/groups', createGroup);
router.delete('/groups/:id', deleteGroup);
router.post('/', createTask);
router.patch('/:id', toggleTask);
router.delete('/:id', deleteTask);

export default router;
