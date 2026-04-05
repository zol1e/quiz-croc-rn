import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GameEvent, GameState } from "../types/game-event";

type AnswerListProps = {
  gameEvent: GameEvent | null;
  playerId: string;
};

export default function AnswerList({ gameEvent, playerId }: AnswerListProps) {
  const playerAnswers = useMemo(() => gameEvent?.lastQuestion?.playerAnswers ?? null, [gameEvent]);

  if (!playerAnswers) {
    return null;
  }

  const entries = Object.entries(playerAnswers);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Answers</Text>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText, styles.playerCol]}>Player</Text>
        <Text style={[styles.cell, styles.headerText, styles.timeCol]}>Time (s)</Text>
        <Text style={[styles.cell, styles.headerText, styles.answerCol]}>Answer</Text>
      </View>

      {entries.map(([answerPlayerId, { answer, timeSpentMillis }]) => {
        const timeSeconds = (timeSpentMillis ?? 0) / 1000;
        const isVisible = gameEvent?.gameState !== GameState.QUESTION || answerPlayerId === playerId;

        return (
          <View key={answerPlayerId} style={styles.row}>
            <Text style={[styles.cell, styles.playerCol]} numberOfLines={1} ellipsizeMode="tail">
              {answerPlayerId}
            </Text>
            <Text style={[styles.cell, styles.timeCol]}>{timeSeconds.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.answerCol]}>
              {isVisible ? answer : "?"}
            </Text>
          </View>
        );
      })}
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
    flex: 1.2,
  },
  timeCol: {
    flex: 0.7,
  },
  answerCol: {
    flex: 1,
  },
});
