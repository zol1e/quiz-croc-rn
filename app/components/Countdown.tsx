import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GameEvent, GameState } from "../types/game-event";

type CountdownProps = {
  secondsLeft: number;
  setSecondsLeft: (value: number) => void;
  gameEvent: GameEvent | null;
};

export default function Countdown({ secondsLeft, setSecondsLeft, gameEvent }: CountdownProps) {
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    if (secondsLeft > 0 && gameEvent?.gameState === GameState.QUESTION) {
      setShowTime(true);
      const timer = setTimeout(() => {
        if (secondsLeft > 0 && gameEvent?.gameState === GameState.QUESTION) {
          setSecondsLeft(secondsLeft - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    setShowTime(false);
    return undefined;
  }, [secondsLeft, gameEvent?.gameState, setSecondsLeft]);

  if (!showTime) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{secondsLeft} sec</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f97316",
    alignSelf: "flex-start",
  },
  time: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
