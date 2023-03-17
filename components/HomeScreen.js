import { useContext, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';

import { createStackNavigator } from '@react-navigation/stack';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

import { AuthContext } from '../Contexts.js';
import { AboutScreen } from './home_screen/AboutScreen.js'
import { ProfileScreen } from './home_screen/ProfileScreen.js'
import { SettingsScreen } from './home_screen/SettingsScreen.js'
import { ReportBugScreen } from './home_screen/ReportBugScreen.js'

// react navigation has lot more capability than 
// previously thought, could go back
// to refactor previous code
const Stack = createStackNavigator();

export const HomeScreen = (props) => {
  const navigation = props.navigation;
  // console.log(navigation === null);

  return(
    <Stack.Navigator>
      <Stack.Screen 
        name="SubHome" 
        component={HomeMainSubScreen} 
        initialParams={{ mainNavigation: navigation }}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
      <Stack.Screen 
        name="Report Bug" 
        component={ReportBugScreen} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
      />
    </Stack.Navigator>
  );
}

const HomeMainSubScreen = props => {
  const navigation = props.navigation;

  // console.log("Checking");
  // console.log(navigation === null);

  const [cards, setCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const getClassCards = async () => {
    const data = await getClasses();
    let count = 0;
    const cardResults = data.map((step, move) => {
      count += 1;
      return (
        <ClassCard 
          className={step.className}
          teacher={step.teacher}
          key={move}
          period={count}
        />
      );
    });

    setCards(<View>{cardResults}</View>);
  }

  useEffect(() => {
    getClassCards();
  }, []);

  return (
    <ScrollView>
      <Options navigation={navigation}/>
      <Text variant={'headlineLarge'} style={{ marginLeft: 20 }}>Class Schedule</Text>
      <Divider style={{ margin: 5 }}/>
      {cards}
    </ScrollView>
  );
}

const Options = props => {
  const { setUser } = useContext(AuthContext);
  const navigation = props.navigation;

  // console.log(`Checking within options: ${navigation === null}`)
  //keep chat or change to report absence??
  return (
    <View style={styles.layout}>
      <View style={[{ marginTop: 20 }, styles.optionsRow]}>
        <Option 
          icon={'account'}
          onPress={() => navigation.navigate("Profile")}
          caption={'Profile'}
        />
        <Option 
          icon={'bug'}
          onPress={() => navigation.navigate('Report Bug')}
          caption={'Report Bug'}
        /> 
        <Option
          icon={'message'}
          onPress={() => navigation.navigate('Chat')}
          caption={'Chat'}
        />
      </View>
      <View style={styles.optionsRow}>
        <Option 
          icon={'cog'}
          onPress={() => navigation.navigate('Settings')}
          caption={'Settings'}
        />
        <Option 
          icon={'cellphone'}
          onPress={() => setUser(false)}
          caption={'Logout'}
        />
        <Option 
          icon={'earth'}
          onPress={() => navigation.navigate('About')}
          caption={'About'}
        />
      </View>
    </View>
  );
}

const Option = props => {
  const icon = props.icon;
  const onPress = props.onPress;
  const caption = props.caption;

  return (
    <TouchableRipple 
      onPress={onPress}
    >
      <View style={styles.option}>
        <IconButton
          icon={icon}
        />
        <Text style={styles.optionText}>
          {caption}
        </Text>
      </View>
    </TouchableRipple>
  )
}

const ClassCard = props => {
  const className = props.className;
  const teacher = props.teacher;
  const period = props.period

  return (
    <Card style={styles.classCard}>
      <Card.Title title={period + ". " + className}/>
      <Card.Content>
        <Text variant={'bodyMedium'}>  Teacher: {teacher}</Text>
      </Card.Content>
    </Card>
  );
}

/**
 * TODO: Implement async getClasses()
 * 
 * return: 
 * [
 * {
 *  className: str,
 *  teacher: str,
 * }
 * ]
 * 
 * note: be sure this is in the correct order
 */
const getClasses = async () => {
  const userQuery = new Parse.Query(global.school);
  const userObj = await userQuery.get(global.id);
  const classes = userObj.get('classes');
  const teachers = userObj.get('teachers');
  let ret = [
    {
      className: classes[0],
      teacher: teachers[0],
    },
    {
      className: classes[1],
      teacher: teachers[1],
    },
    {
      className: classes[2],
      teacher: teachers[2],
    },
    {
      className: classes[3],
      teacher: teachers[3],
    },
    {
      className: classes[4],
      teacher: teachers[4],
    },
    {
      className: classes[5],
      teacher: teachers[5],
    },
    {
      className: classes[6],
      teacher: teachers[6],
    },
    {
      className: classes[7],
      teacher: teachers[7],
    },
  ];

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const styles = StyleSheet.create({
  layout: {
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    height: 100,
  },
  option: {
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  classCard: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
  },
});