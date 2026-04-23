const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChats, smartReplies, askOpenAI, deleteChat } = require('../controllers/chatController');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/smart-replies').post(protect, smartReplies);
router.route('/openai').post(protect, askOpenAI);

router.route('/:chatId').delete(protect, deleteChat);

module.exports = router;
