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
import { ReportAbsenceScreen } from './home_screen/ReportAbsenceScreen.js';

// react navigation has lot more capability than 
// previously thought, could go back
// to refactor previous code
const Stack = createStackNavigator();

export const HomeScreen = (props) => {
  console.log(global.role);

  return(
    <Stack.Navigator>
      <Stack.Screen 
        name="SubHome" 
        component={HomeMainSubScreen} 
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
      <Stack.Screen 
        name="Report Absence" 
        component={ReportAbsenceScreen} 
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
    if (global.role === 'admin')
      return;

    const data = await getClasses();
    let count = 0;
    const cardResults = data.map((step, move) => {
      count += 1;
      if (global.role === 'parent' || global.role === 'student') {
        return (
          <ClassCard 
            className={step.className}
            teacher={step.teacher}
            key={move}
            period={count}
          />
        );
      } else if (global.role === 'educator') {
        return (
          <ClassCard 
            className={step.className}
            key={move}
            period={count}
          />
        );
      }
    });

    setCards(<View>{cardResults}</View>);
  }

  useEffect(() => {
    getClassCards();
  }, []);

  return (
    <ScrollView>
      <Options navigation={navigation}/>
      {(global.role !== 'admin') ?
      <View>
        <Text variant={'headlineLarge'} style={{ marginLeft: 20 }}>Class Schedule</Text>
        <Divider style={{ margin: 5 }}/>
        {cards}
      </View> :
      <Text style={styles.welcome}> Welcome Admin! </Text>
      }
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
          icon={'earth'}
          onPress={() => navigation.navigate('About')}
          caption={'About'}
        />
        <Option 
          icon={'cog'}
          onPress={() => navigation.navigate('Settings')}
          caption={'Settings'}
        />
      </View>
      <View style={styles.optionsRow}>
        <Option
          icon={'calendar-remove'}
          onPress={() => navigation.navigate('Report Absence')}
          caption={(global.role === 'admin') ? 'View Absences' : 'Report Absence'}
        />
        <Option 
          icon={'cellphone'}
          onPress={() => setUser(false)}
          caption={'Logout'}
        />
        <Option 
          icon={'bug'}
          onPress={() => navigation.navigate('Report Bug')}
          caption={'Report Bug'}
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

  if (global.role !== 'educator') {
    return (
      <Card style={styles.classCard}>
        <Card.Title title={period + ". " + className}/>
        <Card.Content>
          <Text variant={'bodyMedium'}>  Teacher: {teacher}</Text>
        </Card.Content>
      </Card>
    );
  } else if (global.role === 'educator') {
    return (
      <Card style={styles.classCard}>
        <Card.Title title={period + ". " + className}/>
      </Card>
    );
  }
}

/*
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
  let ret;
  let classes;
  let teachers;
  if (global.role != 'educator') {
    if (global.role == 'student') {
      const userQuery = new Parse.Query(global.school);
      const userObj = await userQuery.get(global.id);
      classes = userObj.get('classes');
      teachers = userObj.get('teachers');
    } else if (global.role == 'parent') {
      const userQuery = new Parse.Query(global.school);
      const userObj = await userQuery.get(global.id);
      let userKidId = userObj.get('child1');
      
      const userQuery2 = new Parse.Query(global.school);
      userQuery2.equalTo('uID', Number(userKidId));
      const results = await userQuery2.find();
      for (const userKid of results) {
        console.log(userKid.get('classes'));
        classes = userKid.get('classes');
        teachers = userKid.get('teachers');
      }
    }
    ret = [
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
  } else if (global.role == 'educator') {
    const userQuery = new Parse.Query(global.school);
    const userObj = await userQuery.get(global.id);
    classes = userObj.get('classes');
    ret = [
      {
        className: classes[0],
      },
      {
        className: classes[1],
      },
      {
        className: classes[2],
      },
      {
        className: classes[3],
      },
      {
        className: classes[4],
      },
      {
        className: classes[5],
      },
      {
        className: classes[6],
      },
      {
        className: classes[7],
      },
    ];
  }

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const styles = StyleSheet.create({
  layout: {
    alignItems: 'center',
  },
  welcome: {
    alignSelf: 'center',
    marginTop: "33%",
    fontSize: 30   
  },
  optionsRow: {
    flexDirection: 'row',
    height: 100,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: 100,
    height: 100,
  },
  classCard: {
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
  },
});