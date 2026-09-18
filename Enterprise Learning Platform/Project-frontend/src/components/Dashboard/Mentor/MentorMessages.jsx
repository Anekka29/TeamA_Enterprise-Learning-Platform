import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../../api/apiClient';
import NotificationService from '../../../services/NotificationService';
import { useAuth } from '../../../hooks/useAuth';

export default function MentorMessages({ mentorEmail, onShowToast }) {
  const { user } = useAuth();
  const mentorName = user?.fullName || user?.name || 'Instructor';

  const [students, setStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadEnrolledStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/mentor/enrollments');
      const data = res?.data || [];

      // Map unique enrolled students
      const studentMap = new Map();
      data.forEach(item => {
        const email = item.studentEmail || `student_${item.studentId}@skillsphere.com`;
        if (!studentMap.has(email)) {
          studentMap.set(email, {
            id: item.studentId,
            email: email,
            name: item.studentName || 'Enrolled Student',
            initial: getInitials(item.studentName),
            courseTitle: item.courseTitle || 'Enrolled Course',
          });
        }
      });

      const studentList = Array.from(studentMap.values());
      setStudents(studentList);
      if (studentList.length > 0) {
        setActiveStudent(studentList[0]);
      }
    } catch (err) {
      console.error('Failed to load mentor students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrolledStudents();
  }, [loadEnrolledStudents]);

  // Load chat log for active student
  useEffect(() => {
    if (!activeStudent?.email) return;

    const chatKey = `skillsphere_chat_${activeStudent.email}`;
    const stored = localStorage.getItem(chatKey);
    if (stored) {
      try {
        setConversations(prev => ({ ...prev, [activeStudent.email]: JSON.parse(stored) }));
      } catch (err) {
        setConversations(prev => ({ ...prev, [activeStudent.email]: [] }));
      }
    } else {
      setConversations(prev => ({ ...prev, [activeStudent.email]: [] }));
    }
  }, [activeStudent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeStudent]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeStudent) return;

    const chatKey = `skillsphere_chat_${activeStudent.email}`;
    const current = conversations[activeStudent.email] || [];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      sender: 'mentor',
      text: input.trim(),
      time: timeStr
    };

    const updated = [...current, newMsg];
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setConversations(prev => ({ ...prev, [activeStudent.email]: updated }));
    const sentText = input.trim();
    setInput('');

    // Dispatch real notification to student!
    NotificationService.dispatchNotification(activeStudent.email, {
      title: `New Inquiry Reply from ${mentorName}`,
      message: `${mentorName} replied: "${sentText.length > 40 ? sentText.substring(0, 40) + '...' : sentText}"`,
      type: 'ANNOUNCEMENT',
      icon: 'bi-chat-fill',
      color: '#10b981'
    });

    if (onShowToast) onShowToast('success', `Message sent to ${activeStudent.name}`);
  };

  const activeMessages = activeStudent ? (conversations[activeStudent.email] || []) : [];

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Student Inquiry Chat</h2>
        <p className="text-muted mb-0">Engage with enrolled scholars, answer technical questions, and provide project guidance asynchronously.</p>
      </div>

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border">
          <div className="spinner-border text-success mb-3" role="status"></div>
          <div className="text-muted small">Loading enrolled student inquiry threads...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border">
          <i className="bi bi-chat-left-dots fs-1 mb-3 text-secondary"></i>
          <h5 className="fw-bold text-dark mb-2">No Enrolled Student Threads Yet</h5>
          <p className="text-muted small mb-0">
            When students enroll in your published courses, their inquiry chat threads will automatically populate here.
          </p>
        </div>
      ) : (
        <div className="chat-inbox-grid card border-0 shadow-sm rounded-4 overflow-hidden border">
          {/* Student sidebar list */}
          <div className="chat-sidebar p-2 d-flex flex-column gap-1 bg-light border-end">
            <div className="p-3 text-muted small fw-bold text-uppercase border-bottom" style={{ letterSpacing: '0.04em' }}>
              Enrolled Scholars ({students.length})
            </div>
            {students.map(s => {
              const studentMsgs = conversations[s.email] || [];
              const lastMsgObj = studentMsgs[studentMsgs.length - 1];
              const lastMsgText = lastMsgObj ? lastMsgObj.text : `Enrolled in ${s.courseTitle}`;

              return (
                <div 
                  key={s.email}
                  className={`p-3 rounded-4 cursor-pointer d-flex align-items-center gap-3 transition-all ${
                    activeStudent?.email === s.email ? 'chat-active-mentor bg-success text-white' : 'bg-transparent text-dark'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveStudent(s)}
                >
                  <div 
                    className={`rounded-circle fw-bold d-flex align-items-center justify-content-center text-nowrap flex-shrink-0 ${
                      activeStudent?.email === s.email ? 'bg-white text-success' : 'bg-success text-white'
                    }`} 
                    style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}
                  >
                    {s.initial}
                  </div>
                  <div className="overflow-hidden w-100">
                    <h6 className={`fw-bold mb-0 text-truncate ${activeStudent?.email === s.email ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.88rem' }}>
                      {s.name}
                    </h6>
                    <p className={`text-truncate mb-0 small ${activeStudent?.email === s.email ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                      {lastMsgText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message area */}
          {activeStudent && (
            <div className="chat-area d-flex flex-column bg-white">
              <div className="chat-header d-flex align-items-center gap-3 p-3 border-bottom bg-light">
                <div className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center text-nowrap" style={{ width: '42px', height: '42px' }}>
                  {activeStudent.initial}
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{activeStudent.name}</h6>
                  <span className="text-success small fw-semibold" style={{ fontSize: '0.78rem' }}>
                    {activeStudent.courseTitle} • {activeStudent.email}
                  </span>
                </div>
              </div>

              <div className="chat-feed bg-light flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3" style={{ minHeight: '340px', maxHeight: '450px' }}>
                {activeMessages.length === 0 ? (
                  <div className="text-center my-auto py-4 text-muted small">
                    <i className="bi bi-chat-quote fs-2 d-block mb-2 text-secondary"></i>
                    Start a conversation with <strong>{activeStudent.name}</strong> regarding their progress in <em>{activeStudent.courseTitle}</em>.
                  </div>
                ) : (
                  activeMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`msg-bubble p-3 rounded-4 shadow-xs ${
                        msg.sender === 'mentor' 
                          ? 'align-self-end bg-success text-white rounded-bottom-end-0' 
                          : 'align-self-start bg-white text-dark border rounded-bottom-start-0'
                      }`}
                      style={{ maxWidth: '75%' }}
                    >
                      <div className="small">{msg.text}</div>
                      <div className={`text-end extra-small mt-1 ${msg.sender === 'mentor' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.68rem' }}>
                        {msg.time}
                      </div>
                    </div>
                  ))
                )}
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
                <button 
                  type="submit" 
                  className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                  style={{ width: '44px', height: '44px', flexShrink: 0, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <i className="bi bi-send-fill text-white fs-6"></i>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
