import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, ActivityIndicator, Text, Divider } from 'react-native-paper';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

import Storage from 'react-native-storage';

//Initialize Parse/Connect to Back4App db
import Parse from "parse/react-native.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Initialize sdk
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('hd8SQBtMaTjacNWKfJ1rRWnZCAml1Rquec1S9xCV', 'Qn7JG5jASG6A45G5acmsKMCCgJwJx1Kd7Shc6VPq');
Parse.serverURL = 'https://parseapi.back4app.com/';

// https://github.com/stephy/CalendarPicker

let events = [];

//configure local storage for events
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

      <ScrollView>
        {dateCards}
      </ScrollView>
    </View>
  );
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

/**
 * TODO: Get personal events to show up (partial solution committed to GithHub under patch-1)
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

  storage.save({
    key: 'personalEvents', // Note: Do not use underscore("_") in key!
    data: {
      addedEvents: events
    },

    // if expires not specified, the defaultExpires will be applied instead.
    // if set to null, then it will never expire.
    expires: 1000 * 3600
  });

  //get user's personal events
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

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    marginTop: 10,
  }, 
  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
});
