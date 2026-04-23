const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate('users', '-password').populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name email',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const smartReplies = async (req, res) => {
  try {
    const { latestMessage } = req.body;
    let replies = ["Ok, got it!", "Thanks for letting me know.", "I'll look into it."];
    
    if (latestMessage) {
        const text = latestMessage.toLowerCase();
        if (text.includes("hello") || text.includes("hi")) {
            replies = ["Hi there!", "Hello! How are you?", "Hey! What's up?"];
        } else if (text.includes("how are you")) {
            replies = ["I'm good, thanks!", "Doing well, you?", "All good here!"];
        } else if (text.includes("thanks") || text.includes("thank you")) {
            replies = ["You're welcome!", "No problem!", "Anytime!"];
        } else if (text.includes("bye")) {
            replies = ["Goodbye!", "See you later!", "Take care!"];
        } else if (text.includes("?")) {
            replies = ["Yes, absolutely.", "I'm not sure.", "Let me check."];
        }
    }
    
    res.status(200).json({ replies });
  } catch(err) {
    res.status(500).send(err.message);
  }
};

const askOpenAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ message: "Gemini API Key not configured in .env" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    
    // Generate text from Gemini's response
    const text = result.response.text();

    res.status(200).json({ reply: text });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    await Message.deleteMany({ chat: chatId });
    res.status(200).json({ message: "Chat deleted permanently" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { accessChat, fetchChats, smartReplies, askOpenAI, deleteChat };
