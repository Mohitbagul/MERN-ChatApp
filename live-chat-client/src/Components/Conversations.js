import React, { useState } from 'react'
import ConversationItem from './ConversationItem'
import { useSelector } from 'react-redux'

const Conversations = () => {
    const lightTheme = useSelector((state)=>state.themeKey);

    const[conversations,setConverastions] = useState([
        {
            name:"Test#1",
            lastMessage : "Last Message #1",
            timeStamp:"today",
        },
        {
            name:"Test#2",
            lastMessage : "Last Message #2",
            timeStamp:"today",
        },
        {
            name:"Test#3",
            lastMessage : "Last Message #3",
            timeStamp:"today",
        },
    ]);


  return (
    <div className={'sb-conversations' + (lightTheme?"":" dark")}>
        {
            conversations.map((conversation)=>{

               return <ConversationItem props={conversation} key={conversation.name} />
            })
        }
      </div>
  )
}

export default Conversations
