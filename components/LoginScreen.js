import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, } from 'react-native';
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
  global.uID = "";
  global.school = "";
  global.clubsList = [];
})

export const LoginScreen = (props) => {
  const { setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolText, setSchoolText] = useState("");
  const [IDText, setIDText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  return(
    <Provider>
      <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? "padding" : null}>
        <ScrollView style={styles.subLayout}>
          <View style={styles.header}>
            <Image
              style={styles.tinyLogo}
              source={require('../assets/eduMediaLogo.jpg')}
            />
            <Text style={styles.appName}>
              EduMedia
            </Text>
          </View>
          <View>
            {/* <Text style={styles.title}>
              Login
            </Text> */}
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
                onPress={async() => {
                  setIsLoading(true);
                  
                  const userClass = new Parse.User();
                  const queryUser = new Parse.Query(userClass);
                  async function Authenticate() {
                    if (schoolText == "" || passwordText == "" || IDText == "") {
                      alert("Please fill in all fields to login.");
                      return;
                    } 

                    let schoolClassName = schoolText.replace(/\s/g, "");
                    const User = Parse.Object.extend(schoolClassName);
                    const query = new Parse.Query(User);
                    const results = await query.find();

                    try {
                      for (const object of results) {
                        // Access the Parse Object attributes using the .GET method
                        const id = object.get('uID');
                        // console.log(id);
                        // console.log(String(id) === IDText);
                        if (String(id) === IDText) {
                          const passwordHash = object.get('passwordHash')
                          JSHash(passwordText, CONSTANTS.HashAlgorithms.sha256)
                            .then(async(hash) => {
                              if (passwordHash === hash) {
                                let user = await queryUser.get(object.get("objID"));
                                
                                if (!user.get("emailVerified")) {
                                  alert("Your account hash not been verified. Please verify your email before proceeding");
                                  console.log("Your account hash not been verified. Please verify your email before proceeding")
                                  setUser(false);

                                } else if (user.get('emailVerified')) {
                                  global.id = object.id;
                                  global.uID = object.get('uID');
                                  global.school = schoolClassName;
                                  setUser(true);
                                }
                              } else {
                                alert("Incorrect password.");
                              }
                            }).catch(e => {
                              console.log(e);
                              alert("Something went wrong. If the problem persists, contact an administrator.")
                            });
                        } 
                      }
                    } catch (error) {
                      console.error('Error while fetching Student', error);
                    }
                  }

                  await Authenticate();
                  setIsLoading(false);
                }}
              > LOGIN </Button>
            </View>
            <NewAccountComponent />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  const [nameText, setNameText] = useState("");
  const [IDText, setIDText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [confirmPwdText, setConfirmPwdText] = useState("");
  const [errorText, setErrorText] = useState("");

  const createNewAccount = async () => {
    const resetButton = () => {
      setIsLoading(false);
    }

    setIsLoading(true);
    // START IMPLEMENTATION HERE
    await new Promise(res => setTimeout(res, 2000));

    // error cases
    // if adding more, follow similar pattern as these
    if (!schoolText || !nameText || !IDText || !passwordText || !confirmPwdText || !emailText) {
      console.log('empty field error');
      setErrorText('Please fill in all fields');
      resetButton();
      return;
    }

    //TO-DO:  pointer to existing child 
    (async () => {
      //check if passwords match first
      JSHash(passwordText, CONSTANTS.HashAlgorithms.sha256)
        .then(hash1 => {
          JSHash(confirmPwdText, CONSTANTS.HashAlgorithms.sha256)
            .then(hash2 => {
              if (hash1==hash2) {
                makeNewUser(hash1);
              }
            })
            .catch(e => alert("Please make sure both password enteries match"));
          }
        )
        .catch(e => console.log(e));

      //user class used to utilize built in sign up function (has email verification and password reset)
      const makeNewUser = async(hash) => {
        const user = new Parse.User();
        user.set('username', 'Scott Disick');
        user.set('email', 'laasyath@gmail.com');
        user.set('password', 'password');
      
        try {
          let userResult = await user.signUp();
          try {
            //add new parent info to AustinHighSchool class
            let schoolClassName = schoolText.replace(/\s/g, "");
            const newParent = new Parse.Object(schoolClassName);
            newParent.set('uID', Number(2+IDText.substring(1)));
            newParent.set('name', nameText);
            newParent.set('passwordHash', hash);
            newParent.set('role', 'parent');
            newParent.set("objID", user.id);
            //TO-DO need to create a point object instead of a regular pointer
            newParent.set('child1', new Parse.Object(schoolClassName));
            const result = await newParent.save();

            alert("Your account has been created! Please verify your account via email before logging in.");
          } catch (error) {
            console.log("Unable to save user information: " + error);
            alert("It seems like we were unable to create this account. Please contact administration for further details or sumbit a Bug Error.");
          }
        } catch (error) {
          alert("There is already an account registered under this email/username");
        }
      }
    })();
    
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
    <Modal avoidKeyboard visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalStyle}>
      <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? "padding" : null}>
        <ScrollView>
          <Text style={styles.title}>
            New Parent Account
          </Text>
          <TextInput style={styles.textInput}
            label="School"
            value={schoolText}
            onChangeText={text => setSchoolText(sanitize(text))}
          />
          <TextInput style={styles.textInput}
            label="Name"
            value={nameText}
            onChangeText={text => setNameText(sanitize(text))}
          />
          <TextInput style={styles.textInput}
            label="Child's ID"
            value={IDText}
            onChangeText={text => setIDText(sanitize(text))}
          />
          <TextInput style={styles.textInput}
            label="Email"
            value={emailText}
            onChangeText={text => setEmailText(sanitize(text))}
          />
          <TextInput style={styles.textInput}
            label="Create Password"
            value={passwordText}
            onChangeText={text => setPasswordText(sanitize(text))}
            secureTextEntry={true}
          />
          <TextInput style={styles.textInput}
            label="Confirm Password"
            value={confirmPwdText}
            onChangeText={text => setConfirmPwdText(sanitize(text))}
            secureTextEntry={true}
          />
          <View>
            <Text style={[styles.errorText, (errorText) ? { paddingBottom: 10 } : null]}>
              {errorText}
            </Text>
          </View>
          <View style={[styles.button, {marginTop: 0}]}>
            <NewAccountButton 
              onPress={() => { createNewAccount(); }} 
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// const getChildPointerObject = async() => {
//   let searchUser = "AustinHighSchool";
//   const query = new Parse.Query(searchUser);
//   const objectStudent = await query.get(1111111);
//   return objectStudent;
// }

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
  tinyLogo: {
    width: 135,
    height: 125,
    alignSelf: 'center'
  },
  appName: {
    fontSize: 35,
    marginTop: 10
  },
  header: {
    marginTop: "20%",
    alignSelf: 'center',
    marginBottom: "10%"
  },
  layout: {
    justifyContent: 'center',
  },
  subLayout: {
    paddingBottom: 100,
  },
  modalStyle: {
    backgroundColor: 'white',
    padding: 30,
    margin: 30,
  },
  title: {
    alignSelf: 'center',
    fontSize: 25,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
    marginTop: "7.5%",
  },
  newAccountButton: {
    marginTop: "5%",
  },
  newAccountButtonContent: {
    width: 250,
  },
  errorText: {
    color: 'red',
  }
});