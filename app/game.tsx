import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Game() {
    const { gameId } = useLocalSearchParams();
    return (
        <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: 'white',
        }}
        >
        <Text>Game page {gameId}</Text>
        </View>
    );
}
