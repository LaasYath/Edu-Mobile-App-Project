import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useParseQuery } from '@parse/react-native';

import { useFocusEffect } from '@react-navigation/native';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://edumediaapp.b4a.io/';
// it wasn't working until I disabled this...
Parse.enableLocalDatastore();


export const ChatScreen = (props) => {
  // const to = props.to;
  // will allow "to" to be set when this
  // screen is navigated to from AnnouncementsScreen
  const route = props.route;
  const params = route.params;
  const to = params.to;
  const toName = params.toName;
  const fromName = params.fromName;
  const navigation = props.navigation;

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: "Chat with " + toName,
    })
  }, []);

  useFocusEffect(
    useCallback(() => {
      setMessages([]);

      (async() => {
        let toQuery1 = new Parse.Query(global.school + "Messages");
        toQuery1.equalTo('to', to);

        let fromQuery1 = new Parse.Query(global.school + "Messages");
        fromQuery1.equalTo('from', global.id);

        let composedQuery1 = new Parse.Query.and(toQuery1, fromQuery1);

        let toQuery2 = new Parse.Query(global.school + "Messages");
        toQuery2.equalTo('from', to);
        
        let fromQuery2 = new Parse.Query(global.school + "Messages");
        fromQuery2.equalTo('to', global.id);

        let composedQuery2 = new Parse.Query.and(toQuery2, fromQuery2);

        const fullConvo = new Parse.Query.or(composedQuery1, composedQuery2);

        fullConvo.descending('createdAt');

        const res = await fullConvo.find();
        // console.log(res);
        // setResults(res);
        setMessages(res);
      })();
    }, [to])
  );

  // console.log(messages);
  // console.log(messages?.length);

  const onSend = useCallback((messages = []) => {
  
    const Message = Parse.Object.extend(global.school + "Messages");
    let message = new Message();
    message.set('from', global.id);
    message.set('content', messages[0].text);
    message.set('to', to);

    message.save();

    setMessages(previousMessages => GiftedChat.append(previousMessages, message));
  }, [to])

  {/*<GiftedChat
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
  />*/}
  return (
    <View style={styles.layout}>
      <GiftedChat
        messages={messages && messages.map(liveMessage => {
          return ({
            _id: liveMessage.id,
            text: liveMessage.get('content'),
            createdAt: liveMessage.get('createdAt'),
            user: {
              _id: (liveMessage.get('to') === to) ? 1 : 2,
              name: (liveMessage.get('to') === to) ? fromName : toName,
            }
          });
        })}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
          name: fromName,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: '#f9f9f9',
    flex: 1,
  }
});
