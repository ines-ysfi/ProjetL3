import { useMemo, useState } from "react";
import { sendChatMessage } from "../services/chatService";
import "../styles/ChatSection.css";

export default function ChatSection({
  user,
  selectedModule,
  question,
  setQuestion,
  onSuggestionClick,
  role,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const suggestions = selectedModule.suggestions || [];

  const moduleMessages = useMemo(() => {
    return messages.filter((message) => {
      return String(message.moduleId) === String(selectedModule.id);
    });
  }, [messages, selectedModule.id]);

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const messageTimestamp = Date.now();
    const moduleId = String(selectedModule.id);
    const userMessage = {
      id: `${moduleId}-${messageTimestamp}-user`,
      sender: "user",
      text: trimmedQuestion,
      moduleId,
      moduleName: selectedModule.nom,
      role,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await sendChatMessage({
        utilisateurId: user.id,
        moduleId: selectedModule.id,
        question: trimmedQuestion,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${moduleId}-${messageTimestamp}-assistant`,
          sender: "assistant",
          text: response.reponse,
          moduleId,
          moduleName: selectedModule.nom,
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${moduleId}-${messageTimestamp}-error`,
          sender: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Impossible d'obtenir une réponse.",
          moduleId,
          moduleName: selectedModule.nom,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = moduleMessages.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const canSend = !loading && question.trim().length > 0;

  return (
    <section className="chat-section">
      {!hasMessages ? (
        <div className="chat-empty-state">
          <p className="chat-subtitle">
            Posez une question pour
            <br />
            commencer
          </p>

          <div className="question-box">
            <input
              type="text"
              placeholder="Poser une question"
              className="question-input"
              value={question}
              aria-busy={loading}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!canSend}
            >
              ➤
            </button>
          </div>

          {loading ? (
            <p className="chat-status pending">Réponse en cours...</p>
          ) : null}

          {hasSuggestions ? (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <p key={index} onClick={() => onSuggestionClick(suggestion)}>
                  {suggestion}
                </p>
              ))}
            </div>
          ) : (
            <p className="chat-empty-note">
              Aucune suggestion disponible.
            </p>
          )}
        </div>
      ) : (
        <div className="chat-active-state">
          <div className="chat-messages">
            <div className="chat-messages-inner">
              {moduleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${
                    message.sender === "user" ? "user" : "assistant"
                  }`}
                >
                  <div className="message-stack">
                    <div
                      className={`message-bubble ${
                        message.sender === "user" ? "user" : "assistant"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="question-box chat-bottom-input">
            <input
              type="text"
              placeholder="Poser une question"
              className="question-input"
              value={question}
              aria-busy={loading}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!canSend}
            >
              ➤
            </button>
          </div>

          {loading ? (
            <p className="chat-status pending">Réponse en cours...</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
