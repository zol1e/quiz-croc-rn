import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnswerInput from "./components/AnswerInput";
import AnswerList from "./components/AnswerList";
import Countdown from "./components/Countdown";
import Scoreboard from "./components/Scoreboard";
import { GameEvent, GameState } from "./types/game-event";
import { GameMessage, GameMessageType } from "./types/game-message";

export default function Game() {
  const { gameId, playerId, create } = useLocalSearchParams<{ gameId?: string; playerId?: string; create?: string }>();

  const isMasterPlayer = create === "true";

  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [previousGameEvent, setPreviousGameEvent] = useState<GameEvent | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const socketRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    if (!gameId) return null;
    return `ws://localhost:8787/game/${gameId}/ws`;
  }, [gameId]);

  useEffect(() => {
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setReadyState(socket.readyState);

    socket.onopen = () => {
      setReadyState(socket.readyState);
      if (playerId && gameId) {
        const joinMessage = new GameMessage(GameMessageType.JOIN, playerId, gameId);
        socket.send(JSON.stringify(joinMessage));
      }
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setGameEvent((prev) => {
          setPreviousGameEvent(prev ?? null);
          return parsed as GameEvent;
        });
      } catch (err) {
        console.warn("Failed to parse game event", err);
      }
    };

    socket.onerror = () => {
      setReadyState(socket.readyState);
    };

    socket.onclose = () => {
      setReadyState(socket.readyState);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [wsUrl, playerId, gameId]);

  useEffect(() => {
    if (gameEvent?.gameState === GameState.QUESTION) {
      if (previousGameEvent?.gameState !== GameState.QUESTION) {
        const questionMillis = gameEvent.currentQuestion?.timeMillis ?? 20000;
        setSecondsLeft(Math.ceil(questionMillis / 1000));
      }
    } else {
      setSecondsLeft(0);
    }
  }, [gameEvent, previousGameEvent]);

  const sendMessageSafe = (payload: GameMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  function answerQuestion(answerText: string) {
    if (!playerId || !gameId) return;
    const message = new GameMessage(
      GameMessageType.ANSWER,
      playerId,
      gameId,
      gameEvent?.currentQuestion?.id ?? null,
      answerText
    );
    sendMessageSafe(message);
  }

  function onNextQuestionClicked() {
    if (!playerId || !gameId) return;
    const message = new GameMessage(GameMessageType.NEXT_QUESTION, playerId, gameId);
    sendMessageSafe(message);
  }

  const isConnecting = readyState === WebSocket.CONNECTING;
  const isOpen = readyState === WebSocket.OPEN;
  const isClosing = readyState === WebSocket.CLOSING;
  const isClosed = readyState === WebSocket.CLOSED;

  const showNextQuestionButton =
    isMasterPlayer &&
    gameEvent?.gameState !== GameState.QUESTION &&
    gameEvent?.gameState !== GameState.FINISH;

  if (!gameId || !playerId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>Missing game info</Text>
        <Text style={styles.subtle}>Both gameId and playerId are required.</Text>
      </View>
    );
  }

  if (!isOpen && isConnecting) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>Connecting to game...</Text>
        <Text style={styles.subtle}>Please wait while we establish the connection.</Text>
        <ActivityIndicator style={{ marginTop: 16 }} size="large" color="#2563eb" />
      </View>
    );
  }

  if (isClosing || isClosed) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.heading, { color: "#dc2626" }]}>Connection lost</Text>
        <Text style={styles.subtle}>Unable to connect to the game server. Please retry.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => socketRef.current?.close()}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        {gameEvent?.topic ? (
          <Text style={styles.title}>{gameEvent.topic}</Text>
        ) : (
          <ActivityIndicator size="small" color="#2563eb" />
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Player: {playerId || "missing"}</Text>
          <Text style={styles.infoText}>Game ID: {gameEvent?.gameId || gameId || "missing"}</Text>
        </View>
      </View>

      {showNextQuestionButton && (
        <TouchableOpacity
          style={[styles.primaryButton, !isOpen && styles.disabled]}
          onPress={onNextQuestionClicked}
          disabled={!isOpen}
        >
          <Text style={styles.primaryButtonText}>Next question</Text>
        </TouchableOpacity>
      )}

      {gameEvent?.gameState === GameState.FINISH && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Final result</Text>
          <Scoreboard gameEvent={gameEvent} />
        </View>
      )}

      <View style={styles.card}>
        <Countdown gameEvent={gameEvent} secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} />
        <Text style={styles.questionText}>{gameEvent?.lastQuestion?.text || "Waiting for question..."}</Text>
      </View>

      <View style={styles.card}>
        <AnswerInput answerQuestion={answerQuestion} gameEvent={gameEvent} />
      </View>

      <View style={styles.card}>
        <AnswerList gameEvent={gameEvent} playerId={playerId || ""} />
      </View>

      {gameEvent?.gameState !== GameState.FINISH && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Score</Text>
          <Scoreboard gameEvent={gameEvent} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: "white",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    backgroundColor: "white",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtle: {
    color: "#6b7280",
    textAlign: "center",
  },
  headerCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#0f172a",
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  card: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
