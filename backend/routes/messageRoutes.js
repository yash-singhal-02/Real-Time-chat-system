const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessages, sendMediaMessage, clearMessages, markAsRead } = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/media').post(protect, upload.single('media'), sendMediaMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/clear/:chatId').delete(protect, clearMessages);
router.route('/read/:chatId').put(protect, markAsRead);

module.exports = router;
