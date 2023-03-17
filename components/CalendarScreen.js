import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Card, ActivityIndicator, Text, Divider, Button, Modal, Portal, TextInput } from 'react-native-paper';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import Storage from 'react-native-storage';

import { createStackNavigator } from '@react-navigation/stack';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

// https://github.com/stephy/CalendarPicker
// https://github.com/sunnylqm/react-native-storage

let events = [];

//configure local storage for user's personal events
let storage = new Storage({
  // maximum capacity, default 1000 key-ids
  size: 1000,

  storageBackend: AsyncStorage, 

  // null (never expires)
  defaultExpires: null,

  // cache data in the memory. default is true.
  enableCache: true,

  // if data was not found in storage or expired data was found,
  // the corresponding sync method will be invoked returning
  // the latest data.
  sync: {
    
  }
});

export default storage;

//sets local storage key for user's personal events
storage.save({
  key: 'personalEvents', // Note: Do not use underscore("_") in key!
  data: {
    addedEvents: events
  },

  // if expires not specified, the defaultExpires will be applied instead.
  // if set to null, then it will never expire.
  expires: 1000 * 3600
});

export const CalendarScreen = (props) => {
  // controls highlighting of calendar
  const [customDates, setCustomDates] = useState([]);
  // controls ALL of user's events
  // format: dictionary of moment.calendar() to card
  const [allDates, setAllDates] = useState([]);
  // controls the displaying of cards for given date when date is selected
  const [dateCards, setDateCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);

  // const startDate = selectedDate ? selectedDate.toString() : '';

  const getAllDates = async () => {
    const dates = await getDates();
    let allDates = {};
    
    const dateStyles = dates.map((step, move) => {
      if (!allDates[moment(step.date, "YYYYMMDD").format("YYYYMMDD")]) {
        allDates[moment(step.date, "YYYYMMDD").format("YYYYMMDD")] = []; 
        console.log(moment(step.date, "YYYYMMDD").format("YYYYMMDD"));
      }

      const card = <DateCard data={step} key={move} />

      allDates[moment(step.date, "YYYYMMDD").format("YYYYMMDD")].push(card);

      return {
        date: moment(step.date, "YYYYMMDD"),
        style: {backgroundColor: '#d1c4d5'},
        textStyle: {color: 'black'},
        containerStyle: [],
        allowDisabled: true,
      };
    });

    setAllDates(allDates);
    setCustomDates(dateStyles);
    setDateCards(<View />);
  }

  useEffect(() => {
    getAllDates()
  }, []);

  const displayDateCards = date => {
    const cards = allDates[date.format("YYYYMMDD")];
    console.log(date);
    console.log(allDates);

    setDateCards(<View>{cards}</View>);
    console.log("set date cards");
    console.log(cards ? cards.length : 'none');
  }

  return (
    <View style={styles.layout}>
      <CalendarPicker
        onDateChange={(date) => displayDateCards(date)}
        todayBackgroundColor="#e3e3e3"
        selectedDayColor="#b3b3b3"
        customDatesStyles={customDates}
      />

      <Divider style={styles.divider} />

      {/* NEW - adds event*/}
      <NewEventComponent />

      <ScrollView>
        {dateCards}
      </ScrollView>
    </View>
  );
}

//Beginning of add and remove event option (will complete if time allows) 
//Currently not used
const EventOptions = (props) => {

  const edit = async() => {
    console.log('edit event');
  }

  const remove = async() => {
    console.log('remove event');
  }

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" onPress={openMenu}/>}
      >
        <Menu.Item onPress={edit} title='Edit' />
        <Menu.Item onPress={remove} title='Remove' />
      </Menu>
    </View>
  )
}

const DateCard = props => {
  const data = props.data;
  const src = data.src;
  const title = data.title;
  const desc = data.desc;

  return (
    <Card>
      <Card.Title 
        title={title}
        subtitle={"For: " + src}
      />
      <Card.Content>
        <Text variant='bodyMedium'>{desc}</Text>
      </Card.Content>
    </Card>
  )
}

//Event class to store user's events locally instead of flooding database
class Events {
  constructor(date, src, title, desc) {
    this.date = date;
    this.src = src;
    this.title = title;
    this.desc = desc;
  }

  getData() {
    return {
      date: this.date,
      src: this.src,
      title: this.title,
      desc: this.desc
    }
  }
}

/*
 * 
 * Should return ALL dates linked to this account
 *   (aka all dates in all the clubs linked to this account + any school dates)
 * 
 * RETURN: [
 * {
 *   date: str,
 *   src: str,
 *   title: str,
 *   desc: str,
 * }, ...
 * ]
 */
