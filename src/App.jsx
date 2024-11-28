import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FaSun, FaMoon, FaPaperPlane, FaTimes } from "react-icons/fa";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [partnerName, setPartnerName] = useState(null);
  const [showHiSuggestion, setShowHiSuggestion] = useState(false);
  const [theme, setTheme] = useState("light");
  const messagesEndRef = useRef(null);

  // Dark mode toggle and setting the class on body
  useEffect(() => {
    document.body.className =
      theme === "dark" ? "bg-blue-900 text-white" : "bg-blue-100 text-blue-900";
  }, [theme]);

  // Handling WebSocket connections
  useEffect(() => {
    if (!ws) return;

    const handleOpen = () => {
      ws.send(JSON.stringify({ type: "join", username, gender }));
    };

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "matched") {
        setPartnerName(message.partnerName);
        setShowHiSuggestion(true);
      } else if (message.type === "message") {
        setMessages((prev) => [...prev, { sender: message.sender, content: message.content }]);
      }
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);

    return () => {
      ws.close();
    };
  }, [ws, username, gender]);

  // Scroll to the bottom of chat whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to start chat
  const startChat = () => {
    if (username.trim()) {
      const socket = new WebSocket("ws://localhost:5000");
      setWs(socket);
      setIsChatting(true);
    } else {
      alert("Please enter your name!");
    }
  };

  // Function to send message
  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "message", content: message }));
      setMessages((prev) => [...prev, { sender: "You", content: message }]);
    }
  };

  // Handle message submission from input
  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = e.target.message.value.trim();
    if (message) {
      sendMessage(message);
      e.target.message.value = "";
    }
  };

  // Handling "Hi" suggestion message
  const handleHiSuggestion = () => {
    sendMessage("Hi!");
    setShowHiSuggestion(false);
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // End chat function
  const endChat = () => {
    setMessages([]);
    setPartnerName(null);
    setIsChatting(false);
    setShowHiSuggestion(false);
  };

  // Switch pages (Home to Text Chat, etc.)
  const goToPage = (page) => {
    setCurrentPage(page);
    setUsername("");
    setIsChatting(false);
    setMessages([]);
    setPartnerName(null);
  };

  // Gender-specific icon
  const genderIcon = gender === "male" ? "/path/to/male-icon.svg" : "/path/to/female-icon.svg";

  // Handle page rendering for home or chat interface
  if (currentPage === "home") {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          theme === "dark" ? "bg-blue-900 text-white" : "bg-blue-100 text-blue-900"
        }`}
      >
        <h1 className="text-4xl font-bold mb-8">Welcome to Chat App</h1>
        <div className="space-x-4">
          <button
            onClick={() => goToPage("textChat")}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Text Chat
          </button>
          <button
            onClick={() => alert("Video Chat: Coming Soon!")}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Video Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen ${
        theme === "dark" ? "bg-blue-900 text-white" : "bg-blue-100 text-blue-900"
      }`}
    >
      <div
        className={`w-1/3 max-w-md p-6 flex flex-col items-center ${
          theme === "dark" ? "bg-blue-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex justify-between w-full mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Chat App</h1>
          <button onClick={toggleTheme} className="text-xl focus:outline-none">
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        {/* Gender selection */}
        <div className="mb-4">
          <label className="mr-4">Select Gender:</label>
          <label>
            <input
              type="radio"
              value="male"
              checked={gender === "male"}
              onChange={() => setGender("male")}
            />
            Male
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="female"
              checked={gender === "female"}
              onChange={() => setGender("female")}
            />
            Female
          </label>
        </div>

        {!isChatting ? (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={startChat}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-4"
            >
              Start Chat
            </button>
          </>
        ) : (
          <h2 className="text-2xl font-semibold text-center">
            Chatting with {partnerName || "Matching..."}
          </h2>
        )}
      </div>

      {/* Chat Box */}
      <div className="flex-1 p-6 flex flex-col">
        {isChatting && (
          <>
            <div
              className="flex-grow overflow-y-auto p-4 mb-4 bg-white rounded-lg flex flex-col-reverse"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === "You" ? "text-right text-blue-600" : "text-left text-gray-800"
                  }`}
                >
                  <span className="block font-semibold">{msg.sender}:</span>
                  <span className="block">{msg.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              {showHiSuggestion && (
                <button
                  onClick={handleHiSuggestion}
                  className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700"
                >
                  Say Hi
                </button>
              )}
              <input
                type="text"
                name="message"
                placeholder="Type your message"
                className="flex-grow p-2 border rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaPaperPlane className="mr-2" />
                Send
              </button>
              <button
                type="button"
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center"
                onClick={endChat}
              >
                <FaTimes className="mr-2" />
                End
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
