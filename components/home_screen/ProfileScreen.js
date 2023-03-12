import { useState, useEffect } from 'react';

import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

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
      <Text variant={'displayLarge'}>Profile</Text>
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
  const relatedPeople = data.relatedPeople;

  const relatedPeopleArr = relatedPeople.map((step, move) => {
    return (
      <Text key={move}>{step.name}: {step.relationship}</Text>
    );
  });

  return (
    <View>
      <Text>Name: {name}</Text>
      <Text>Id: {id}</Text>
      <Text>Role: {role}</Text>
      <Text>School: {school}</Text>
      <View>
        {relatedPeopleArr}
      </View>
    </View>
  );
}

/**
 * TODO: Implement async getProfileData()
 * 
 * ret:
 * {
 *  name: str,
 *  id: str,
 *  role: str,
 *  school: str,
 *  relatedPeople: 
 *    {
 *      name: str,
 *      relationship: str,
 *    }
 * }
 */
const getProfileData = async () => {
  let ret ={
    name: "Acer Dan",
    id: "1123456",
    role: "Student",
    school: "Austin High School",
    relatedPeople: [
      {
        name: "Amy Dan",
        relationship: "Guardian",
      },
      {
        name: "Daniel Dan",
        relationship: "Guardian",
      },
    ],
  }

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const styles = StyleSheet.create({

});