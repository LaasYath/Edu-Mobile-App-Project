import { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { useParseQuery } from '@parse/react-native';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://edumediaapp.b4a.io/';
Parse.enableLocalDatastore();


export const ChatScreen = (props) => {
  // const to = props.to;
  // will allow "to" to be set when this
  // screen is navigated to from AnnouncementsScreen
  const route = props.route;
  const params = route.params;
  const to = params.to;

  // TODO: Implement getting specific messages with 
  // user "to"
  let parseQuery = new Parse.Query(global.school + "Messages");
  parseQuery.descending('createdAt');

  let currentUser;
  const [messages, setMessages] = useState([]);

  const {
    isLive,
    isLoading,
    isSyncing,
    results,
    count,
    error,
    reload
  } = useParseQuery(parseQuery);

  useEffect(() => {
    async function getCurrentUser() {
      currentUser = global.id;
    }

    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
    getCurrentUser;
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
  
    const Message = Parse.Object.extend(global.school + "Messages");
    let message = new Message();
    message.set('from', global.id);
    message.set('content', messages[0].text);
    message.set('to', to);

    message.save();
  }, [])

  return (
    <GiftedChat
      messages={results && results.map(liveMessage => ({
        _id: liveMessage.id,
        text: liveMessage.get('content'),
        createAt: liveMessage.get('createdAt'),
        user: {
          _id: 2,
          name: 'React Native',
        }
      }))}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}
