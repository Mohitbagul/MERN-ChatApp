import React, { useContext, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { myContext } from "./MainContainer";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8080"; 
let socket;

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const { _id } = useParams();
  const [chat_id] = _id.split("&"); // ✅ Extract only chat_id
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const { refresh, setRefresh } = useContext(myContext);
  const [messageContent, setMessageContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // ✅ Connect to Socket.io
  useEffect(() => {
    socket = io(ENDPOINT, { transports: ["websocket"] }); 
    socket.emit("setup", userData);

    socket.on("connected", () => {
      console.log("Socket Connected");
      setSocketConnected(true);
    });

    return () => {
      socket.disconnect(); // ✅ Cleanup to prevent memory leaks
    };
  }, []);

  // ✅ Listen for new messages
  useEffect(() => {
    if (!socket) return;  

    socket.on("message received", (newMessage) => {
      console.log("New message received:", newMessage);
      setAllMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("message received");
    };
  }, [socket]);

  // ✅ Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userData.data.token}` },
        };

        const { data } = await axios.get(`${ENDPOINT}/message/${chat_id}`, config);
        
        setAllMessages(data.messages); 
        setChatDetails(data.chatDetails);
        setLoaded(true);
        socket.emit("join chat", chat_id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [refresh, chat_id, userData.data.token]);

  // ✅ Send Message
  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userData.data.token}` },
      };

      const { data } = await axios.post(
        `${ENDPOINT}/message/`,
        { content: messageContent, chatId: chat_id },
        config
      );

      setAllMessages((prev) => [...prev, data]);
      setMessageContent("");
      socket.emit("new message", data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  let chatName = chatDetails?.isGroupChat
    ? chatDetails.chatName
    : chatDetails?.users.find((u) => u._id !== userData.data._id)?.name || "Unknown";

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`chatArea-container ${lightTheme ? "" : "dark"}`}>
      <div className={`chatArea-header ${lightTheme ? "" : "dark"}`}>
        <p className={`con-icon ${lightTheme ? "" : "dark"}`}>{chatName?.[0]}</p>
        <div className={`header-text ${lightTheme ? "" : "dark"}`}>
          <p className={`con-title ${lightTheme ? "" : "dark"}`}>{chatName}</p>
        </div>
        <IconButton className={`icon ${lightTheme ? "" : "dark"}`}>
          <DeleteIcon />
        </IconButton>
      </div>

      <div className={`messages-container ${lightTheme ? "" : "dark"}`}>
        {allMessages.map((message, index) => {
          return message.sender?._id === userData.data._id ? (
            <MessageSelf key={index} props={message} />
          ) : (
            <MessageOthers key={index} props={message} />
          );
        })}
      </div>

      <div className={`text-input-area  `}>
        <input
          placeholder="Type a Message"
          className={`search-box`}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <IconButton className={`icon`} onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default ChatArea;
