import { createContext, useContext, useEffect, useState } from "react";

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const sendAudioData = async (text) => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/generate_lip_sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text, 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

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

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch lip sync data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    sendAudioData("This is a test message.");
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
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
