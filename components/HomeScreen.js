import { useContext, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Divider, IconButton, Text, TouchableRipple } from 'react-native-paper';

import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../Contexts.js';
import { AboutScreen } from './home_screen/AboutScreen.js'
import { ProfileScreen } from './home_screen/ProfileScreen.js'
import { SettingsScreen } from './home_screen/SettingsScreen.js'

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
    const cardResults = data.map((step, move) => {
      return (
        <ClassCard 
          className={step.className}
          teacher={step.teacher}
          key={move}
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
  return (
    <View style={styles.layout}>
      <View style={[{ marginTop: 20 }, styles.optionsRow]}>
        <Option 
          icon={'account'}
          onPress={() => navigation.navigate("Profile")}
          caption={'Profile'}
        />
        <Option 
          icon={'calendar'}
          onPress={() => navigation.navigate('Calendar')}
          caption={'Calendar'}
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

  return (
    <Card style={styles.classCard}>
      <Card.Title title={className}/>
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
  let ret = [
    {
      className: "English",
      teacher: "Ms. A"
    },
    {
      className: "Science",
      teacher: "Mr. B",
    },
    {
      className: "Math",
      teacher: "Mr. C",
    },
    {
      className: "Computer Science",
      teacher: "Mrs. D",
    },
    {
      className: "History",
      teacher: "Mr. E",
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
