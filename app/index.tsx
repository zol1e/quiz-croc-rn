import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Input } from 'react-native-elements';

export default function Index() {
  const router = useRouter();

  const [gameId, setGameId] = useState('');
  
  const handleJoin = () => {
    router.push({
      pathname: '/game',
      params: { gameId }, // not in URL, passed as navigation params
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Input label="Nickname" />
        <Input label="Nickname"
          placeholder='Friends series, quantum physics etc. You can write a longer description of the topic.'
        />
        <Pressable style={styles.button} onPress={handleJoin}>
          <Text style={styles.buttonText}>Create game</Text>
        </Pressable>
        
        <Input label="Game ID" value={gameId} onChangeText={setGameId} />
        <Pressable style={styles.button} onPress={handleJoin}>
          <Text style={styles.buttonText}>Join</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 600,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
