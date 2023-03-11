import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, Divider, Text, TextInput, TouchableRipple } from 'react-native-paper';

export const ChatScreen = (props) => {
  const loading = <ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />;

  const [displayScreen, setDisplayScreen] = useState(<View>{loading}</View>)

  const setMessageOptions = async () => {
    const results = await getMessageOptions();
    const resetToGalleryMainSubScreen = () => setDisplayScreen(<ChatMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />)

    setDisplayScreen(<ChatMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />);
  }

  useEffect(() => {
    setMessageOptions();
  }, []);

  return(
    <View style={styles.layout}>
      {displayScreen}
    </View>
  );
}

const ChatMainSubScreen = props => {
  const data = props.data;
  const display = props.display;
  const goBack = props.goBack;

  const cards = data.map((step, move) => {
    return (<MessageOption
      name={step.name}
      onPress={() => display(<ChatMiniSubScreen
        name={step.name}
        goBack={goBack}
      />)}
      key={move}
    />)
  });


  return (
    <ScrollView>
      {cards}
    </ScrollView>
  );
}

/**
 * TODO: Implement async getMessageOptions()
 * 
 * ret format:
 * [
 * {
 *  name: str
 * }, ...
 * ]
 */
const getMessageOptions = async () => {
  const ret = [
    {
      name: 'Ana Ada',
    },
    {
      name: 'Billy Bob',
    },
  ];

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const MessageOption = props => {
  const name = props.name;
  const onPress = props.onPress;

  return (
  <View style={{backgroundColor: '#e8e8e8'}}>
    <TouchableRipple onPress={onPress}>
      <Text variant={'headlineMedium'} style={styles.optionTitle}>{name}</Text>
    </TouchableRipple>
    <Divider style={styles.divider} />
  </View>
  )
}

const ChatMiniSubScreen = props => {
  const name = props.name;
  const goBack = props.goBack;

  const [cards, setCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);
  const [messageInput, setMessageInput] = useState('');

  const setMessages = async () => {
    const data = await getMessages(name);
    
    const cardResults = data.map((step, move) => {
      const message = step.msg;
      const sentByUser = step.sentByUser;

      return (
        <MessageCard
          message={message}
          sentByUser={sentByUser} 
          key={move}
        />
      );
    });

    setCards(<View>{cardResults}</View>);
  }

  useEffect(() => {
    setMessages();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={goBack}/>
        <Appbar.Content title={name}/>
      </Appbar.Header>
      <ScrollView>
        {cards}
      </ScrollView>
      <TextInput
          multiline={true}
          placeholder={'Send a message...'}
          value={messageInput}
          onChangeText={text => setMessageInput(text)}
          right={<TextInput.Icon
            icon="arrow-right-drop-circle"
            onPress={() => {
              sendMessage(name, messageInput);
              setMessageInput('');
            }}
          />}
        />
    </View>
  );
}

const MessageCard = props => {
  const message = props.message;
  const sentByUser = props.sentByUser;

  const cardStyle = sentByUser ?
                      { ...styles.messageCard, marginRight: "55%" } : 
                      { ...styles.messageCard, marginLeft: "55%" };

  const textStyle = sentByUser ?
                      { ...styles.messageText, textAlign: 'left' } :
                      { ...styles.messageText, textAlign: 'right' };

  return (
    <View>
      <Card style={cardStyle}>
        <Card.Content>
          <Text style={textStyle} variant={'bodyMedium'}>{message}</Text>
        </Card.Content>
      </Card>
    </View>
  )
}

/**
 * TODO: implement async getMessages(name)
 *  name is str that represents who this user is talking with
 * 
 * ret:
 * [
 * {
 *  msg: str
 *  sentByUser: boolean
 * }, ...
 * ]
 * 
 * sentByUser should represent whether the user
 * currently logged into this app was the one 
 * who sent this message
 */
const getMessages = async (name) => {
  let ret = [
    {
      msg: 'Hello this is me!',
      sentByUser: true,
    },
    {
      msg: 'Hello "me", I am you! How are you doing?',
      sentByUser: false,
    },
    {
      msg: 'Good, thanks for asking!',
      sentByUser: true,
    },
    {
      msg: 'How are you?',
      sentByUser: true,
    },
  ];

  for (let i = 0; i < Math.round(Math.random() * 20); i++) {
    ret.push({
      msg: 'a'.repeat(Math.round(Math.random() * 100)),
      sentByUser: Math.random() < .5,
    });
  }

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

/**
 * TODO: implement sending message
 * 
 * sending message to person
 *  with name to
 *  with text msg 
 */
const sendMessage = (to, msg) => {
  console.log(`send msg to ${to}: ${msg}`);
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  optionTitle: {
    margin: 10,
    marginLeft: 20,
  },
  divider: {
    margin: 5,
  },
  messageCard: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    flex: 1,
  },
  messageText: {
    flex: 1,
  },
});
