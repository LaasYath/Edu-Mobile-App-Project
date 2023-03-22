import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export const AboutScreen = props => {
  return (
    <ScrollView contentContainerStyle={styles.layout}>
      <Text style={styles.text} variant={'bodyLarge'}>EduMedia is an app that connects parents, students, and teachers. Browse clubs offered at your school,
        view announcements from teachers, and view club and school events on the calendar screen. We hope
        you'll find everything you need!
      </Text>
      <Text style={styles.text} variant={'bodyLarge'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Faucibus purus in massa tempor nec feugiat. Pellentesque dignissim enim sit amet venenatis urna cursus. Maecenas ultricies mi eget mauris pharetra et. Aliquet nibh praesent tristique magna sit amet. Eu feugiat pretium nibh ipsum consequat. Ligula ullamcorper malesuada proin libero nunc consequat. Lectus urna duis convallis convallis. Vel pretium lectus quam id leo in. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. Cras adipiscing enim eu turpis egestas pretium. Nibh cras pulvinar mattis nunc sed. Lacinia quis vel eros donec. Pharetra massa massa ultricies mi quis hendrerit.
      </Text>
      <Text style={styles.text} variant={'bodyLarge'}>Sagittis orci a scelerisque purus semper eget duis at tellus. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. Tortor vitae purus faucibus ornare suspendisse sed. Vel facilisis volutpat est velit egestas. Senectus et netus et malesuada fames ac turpis egestas integer. Magna etiam tempor orci eu lobortis elementum. Pharetra massa massa ultricies mi quis. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Varius duis at consectetur lorem donec. Tristique risus nec feugiat in fermentum posuere. Quis auctor elit sed vulputate mi sit amet mauris commodo. Vitae ultricies leo integer malesuada nunc vel risus. Arcu felis bibendum ut tristique. Quam adipiscing vitae proin sagittis nisl rhoncus mattis. In cursus turpis massa tincidunt dui ut ornare lectus sit. Eu lobortis elementum nibh tellus molestie nunc non blandit massa. Nunc eget lorem dolor sed viverra ipsum nunc aliquet.
      </Text>
      <Text style={styles.text} variant={'bodyLarge'}>Et egestas quis ipsum suspendisse ultrices gravida. Augue interdum velit euismod in. Dis parturient montes nascetur ridiculus. Amet justo donec enim diam vulputate ut. Neque viverra justo nec ultrices dui. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Faucibus pulvinar elementum integer enim neque volutpat ac tincidunt vitae. Id nibh tortor id aliquet lectus proin nibh. Tempus iaculis urna id volutpat. Integer feugiat scelerisque varius morbi enim nunc faucibus a. Fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate. Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Maecenas ultricies mi eget mauris pharetra et ultrices neque. Donec adipiscing tristique risus nec feugiat. Nam aliquam sem et tortor consequat id porta. Enim ut sem viverra aliquet eget. Sollicitudin ac orci phasellus egestas tellus rutrum tellus.
      </Text>
      <Text style={styles.text} variant={'bodyLarge'}>Aenean euismod elementum nisi quis eleifend. Nec dui nunc mattis enim ut tellus elementum sagittis vitae. Suspendisse faucibus interdum posuere lorem ipsum dolor. Iaculis at erat pellentesque adipiscing. Bibendum est ultricies integer quis auctor elit sed. Nulla facilisi cras fermentum odio eu feugiat pretium nibh. Convallis posuere morbi leo urna. Vel turpis nunc eget lorem dolor. Morbi tincidunt augue interdum velit euismod in pellentesque massa. Egestas erat imperdiet sed euismod nisi porta lorem. Orci sagittis eu volutpat odio facilisis mauris sit amet. Neque egestas congue quisque egestas diam. Lobortis scelerisque fermentum dui faucibus. Sit amet risus nullam eget felis eget nunc lobortis. Massa eget egestas purus viverra accumsan in nisl nisi scelerisque. Sed risus ultricies tristique nulla aliquet. Enim nulla aliquet porttitor lacus luctus accumsan tortor.
      </Text>
      <Text style={[styles.text, styles.creditText]} variant={'bodyMedium'}> Made By: Marcus A. and Laasya Y.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  layout: {
    padding: 20,
  },
  text: {
    
  },
  creditText: {
    paddingTop: 50,
  }
});