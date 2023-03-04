import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, Provider, Button, Modal, Portal } from 'react-native-paper';

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
  global.school = "";
})

export const LoginScreen = (props) => {
  const { setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolText, setSchoolText] = useState("");
  const [IDText, setIDText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  return(
    <Provider>
      <View style={styles.layout}>
        <Text style={styles.title}>
          Login
        </Text>
        <TextInput style={styles.textInput}
          label="School"
          value={schoolText}
          onChangeText={text => setSchoolText(sanitize(text))}
        />
        <TextInput style={styles.textInput}
          label="ID"
          value={IDText}
          onChangeText={text => setIDText(sanitize(text))}
        />
        <TextInput style={styles.textInput}
          label="Password"
          value={passwordText}
          onChangeText={text => setPasswordText(sanitize(text))}
          secureTextEntry={true}
        />
        <View style={styles.button}>
          <Button
            loading={isLoading}
            mode={'contained'}
            onPress={() => {
              async function Authenticate() {
                if (schoolText == "" || passwordText == "" || IDText == "") {
                  alert("Please fill in all fields to login.");
                } else {
                  let schoolClassName = schoolText.replace(/\s/g, "");
                  const User = Parse.Object.extend(schoolClassName);
                  const query = new Parse.Query(User);
                  const results = await query.find();

                  try {
                    for (const object of results) {
                      // Access the Parse Object attributes using the .GET method
                      const id = object.get('uID');
                      if (id == IDText) {
                        const passwordHash = object.get('passwordHash')
                        JSHash(passwordText, CONSTANTS.HashAlgorithms.sha256)
                          .then(hash => {if (passwordHash == hash) {
                                          global.id = object.id;
                                          global.school = schoolClassName;
                                          setUser(true);
                                          setIsLoading(false);
                          }})
                          .catch(e => {
                            console.log(e);
                            setIsLoading(false);
                          });
                      }
                    }
                  } catch (error) {
                    setIsLoading(false);
                    console.error('Error while fetching Student', error);
                  }

                  setIsLoading(false);
                }

              }
              setIsLoading(false);
              Authenticate();
              
            }}
          >GO!</Button>
        </View>
        <NewAccountComponent />
      </View>
    </Provider>
  );
}

const NewAccountComponent = props => {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <View>
      <Portal>
        <NewAccountModal visible={visible} onDismiss={hideModal} />
      </Portal>
      <Button 
        mode={'text'} 
        onPress={showModal} 
        style={[styles.button, styles.newAccountButton]} 
        contentStyle={styles.newAccountButtonContent}
      >
        <Text>
          Don't have an account?
        </Text>
      </Button>
    </View>
  );
}

const NewAccountModal = props => {
  const visible = props.visible;
  const hideModal = props.onDismiss;

  const [isLoading, setIsLoading] = useState(false);
  const [schoolText, setSchoolText] = useState("");
  const [IDText, setIDText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [errorText, setErrorText] = useState("");

  // TODO: Implement createNewAccount function
  const createNewAccount = async () => {
    const resetButton = () => {
      setIsLoading(false);
    }

    console.log('check 1');
    setIsLoading(true);
    // START IMPLEMENTATION HERE
    await new Promise(res => setTimeout(res, 2000));

    // error cases
    // if adding more, follow similar pattern as these
    if (!schoolText) {
      console.log('school error');
      setErrorText('Please enter the school you go to.');
      resetButton();
      return;
    }

    if (!IDText) {
      console.log('id error');
      setErrorText('Please enter your school-given ID.');
      resetButton();
      return;
    }

    if (!passwordText) {
      console.log('password error');
      setErrorText('Please enter a password.');
      resetButton();
      return;
    }

    console.log(`New account has been created:\n` +
                `  School: "${schoolText}"\n` +
                `  ID: "${IDText}"\n` +
                `  Password: "${passwordText}"`);
    
    // Leave these as they are
    setErrorText('');
    hideModal();
    resetButton();
    return;
  }

  // reset error text every time
  // the modal is opened/closed
  useEffect(() => {
    setErrorText("");
  }, [visible])

  return (
    <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalStyle}>
      <Text style={styles.title}>
        New Account
      </Text>
      <TextInput style={styles.textInput}
        label="School"
        value={schoolText}
        onChangeText={text => setSchoolText(sanitize(text))}
      />
      <TextInput style={styles.textInput}
        label="School-Given ID"
        value={IDText}
        onChangeText={text => setIDText(sanitize(text))}
      />
      <TextInput style={styles.textInput}
        label="Create Password"
        value={passwordText}
        onChangeText={text => setPasswordText(sanitize(text))}
        secureTextEntry={false}
      />
      <View>
        <Text style={{ color: 'red' }}>
          {errorText}
        </Text>
      </View>
      <View style={styles.button}>
        <NewAccountButton 
          onPress={() => { createNewAccount(); }} 
          loading={isLoading}
        />
      </View>
    </Modal>
  );
}

const NewAccountButton = props => (
  <Button
    loading={props.loading}
    mode={'contained'}
    onPress={props.onPress}
  >
    Create New Account
  </Button>
);

//cleans data (automatically deltes special characters while the user is typing)
function sanitize(string) {
  const map = {
      '&': '',
      '<': '',
      '>': '',
      '"': '',
      "'": '',
      "/": '',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
  },
  modalStyle: {
    backgroundColor: 'white',
    padding: 30,
    margin: 30,
  },
  title: {
    alignSelf: 'center',
    fontSize: 32,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    marginTop: 10,
  },
  newAccountButton: {
    marginTop: 40,
  },
  newAccountButtonContent: {
    width: 200,
  },
  errorText: {
    backgroundColor: 'red',
    padding: 10,
  }
});