import { useState, useEffect, useCallback, React } from 'react';
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

export const ClubsScreen = () => {
  const [filter, setFilter] = useState("A-Z");
  // tracks changes in amount of clubs
  const [clubChange, setClubChange] = useState(0);

  return (
    <ScrollView style={styles.layout}>
      <Title style={styles.title}>Your Clubs</Title>
      <Divider bold={true} horizontalInset={true} />
      <UserClubCards clubChange={clubChange} setClubChange={setClubChange}/>

      <View style={styles.allClubsHeader}>
        <View style={{ flex: 2 }}><Title style={styles.title}>Browse</Title></View>
        <View style={{ flex: 1 }}><FilterMenu filter={filter} setFilter={setFilter}/></View>
      </View>
      <Divider bold={true} horizontalInset={true} />
      <AllClubCards filter={filter} clubChange={clubChange} setClubChange={setClubChange} />
    </ScrollView>
  );
};

const UserClubCards = (props) => {
  const clubChange = props.clubChange;
  const setClubChange = props.setClubChange;

  const [clubCards, setClubCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);

  async function getCardData() {
    const cardData = await getUserClubCards();

    const cards = cardData.map((step, move) => {
      return (
        <ClubCardPersonal key={move} clubData={step} onLeave={() => {
          setClubChange(clubChange - 1);
        }}/>
      );
    });

    setClubCards(<View>{cards}</View>);
  }
  
  useEffect(() => {
    getCardData();
  }, [clubChange]);

  return (
    <View>
      {clubCards}
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
  let searchID;
  if (global.role !== 'p') {
    searchID = global.id;
  } else {
    // idk if this actually works
    const parentObj = await queryStudent.get(global.id);
    await parentObj.fetch();
    console.log(parentObj.get("child1"))
    searchID = parentObj.get("child1");
  }

  const objectStudent = await queryStudent.get(searchID);
  //save object data to reponse
  const responseStudent = await objectStudent.save();
  //store user's clubs
  global.clubsList = responseStudent.get("clubs");

  let name = "";
  let descrip = "";
  let cover = "";
  let id = "";
  let x;

  //gets club information
  let searchField = global.school + "Clubs";
  let query = new Parse.Query(searchField);
  const results = await query.find();

  for (const club of results) {
    //checks if current club is in user's club list
    if (clubsList.includes(club.get("name"))) {
      name = club.get("name");
      descrip = club.get("descrip");
      cover = club.get("cover");
      id = club.id;
      x = {
        clubTitle: name,
        clubDescription: descrip,
        clubCover: cover,
        clubID: id,
      }
      //add club map to array
      cardData.push(x);   
    } 
  }

  return cardData;
  // at the end, includes all user's clubs/maps
}

const AllClubCards = props => {
  // const cardsData = getAllClubCards();
  const [cards, setCards] = useState(<ActivityIndicator 
                                         animating={true} 
                                         style={{ marginTop: 10, marginBottom: 10 }}
  />);
  const clubChange = props.clubChange;
  const setClubChange = props.setClubChange;

  const onJoin = useCallback(() => {
    setClubChange(clubChange + 1);
  }, [clubChange]);
  
  async function getAllClubCards() {
    /* implement getting all clubs */
    /* RETURN FORMAT: [{
      clubTitle: str,
      clubDescription: str,
      clubCover: str,
    }...]
    (clubCover - can be URL or path (aka URI))
    */  
    let cardData = [];
    let name = "", descrip = "", cover = "", x;

    let search = global.school + "Clubs";
    let queryClubs = new Parse.Query(search);

    /*depending on seclected filter, the query is changed. tried reloading the component once the user clicks
    the filter button with new properties
    */
    console.log("filter is: " + props.filter);
    if (props.filter === "A-Z") {
      queryClubs.ascending("name");
    } else if (props.filter === "Z-A") {
      queryClubs.descending("name");
    }

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
        <ClubCardBrowse key={move} clubData={step} onJoin={onJoin}/>
      );
    });

    setCards(<View>{cards}</View>);
  }

  useEffect(() => {
    getAllClubCards();
  }, [props.filter, clubChange]);

  return (
    <View>
      {cards}
    </View>
  );
}

