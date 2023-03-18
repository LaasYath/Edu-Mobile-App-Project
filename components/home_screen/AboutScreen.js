import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export const AboutScreen = props => {
  return (
    <View style={styles.layout}>
      <Text style={styles.text} variant={'bodyLarge'}> EduMedia is an app that connects parents, students, and teachers. Browse clubs offered at your school,
        view announcements from teachers, and view club and school events on the calendar screen. We hope
        you'll find everything you need!
      </Text>
      <Text style={styles.text} variant={'bodyMedium'}> Made By: Marcus A. and Laasya Y.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  text: {
    
  },
});