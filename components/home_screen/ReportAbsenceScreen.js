import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

export const ReportAbsenceScreen = props => {
  const [dateTxt, setDateTxt] = useState(moment().format("YYYY-MM-DD"));
  const [reasonTxt, setReasonTxt] = useState("");
  const [errorTxt, setErrorTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onDateChange = (date) => {
    setDateTxt(date.format("YYYY-MM-DD"));
  }
  
  // TODO: Implement async onSubmit() for reporting absences
  const onSubmit = async () => {
    setIsLoading(true);

    if (!dateTxt || !reasonTxt) {
      setErrorTxt("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    await new Promise(res => setTimeout(() => res(), 2000));

    console.log(`Absence Reported:\n` +
                ` Date: ${dateTxt}\n` +
                ` Reason: ${reasonTxt}`); 
    setDateTxt("");
    setReasonTxt("");
    setIsLoading(false);
    alert("Your report has been sent.");
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
  }
});
