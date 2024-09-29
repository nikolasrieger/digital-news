import { createContext, useContext, useEffect, useState } from "react";

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();

  const sendAudioData = async () => {
    const audioFileToBase64 = async ({ fileName }) => {
      console.log(`public/audio.wav`);
      const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result.split(",")[1];
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    let audio = await audioFileToBase64("audio.mp3");
    const readJsonTranscript = async ({ fileName }) => {
      const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
      const data = await response.json();
      return data;
    };
    
    let lipsync = await readJsonTranscript({ fileName: `output.json` });

    // Example simulated response (you can modify this based on your needs)
    const simulatedResponse = [
      { text: "This is a test message.", facialExpression: "smile", animation: "Talking-1", audio, lipsync },
      { text: "This is another message.", facialExpression: "default", animation: "Talking-2", audio, lipsync },
    ];
    
    setLoading(true);
    setMessages((prevMessages) => [...prevMessages, ...simulatedResponse]);
    setLoading(false);
  };

  useEffect(() => {
    sendAudioData(); // Call this function to initially load audio and transcripts
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
        setMessages, // Expose setMessages for adding new messages
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
