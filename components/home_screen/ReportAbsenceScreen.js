import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { ActivityIndicator, Button, Card, Text, TextInput } from 'react-native-paper';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

export const ReportAbsenceScreen = props => {
  const isAdmin = () => {
    return global.role === 'admin';
  }

  return (
    <View>
      {(isAdmin()) ? <ReportAbsenceAdminScreen /> : <ReportAbsenceMainScreen />}
    </View>
  )
}

const ReportAbsenceMainScreen = props => {
  const [dateTxt, setDateTxt] = useState(moment().format("YYYY-MM-DD"));
  const [reasonTxt, setReasonTxt] = useState("");
  const [errorTxt, setErrorTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onDateChange = (date) => {
    setDateTxt(date.format("YYYY-MM-DD"));
  }
  
  const onSubmit = async () => {
    setIsLoading(true);

    if (!dateTxt || !reasonTxt) {
      setErrorTxt("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    await new Promise(res => setTimeout(() => res(), 2000));

    let userQuery = new Parse.Query(global.school);
    let userObj = await userQuery.get(global.id);

    const newAbsence = new Parse.Object(global.school + "Absences");
    let date = dateTxt.replace(/-/g, "");
    newAbsence.set('date', date);
    newAbsence.set('name', await userObj.get('name'));
    newAbsence.set('reason', reasonTxt);
    newAbsence.set('uID', await userObj.get('uID'));
    try {
      const result = await newAbsence.save();
      
      return new Promise(res => setTimeout(() => {
        setDateTxt("");
        setReasonTxt("");
        setIsLoading(false);
        alert("Your report has been sent.");
        return;
      }, 1000));
    } catch (error) {
      console.error('Error while creating New Absence: ', error);
      return new Promise(res => setTimeout(() => {
        setIsLoading(false);
        return;
      }, 1000));
    }
  }


  return (
    <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? "padding" : null}>
      <ScrollView>
        <View>
          <CalendarPicker 
            onDateChange={onDateChange}
            todayBackgroundColor="#e3e3e3"
            selectedDayColor="#b3b3b3"
          />
            <TextInput 
              label="Date of Absence (YYYY-MM-DD)"
              value={dateTxt}
              onChangeText={txt => setDateTxt(txt)}
            />
            <TextInput
              label="Reason for Absence"
              value={reasonTxt}
              onChangeText={txt => setReasonTxt(txt)} 
              multiline
            />
          <View style={styles.subLayout}>
            <Text style={[styles.errorText, (errorTxt) ? { paddingBottom : 10 } : null]}>
              {errorTxt}
            </Text>
            <Button
              mode='contained'
              onPress={onSubmit}
              loading={isLoading}
              style={styles.button}
            >
              Report Absence
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const ReportAbsenceAdminScreen = props => {
  const [cards, setCards] = useState(<ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const setAbsenceCards = async () => {
    const data = await getAbsences();

    const tempCards = data.map((step, move) => {
      return (
      <AbsenceCard 
        key={move}
        name={step.name}
        date={step.date}
        reason={step.reason}
      />);
    })

    setCards(<View>{tempCards}</View>)
  }

  useEffect(() => {
    setAbsenceCards();
  }, []);

  return (
    <ScrollView>
      {cards}
    </ScrollView>
  )
}

// TODO: Implement async getAbsences()
const getAbsences = async () => {
 
  await new Promise(res => setTimeout(() => res(), 1000));

  let ret = [];

  const AustinHighSchoolAbsences = Parse.Object.extend('AustinHighSchoolAbsences');
  const query = new Parse.Query(AustinHighSchoolAbsences);
  // You can also query by using a parameter of an object
  // query.equalTo('objectId', 'xKue915KBG');
  try {
    const results = await query.find();
    for (const object of results) {
      // Access the Parse Object attributes using the .GET method
      const date = object.get('date')
      const reason = object.get('reason')
      const name = object.get('name')
      const uID = object.get('uID')

      let x = {
        name: name,
        date: date,
        reason, reason,
      }
      ret.push(x);
    }
  } catch (error) {
    console.error('Error while fetching AustinHighSchoolAbsences', error);
  }
 

  return ret;
}

const AbsenceCard = props => {
  const name = props.name;
  const date = moment(props.date, "YYYYMMDD").format('MM/DD/YYYY');
  const reason = props.reason;

  return (
    <Card style={styles.absenceCard}>
      <Card.Title
        title={"Person: " + name}
      />
      <Card.Content>
        <Text>Date: {date}</Text>
        <Text>Reason: {reason}</Text>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  subLayout: {
    margin: 10,
    marginTop: 0,
  },
  errorText: {
    color: 'red',
  },
  button: {
    alignSelf: 'center',
  },
  absenceCard: {
    margin: 10,
  },
});
