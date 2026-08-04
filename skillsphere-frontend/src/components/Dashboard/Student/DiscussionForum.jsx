import { useState, useEffect } from 'react';

const INITIAL_THREADS = [
  {
    id: 't1',
    title: 'How do we solve JPA Mapping StackOverflow recursion?',
    author: 'Rahul Sharma',
    date: '3 hours ago',
    category: 'Tech',
    upvotes: 12,
    replies: [
      { author: 'Dr. Sarah Jenkins (Mentor)', text: 'This happens because of circular bidirectional references in your @OneToMany and @ManyToOne entities. Use @JsonManagedReference and @JsonBackReference annotations to decouple serialisation.', date: '2 hours ago' },
      { author: 'Rahul Sharma', text: 'Thank you! That resolved it immediately.', date: '1 hour ago' }
    ]
  },
  {
    id: 't2',
    title: 'Tips for achieving high contrast in dark emerald themes?',
    author: 'Pooja Sen',
    date: '1 day ago',
    category: 'Design',
    upvotes: 8,
    replies: [
      { author: 'Elena Rostova (Mentor)', text: 'Always keep contrast ratios above 4.5:1. I suggest using text colors like #e6f7f2 on surfaces like #0d3d30.', date: 'Yesterday' }
    ]
  },
  {
    id: 't3',
    title: 'Which vector database works best for local RAG scripts?',
    author: 'Aarav Gupta',
    date: '2 days ago',
    category: 'Tech',
    upvotes: 15,
    replies: [
      { author: 'Prof. Alan Turing (Mentor)', text: 'ChromaDB is exceptionally fast for lightweight local experiments. For scale production, PGVector or Pinecone are superior.', date: '1 day ago' }
    ]
  }
];

export default function DiscussionForum({ userEmail }) {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newTopic, setNewTopic] = useState({ title: '', category: 'Tech', text: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  // Sync state
  useEffect(() => {
    const key = `discussion_threads_${userEmail}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setThreads(JSON.parse(stored));
    } else {
      setThreads(INITIAL_THREADS);
      localStorage.setItem(key, JSON.stringify(INITIAL_THREADS));
    }
  }, [userEmail]);

  const saveThreads = (updated) => {
    setThreads(updated);
    localStorage.setItem(`discussion_threads_${userEmail}`, JSON.stringify(updated));
    // If viewing the updated thread, update selected reference
    if (activeThread) {
      const match = updated.find(t => t.id === activeThread.id);
      if (match) setActiveThread(match);
    }
  };

  const handleUpvote = (id, e) => {
    e.stopPropagation();
    const updated = threads.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t);
    saveThreads(updated);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const reply = {
      author: userEmail,
      text: newComment,
      date: 'Just now'
    };

    const updated = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          replies: [...t.replies, reply]
        };
      }
      return t;
    });

    saveThreads(updated);
    setNewComment('');
  };

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.text.trim()) return;

    const newT = {
      id: `t_${Date.now()}`,
      title: newTopic.title,
      author: userEmail,
      date: 'Just now',
      category: newTopic.category,
      upvotes: 0,
      replies: [
        { author: userEmail, text: newTopic.text, date: 'Just now' }
      ]
    };

    const updated = [newT, ...threads];
    saveThreads(updated);
    setNewTopic({ title: '', category: 'Tech', text: '' });
    setShowCreateModal(false);
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1">Discussion Forums</h2>
          <p className="text-muted">Engage with fellow student developers and request guidance from syllabus leads.</p>
        </div>
        <button className="btn btn-success rounded-pill fw-bold" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Start a Thread
        </button>
      </div>

      <div className="row g-4">
        {/* Thread Lists Panel */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Search forum topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex flex-column gap-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredThreads.map(thread => (
                <div 
                  key={thread.id} 
                  className={`p-3 border rounded-4 cursor-pointer transition-all ${
                    activeThread?.id === thread.id ? 'border-success bg-success-subtle' : 'bg-light'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveThread(thread)}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{thread.category}</span>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{thread.date}</span>
                  </div>
                  <h6 className="fw-bold text-dark mb-2">{thread.title}</h6>
                  <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.75rem' }}>
                    <span>By: {thread.author}</span>
                    <div className="d-flex align-items-center gap-3">
                      <button className="btn btn-link text-success p-0 text-decoration-none small" onClick={(e) => handleUpvote(thread.id, e)}>
                        <i className="bi bi-hand-thumbs-up-fill me-1"></i> {thread.upvotes}
                      </button>
                      <span><i className="bi bi-chat-text-fill text-muted me-1"></i> {thread.replies.length} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Thread View */}
        <div className="col-lg-6">
          {activeThread ? (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="border-bottom pb-3 mb-3 text-start">
                  <span className="badge bg-success-subtle text-success rounded-pill fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem' }}>{activeThread.category}</span>
                  <h5 className="fw-bold text-dark">{activeThread.title}</h5>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Opened by: {activeThread.author} • {activeThread.date}</div>
                </div>

                {/* Replies Feed */}
                <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                  {activeThread.replies.map((reply, i) => (
                    <div key={i} className="p-3 bg-light rounded-4 border">
                      <div className="d-flex justify-content-between mb-2 border-bottom pb-1 small" style={{ fontSize: '0.75rem' }}>
                        <span className="fw-bold text-dark">{reply.author}</span>
                        <span className="text-muted">{reply.date}</span>
                      </div>
                      <p className="text-muted mb-0 small" style={{ lineHeight: '1.4' }}>{reply.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleCommentSubmit} className="d-flex gap-2 border-top pt-3">
                <input
                  type="text"
                  required
                  placeholder="Post comment to thread..."
                  className="form-control rounded-pill px-3 small"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-success btn-sm rounded-pill px-4 fw-bold">Post</button>
              </form>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <i className="bi bi-chat-left-dots fs-1 text-muted mb-3"></i>
              <p>Select a thread from the list to view conversations and participate in discussion.</p>
            </div>
          )}
        </div>
      </div>

      {/* Start Thread Modal */}
      {showCreateModal && (
        <div className="study-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="study-window bg-white rounded-4 p-4 text-start shadow-lg" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">Create Discussion Thread</h5>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
            </div>

            <form onSubmit={handleCreateTopic}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Topic Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-control rounded-3" 
                  placeholder="Summarize your query..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Select Category</label>
                <select 
                  className="form-select rounded-3"
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                >
                  <option value="Tech">Tech / Programming</option>
                  <option value="Design">UI/UX Design</option>
                  <option value="Business">Product Management</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Description / Query Body</label>
                <textarea 
                  required 
                  rows="4" 
                  className="form-control rounded-3" 
                  placeholder="Detail your question, including code snippet or link screenshots if applicable..."
                  value={newTopic.text}
                  onChange={(e) => setNewTopic({ ...newTopic, text: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Launch Thread</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
