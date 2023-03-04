import { useState, useEffect, React } from 'react';
import { StyleSheet, View, ScrollView, Share, Linking } from 'react-native';
import { Card, Title, Paragraph, Divider, Button, Menu, ActivityIndicator, IconButton } from 'react-native-paper';

import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

export const ClubsScreen = () => (
  <ScrollView style={styles.layout}>
    <Title style={styles.title}>Your Clubs</Title>
    <Divider bold={true} horizontalInset={true} />
    <UserClubCards user={global.id} />

    <View style={styles.allClubsHeader}>
      <View style={{ flex: 2 }}><Title style={styles.title}>Browse</Title></View>
      <View style={{ flex: 1 }}><FilterMenu /></View>
    </View>
    <Divider bold={true} horizontalInset={true} />
    <AllClubCards />
  </ScrollView>
);

/*
<UserClubCards user={
      /* Once auth fully implemented, will need to have this actually reference their ID */
      /*"Example User"
    /*}/>
*/

const UserClubCards = (props) => {
  const user = props.user;
  const [cards, setCards] = useState(<ActivityIndicator 
                                        animating={true} 
                                        style={{ marginTop: 10, marginBottom: 10 }}
  />);
  //goes to allClubCards before executing get user club cards

  // async func, retrives club dta from db and adds it to array
  // no longer modifies cardData list decla
  // now changes state
  async function getCardData() {
    const cardData = await getUserClubCards();

    const cards = cardData.map((step, move) => {
      return (
        <ClubCard key={move} clubData={step} />
      );
    });

    setCards(<View>{cards}</View>);
  }

  // react version of promises
  // first argument is async function to execute (changing a state)
  // second argument is array of variables to watch, then will
  //   execute again if one of those variables is changed.
  // warning: unwatched promises, idk how to fix
  useEffect(() => {
    getCardData();
  }, []);

  return (
    <View>
      {cards}
    </View>
  );
}

const AllClubCards = () => {
  // const cardsData = getAllClubCards();
  const [cards, setCards] = useState(<ActivityIndicator 
                                         animating={true} 
                                         style={{ marginTop: 10, marginBottom: 10 }}
  />);
  let cardData = [];
 
  async function getAllClubCards() {
    /* implement getting all clubs */
    /* RETURN FORMAT: [{
      clubTitle: str,
      clubDescription: str,
      clubCover: str,
    }...]
    (clubCover - can be URL or path (aka URI))
    */  
    let name = "", descrip = "", cover = "", x;

    let search = global.school + "Clubs";
    const Clubs = new Parse.Object.extend(search);
    const queryClubs = new Parse.Query(Clubs);
    const results = await queryClubs.find();
    try {
      for (const club of results) {
        //retrieve info
        name = club.get("name");
        descrip = club.get("descrip");
        cover = club.get("cover");

        x = {
          clubTitle: name,
          clubDescription: descrip,
          clubCover: cover,
        }
        //add club map to array
        cardData.push(x);
      }
    } catch (error) {
      console.error('Error while fetching Clubs', error);
    }

    //return cardData;
    const cards = cardData.map((step, move) => {
      return (
        <ClubCard key={move} clubData={step} />
      );
    });

    setCards(<View>{cards}</View>);
  }

  useEffect(() => {
    getAllClubCards();
  }, []);

  return (
    <View>
      {cards}
    </View>
  );
}

