import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Divider, Button, Menu, ActivityIndicator } from 'react-native-paper';

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
      <View style={{ flex: 1 }}><MiniMenu /></View>
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
  console.log(clubsList);

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

  console.log("inside club" + clubInfo.clubTitle);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{clubInfo.clubTitle}</Title>
        <Paragraph>{clubInfo.clubDescription}</Paragraph>
      </Card.Content>
      <Card.Cover source={{ uri: clubInfo.clubCover }}/>
    </Card>
  );
}

const MiniMenu = () => {
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