import { StyleSheet, View, Title } from 'react-native';
import { Calendar } from 'react-native-calendars';

// https://www.educba.com/react-native-calendar/
// https://www.reactnativeschool.com/how-to-use-react-native-calendar

export const CalendarScreen = (props) => {
  return(
    <View>
      <Calendar></Calendar>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
