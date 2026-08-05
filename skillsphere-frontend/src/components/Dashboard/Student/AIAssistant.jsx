import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AIService from '../../../services/AIService';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your SkillSphere AI Study Assistant. Ask me anything about your current courses, programming questions, or career planning. I can generate code snippets or explain complex topics!', time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const bottomRef = useRef(null);

  const suggestions = [
    'Explain React useEffect hooks',
    'How does Spring Boot JPA mapping work?',
    'Give me a CSS grid snippet for a responsive catalog',
    'What is the difference between SQL and MongoDB?'
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await AIService.chat(textToSend, conversationId);
      
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      const aiMsg = {
        sender: 'ai',
        text: response.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      let rawText = 'Sorry, I encountered an error. Please try again later.';
      if (typeof error === 'string') {
        rawText = error;
      } else if (typeof error?.message === 'string') {
        rawText = error.message;
      } else if (typeof error?.response?.data === 'string') {
        rawText = error.response.data;
      } else if (typeof error?.response?.data?.message === 'string') {
        rawText = error.response.data.message;
      }

      const errorMsg = {
        sender: 'ai',
        text: rawText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">AI Study Assistant</h2>
        <p className="text-muted">Get immediate answers, debugging help, and learning guides compiled from your syllabus.</p>
      </div>

      <div className="row g-4">
        {/* Chat Feed Column */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column" style={{ height: '550px', background: 'white', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4">🤖</span>
                <div>
                  <h5 className="fw-bold text-dark mb-0">SkillSphere AI Tutor</h5>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>Active Online</span>
                </div>
              </div>
              <button className="btn btn-outline-danger btn-sm rounded-pill fw-bold" onClick={() => {
                setMessages([{ sender: 'ai', text: 'Hello! I am your SkillSphere AI Study Assistant. Ask me anything about your current courses, programming questions, or career planning. I can generate code snippets or explain complex topics!', time: 'Just now' }]);
                setConversationId(null);
              }}>
                Reset Conversation
              </button>
            </div>

            <div className="p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3" style={{ background: '#fcfdfd' }}>
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-4 msg-bubble ${m.sender === 'user' ? 'msg-student' : 'msg-mentor align-self-start'}`} style={{ maxWidth: '85%' }}>
                  <div className="small fw-bold mb-1 opacity-75">{m.sender === 'user' ? 'You' : 'AI Assistant'}</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {m.sender === 'ai' ? (
                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={tomorrow}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {m.text}
                      </Markdown>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    )}
                  </div>
                  <div className="text-end small mt-1 opacity-75" style={{ fontSize: '0.6rem' }}>{m.time}</div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator msg-mentor align-self-start">
                  <span>AI Tutor is preparing explanation...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="p-3 border-top bg-white d-flex gap-2"
            >
              <input
                type="text"
                className="form-control rounded-pill px-4"
                placeholder="Ask a question about programming, SQL, design patterns..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit" 
                className="btn btn-success rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: '44px', height: '44px', flexShrink: 0 }}
                disabled={isTyping || !input.trim()}
              >
                <i className="bi bi-send-fill text-white fs-6"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Suggestion Chips and Context panel */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-chat-heart text-success me-2"></i>Quick Prompts</h5>
            <p className="text-muted small">Click any prompt card below to send it directly to the AI study assistant.</p>
            <div className="d-flex flex-column gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="btn btn-outline-success text-start rounded-3 py-2 px-3 small border-success-subtle fw-semibold transition-all hover-translate"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => handleSend(s)}
                  disabled={isTyping}
                >
                  <i className="bi bi-patch-question me-2"></i> {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'linear-gradient(135deg, #0d4a3a, #166534)' }}>
            <h5 className="fw-bold mb-2">🎓 Syllabus Synced</h5>
            <p className="mb-0 small text-white-50" style={{ lineHeight: '1.4' }}>
              Your tutor has full context of your enrolled courses (Full-Stack, AI, UI/UX). It will prioritize templates, databases, and frameworks listed in your student curriculum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