const getDates = async () => {
  //get related club and school events
  let searchUser = global.school;
  const queryStudent = new Parse.Query(searchUser);
  //get student object of specific id 
  const objectStudent = await queryStudent.get(global.id);
  //save object data to reponse
  const responseStudent = await objectStudent.save();
  //store user's clubs
  global.clubsList = responseStudent.get("clubs");

  const queryForEvent = new Parse.Query(global.school + "Events");
  const resultsOfEvents = await queryForEvent.find();
  for (const event of resultsOfEvents) {
    if (global.clubsList.includes(event.get('entity')) || event.get('entity') == "School") {
      let schoolEvent = new Events(event.get('date'), event.get('entity'), event.get('title'), event.get('desc')); //date, src, title, desc
      events.push(schoolEvent.getData());

    }
  }

  //update local storage to user's clubs/school events
  storage.save({
    key: 'personalEvents', // Note: Do not use underscore("_") in key!
    data: {
      addedEvents: events
    },
  
    // if expires not specified, the defaultExpires will be applied instead.
    // if set to null, then it will never expire.
    expires: 1000 * 3600
  });

  //load all of user's events
  storage
  .load({
    key: 'personalEvents',

    autoSync: true,

    syncInBackground: true,

    // syncParams: {
    //   extraFetchOptions: {
    //     
    //   },
    //   someFlag: true
    // }
  })
  .then(ret => {
    // found data go to then()
    for (const object of ret.addedEvents) {
      console.log("LOAD" + object);
    }
  })
  .catch(err => {
    // any exception including data not found
    // goes to catch()
    console.warn(err.message);
    switch (err.name) {
      case 'NotFoundError':
        break;
      case 'ExpiredError':
        break;
    }
  });

  return new Promise((res) => {setTimeout(() => res(events), 3000)});
}

const NewEventComponent = props => {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <View>
      <Portal>
        <NewEventModal visible={visible} onDismiss={hideModal} />
      </Portal>
      <Button 
        mode={'text'} 
        onPress={showModal} 
        style={[styles.addEventButton]} 
        contentStyle={styles.addEventText}
      >
        <Text>
          +
        </Text>
      </Button>
    </View>
  );
}

const NewEventModal = props => {
  const visible = props.visible;
  const hideModal = props.onDismiss;

  const [isLoading, setIsLoading] = useState(false);

  //set date to current date
  let date = new Date();
  let month = date.getMonth()+1;
  if (month < 10) {
    month = "" + 0 + month;
  }
  let [dateTxt, setDateTxt] = useState(date.getFullYear() + "-" + month + "-" + date.getDate());

  const [titleTxt, setTitleTxt] = useState("");
  const [descTxt, setDescTxt] = useState("");
  const [srcTxt, setSrcTxt] = useState("");
  const [errorText, setErrorText] = useState("");

  // TODO: Implement createNewAccount function
  const createNewEvent = async () => {
    const resetButton = () => {
      setIsLoading(false);
    }

    setIsLoading(true);

    await new Promise(res => setTimeout(res, 2000));

    //error cases
    if (!dateTxt || !titleTxt || !srcTxt || !descTxt) {
      console.log('empty field error');
      setErrorText('Please fill in all fields');
      resetButton();
      return;
    }
    
    //add events by adding new event to local storage
    (async () => {
      let dateOfEvent = dateTxt.replace(/-/g, "");
      let newEvent = new Events(dateOfEvent, srcTxt, titleTxt, descTxt); //date, src, title, desc
      //automatically change local storage data
      events.push(newEvent.getData());

      storage.save({
        key: 'personalEvents', 
        data: {
          addedEvents: events
        },
      
        expires: null
      });

    })();

    console.log("final list: " + events);
    for (const event1 of events) {
      console.log(event1);
    }

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
        New Event
      </Text>
      <TextInput style={styles.textInput}
        label="Title"
        value={titleTxt}
        onChangeText={text => setTitleTxt(sanitize(text))}
      />
      <TextInput style={styles.textInput}
        label="Group"
        value={srcTxt}
        onChangeText={text => setSrcTxt(sanitize(text))}
      />
      <TextInput style={styles.textInput}
        label="Date (YYYY-MM-DD)"
        value={dateTxt}
        onChangeText={text => setDateTxt(sanitize(text))}
      />
      <TextInput style={styles.textInput}
        label="Description"
        value={descTxt}
        onChangeText={text => setDescTxt(sanitize(text))}
      />
      <View>
        <Text style={{ color: 'red' }}>
          {errorText}
        </Text>
      </View>
      <View style={styles.button}>
        <NewEventButton 
          onPress={() => { createNewEvent(); }} 
          loading={isLoading}
        />
      </View>
    </Modal>
  );
}


const NewEventButton = props => (

  <Button
    loading={props.loading}
    mode={'contained'}
    onPress={props.onPress}
  >
    Create New Event
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
    marginTop: 10,
  }, 
  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
  addEventButton: {
    backgroundColor: "#d3d3d3",
    alignSelf: "flex-end",
    height: 40,
    borderRadius: 75,
    marginRight: 10
  },
  addEventText: {
    alignSelf: 'center',
    fontSize: 20,
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
  errorText: {
    backgroundColor: 'red',
    padding: 10,
  },
  button: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

