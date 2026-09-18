import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AIService from '../../../services/AIService';

const INITIAL_SUGGESTIONS = [
  { category: 'Coding', icon: 'bi-code-slash', text: 'Explain React useEffect hooks and state management' },
  { category: 'GK & History', icon: 'bi-globe-americas', text: 'Who was the first President of India and what is its capital?' },
  { category: 'Science', icon: 'bi-lightbulb-fill', text: 'Explain how photosynthesis works in plants' },
  { category: 'Math', icon: 'bi-calculator-fill', text: 'Explain the quadratic formula ax² + bx + c = 0 with an example' },
  { category: 'Career & Writing', icon: 'bi-pencil-square', text: 'Draft a professional follow-up email after a tech job interview' },
  { category: 'Database', icon: 'bi-database-fill', text: 'What is the difference between SQL and NoSQL databases?' }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Hello! I am your **Enterprise Learning Platform AI Agent (ChatGPT Powered)**. Ask me anything — from complex programming, code debugging, and software architecture to General Knowledge (GK), science, mathematics, history, writing, and career planning!', 
      time: 'Just now' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activePrompts, setActivePrompts] = useState(INITIAL_SUGGESTIONS);
  const [lastAskedTopic, setLastAskedTopic] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to extract or predict follow-up prompts dynamically based on user message and AI response
  const predictFollowUpPrompts = (userQuery, aiResponseText) => {
    const extracted = [];
    
    // 1. Check if AI response contains structured follow-up questions under 'Suggested Next Questions' header
    if (aiResponseText && aiResponseText.includes('Suggested Next Questions')) {
      const lines = aiResponseText.split('\n');
      let inSection = false;
      for (const line of lines) {
        if (line.includes('Suggested Next Questions')) {
          inSection = true;
          continue;
        }
        if (inSection) {
          const clean = line.replace(/^[\s\-\*\d\.\:\#\💡\>]+/, '').trim();
          if (clean && clean.length > 5 && !clean.startsWith('#')) {
            extracted.push(clean);
          }
        }
      }
    }

    if (extracted.length >= 2) {
      return extracted.slice(0, 5).map(q => ({
        category: 'Next Step',
        icon: 'bi-lightbulb-fill',
        text: q
      }));
    }

    // 2. Fallback smart topic predictor based on query keywords
    const text = (userQuery + ' ' + (aiResponseText || '')).toLowerCase();

    if (text.includes('react') || text.includes('useeffect') || text.includes('hook') || text.includes('jsx')) {
      return [
        { category: 'React Hooks', icon: 'bi-code-slash', text: 'How to perform API data fetching asynchronously inside useEffect?' },
        { category: 'React Advanced', icon: 'bi-code-slash', text: 'What is the difference between useEffect and useLayoutEffect?' },
        { category: 'Performance', icon: 'bi-lightning-charge-fill', text: 'How do dependency arrays prevent infinite re-render loops in React?' },
        { category: 'Architecture', icon: 'bi-diagram-2-fill', text: 'Explain React Custom Hooks with a practical code example' }
      ];
    }
    if (text.includes('president') || text.includes('india') || text.includes('history') || text.includes('capital')) {
      return [
        { category: 'Indian History', icon: 'bi-globe-americas', text: 'Who was the first Prime Minister of India?' },
        { category: 'Civics & Law', icon: 'bi-bank2', text: 'How is the President of India elected under the Constitution?' },
        { category: 'Geography', icon: 'bi-map-fill', text: 'What are the major rivers and mountain ranges of India?' },
        { category: 'Constitution', icon: 'bi-journal-bookmark-fill', text: 'What are the fundamental rights guaranteed by the Indian Constitution?' }
      ];
    }
    if (text.includes('photosynthesis') || text.includes('plant') || text.includes('biology') || text.includes('chlorophyll')) {
      return [
        { category: 'Biochemistry', icon: 'bi-lightbulb-fill', text: 'What is the difference between Light and Dark reactions in photosynthesis?' },
        { category: 'Biochemistry', icon: 'bi-droplet-fill', text: 'Why are plant leaves green and how does chlorophyll capture light?' },
        { category: 'Botany', icon: 'bi-tree-fill', text: 'How do stomata control transpiration and gas exchange in leaves?' },
        { category: 'Cellular Biology', icon: 'bi-sun-fill', text: 'How does cellular respiration differ from photosynthesis?' }
      ];
    }
    if (text.includes('sql') || text.includes('nosql') || text.includes('database') || text.includes('mongo') || text.includes('postgres')) {
      return [
        { category: 'Database Choice', icon: 'bi-database-fill', text: 'When should I choose MongoDB over PostgreSQL for an application?' },
        { category: 'Optimization', icon: 'bi-diagram-3-fill', text: 'Explain SQL database indexing and query optimization techniques' },
        { category: 'Transactions', icon: 'bi-shield-check', text: 'What are ACID properties in relational database systems?' },
        { category: 'Database Design', icon: 'bi-key-fill', text: 'Explain Primary Key vs Foreign Key relationships in SQL' }
      ];
    }
    if (text.includes('python') || text.includes('java') || text.includes('code') || text.includes('function') || text.includes('programming')) {
      return [
        { category: 'OOP Design', icon: 'bi-code-square', text: 'How do Object-Oriented Programming (OOP) principles apply here?' },
        { category: 'Algorithms', icon: 'bi-cpu-fill', text: 'What is the time and space complexity (Big O notation) of this approach?' },
        { category: 'Best Practices', icon: 'bi-bug-fill', text: 'What are the best practices for robust error handling and logging?' },
        { category: 'Testing', icon: 'bi-check-all', text: 'Show me how to write automated unit tests for this functionality' }
      ];
    }
    if (text.includes('math') || text.includes('formula') || text.includes('quadratic') || text.includes('equation')) {
      return [
        { category: 'Algebra', icon: 'bi-calculator-fill', text: 'How do I derive the quadratic formula by completing the square?' },
        { category: 'Algebra', icon: 'bi-graph-up', text: 'What is the discriminant (b² - 4ac) and what does it reveal about roots?' },
        { category: 'Equations', icon: 'bi-braces', text: 'Solve the system of linear equations 2x + 3y = 7 and x - y = 1' }
      ];
    }

    // Default dynamic topic-aware follow-ups
    const topicSummary = userQuery.length > 28 ? userQuery.substring(0, 28) + '...' : userQuery;
    return [
      { category: 'Practical Code', icon: 'bi-code-slash', text: `Can you give me a real-world code example for "${topicSummary}"?` },
      { category: 'Deep Dive', icon: 'bi-layers-fill', text: `What are common pitfalls or edge cases to avoid with "${topicSummary}"?` },
      { category: 'Best Practices', icon: 'bi-star-fill', text: `What are modern industry standards and best practices for "${topicSummary}"?` },
      { category: 'Self-Quiz', icon: 'bi-patch-question-fill', text: `Give me 3 practice quiz questions to test my understanding of "${topicSummary}"!` }
    ];
  };

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
    setLastAskedTopic(textToSend);

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

      // Dynamically predict next follow-up prompts based on the question and response!
      const predictedNextPrompts = predictFollowUpPrompts(textToSend, response.message);
      setActivePrompts(predictedNextPrompts);

    } catch (error) {
      let rawText = 'Sorry, I encountered an issue while connecting to the AI provider. Please try again.';
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
        <div className="d-flex align-items-center gap-2 mb-1">
          <h2 className="fw-bold text-dark mb-0">Enterprise Learning Platform AI Agent</h2>
          <span className="badge bg-primary rounded-pill px-3 py-1 fs-6">ChatGPT Powered</span>
        </div>
        <p className="text-muted mb-0">Your universal AI assistant for coding, general knowledge, science, math, career, and general inquiries.</p>
      </div>

      <div className="row g-4">
        {/* Chat Feed Column */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column" style={{ height: '580px', background: 'white', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <i className="bi bi-robot fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">Enterprise Learning Platform AI Agent</h5>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>Online & Multi-Field Ready</span>
                </div>
              </div>
              <button 
                className="btn btn-outline-danger btn-sm rounded-pill fw-bold px-3" 
                onClick={() => {
                  setMessages([{ 
                    sender: 'ai', 
                    text: 'Hello! I am your **Enterprise Learning Platform AI Agent (ChatGPT Powered)**. Ask me anything — from complex programming, code debugging, and software architecture to General Knowledge (GK), science, mathematics, history, writing, and career planning!', 
                    time: 'Just now' 
                  }]);
                  setConversationId(null);
                  setActivePrompts(INITIAL_SUGGESTIONS);
                  setLastAskedTopic('');
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Chat
              </button>
            </div>

            <div className="p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3" style={{ background: '#fcfdfd' }}>
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-4 msg-bubble ${m.sender === 'user' ? 'msg-student' : 'msg-mentor align-self-start'}`} style={{ maxWidth: '85%' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold opacity-75">{m.sender === 'user' ? 'You' : 'Enterprise Learning Platform AI Agent'}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {m.sender === 'ai' ? (
                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            return !inline ? (
                              <div className="position-relative my-2">
                                <button
                                  type="button"
                                  className="btn btn-dark btn-sm rounded-2 position-absolute top-0 end-0 m-2 px-2 py-1 extra-small text-white opacity-75"
                                  style={{ zIndex: 5, fontSize: '0.7rem' }}
                                  onClick={() => handleCopy(codeString, `${i}-${codeString.substring(0, 10)}`)}
                                >
                                  {copiedIndex === `${i}-${codeString.substring(0, 10)}` ? (
                                    <span><i className="bi bi-check2 me-1"></i>Copied!</span>
                                  ) : (
                                    <span><i className="bi bi-clipboard me-1"></i>Copy</span>
                                  )}
                                </button>
                                <SyntaxHighlighter
                                  style={tomorrow}
                                  language={match ? match[1] : 'text'}
                                  PreTag="div"
                                  customStyle={{ borderRadius: '8px', padding: '12px' }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
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
                  <div className="text-end small mt-1 opacity-75" style={{ fontSize: '0.65rem' }}>{m.time}</div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator msg-mentor align-self-start p-3 rounded-4 bg-light border">
                  <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                    <span className="small text-muted fw-semibold">AI Agent is analyzing context & predicting next steps...</span>
                  </div>
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
                placeholder="Ask me anything (Coding, GK, Science, Math, History, Writing, Career)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit" 
                className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style={{ width: '44px', height: '44px', flexShrink: 0 }}
                disabled={isTyping || !input.trim()}
              >
                <i className="bi bi-send-fill text-white fs-6"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Contextual Next Question Predictions Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border border-success-subtle">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-compass-fill text-success"></i>
                {lastAskedTopic ? 'Suggested Next Questions' : 'Multi-Domain Prompts'}
              </h5>
              {lastAskedTopic && (
                <span className="badge bg-success text-white extra-small rounded-pill px-2 py-1">Predicted for You</span>
              )}
            </div>
            <p className="text-muted small mb-3">
              {lastAskedTopic ? (
                <span>Next logical questions based on: <em className="fw-semibold text-dark">"{lastAskedTopic.length > 30 ? lastAskedTopic.substring(0, 30) + '...' : lastAskedTopic}"</em></span>
              ) : (
                'Click any topic card below to ask the AI Agent immediately.'
              )}
            </p>
            <div className="d-flex flex-column gap-2">
              {activePrompts.map((s, idx) => (
                <button
                  key={idx}
                  className="btn btn-outline-success text-start rounded-3 py-2 px-3 small border-success-subtle fw-semibold transition-all hover-translate d-flex align-items-center justify-content-between"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => handleSend(s.text)}
                  disabled={isTyping}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden me-1">
                    <i className={`bi ${s.icon} text-success`}></i>
                    <span className="text-truncate">{s.text}</span>
                  </div>
                  <span className="badge bg-success-subtle text-success extra-small flex-shrink-0 ms-1">{s.category}</span>
                </button>
              ))}
            </div>

            {lastAskedTopic && (
              <button 
                className="btn btn-link text-muted extra-small text-decoration-none mt-2 p-0 text-center w-100"
                onClick={() => {
                  setActivePrompts(INITIAL_SUGGESTIONS);
                  setLastAskedTopic('');
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Restore starter topics
              </button>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'linear-gradient(135deg, #0d4a3a, #166534)' }}>
            <h5 className="fw-bold mb-2">💡 Intelligent Learning Guide</h5>
            <p className="mb-0 small text-white-50" style={{ lineHeight: '1.4' }}>
              The AI Agent predicts follow-up topics to guide your learning path step-by-step from core concepts to advanced mastery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
