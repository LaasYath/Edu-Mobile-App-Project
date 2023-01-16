import { useContext, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TextInput } from 'react-native-paper';

//hash funcs
import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";

import { AuthContext } from '../Contexts.js';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';


(async () => {
  global.id = "";
})

export const LoginScreen = (props) => {
  const { setUser } = useContext(AuthContext);
  const [districtText, setDistrictText] = useState("");
  const [IDText, setIDText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  return(
    <View style={styles.layout}>
      <Text style={styles.texts}>
        Login
      </Text>
      <TextInput style={styles.textInput}
        label="District"
        value={districtText}
        onChangeText={text => setDistrictText(text)}
      />
      <TextInput style={styles.textInput}
        label="ID"
        value={IDText}
        onChangeText={text => setIDText(text)}
      />
      <TextInput style={styles.textInput}
        label="Password"
        value={passwordText}
        onChangeText={text => setPasswordText(text)}
        secureTextEntry={true}
      />
      <View style={styles.button}>
        <Button
          title="Go!"
          onPress={() => {
            async function Authenticate() {
              const Student = Parse.Object.extend('Student');
              const query = new Parse.Query(Student);
              const results = await query.find();

              try {
                for (const object of results) {
                  // Access the Parse Object attributes using the .GET method
                  const id = object.get('stuID');
                  if (id == IDText) {
                    const passwordHash = object.get('passwordHash')
                    JSHash(passwordText, CONSTANTS.HashAlgorithms.sha256)
                      .then(hash => {if (passwordHash == hash) {
                                      global.id = object.id;
                                      setUser(true);
                      }})
                      .catch(e => console.log(e));
                  }
                }
              } catch (error) {
                console.error('Error while fetching Student', error);
              }
            }

            Authenticate();
            
            
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
  },
  texts: {
    alignSelf: 'center',
    fontSize: 32,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  }
});