import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GameEvent } from "../types/game-event";

type ScoreboardProps = {
  gameEvent: GameEvent | null;
};

export default function Scoreboard({ gameEvent }: ScoreboardProps) {
  const sortedScores = useMemo(() => {
    const scores = gameEvent?.score ?? {};
    return Object.entries(scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  }, [gameEvent?.score]);

  if (sortedScores.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scoreboard</Text>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText, styles.playerCol]}>Player</Text>
        <Text style={[styles.cell, styles.headerText, styles.scoreCol]}>Score</Text>
      </View>
      {sortedScores.map(([playerId, score]) => (
        <View key={playerId} style={styles.row}>
          <Text style={[styles.cell, styles.playerCol]} numberOfLines={1} ellipsizeMode="tail">
            {playerId}
          </Text>
          <Text style={[styles.cell, styles.scoreCol]}>{score}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
    paddingVertical: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: "#cbd5e1",
  },
  cell: {
    color: "#0f172a",
  },
  headerText: {
    fontWeight: "700",
  },
  playerCol: {
    flex: 1,
  },
  scoreCol: {
    flex: 0.6,
    textAlign: "right",
  },
});
