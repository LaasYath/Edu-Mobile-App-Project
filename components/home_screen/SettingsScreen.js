import { useState, Linking } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TextInput } from 'react-native-paper';

import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

// import DeviceInfo from 'react-native-device-info';
import * as IntentLauncher from 'expo-intent-launcher';

//hash funcs
import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";

export const SettingsScreen = props => {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  return (
    <View style={styles.layout}>
      <Portal>
        <ChangePasswordModal visible={modalVisible} hideModal={hideModal}/>
      </Portal>
      <View style={styles.permSwitches}>
        <CameraPermissionsButton />
        <LibraryPermissionsButton />
      </View>
      <Button mode={'contained'} onPress={showModal} style={{ margin: 20 }}>
        Change Password
      </Button>
    </View>
  )
}

const ChangePasswordModal = props => {
  const visible = props.visible;
  const hideModal = props.hideModal;

  const [oldPswdText, setOldPswdText] = useState("");
  const [newPswdText, setNewPswdText] = useState("");
  const [confPswdText, setConfPswdText] = useState("");
  const [errorText, setErrorText] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onDismiss = () => {
    setErrorText("");
    setIsLoading(false);
    hideModal();
  }

  const changePassword = async () => {
    setIsLoading(true);
    if (!oldPswdText || !newPswdText || !confPswdText) {
      setErrorText('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (newPswdText !== confPswdText) {
      setErrorText('Please make sure both password entries match');
      setIsLoading(false);
      return;
    }

    const userQuery = new Parse.Query(global.school);
    const userObj = await userQuery.get(global.id);
    const pwdHash = userObj.get('passwordHash');

    JSHash(newPswdText, CONSTANTS.HashAlgorithms.sha256)
    .then(async(hash) => {
      userObj.set('passwordHash', hash);
    })
    .catch(e => {
      console.log("Error => " + e);
    })

    return new Promise(res => setTimeout(() => {
      console.log("password reset");
      alert("Password Reset Successfully!");
      onDismiss();
    }, 1000));
  }

  return (
    <Modal avoidKeyboard visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalStyle}>
      <Text style={styles.modalTitle}>Reset Password</Text>
      <TextInput style={styles.textInput}
        label="Input Old Password"
        value={oldPswdText}
        onChangeText={text => setOldPswdText(sanitize(text))}
        secureTextEntry={true}
      />
      <TextInput style={styles.textInput}
        label="Create New Password"
        value={newPswdText}
        onChangeText={text => setNewPswdText(sanitize(text))}
        secureTextEntry={true}
      />
      <TextInput style={styles.textInput}
        label="Confirm New Password"
        value={confPswdText}
        onChangeText={text => setConfPswdText(sanitize(text))}
        secureTextEntry={true}
      />
      <View>
        <Text style={[styles.errorText, (errorText) ? { paddingVertical: 10 } : null]}>
          {errorText}
        </Text>
      </View>
      <View style={styles.button}>
        <Button 
          onPress={changePassword} 
          loading={isLoading}
          mode={'contained'}
        >Change Password</Button>
      </View>
    </Modal>
  );
}

const CameraPermissionsButton = props => {
  const onPress = async () => {
    console.log("camera permissions requested")
    // https://stackoverflow.com/questions/64769522/how-to-open-applications-location-permission-settings-directly-in-react-native
    // https://docs.expo.dev/versions/latest/sdk/intent-launcher/
    // const perm = await Camera.requestCameraPermissionsAsync();
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.PRIVACY_SETTINGS);
    }
  }

  return (
    <View style={styles.permLayout}>
      <Text variant={'titleMedium'} style={styles.permText}>Camera Settings</Text>
      <Button 
        mode='outlined'
        onPress={onPress}
        style={styles.button}
      >Edit</Button>
    </View>
  )
}

const LibraryPermissionsButton = props => {
  const onPress = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.PRIVACY_SETTINGS);
    }
  }

  return (
    <View style={styles.permLayout}>
      <Text variant={'titleMedium'} style={styles.permText}>Library Settings</Text>
      <Button 
        mode='outlined'
        onPress={onPress}
        style={styles.button}
      >Edit</Button>
    </View>
  )
}

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
    justifyContent: 'center',
  },
  permSwitches: { 
    height: 150,
    alignItems: 'center',
  },
  permLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "90%",
  },
  permText: {
    marginTop: 25,
  },
  button: {
    alignSelf: 'center',
  },
  modalStyle: {
    backgroundColor: 'white',
    padding: 30,
    margin: 30,
  },
  modalTitle: {
    alignSelf: 'center',
    fontSize: 25,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
  }
});