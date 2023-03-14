import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import { Ionicons } from '@expo/vector-icons';
// https://icons.expo.fyi/ (only using icons under ionicons family)

import { GalleryScreen } from './GalleryScreen.js';
import { CalendarScreen } from './CalendarScreen.js';
import { HomeScreen } from './HomeScreen.js';
import { ClubsScreen } from './ClubsScreen.js';
import { ChatScreen } from './ChatScreen.js';

const Tab = createBottomTabNavigator();

export const MainNavigatorScreen = (props) => {
  // note: do not need to have another <NavigationContainer />

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Gallery" 
      options={{
        tabBarActiveTintColor: '#b042ff',
        tabBarInactiveTintColor: 'grey',
        tabBarLabel: 'Gallery',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="images" color={color} size={size} />
        ),
      }}
      component={GalleryScreen} />

      <Tab.Screen name="Calendar"
      options={{
        tabBarActiveTintColor: '#b042ff',
        tabBarInactiveTintColor: 'grey',
        tabBarLabel: 'Calendar',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" color={color} size={size} />
        ),
      }}
      component={CalendarScreen} />

      <Tab.Screen name="Home"
      options={{
        tabBarActiveTintColor: '#b042ff',
        tabBarInactiveTintColor: 'grey',
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        ),
      }}
      component={HomeScreen} />

      <Tab.Screen name="Clubs" 
      options={{
        tabBarActiveTintColor: '#b042ff',
        tabBarInactiveTintColor: 'grey',
        tabBarLabel: 'Clubs',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="basketball" color={color} size={size} />
        ),
      }}
      component={ClubsScreen} />

      <Tab.Screen name="Chat" size="50px"
      options={{
        tabBarActiveTintColor: '#b042ff',
        tabBarInactiveTintColor: 'grey',
        tabBarBadge: 3,
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbox-ellipses" color={color} size={size} />
        ),
      }}
      component={ChatScreen} />
    </Tab.Navigator>
  );
}
