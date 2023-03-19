import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Image, SafeAreaView, StatusBar } from 'react-native';
import { Button, ActivityIndicator, Card, IconButton, Text, TextInput, Divider } from 'react-native-paper';

import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

const Stack = createStackNavigator();

export const GalleryScreen = (props) => {
  return (
    <Stack.Navigator initialRouteName='GalleryMainSubScreen'>
      <Stack.Screen 
        name="GalleryMainSubScreen"
        component={GalleryMainSubScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubGallery"
        component={Gallery}
        options={{ title: 'Gallery' }}
      />
      <Stack.Screen
        name="AddImage"
        component={AddImageScreen}
        initialParams={{ club: 'Test' }}
        options={{ title: 'Add Image'}}
      />
    </Stack.Navigator>
  )
}

const GalleryMainSubScreen = props => {
  const navigation = props.navigation;
  // const display = props.display;
  // const goBack = props.goBack;

  const [ownedCards, setOwnedCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);
  const [allCards, setAllCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);
  // const [screens, setScreens] = useState([]);
  
  const setClubData = async () => {
    const data = await getClubs();
    // const clubs = results.map((step, move) => step.name);
    
    const cards = data.map((step, move) => {
      return ([
        <GalleryCard 
          subject={step.name}
          onPress={() => navigation.navigate('SubGallery', {
            club: step.name,
            owned: step.owned,
          })}
          key={move}
        />, step.owned]);
    });

    const ownedCards = cards.filter(card => card[1]).map((step, move) => step[0]);
    const allCards = cards.map((step, move) => step[0]);
    
    setOwnedCards(ownedCards);
    setAllCards(allCards);
  }

  // like useEffect, except also runs when screen receives focus
  useFocusEffect(useCallback(() => {
    setClubData();
  }, []));
  
  return (
    <ScrollView>
      <Text variant={'titleLarge'} style={styles.categoryTitle}>Owned Clubs</Text>
      <Divider style={styles.divider} bold={true}/>
      <View>
        {ownedCards}
      </View>

      <Text variant={'titleLarge'} style={[styles.categoryTitle, {paddingTop: 20}]}>Clubs You're In</Text>
      <Divider style={styles.divider} bold={true}/>
      <View>
        {allCards}
      </View>
    </ScrollView>
  )
}

const GalleryCard = props => {
  const subject = props.subject;
  const onPress = props.onPress;

  return (
    <Card style={styles.card}>
      <Card.Title 
        title={subject}
        right={props => <IconButton icon="arrow-right-drop-circle" onPress={onPress} />}
      />
    </Card>
  )
}

const getClubs = async () => {
  let userQuery = new Parse.Query(global.school);
  let userObj;
  if (global.role !== 'parent') {
    userObj = await userQuery.get(global.id);
  } else {
    const parentObj = await userQuery.get(global.id);

    //console.log("child id:")
    //console.log(parentObj.get("child1"))
    let childUID = parentObj.get("child1");

    const userQuery2 = new Parse.Query(global.school);
    userQuery2.equalTo('uID', Number(childUID));
    const idResults = await userQuery2.find();

    /*for (const userChild of idResults) {
      console.log(userChild.get('uID'));
    }*/
    userObj = idResults[0];
  }

  let clubs = userObj.get('clubs');
  let ownedClubs = userObj.get('ownedClubs');
  let ret = [];

  for (const club of clubs) {
    console.log(club);
    let clubInfo
    if (ownedClubs.includes(club)) {
      clubInfo = {
        name: club,
        owned: true
      }
    } else {
      clubInfo = {
        name: club,
        owned: false
      }
    }
    ret.push(clubInfo);
  }

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

const Gallery = props => {
  const route = props.route;
  const params = route.params;
  const club = params.club;
  const owned = params.owned;

  const navigation = props.navigation;

  const canUserPost = () => (
    owned && global.role !== 'parent'
  );

  useEffect(() => {
    navigation.setOptions({
      title: club,
      headerRight: () => (canUserPost()) ? <AddImageButton club={club} navigation={navigation} /> : null,
    })
  })

  return(
    <View>
      <ScrollView>
        <ImageList club={club}/>
      </ScrollView>
    </View>
  );
}

const AddImageButton = props => {
  const club = props.club;
  const navigation = props.navigation;

  return (
    <IconButton 
      icon='plus'
      onPress={() => {
        navigation.navigate('AddImage', { club: club })
      }}
    />
  )
}

const AddImageScreen = props => {
  const route = props.route;
  const params = route.params;
  const club = params.club;
  
  const navigation = props.navigation;

  useEffect(() => {
    navigation.setOptions({
      title: "Add Image for " + club
    });
  }, [])

  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [captionText, setCaptionText] = useState("");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
        setHasCameraPermission(cameraPermission.status === "granted");
        setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
        console.log(cameraPermission);
        console.log(mediaLibraryPermission);
      })();
    }, [])
  );

  if (hasCameraPermission === undefined) {
    return <Text style={{ margin: 10 }}>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text style={{ margin: 10 }}>Permission for camera not granted. Please change this in settings.</Text>
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (photo) {
    let sharePic = async(caption) => {
      const userQuery = new Parse.Query(global.school);
      const userObj = await userQuery.get(global.id);
      const userNewPhoto = new Parse.Object(global.school + "Gallery");
      userNewPhoto.set('album', '');
      userNewPhoto.set('img_b64', "data:image/jpg;base64," + photo.base64);
      userNewPhoto.set('caption', caption);
      userNewPhoto.set('uploader', userObj.get('name'));
      userNewPhoto.set('club', club);
      const result = await userNewPhoto.save();

      alert("Your photo has been uploaded!");
    };

    let savePhoto = async() => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={() => sharePic(captionText)}> Share Picture </Button>
        <TextInput  
          label="Caption"
          value={captionText}
          onChangeText={text => setCaptionText(text)}
          style={styles.captionInput}>
        </TextInput>
        {hasMediaLibraryPermission ? <Button title="Save" onPress={() => savePhoto()}> Save Picture </Button> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)}> 
          Discard Picture
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <Button onPress={takePic}>
          <Ionicons name="camera" color="#b042ff" size={20}/>
        </Button>
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}

