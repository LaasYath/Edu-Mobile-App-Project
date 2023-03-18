import { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export const ReportBugScreen = props => {
  const [locationText, setLocationText] = useState(""); 
  const [descText, setDescText] = useState(""); 
  const [errorText, setErrorText] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implement async onSubmit()
  const onSubmit = async () => {
    if (!locationText || !descText) {
      setErrorText("Please in all fields.")
      return;
    }

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