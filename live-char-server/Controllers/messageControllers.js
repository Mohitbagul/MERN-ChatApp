const expressAsyncHandler = require("express-async-handler");
const Message = require("../Models/messageMode");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModels");

const allMessages = expressAsyncHandler(async (req, res) => {
  console.log("Fetching all messages for chat:", req.params.chatId);

  try {
    // ✅ Fetch messages
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name email" },
      })
      .sort({ createdAt: 1 });

    // ✅ Fetch chat details
    const chatDetails = await Chat.findById(req.params.chatId)
      .populate("users", "name email")
      .populate("groupAdmin", "name email");

    res.json({ messages, chatDetails }); // ✅ Send both messages and chat info
  } catch (error) {
    console.error("Error in allMessages:", error);
    res.status(400).json({ error: error.message });
  }
});


const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Invalid data passed into request" });
  }

  try {
    const chat = await Chat.findById(chatId).populate("users", "_id");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    let receiver = null;
    let isGroupMessage = chat.isGroupChat;

    if (!isGroupMessage) {
      receiver = chat.users.find((user) => user._id.toString() !== req.user._id.toString());
    }

    const newMessageData = {
      sender: req.user._id,
      content,
      chat: chatId,
      isGroupMessage,
    };

    if (!isGroupMessage) {
      newMessageData.receiver = receiver._id; // ✅ Only set for private chats
    }

    const newMessage = await Message.create(newMessageData);

    let message = await Message.findById(newMessage._id)
      .populate("sender", "name")
      .populate("chat")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name email" },
      });

    if (receiver) {
      message = await message.populate("receiver", "name");
    }

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = { allMessages, sendMessage };