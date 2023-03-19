import { useState, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

import { useFocusEffect } from '@react-navigation/native';

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
  const toName = params.toName;
  const fromName = params.fromName;
  const navigation = props.navigation;

  const [messages, setMessages] = useState([]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: "Chat with " + toName,
      })
    }, [toName])
  );

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
        setMessages(res);
      })();
    }, [to])
  );

  const onSend = useCallback((messages = []) => {
  
    const Message = Parse.Object.extend(global.school + "Messages");
    let message = new Message();
    message.set('from', global.id);
    message.set('content', messages[0].text);
    message.set('to', to);

    message.save();

    setMessages(previousMessages => GiftedChat.append(previousMessages, message));
  }, [to])
  
  return (
    <View style={styles.layout}>
      {(messages?.length) ? <GiftedChat
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
        /> : 
        <ActivityIndicator 
          animating={true} 
          style={{ marginTop: 10, marginBottom: 10 }}
        />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: '#f9f9f9',
    flex: 1,
  }
});
