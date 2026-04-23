const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).send('Invalid data passed into request');
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate('sender', 'name');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).populate('sender', 'name email').populate('chat');
    res.json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const sendMediaMessage = async (req, res) => {
  const { content, chatId } = req.body;
  if (!chatId) return res.status(400).send("chatId not provided");

  let mediaUrl = "";
  if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    mediaUrl: mediaUrl
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate('sender', 'name');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const clearMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: null });
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { sendMessage, allMessages, sendMediaMessage, clearMessages };
