import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Box, Button, TextField, CircularProgress } from "@mui/material";

const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [url, setUrl] = useState(""); 
  const initialized = useRef(false);

  const sendAudioData = async () => {
    try {
      if (initialized.current) return;

      setLoading(true);
      initialized.current = true;

      const eventSource = new EventSource(
        `http://localhost:5000/generate_lip_sync?url=${encodeURIComponent(url)}`
      );

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

      eventSource.addEventListener("open", () => {
        setLoading(false);
      });

      return () => eventSource.close();
    } catch (error) {
      console.error("Failed to fetch lip sync data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[messages.length - 1]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendAudioData(); 
  };

  return (
    <SpeechContext.Provider value={{ message, loading }}>
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {children}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            bottom: 20,
            left: 0,
            right: 0,
            padding: "10px",
            backgroundColor: "white",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            label="Enter URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ marginRight: "10px" }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !url}
          >
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </Box>
      </Box>
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
