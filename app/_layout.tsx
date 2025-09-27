import { Image } from 'expo-image';
import { Stack } from "expo-router";
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack 
        screenOptions={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: 'transparent'
          },
          headerBackground: () => (
              <View style={styles.headerContainer}>
                <Image source={require('@/assets/images/krok1.gif')} style={styles.headerImage}/>
              </View>
          ),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerImage: {
    alignContent: 'center', 
    width: '80%', 
    height: '100%', 
    resizeMode: 'contain'
  }
});
