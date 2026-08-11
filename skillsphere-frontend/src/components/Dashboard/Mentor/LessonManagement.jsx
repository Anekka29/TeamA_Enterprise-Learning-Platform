import { useState, useEffect } from 'react';

export default function LessonManagement({ mentorEmail, onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const loadCourses = () => {
    const key = `global_courses`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      const filtered = parsed.filter(c => c.instructorEmail === mentorEmail || c.isDefault);
      setCourses(filtered);
      if (filtered.length > 0 && !selectedCourse) {
        setSelectedCourse(filtered[0]);
      }
    }
  };

  useEffect(() => {
    loadCourses();
  }, [mentorEmail]);

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLesson.title.trim() || !newLesson.question.trim() || !newLesson.correctAnswer.trim()) return;

    const allCoursesKey = `global_courses`;
    const stored = localStorage.getItem(allCoursesKey);
    if (!stored) return;

    const allCourses = JSON.parse(stored);
    const updated = allCourses.map(c => {
      if (c.id === selectedCourse.id) {
        // Increment lesson counts and update current simulator
        const nextLessons = (c.totalLessons || 0) + 1;
        return {
          ...c,
          totalLessons: nextLessons,
          currentLesson: {
            title: newLesson.title,
            question: newLesson.question,
            options: newLesson.options.filter(o => o.trim() !== ''),
            correctAnswer: newLesson.correctAnswer,
            explanation: newLesson.explanation
          }
        };
      }
      return c;
    });

    localStorage.setItem(allCoursesKey, JSON.stringify(updated));
    onShowToast('success', 'New lesson module compiled and saved to syllabus!');
    
    // Reset Form
    setNewLesson({
      title: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    
    // Reload state
    loadCourses();
    const updatedSelected = updated.find(c => c.id === selectedCourse.id);
    if (updatedSelected) setSelectedCourse(updatedSelected);
  };

  return (
    <div className="fade-in-quick text-start">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Lesson & Module Management</h2>
        <p className="text-muted">Author learning material, compile syllabus modules, and configure study simulator questions.</p>
      </div>

      <div className="row g-4">
        {/* Course selector and syllabus tree */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <div className="mb-3">
              <label className="form-label small fw-bold">Select Active Syllabus</label>
              <select
                className="form-select rounded-3"
                value={selectedCourse?.id || ''}
                onChange={(e) => {
                  const match = courses.find(c => c.id.toString() === e.target.value.toString());
                  if (match) setSelectedCourse(match);
                }}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="mt-4">
                <h6 className="fw-bold text-dark mb-3">Syllabus Curriculum Tree</h6>
                <div className="border rounded-3 p-3 bg-light text-muted small">
                  <div className="mb-2"><i className="bi bi-folder-fill text-warning me-2"></i>Module 1: Foundational Frameworks</div>
                  <div className="mb-2"><i className="bi bi-folder-fill text-warning me-2"></i>Module 2: Advanced Design Patterns</div>
                  <div className="mb-3"><i className="bi bi-folder-fill text-warning me-2"></i>Module 3: Project Architecture</div>
                  <div className="border-top pt-2">
                    <span className="fw-bold text-dark">Active Lesson Simulator Configured:</span>
                    <p className="mb-0 text-success fw-bold small mt-1">
                      {selectedCourse.currentLesson ? selectedCourse.currentLesson.title : 'No active lesson config.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add module question form */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
            <h5 className="fw-bold text-dark mb-4">Add Syllabus Unit & Question</h5>
            
            <form onSubmit={handleAddLesson}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Lesson Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-control rounded-3" 
                  placeholder="e.g. Module 4: Routing and Controller Configs"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Simulator MCQ Question</label>
                <textarea 
                  required 
                  rows="2"
                  className="form-control rounded-3" 
                  placeholder="e.g. What is the scope of standard Spring Beans?"
                  value={newLesson.question}
                  onChange={(e) => setNewLesson({ ...newLesson, question: e.target.value })}
                ></textarea>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12"><label className="form-label small fw-bold mb-1">Answer Options</label></div>
                {newLesson.options.map((opt, i) => (
                  <div key={i} className="col-md-6">
                    <input 
                      type="text" 
                      required 
                      className="form-control rounded-3 form-control-sm" 
                      placeholder={`Option ${i+1}`}
                      value={opt}
                      onChange={(e) => {
                        const updatedOpts = [...newLesson.options];
                        updatedOpts[i] = e.target.value;
                        setNewLesson({ ...newLesson, options: updatedOpts });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Correct Option Value</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control rounded-3" 
                    placeholder="Must match correct option exactly"
                    value={newLesson.correctAnswer}
                    onChange={(e) => setNewLesson({ ...newLesson, correctAnswer: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Question Explanation</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control rounded-3" 
                    placeholder="Explain why this answer is correct..."
                    value={newLesson.explanation}
                    onChange={(e) => setNewLesson({ ...newLesson, explanation: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success rounded-pill fw-bold w-100 mt-2">
                Compile & Append Lesson Unit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
