const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionsCSV,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);
router.post('/upload', protect, upload.single('file'), uploadTransactionsCSV);

module.exports = router;
