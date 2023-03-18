import { useState, useEffect } from 'react';

import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

export const ProfileScreen = props => {
  const [infoComponent, setInfoComponent] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const setProfileDisplay = async () => {
    const data = await getProfileData();

    setInfoComponent(<ProfileDisplay data={data}/>);
  }

  useEffect(() => {
    setProfileDisplay();
  }, []);

  return (
    <View>
      {/* <Text variant={'displayLarge'}>Profile</Text> */}
      {infoComponent}
    </View>
  )
}

const ProfileDisplay = props => {
  const data = props.data;
  const name = data.name;
  const id = data.id;
  const role = data.role;
  const school = data.school;
  // const relatedPeople = data.relatedPeople;

  // const relatedPeopleArr = relatedPeople.map((step, move) => {
  //   return (
  //     <Text key={move}>{step.name}: {step.relationship}</Text>
  //   );
  // });

  return (
    <Surface style={styles.surface} elevation={3}>
      <Text variant={'bodyLarge'} style={styles.text}>Name: {name}</Text>
      <Text variant={'bodyLarge'} style={styles.text}>Id: {id}</Text>
      <Text variant={'bodyLarge'} style={styles.text}>Role: {role}</Text>
      <Text variant={'bodyLarge'} style={styles.text}>School: {school}</Text>
      {/* <View>
        {relatedPeopleArr}
      </View> */}
    </Surface>
  );
}

/* TO-DO: include parent information in profile */
const getProfileData = async () => {
  let ret
  const userQuery = new Parse.Query(global.school);
  const userObj = await userQuery.get(global.id);
  ret = {
    name: userObj.get('name'),
    id: userObj.get('uID'),
    role: userObj.get('role'),
    school: global.school,
  }

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const styles = StyleSheet.create({
  surface: {
    padding: 25,
    margin: 25,
  },
  text: {
    
  }
});