const ImageList = (props) => {
  const [images, setImages] = useState(<ActivityIndicator 
                                          animating={true} 
                                          style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const club = props.club;

  //TODO: keep images from overflowing past page, flex-column?
  // is it not wrapping? it wraps for me
  async function getImages() {
    setImages(<ActivityIndicator animating={true} style={{ marginTop: 10, marginBottom: 10 }}/>)
    const data = await getFilteredImages(club);

    const imgComponents = data.map((step, move) => {
      return (
        <ImageCard 
          source={{ uri: step.src }}
          postedBy={step.postedBy}
          caption={step.caption}
          key={move}
        />
      )
    });

    const imgMatrix = Array(Math.floor(imgComponents.length / 3) + 1).fill(null);
    for (let row = 0; row < imgMatrix.length; row++) {
      const imgRow = Array(3).fill(null);
      
      for (let col = 0; col < 3; col++) {
        imgRow[col] = imgComponents[(row * 3) + col] ? 
                        imgComponents[(row * 3) + col] : 
                        <View style={styles.imgHolder} key={(row * 3) + col} />;
      }

      imgMatrix[row] = <View style={styles.imgRowLayout} key={row}>{imgRow}</View>;
    }

    setImages(<View style={styles.imgMatrixLayout}>{imgMatrix}</View>);
  }

  useEffect(() => {
    getImages();
  }, [])

  return (
    <View>
      {images}
    </View>
  );
}

const ImageCard = props => {
  const source = props.source.uri;
  const postedBy = props.postedBy;
  const caption = props.caption;

  return (
    <Card style={styles.imgCard}>
      <Card.Cover source={{ uri: source }}/>
      <Card.Content style={styles.imgCardContent}>
        <Text variant={'bodySmall'} style={styles.imgCardText}>Posted by: {postedBy}</Text>
        <Text variant={'bodySmall'} style={styles.imgCardText}>{caption}</Text>
      </Card.Content>
    </Card>
  );
}

async function getFilteredImages(club) {
  /* RETURN FORMAT: [{
    src: str
    postedBy: str
    caption: str
  }...]
  */
  let clubSrc;
  let ret = [];

  let clubQuery = new Parse.Query(global.school + "Gallery");
  clubQuery.equalTo('club', club);
  const results = await clubQuery.find();
  for (const pic of results) {
    let clubPic = {
      src: pic.get('img_b64'),
      postedBy: pic.get('uploader'),
      caption: pic.get('caption')
    }
    ret.push(clubPic);
  }

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(ret);
    }, 1000)
  })
  
  return await promise;
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: "center",
  },
  categoryTitle: {
    margin: 15,
  },
  divider: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
  },
  card: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 5,
  },
  imgMatrixLayout: {
    marginBottom: 150,
  },
  imgRowLayout: { 
    flex: 1, 
    flexDirection: "row", 
    width: "100%",
  },
  menuContainer: {
    flex: 1,
    flexDirection: "row",
  },
  menu: {
    flex: 1,
    width: 200,
  },
  menuItem: {
    
  },
  imgCard: {
    flex: 1,
    padding: 5,
    margin: 5,
  },
  imgCardContent: {
    marginTop: 10,
  },
  imgCardText: {
    marginTop: 5,
  },
  imgHolder: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: "100%",
    height: 50,
    width: 50,
    borderRadius: 50
  },
  exitCamera: {
    flex: 'flex-end',
    marginTop: "5%",
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  captionInput: {
    width: "75%"
  }
});