// can just turn entire helper func into async
async function getUserClubCards() {
  /* implement getting all user clubs */
  /* RETURN FORMAT: [{
    clubTitle: str,
    clubDescription: str,
    clubCover: str,
  }...]
  (clubCover - can be URL or path (aka URI))
  */
  let cardData = [];
  //getting student information
  let searchUser = global.school;
  const queryStudent = new Parse.Query(searchUser);
  //get student object of specific id 
  const objectStudent = await queryStudent.get(global.id);
  //save object data to reponse
  const responseStudent = await objectStudent.save();
  //store user's clubs
  const clubsList = responseStudent.get("clubs");

  let name = "";
  let descrip = "";
  let cover = "";
  let x;

  //gets club information
  let searchField = global.school + "Clubs";
  const searchClub = Parse.Object.extend(searchField);
  const query = new Parse.Query(searchClub);
  const results = await query.find();

  for (const club of results) {
    //checks if current club is in user's club list
    if (clubsList.includes(club.get("name"))) {
      name = club.get("name");
      descrip = club.get("descrip");
      cover = club.get("cover");
      x = {
        clubTitle: name,
        clubDescription: descrip,
        clubCover: cover,
      }
      //add club map to array
      cardData.push(x);   
    } 
  }

  return cardData;
  // at the end, includes all user's clubs/maps
}

const ClubCard = (props) => {
  const clubInfo = props.clubData;

  return (
    <Card style={styles.card}>
      <Card.Title 
        title={clubInfo.clubTitle}
        right={(props) => <ClubOptionsMenu {...props} clubData={clubInfo} />}
      />
      <Card.Content>
        <Paragraph>{clubInfo.clubDescription}</Paragraph>
      </Card.Content>
      <Card.Cover source={{ uri: clubInfo.clubCover }}/>
    </Card>
  );
}

const ClubOptionsMenu = (props) => {
  const clubInfo = props.clubData;
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const share = async() => {
    let uri = clubInfo.clubCover;

    //better on ios (faster)
    if (Sharing.isAvailableAsync()) {
      const result = await Share.share(
        {
          //shares link to poster (base64 representation is way too long)
          title: clubInfo.clubName + "\'s Club Poster",
          url: uri,
        },
        {
          excludedActivityTypes: [
            //makes app laod faster by taking away airdrop option
            'com.apple.UIK.activity.AirDrop',
          ]
        }
      );

      //success message if user shared an image
      if (result.action === Share.sharedAction) {
        alert("Shared successfully");
      } 
    }

    closeMenu();
  }


  const linkToInsta = async() => {
    //saves picture to user's camera roll
    await savePhotoForInsta();
    /*
    takes user to instagram, shares most recent pic in camera roll (facebook has mo built in hooks/deep linking 
    to share pictures that aren't in the user's library or already posted)
    */
    const instagramURL = `instagram://library?AssetPath=""`;
    return Linking.openURL(instagramURL);
  
  }

  const savePhotoForInsta = async() => {
    //image address for club poster
    const uri = clubInfo.clubCover;

    // gets permissions to user's camera roll
    const permissionResponse = await MediaLibrary.requestPermissionsAsync();

    //if permissions have been granted
    if (permissionResponse.granted) {
      //returns a null object, but event has successfully been completed
      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    }
  }

  //adds an alert when photo is saved
  const savePhoto = async() => {
    const checkPermissions = savePhotoForInsta();
    if(checkPermissions) {
      alert("Poster has been saved to camera roll.");
    }
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" onPress={openMenu}/>}
      >
        <Menu.Item onPress={share} title='Share' />
        <Menu.Item onPress={savePhoto} title='Save Poster' />
        <Menu.Item onPress={share} title='Options' />
      </Menu>
    </View>
  )
}

const FilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState("Filter...");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const selectFilter = (filter) => {
    setFilter(filter);
    closeMenu();
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button mode="outlined" onPress={openMenu}>{filter}</Button>}
      >
        <Menu.Item onPress={() => {selectFilter('Filter 1')}} title='Filter 1' />
        <Menu.Item onPress={() => {selectFilter('Filter 2')}} title='Filter 2' />
        <Menu.Item onPress={() => {selectFilter('Filter 3')}} title='Filter 3' />
      </Menu>
    </View>
  )
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: "#fff",
  },
  allClubsHeader: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 3,
  },
  title: {
    marginLeft: 10,
  },
  menuContainer: {
    flexDirection: "row",
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  card: {
    margin: 5,
  },
});