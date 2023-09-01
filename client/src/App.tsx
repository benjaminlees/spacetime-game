import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import { SpacetimeDBClient, Identity } from "@clockworklabs/spacetimedb-sdk";

import Message from './module_bindings/message';
import User from './module_bindings/user';
import SendMessageReducer from './module_bindings/send_message_reducer';
import SetNameReducer from './module_bindings/set_name_reducer'
console.log(Message, User, SendMessageReducer, SetNameReducer);

export type MessageType = {
  name: string;
  message: string;
};

let token = localStorage.getItem('auth_token') || undefined;
const spacetimeDBClient = new SpacetimeDBClient("ws://localhost:4000", "game", token);

function App() {
  const [newName, setNewName] = useState("");
  const [settingName, setSettingName] = useState(false);
  const [name, setName] = useState("");
  const [systemMessage, setSystemMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  let local_identity = useRef<Identity | undefined>(undefined);
  let initialized = useRef<boolean>(false);
  const client = useRef<SpacetimeDBClient>(spacetimeDBClient);

  useEffect(() => {
    if (!initialized.current) {
      client.current.connect();
      initialized.current = true;
    }
  }, []);

  client.current.onConnect((token, identity) => {
    console.log("Connected to SpacetimeDB");

    local_identity.current = identity;

    localStorage.setItem('auth_token', token);

    client.current.subscribe([
      "SELECT * FROM User",
      "SELECT * FROM Message"
    ]);
  });

  function userNameOrIdentity(user: User): string {
    console.log(`Name: ${user.name} `);
    if (user.name !== null) {
      return user.name || "";
    }
    else {
      var identityStr = new Identity(user.identity.toUint8Array()).toHexString();
      console.log(`Name: ${identityStr} `);
      return (new Identity(user.identity.toUint8Array())).toHexString().substring(0, 8);
    }
  }

  function setAllMessagesInOrder() {
    let messages = Array.from(Message.all());
    messages.sort((a, b) => a.sent > b.sent ? 1 : a.sent < b.sent ? -1 : 0);

    let messagesType: MessageType[] = messages.map((message) => {
      let sender_identity = User.filterByIdentity(message.sender);
      let display_name = sender_identity ? userNameOrIdentity(sender_identity) : "unknown";

      return {
        name: display_name,
        message: message.text,
      };
    });

    setMessages(messagesType);
  }

  client.current.on("initialStateSync", () => {
    setAllMessagesInOrder();
    const user = local_identity?.current && User.filterByIdentity(local_identity.current);
    setName(userNameOrIdentity(user!));
  });

  Message.onInsert((message, reducerEvent) => {
    if (reducerEvent !== undefined) {
      setAllMessagesInOrder();
    }
  });

  // Helper function to append a line to the systemMessage state
   function appendToSystemMessage(line: String) {
    setSystemMessage(prevMessage => prevMessage + '\n' + line);
  };

  User.onInsert((user, reducerEvent) => {
    if (user.online) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
    }
  });

  User.onUpdate((oldUser, user, reducerEvent) => {
    if (oldUser.online === false && user.online === true) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has connected.`);
    }
    else if (oldUser.online === true && user.online === false) {
      appendToSystemMessage(`${userNameOrIdentity(user)} has disconnected.`);
    }

    if (user.name !== oldUser.name) {
      appendToSystemMessage(`User ${userNameOrIdentity(oldUser)} renamed to ${userNameOrIdentity(user)}.`);
    }
  });

  SetNameReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity.current && reducerEvent.callerIdentity.isEqual(local_identity.current)) {
      if (reducerEvent.status === 'failed') {
        appendToSystemMessage(`Error setting name: ${reducerEvent.message} `);
      }
      else if (reducerEvent.status === 'committed') {
        setName(reducerArgs[0])
      }
    }
  });

  SendMessageReducer.on((reducerEvent, reducerArgs) => {
    if (local_identity.current && reducerEvent.callerIdentity.isEqual(local_identity.current)) {
      if (reducerEvent.status === 'failed') {
        appendToSystemMessage(`Error sending message: ${reducerEvent.message} `);
      }
    }
  });

  const [newMessage, setNewMessage] = useState("");

  const onSubmitNewName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingName(false);
    SetNameReducer.call(newName);
    // Fill in app logic here
  };

  const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Fill in app logic here
    setNewMessage("");
    SendMessageReducer.call(newMessage);
  };

  return (
    <div className="App">
      <div className="profile">
        <h1>Profile</h1>
        {!settingName ? (
          <>
            <p>{name}</p>
            <button
              onClick={() => {
                setSettingName(true);
                setNewName(name);
              }}
            >
              Edit Name
            </button>
          </>
        ) : (
          <form onSubmit={onSubmitNewName}>
            <input
              type="text"
              style={{ marginBottom: "1rem" }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
      <div className="message">
        <h1>Messages</h1>
        {messages.length < 1 && <p>No messages</p>}
        <div>
          {messages.map((message, key) => (
            <div key={key}>
              <p>
                <b>{message.name}</b>
              </p>
              <p>{message.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="system" style={{ whiteSpace: 'pre-wrap' }}>
        <h1>System</h1>
        <div>
          <p>{systemMessage}</p>
        </div>
      </div>
      <div className="new-message">
        <form
          onSubmit={onMessageSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            margin: "0 auto",
          }}
        >
          <h3>New Message</h3>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;