import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GalleryScreen } from './GalleryScreen.js';
import { CalendarScreen } from './CalendarScreen.js';
import { HomeScreen } from './HomeScreen.js';
import { ClubsScreen } from './ClubsScreen.js';
import { ChatScreen } from './ChatScreen.js';

const Tab = createBottomTabNavigator();

export const MainNavigatorScreen = (props) => {
  // note: do not need to have another <NavigationContainer />

  return(
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Clubs" component={ClubsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}
