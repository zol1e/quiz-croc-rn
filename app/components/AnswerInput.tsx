import { useCallback, useMemo, useState } from "react";
import { Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GameEvent, GameState } from "../types/game-event";

type AnswerProps = {
  answerQuestion: (value: string) => void;
  gameEvent: GameEvent | null;
};

export default function AnswerInput({ answerQuestion, gameEvent }: AnswerProps) {
  const [answer, setAnswer] = useState("");

  const alternativeAnswers = useMemo(() => {
    const raw: unknown = gameEvent?.currentQuestion?.alternativeAnswers;
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === "string") {
      return raw
        .split(";")
        .map((s: string) => s.trim())
        .filter((s: string) => Boolean(s));
    }
    return [] as string[];
  }, [gameEvent?.currentQuestion?.alternativeAnswers]);

  const hasAlternativeAnswers = alternativeAnswers.length > 0;

  const showCorrectAnswer = useMemo(
    () =>
      gameEvent?.gameState === GameState.BETWEEN_QUESTIONS ||
      gameEvent?.gameState === GameState.FINISH,
    [gameEvent?.gameState]
  );

  const handleSubmit = useCallback(() => {
    if (answer.trim().length === 0) return;
    answerQuestion(answer.trim());
  }, [answer, answerQuestion]);

  const handleOpenSource = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn("Failed to open source URL", err);
    }
  }, []);

  return (
    <View style={styles.wrapper}>
      {showCorrectAnswer && (
        <View style={styles.correctAnswerContainer}>
          <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
          <Text style={styles.correctAnswerValue}>{gameEvent?.lastQuestion?.correctAnswer}</Text>
          {!!gameEvent?.lastQuestion?.sourceUrl && (
            <TouchableOpacity
              style={styles.sourceLink}
              onPress={() => handleOpenSource(gameEvent.lastQuestion!.sourceUrl!)}
              accessibilityRole={Platform.OS === "web" ? "link" : undefined}
            >
              <Text style={styles.sourceLinkText}>Source 🔗</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {hasAlternativeAnswers ? (
        <View style={styles.choicesGrid}>
          {alternativeAnswers.map((buttonAnswer, index) => (
            <TouchableOpacity
              key={`${buttonAnswer}-${index}`}
              style={styles.choiceButton}
              onPress={() => answerQuestion(buttonAnswer)}
              accessibilityRole="button"
            >
              <Text style={styles.choiceText}>{buttonAnswer}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.numericRow}>
          <TextInput
            style={styles.numericInput}
            value={answer}
            onChangeText={setAnswer}
            keyboardType="numeric"
            inputMode="numeric"
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Your answer"
            placeholderTextColor="#888"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity style={styles.answerButton} onPress={handleSubmit} accessibilityRole="button">
            <Text style={styles.answerButtonText}>Answer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 12,
    paddingVertical: 8,
  },
  correctAnswerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  correctAnswerLabel: {
    fontWeight: "700",
  },
  correctAnswerValue: {
    fontWeight: "500",
  },
  sourceLink: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#eef2ff",
  },
  sourceLinkText: {
    color: "#4338ca",
    fontWeight: "600",
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
    minWidth: 120,
  },
  choiceText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  numericRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  numericInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  answerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#22c55e",
  },
  answerButtonText: {
    color: "white",
    fontWeight: "700",
  },
});
