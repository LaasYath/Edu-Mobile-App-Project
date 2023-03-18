import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { List, Divider } from 'react-native-paper';
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

export const ListChats = () => {
    const navigation = useNavigation();

    const parseQuery = new Parse.Query(global.school);
    parseQuery.descending('createdAt');

    const {
        isLive,
        isLoading,
        isSyncing,
        results,
        count,
        error,
        reload
    } = useParseQuery(parseQuery);

    console.log(item.id);

    return (
        <View style={styles.container}>
            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <Divider />}
                renderItem={({item}) => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Chat')}>
                    <List.Item
                        title={item.get('name')}
                        description={"Chat with " + item.get('name')}
                        titleNumberOfLines={1}
                        titleStyle={styles.listTitle}
                        descriptionStyle={styles.listDescription}
                        descriptionNumberOfLines={1}
                    />
                </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f5f5f5",
        flex: 1,
    },
    listTitle: {
        fontSize: 22,
    },
    listDescription: {
        fontSize: 16,
    }
})