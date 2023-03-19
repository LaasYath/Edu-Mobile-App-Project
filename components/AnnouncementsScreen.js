import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { List, Divider, Button } from 'react-native-paper';
import { useParseQuery } from '@parse/react-native';
import { useNavigation } from '@react-navigation/native';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://edumediaapp.b4a.io/';
Parse.enableLocalDatastore();

(async () => {
  global.toUser = "";
})

export const AnnouncementsScreen = props => {
  const navigation = props.navigation;

  let parseQuery = new Parse.Query(global.school);
  if (global.role == 'student' || global.role == 'parent') {
    parseQuery.equalTo('role', 'educator');
  } else if (global.role == 'educator') {
    parseQuery.notEqualTo('role', 'educator');
  }

  const {
    isLive,
    isLoading,
    isSyncing,
    results,
    count,
    error,
    reload
  } = useParseQuery(parseQuery);

  // console.log(item.id);

  return (
  <View style={styles.container}>
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({item}) => {
        const name = item.get('name');

        return (<Button
          onPress={() => {
            // will be passed to:
            // props.route.params.to
            navigation.navigate('Chat', {to: item.id}); 
            console.log(`going to chat with ${item.id}`)
          }}
          mode='text'
          contentStyle={styles.listItem}
          labelStyle={styles.listTitle}
          textColor='black'
        >
          {name}
        </Button>
        )
      }}
    />
  </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  listItem: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  listTitle: {
    color: 'black',
    textAlign: 'left',
    flex: 1,
  },
})