import { useState, useEffect, useRef } from 'react';

const STUDENTS = [
  { email: 'student@skillsphere.com', name: 'Rahul Sharma', initial: 'RS', lastMsg: 'I have some questions on JPA mapping.' },
  { email: 'pooja@skillsphere.com', name: 'Pooja Sen', initial: 'PS', lastMsg: 'WCAG contrast colors updated!' }
];

export default function MentorMessages({ mentorEmail, onShowToast }) {
  const [activeStudent, setActiveStudent] = useState(STUDENTS[0]);
  const [conversations, setConversations] = useState({});
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeStudent]);

  // Load chat logs from storage
  const loadChat = () => {
    const key = `student_chat_${activeStudent.email}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setConversations(prev => ({ ...prev, [activeStudent.email]: JSON.parse(stored) }));
    } else {
      const defaults = [
        { sender: 'mentor', text: 'Hey! How is your homework going?', time: '10:30 AM' },
        { sender: 'student', text: 'Almost done, working on configuration details.', time: '10:45 AM' }
      ];
      setConversations(prev => ({ ...prev, [activeStudent.email]: defaults }));
    }
  };

  useEffect(() => {
    loadChat();
  }, [activeStudent]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const key = `student_chat_${activeStudent.email}`;
    const current = conversations[activeStudent.email] || [];
    const newMsg = {
      sender: 'mentor',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...current, newMsg];
    localStorage.setItem(key, JSON.stringify(updated));
    setConversations(prev => ({ ...prev, [activeStudent.email]: updated }));
    setInput('');

    // Trigger notification to student!
    const studentNotificationKey = `notifications_${activeStudent.email}`;
    const studentNotis = JSON.parse(localStorage.getItem(studentNotificationKey) || '[]');
    const newNoti = {
      id: `chat_${Date.now()}`,
      title: 'New Message from Instructor',
      text: `Dr. Sarah Jenkins sent you a chat message: "${input.substring(0, 30)}..."`,
      type: 'info',
      read: false,
      time: 'Just now'
    };
    localStorage.setItem(studentNotificationKey, JSON.stringify([newNoti, ...studentNotis]));
    window.dispatchEvent(new Event('notifications_updated'));
  };

  const activeMessages = conversations[activeStudent.email] || [];

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Student Inquiry Chat</h2>
        <p className="text-muted">Engage with enrolled scholars, answer syntax questions, and provide project help asynchronously.</p>
      </div>

      <div className="chat-inbox-grid">
        {/* Student sidebar list */}
        <div className="chat-sidebar p-2 d-flex flex-column gap-1">
          <div className="p-3 text-muted small fw-bold text-uppercase border-bottom">Student Threads</div>
          {STUDENTS.map(s => (
            <div 
              key={s.email}
              className={`p-3 rounded-4 cursor-pointer d-flex align-items-center gap-3 transition-all ${
                activeStudent.email === s.email ? 'chat-active-mentor bg-success' : 'bg-transparent'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveStudent(s)}
            >
              <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center text-nowrap" style={{ width: '40px', height: '40px', fontSize: '0.9rem', flexShrink: 0 }}>
                {s.initial}
              </div>
              <div className="overflow-hidden w-100">
                <h5 className="fs-6 fw-bold mb-0 text-dark text-truncate">{s.name}</h5>
                <p className="text-muted text-truncate mb-0 small" style={{ fontSize: '0.75rem' }}>{s.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message area */}
        <div className="chat-area">
          <div className="chat-header d-flex align-items-center gap-3">
            <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center text-nowrap" style={{ width: '40px', height: '40px' }}>
              {activeStudent.initial}
            </div>
            <div>
              <h5 className="fs-6 fw-bold mb-0 text-dark">{activeStudent.name}</h5>
              <span className="text-success small fw-semibold">Student Account ({activeStudent.email})</span>
            </div>
          </div>

          <div className="chat-feed bg-light flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3">
            {activeMessages.map((msg, idx) => (
              <div key={idx} className={`msg-bubble ${msg.sender === 'mentor' ? 'msg-student' : 'msg-mentor align-self-start'}`}>
                <div>{msg.text}</div>
                <div className="text-end small mt-1 opacity-75" style={{ fontSize: '0.65rem' }}>{msg.time}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-top bg-white d-flex gap-2">
            <input
              type="text"
              required
              className="form-control rounded-pill px-4"
              placeholder={`Write response back to ${activeStudent.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', flexShrink: 0 }}>
              <i className="bi bi-send-fill text-white fs-6"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
