import React, { useState, useEffect } from 'react';
import '../style/ChatDashboard.css';

const API_URL = 'http://localhost:5001/api';

const ChatDashboard = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token') || '';
  const userRole = user?.role || 'student';

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chats, setChats] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    console.log('ChatDashboard mount - Token:', token, 'User:', user);
    
    if (!token || token.trim() === '') {
      console.log('No valid token, cannot proceed');
      setError('Session expired. Please login again.');
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
      return;
    }
    fetchChatList();
  }, []);

  const fetchChatList = async () => {
    try {
      const chatRole = userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'student';
      const response = await fetch(`${API_URL}/chat/list/${chatRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
          if (data.chats.length > 0) {
            setSelectedChat(data.chats[0].id);
            fetchMessages(data.chats[0].id);
          }
        }
      } else {
        console.error('Failed to fetch chat list:', response.status);
        setError('Failed to load chats');
      }
    } catch (err) {
      console.error('Error fetching chat list:', err);
      setError('Error loading chats');
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/chat/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatMessages(prev => ({
            ...prev,
            [chatId]: {
              messages: data.messages
            }
          }));
        }
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!selectedChat) return;

    const pollInterval = setInterval(() => {
      fetchMessages(selectedChat);
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [selectedChat, token]);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !attachedFile && !recordedAudio) || !selectedChat) return;

    setLoading(true);
    setError('');

    try {
      const messagePayload = {
        chatId: selectedChat,
        text: messageInput,
        sender: user.name || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
        avatar: userRole === 'admin' ? '👤' : userRole === 'teacher' ? '👨‍🏫' : '👨‍🎓',
        file: attachedFile ? {
          name: attachedFile.name,
          type: attachedFile.type,
          size: attachedFile.size,
          data: attachedFile.data
        } : null,
        voice: recordedAudio ? {
          data: recordedAudio.data,
          duration: recordedAudio.duration
        } : null
      };

      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messagePayload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccessMessage('Message sent!');
          setMessageInput('');
          setAttachedFile(null);
          setRecordedAudio(null);
          
          await fetchMessages(selectedChat);
          
          setTimeout(() => setSuccessMessage(''), 2000);
        }
      } else {
        setError('Failed to send message');
        console.error('Send message error:', response.status);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSize = file.size / 1024 / 1024;
    if (fileSize > 50) {
      setError('File size must be less than 50MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: fileSize.toFixed(2),
        data: event.target?.result
      };
      setAttachedFile(fileData);
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({ data: audioUrl, duration: recordingTime });
        setIsRecording(false);
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      setError('Microphone access denied.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const sendVoiceMessage = async () => {
    if (!recordedAudio || !selectedChat) return;

    setLoading(true);
    setError('');

    try {
      const messagePayload = {
        chatId: selectedChat,
        text: `Voice message (${formatTime(recordedAudio.duration)})`,
        sender: user.name || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
        avatar: userRole === 'admin' ? '👤' : userRole === 'teacher' ? '👨‍🏫' : '👨‍🎓',
        voice: {
          data: recordedAudio.data,
          duration: recordedAudio.duration
        }
      };

      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messagePayload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecordedAudio(null);
          setSuccessMessage('Voice message sent!');
          
          await fetchMessages(selectedChat);
          
          setTimeout(() => setSuccessMessage(''), 2000);
        }
      } else {
        setError('Failed to send voice message');
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('Error sending voice message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  };

  const currentChat = chatMessages[selectedChat];

  return (
    <div className="chat-dashboard">
      {/* Header */}
      <header className="chat-header-top">
        <div className="header-left">
          <h1>Chat - {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</h1>
          <p>{user?.name || 'User'}</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="chat-main">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-list-header">
            <h3>Chats</h3>
          </div>
          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChat(chat.id);
                  fetchMessages(chat.id);
                }}
              >
                <div className="chat-avatar">{chat.avatar || '💬'}</div>
                <div className="chat-info">
                  <h4>{chat.name}</h4>
                  <p>{chat.type === 'group' ? `${chat.members} members` : 'Personal'}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="chat-content">
          {selectedChat && currentChat ? (
            <>
              {/* Messages Display */}
              <div className="messages-container">
                {currentChat.messages && currentChat.messages.length > 0 ? (
                  currentChat.messages.map((msg) => (
                    <div key={msg.id} className="message">
                      <div className="message-avatar">{msg.avatar}</div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">{msg.sender}</span>
                          <span className="message-time">{msg.timestamp}</span>
                        </div>
                        {msg.text && <p className="message-text">{msg.text}</p>}
                        
                        {/* File Display */}
                        {msg.file && (
                          <div className="message-file">
                            <span className="file-name">📎 {msg.file.name}</span>
                            <a href={msg.file.data} download={msg.file.name} className="download-btn">
                              Download
                            </a>
                          </div>
                        )}

                        {/* Voice Message Display */}
                        {msg.voice && (
                          <div className="message-voice">
                            <audio controls>
                              <source src={msg.voice.data} type="audio/mp3" />
                              Your browser does not support the audio element.
                            </audio>
                            <span className="voice-duration">{formatTime(msg.voice.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="message-input-area">
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {/* Attached File Preview */}
                {attachedFile && (
                  <div className="attached-file-preview">
                    <span>📎 {attachedFile.name}</span>
                    <button onClick={() => setAttachedFile(null)}>✕</button>
                  </div>
                )}

                {/* Voice Recording Display */}
                {recordedAudio && (
                  <div className="recorded-audio-preview">
                    <audio controls src={recordedAudio.data} />
                    <button onClick={() => setRecordedAudio(null)}>✕</button>
                  </div>
                )}

                {isRecording && (
                  <div className="recording-indicator">
                    🎙️ Recording... {formatTime(recordingTime)}
                  </div>
                )}

                {/* Input Controls */}
                <div className="input-controls">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <div className="action-buttons">
                    <label className="file-upload-btn" title="Upload File">
                      📎
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*,video/*,.pdf"
                        style={{ display: 'none' }}
                        disabled={loading}
                      />
                    </label>

                    {!recordedAudio ? (
                      <>
                        {!isRecording ? (
                          <button
                            className="voice-record-btn"
                            onClick={startRecording}
                            title="Start Recording"
                            disabled={loading}
                          >
                            🎙️
                          </button>
                        ) : (
                          <button
                            className="voice-stop-btn"
                            onClick={stopRecording}
                            title="Stop Recording"
                            disabled={loading}
                          >
                            ⏹️
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="voice-send-btn"
                        onClick={sendVoiceMessage}
                        disabled={loading}
                      >
                        Send Voice 🎤
                      </button>
                    )}

                    <button
                      className="send-msg-btn"
                      onClick={handleSendMessage}
                      disabled={loading || (!messageInput.trim() && !attachedFile && !recordedAudio)}
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