const ClubCardBrowse = (props) => {
  const clubInfo = props.clubData;
  const onJoin = props.onJoin;

  return (
    <Card style={styles.card}>
      <Card.Title 
        title={clubInfo.clubTitle}
        right={(props) => <ClubOptionsMenuBrowse {...props} clubData={clubInfo} onJoin={onJoin}/>}
      />
      <Card.Content>
        <Paragraph>{clubInfo.clubDescription}</Paragraph>
      </Card.Content>
      <Card.Cover source={{ uri: clubInfo.clubCover }}/>
    </Card>
  );
}

const ClubCardPersonal = (props) => {
  const clubInfo = props.clubData;
  const onLeave = props.onLeave;

  return (
    <Card style={styles.card}>
      <Card.Title 
        title={clubInfo.clubTitle}
        right={(props) => <ClubOptionsMenuPersonal {...props} clubData={clubInfo} onLeave={onLeave}/>}
      />
      <Card.Content>
        <Paragraph>{clubInfo.clubDescription}</Paragraph>
      </Card.Content>
      <Card.Cover source={{ uri: clubInfo.clubCover }}/>
    </Card>
  );
}

//TO-DO: Once user leaves or joins club, resync front end to reflect user's change 

const ClubOptionsMenuBrowse = (props) => {
  const clubInfo = props.clubData;
  const onJoin = props.onJoin;
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
    closeMenu();

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

    closeMenu();
  }

  const joinClub = async() => {
    console.log(clubInfo.clubTitle);
    const userQuery = new Parse.Query(global.school);
    const userObj = await userQuery.get(global.id);
    let clubsList = userObj.get('clubs');

    console.log(clubsList);
    if (clubsList.some(c => c === clubInfo.clubTitle)) {
      alert("You are already in that club.");
      return;
    }

    clubsList.push(clubInfo.clubTitle);
    
    try {
      userObj.set('clubs', clubsList)
      console.log("club joined");
      onJoin();
    } catch (error) {
      console.log("Error: unable to join club => ", error);
    }

    closeMenu();
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" onPress={openMenu}/>}
      >
        {(global.role !== 'p') ? <Menu.Item onPress={joinClub} title='Join Club' /> : null}
        <Menu.Item onPress={linkToInsta} title='Share to Instagram' />
        <Menu.Item onPress={savePhoto} title='Save Poster' />
        <Menu.Item onPress={share} title='Other' />
      </Menu>
    </View>
  )
}

const ClubOptionsMenuPersonal = (props) => {
  const clubInfo = props.clubData;

  // updates frontend
  const onLeave = props.onLeave;
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
          title: clubInfo.clubTitle + "\'s Club Poster",
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
    closeMenu();

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

    closeMenu();
  }

  const leaveClub = async () => {
    console.log(clubInfo.clubTitle);
    // console.log(clubInfo.clubID);
    // const toDel = await clubsQuery.get(clubInfo.clubID);
    // console.log(toDel);
    const userQuery = new Parse.Query(global.school);
    const userObj = await userQuery.get(global.id);
    let clubsList = userObj.get('clubs');
    clubsList = clubsList.filter(function (club) {
      return club != clubInfo.clubTitle;
    });
    
    try {
      userObj.set('clubs', clubsList)
      console.log("club removed");
      onLeave();
    } catch (error) {
      console.log("Error: unable to del club => ", error);
    }

    closeMenu();
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" onPress={openMenu}/>}
      >
        {(global.role !== 'p') ? <Menu.Item onPress={leaveClub} title='Leave Club' /> : null}
        <Menu.Item onPress={linkToInsta} title='Share to Instagram' />
        <Menu.Item onPress={savePhoto} title='Save Poster' />
        <Menu.Item onPress={share} title='Other' />
      </Menu>
    </View>
  )
}

const FilterMenu = props => {
  const [visible, setVisible] = useState(false);
  const filter = props.filter;
  const setFilter = props.setFilter;

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const selectFilterDesc = () => {
    console.log("filter 1");
    setFilter("A-Z");
    <AllClubCards filter="A-Z"/>
    closeMenu();
  }

  const selectFilterAsc = () => {
    setFilter("Z-A");
    closeMenu();
    <AllClubCards filter={"Z-A"}/>
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button mode="outlined" onPress={openMenu}>{filter}</Button>}
      >
        <Menu.Item onPress={() => {selectFilterDesc()}} title='A-Z' />
        <Menu.Item onPress={() => {selectFilterAsc()}} title='Z-A' />
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
    marginTop: 50,
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