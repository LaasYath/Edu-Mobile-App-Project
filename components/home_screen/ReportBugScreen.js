import { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export const ReportBugScreen = props => {
  const [locationText, setLocationText] = useState(""); 
  const [descText, setDescText] = useState(""); 
  const [errorText, setErrorText] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!locationText || !descText) {
      setErrorText("Please in all fields.")
      return;
    }

    const newBug = new Parse.Object('ReportedBugs');
    newBug.set('date', new Date());
    newBug.set('location', locationText);
    newBug.set('description', descText);
    newBug.set('class', global.school);
    newBug.set('objID', global.id);
    try {
      const result = await newBug.save();
      // Access the Parse Object attributes using the .GET method
      console.log('ReportedBugs created', result);
      return new Promise(res => setTimeout(() => {
        console.log(`Bug Report Submitted:\n` +
                    `Location: ${locationText}\n` +
                    `Description: ${descText}`);
        setErrorText("");
        alert("Your report has been sent.")
        setLocationText("");
        setDescText("");
        setIsLoading(false);
        return;
      }, 1000));
    } catch (error) {
      console.error('Error while creating ReportedBugs: ', error);
      return new Promise(res => setTimeout(() => {
        setErrorText("Something went wrong. Please try again");
        setIsLoading(false);
        return;
      }, 1000));
    }
  }

  return (
    <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? "padding" : null}>
      <ScrollView style={styles.layout}>
        <Text style={styles.title} variant={'displayLarge'}>Report Bug</Text>
        <TextInput 
          label={'Location of Problem'}
          value={locationText}
          onChangeText={text => setLocationText(text)}
        />
        <TextInput 
          label={'Description of Problem'}
          value={descText}
          onChangeText={text => setDescText(text)}
          multiline
        />
        <Text style={[styles.errorText, (errorText) ? { paddingVertical: 10 } : null]}>
          {errorText}
        </Text>
        <Button
          mode={'contained'}
          loading={isLoading}
          onPress={async () => {
            setIsLoading(true);
            await onSubmit();

            setIsLoading(false);
          }}
        >
          Submit Bug Report
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  layout: {
    marginHorizontal: 10,
  },
  title: {
    alignSelf: 'center',
    margin: 20,
  },
  errorText: {
    color: 'red',
  }
});