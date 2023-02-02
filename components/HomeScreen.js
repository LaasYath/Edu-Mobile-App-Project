import { useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import { AuthContext } from '../Contexts.js';

export const HomeScreen = (props) => {
  const { setUser } = useContext(AuthContext);

  return(
    <View style={styles.layout}>
      <Text style={styles.texts}>
        Home
      </Text>
      <Button 
        title="Log Out"
        onPress={() => setUser(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texts: {
    fontSize: 32,
    marginBottom: 16,
  },
});
