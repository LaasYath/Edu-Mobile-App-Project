import { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, Image, SafeAreaView } from 'react-native';
import { Menu, Button, ActivityIndicator, Card, IconButton, Text, Divider, Appbar } from 'react-native-paper';

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

export const GalleryScreen = (props) => {
  const loading = <ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />;

  const [displayScreen, setDisplayScreen] = useState(<View>{loading}</View>);

  const setClubs = async () => {
    const results = await getClubs();
    // const clubs = results.map((step, move) => step.name);
    const resetToGalleryMainSubScreen = () => setDisplayScreen(<GalleryMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />);

    // console.log(clubs);

    setDisplayScreen(<GalleryMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />)
  }

  useEffect(() => {
    setClubs();
  }, []);

  return (
    <View>
      {displayScreen}
    </View>
  )
}

const GalleryMainSubScreen = props => {
  const data = props.data;
  const display = props.display;
  const goBack = props.goBack;

  const cards = data.map((step, move) => {
    return ([
      <GalleryCard 
        subject={step.name}
        onPress={() => display(
          <Gallery 
            club={step.name}
            goBack={goBack}
          />
        )}
        key={move}
      />, step.owned]);
  });

  const ownedCards = cards.filter(card => card[1]).map((step, move) => step[0]);
  const allCards = cards.filter(card => card[0]).map((step, move) => step[0]);
  
  return (
    <ScrollView>
      <Text variant={'titleLarge'} style={styles.categoryTitle}>My Clubs</Text>
      <Divider style={styles.divider} bold={true}/>
      <View>
        {ownedCards}
      </View>

      <Text variant={'titleLarge'} style={styles.categoryTitle}>Browse</Text>
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
  let userObj = await userQuery.get(global.id);
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

const AddImageScreen = props => {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [captionText, setCaptionText] = useState("");

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>
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
      userNewPhoto.set('img_b64', photo.base64);
      userNewPhoto.set('caption', caption);
      userNewPhoto.set('uploader', userObj.get('name'));
      userNewPhoto.set('club', '');
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
        {/* TODO:
        * implement close camera 
        */}
        <Button title="Close Camera" onPress={console.log('implement close camera')}> 
          Close Camera
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

const Gallery = props => {
  const [filter, setFilter] = useState("Favorite");
  const club = props.club;
  const goBack = props.goBack;

  const loading = <ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />;

  const [displayScreen, setDisplayScreen] = useState(<View>{loading}</View>);

  const selectFilter = (selectedFilter) => {
    setFilter(selectedFilter);
  }

  return(
    <View>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={club} />
        {/* TODO
        * open 'AddImageScreen' when user hits plus button
        */}
        <Appbar.Action icon={'plus'} onPress={(console.log("show AddImageScreen component so user can take pics and directly upload them"))} />
      </Appbar.Header>
      <ScrollView>
        <View style={styles.layout}>
          <MiniMenu filter={filter} selectFilter={selectFilter} />
        </View>
        <ImageList club={club} filter={filter}/>
      </ScrollView>
    </View>
  );
}

const ImageList = (props) => {
  const [images, setImages] = useState(<ActivityIndicator 
                                          animating={true} 
                                          style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const club = props.club;

  //TODO: keep images from overflowing past page, flex-column?
  async function getImages(filter) {
    setImages(<ActivityIndicator animating={true} style={{ marginTop: 10, marginBottom: 10 }}/>)
    const data = await getFilteredImages(club, filter);

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

  // see ClubsScreen.js for explanation
  // need to observe props.filter because images should change when that filter is changed
  useEffect(() => {
    getImages(props.filter);
  }, [props.filter])

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

async function getFilteredImages(club, filter) {
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
      postedBy: pic.get('uplaoder'),
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

const MiniMenu = (props) => {
  const selectFilter = (filter) => {
    props.selectFilter(filter)
    closeMenu();
  }

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(
    <View>
        <MiniMenuOption filter={"Favorite"} selectFilter={selectFilter} />
        <MiniMenuOption filter={"School"} selectFilter={selectFilter} />
    </View>
  );

  const filter = props.filter;

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  async function getOptions() {
    const clubNames = await getAvailableFilters();

    const opts = clubNames.map((step, move) => {
      return (
        <MiniMenuOption key={move} filter={step.name} selectFilter={selectFilter} />
      )
    })

    setOptions(
      <View>
        <MiniMenuOption filter={"Favorite"} selectFilter={selectFilter} />
        <MiniMenuOption filter={"School"} selectFilter={selectFilter} />
        {opts}
      </View>
    );
  }

  // see ClubsScreen.js for explanation
  // (don't need to watch any vars bc just doing once)
  useEffect(() => {
    getOptions();
  }, []);

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button mode="outlined" onPress={openMenu} style={styles.menu}>{filter}</Button>}
      >
        {options}
      </Menu>
    </View>
  )
}

const MiniMenuOption = (props) => {
  const filter = props.filter;
  const selectFilter = props.selectFilter;
  
  return (
    <Menu.Item onPress={() => {selectFilter(filter)}} style={styles.menuItem} title={filter} />
  )
}

// TODO: remove filters, not enough time
async function getAvailableFilters() {
  /* RETURN FORMAT:
  [
  {
    name: "club name"
  },...
  ]
   */
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([{ name: "Club 1" }, { name: "Club 2" }]);
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
