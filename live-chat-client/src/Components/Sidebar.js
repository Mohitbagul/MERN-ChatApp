import React, { useState, useEffect, useContext } from "react";
import "./myStyles.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import { myContext } from "./MainContainer";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    console.log("User not Authenticated");
    navigate("/");
  }

  const user = userData.data;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        console.log("Fetching conversations...");
        const response = await axios.get("mern-chat-app-api-nine.vercel.app/chat/", config);
        console.log("fetched data:",response.data);
        
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [refresh, user.token]);

  return (
    <div className="sidebar-container">
      <div className={`sb-header${lightTheme ? "" : " dark"}`}>
        <div className="other-icons">
          <IconButton>
            <AccountCircleIcon className={`icon${lightTheme ? "" : " dark"}`} />
          </IconButton>
          <IconButton onClick={() => navigate("users")}>
            <PersonAddIcon className={`icon${lightTheme ? "" : " dark"}`} />
          </IconButton>
          <IconButton onClick={() => navigate("groups")}>
            <GroupAddIcon className={`icon${lightTheme ? "" : " dark"}`} />
          </IconButton>
          <IconButton onClick={() => navigate("create-groups")}>
            <AddCircleIcon className={`icon${lightTheme ? "" : " dark"}`} />
          </IconButton>
          <IconButton onClick={() => dispatch(toggleTheme())}>
            {lightTheme ? (
              <NightlightIcon className={`icon${lightTheme ? "" : " dark"}`} />
            ) : (
              <LightModeIcon className={`icon${lightTheme ? "" : " dark"}`} />
            )}
          </IconButton>
          <IconButton
            onClick={() => {
              localStorage.removeItem("userData");
              navigate("/");
            }}
          >
            <ExitToAppIcon className={`icon${lightTheme ? "" : " dark"}`} />
          </IconButton>
        </div>
      </div>

      <div className={`sb-conversations${lightTheme ? "" : " dark"}`}>
        {conversations.map((conversation, index) => {

          let chatName = "";
          let chatIcon = "";

          if (conversation.isGroupChat) {
            // ✅ Show group name for group chats
            chatName = conversation.chatName;
            chatIcon = chatName[0];
          } else {
            // ✅ Show the other participant's name in private chats
            const otherUser = conversation.users.find((u) => u._id !== user._id);
            if (otherUser) {
              chatName = otherUser.name;
              chatIcon = chatName[0];
            }
          }

          return (
            <div
              key={index}
              className="conversation-container"
              onClick={() => {
                navigate(`chat/${conversation._id}&${chatName}`);
                setRefresh(!refresh);
              }}
            >
              <p className={`con-icon`}>{chatIcon}</p>
              <p className={`con-title`}>{chatName}</p>
              <p className="con-lastMessage">
                {conversation.latestMessage ? conversation.latestMessage.content : "No previous messages, click here to start a new chat"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
