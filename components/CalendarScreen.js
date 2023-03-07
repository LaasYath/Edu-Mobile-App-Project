import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, ActivityIndicator, Text, Divider } from 'react-native-paper';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

// https://github.com/stephy/CalendarPicker

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

/**
 * TODO: Implement async getDates()
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
 * 
 * date should be in YYYYMMDD format
 * ex: March 10th, 2023 would be 20230310
 * 
 * src should be where event is coming from 
 *  (ex: Chess club, school, etc.)
 * title is name of event
 * desc is description of event
 *  (just put time of event in desc)
 */
const getDates = async () => {
  const ret = [
    {
      date: '20230310',
      src: 'Chess Club',
      title: 'Chess Competition',
      desc: 'At 2:00 pm in the main building',
    },
    {
      date: '20230323',
      src: 'FBLA',
      title: 'State Competition',
      desc: 'Compete to win the glory of being the best in the state!',
    },
    {
      date: '20230323',
      src: 'School',
      title: 'Eat tacos',
      desc: 'Come eat tacos for free at 10 AM in the side building!',
    },
    {
      date: '20230323',
      src: 'Robotics',
      title: 'Lorem ipsum',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Venenatis a condimentum vitae sapien pellentesque. Dolor sit amet consectetur adipiscing.',
    }
  ];

  return new Promise((res) => {setTimeout(() => res(ret), 3000)});
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
