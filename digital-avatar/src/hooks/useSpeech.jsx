import { createContext, useContext, useEffect, useState, useRef } from "react";

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const initialized = useRef(false);

  const sendAudioData = async () => {
    try {
      if (initialized.current) return; 

      setLoading(true);
      initialized.current = true; 

      const eventSource = new EventSource("http://localhost:5000/generate_lip_sync");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: data.text,
            facialExpression: data.facialExpression,
            animation: data.animation,
            audio: data.audio,
            lipsync: data.lipsync,
          },
        ]);
      };

      eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        eventSource.close();
        setLoading(false);
      };

      eventSource.addEventListener('open', () => {
        setLoading(false);
      });

      return () => eventSource.close(); 

    } catch (error) {
      console.error("Failed to fetch lip sync data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    sendAudioData();
  }, []); // Only run once on mount

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[messages.length - 1]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <SpeechContext.Provider
      value={{
        message,
        loading,
        sendAudioData,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
