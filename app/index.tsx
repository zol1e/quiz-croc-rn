import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Input } from 'react-native-elements';

export default function Index() {
  const router = useRouter();

  const [playerId, setPlayerId] = useState('');
  const [gameId, setGameId] = useState('');
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!topic.trim()) {
      Alert.alert('Topic required', 'Please enter a topic to create a game.');
      return;
    }

    setIsCreating(true);

    try {
      const url = `http://localhost:8787/game/create?topic=${encodeURIComponent(topic.trim())}`;
      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Create failed (${response.status})`);
      }

      const contentType = response.headers.get('content-type');
      let createdGameId: string | undefined;

      if (contentType?.includes('application/json')) {
        const payload = await response.json();
        createdGameId = payload?.gameId ?? payload?.id ?? payload?.game?.id;
      } else {
        const text = (await response.text())?.trim();
        createdGameId = text || undefined;
      }

      if (!createdGameId) {
        throw new Error('gameId missing in response');
      }

      setGameId(createdGameId);

      router.push({
        pathname: '/game',
        params: { gameId: createdGameId, playerId, create: 'true' },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create game';
      const corsNote = Platform.OS === 'web'
        ? '\nIf this shows as a CORS error, add http://localhost:8081 (and your deployed origins) to Access-Control-Allow-Origin on the Worker.'
        : '';
      Alert.alert('Create game failed', `${message}${corsNote}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = () => {
    router.push({
      pathname: '/game',
      params: { gameId, playerId, create: 'false' },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Input label="Nickname" value={playerId} onChangeText={setPlayerId} />
        <Input 
          value={topic} onChangeText={setTopic}
          label="Topic"
          placeholder='Friends series, quantum physics etc. You can write a longer description of the topic.'
        />
        <Pressable style={[styles.button, isCreating && styles.buttonDisabled]} onPress={handleCreate} disabled={isCreating}>
          <Text style={styles.buttonText}>{isCreating ? 'Creating...' : 'Create game'}</Text>
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
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
