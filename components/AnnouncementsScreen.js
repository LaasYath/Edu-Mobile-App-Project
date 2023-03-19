import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Divider, Button } from 'react-native-paper';
import { useParseQuery } from '@parse/react-native';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://edumediaapp.b4a.io/';
Parse.enableLocalDatastore();

export const AnnouncementsScreen = props => {
  const navigation = props.navigation;
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [parseQuery, setParseQuery] = useState(new Parse.Query(global.school));
  const [results, setResults] = useState([]);

  const resetParseQuery = () => {
    let newQuery = new Parse.Query(global.school);
    if (global.role == 'student' || global.role == 'parent') {
      newQuery.equalTo('role', 'educator');
    } else if (global.role == 'educator') {
      newQuery.notEqualTo('role', 'educator');
    }

    setParseQuery(newQuery);
  }

  useEffect(() => {
    resetParseQuery();
  }, []);

  const onChangeSearch = async query => {
    setSearch(query);

    if (!query)
      resetParseQuery();
    console.log(query);
  }

  const conductSearch = async () => {
    //TODO an only set text value in 'onChangeSearch, need a sumbit button
    if (search) {
      let searchQuery = new Parse.Query(global.school);
      searchQuery.startsWith('name', search.toString());
      setParseQuery(Parse.Query.and(searchQuery, parseQuery));
    } else {
      resetParseQuery();
    }
  }

  /*
  const {
    isLive,
    isLoading,
    isSyncing,
    results,
    count,
    error,
    reload
  } = useParseQuery(parseQuery);
  */

  useEffect(() => {
    (async() => {
      const result = await parseQuery.find();
      // console.log(result);
      setResults(result);
    })();
  }, [parseQuery]);

  // console.log(item.id);
  useEffect(() => {
    (async () => {
      const userQuery = new Parse.Query(global.school);
      const userObj = await userQuery.get(global.id);

      setUserName(userObj.get("name"));
    })();
  }, []);

  return (
  <View style={styles.container}>
    <Searchbar
      placeholder='Search People'
      onChangeText={onChangeSearch}
      value={search}
      onIconPress={conductSearch}
    />
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({item}) => {
        const name = item.get('name');

        global.to = name;

        return (<Button
          onPress={() => {
            // will be passed to:
            // props.route.params.to
            navigation.navigate('Chat', {
              to: item.id,
              toName: name,
              fromName: userName,
            }); 
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