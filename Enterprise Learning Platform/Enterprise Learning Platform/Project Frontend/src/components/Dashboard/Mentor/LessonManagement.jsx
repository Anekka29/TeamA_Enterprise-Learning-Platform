import { useState, useEffect } from 'react';
import CourseService from '../../../services/CourseService';

const DEFAULT_COURSES = [
  {
    id: 'c_fullstack_dev',
    title: 'Full-Stack Web Development & Microservices',
    instructorEmail: 'mentor@skillsphere.com',
    isDefault: true,
    totalLessons: 12,
    modules: [
      'Module 1: REST API Architecture & Controller Design',
      'Module 2: Database Schema & JPA/Hibernate Persistence',
      'Module 3: Frontend Integration with React & State Management',
      'Module 4: Security, JWT & OAuth2 Authentication'
    ],
    currentLesson: {
      title: 'Module 1: REST API Architecture & Controller Design',
      question: 'Which HTTP method should be used for idempotent record updates according to REST conventions?',
      options: ['PUT', 'POST', 'DELETE', 'PATCH'],
      correctAnswer: 'PUT',
      explanation: 'PUT is idempotent, meaning calling it multiple times with the same payload produces the same state result.'
    }
  },
  {
    id: 'c_java_backend',
    title: 'Java Backend & Microservices Masterclass',
    instructorEmail: 'mentor@skillsphere.com',
    isDefault: true,
    totalLessons: 15,
    modules: [
      'Module 1: JVM Internals & Memory Architecture',
      'Module 2: Spring Boot Dependency Injection & Beans',
      'Module 3: Microservices Communication & Eureka Registry',
      'Module 4: Kafka Messaging & Asynchronous Event Processing'
    ],
    currentLesson: {
      title: 'Module 2: Spring Boot Dependency Injection & Beans',
      question: 'What is the default scope of a standard Spring Bean in Spring Framework?',
      options: ['Singleton', 'Prototype', 'Request', 'Session'],
      correctAnswer: 'Singleton',
      explanation: 'By default, Spring beans are singletons — only one shared instance is managed per Spring container context.'
    }
  },
  {
    id: 'c_react_arch',
    title: 'Advanced React 18 & Modern UI Engineering',
    instructorEmail: 'mentor@skillsphere.com',
    isDefault: true,
    totalLessons: 10,
    modules: [
      'Module 1: Component Lifecycle & Custom Hooks',
      'Module 2: Global State Management (Context & Redux)',
      'Module 3: Virtualization, Memoization & UI Performance',
      'Module 4: Server Components & Next.js Routing'
    ],
    currentLesson: {
      title: 'Module 1: Component Lifecycle & Custom Hooks',
      question: 'Which Hook should be used to memoize expensive computations between re-renders?',
      options: ['useMemo', 'useCallback', 'useEffect', 'useRef'],
      correctAnswer: 'useMemo',
      explanation: 'useMemo caches the result of a calculation between re-renders until one of its dependencies changes.'
    }
  },
  {
    id: 'c_dsa_system',
    title: 'Data Structures, Algorithms & System Design',
    instructorEmail: 'mentor@skillsphere.com',
    isDefault: true,
    totalLessons: 18,
    modules: [
      'Module 1: Array Manipulation & Two Pointer Techniques',
      'Module 2: Trees, Graphs & Dynamic Programming',
      'Module 3: High-Level System Architecture & Load Balancing',
      'Module 4: Distributed Caching & Sharding Strategies'
    ],
    currentLesson: {
      title: 'Module 3: High-Level System Architecture & Load Balancing',
      question: 'Which load balancing algorithm distributes requests sequentially among backend servers?',
      options: ['Round Robin', 'Least Connections', 'IP Hash', 'Weighted Random'],
      correctAnswer: 'Round Robin',
      explanation: 'Round Robin routes incoming requests sequentially to each server in the pool in turn.'
    }
  }
];

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

  const syncToLocalStorage = (courseList) => {
    try {
      localStorage.setItem('global_courses', JSON.stringify(courseList));
      localStorage.setItem('skillsphere_global_courses', JSON.stringify(courseList));
    } catch (e) {
      console.warn('Error saving courses to localStorage', e);
    }
  };

  const loadCourses = async () => {
    let loadedCourses = [];

    // 1. Try fetching from CourseService API
    try {
      const res = await CourseService.getMentorCourses();
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) {
        loadedCourses = list.map(c => ({
          id: c.id || `c_${c.title}`,
          title: c.title || 'Untitled Course',
          instructorEmail: c.instructorEmail || mentorEmail,
          isDefault: true,
          totalLessons: c.totalLessons || c.lessonCount || 8,
          modules: c.modules || [
            `Module 1: ${c.title} Architecture`,
            `Module 2: Core Concepts & Practice`,
            `Module 3: Production Deployment`
          ],
          currentLesson: c.currentLesson || null
        }));
      }
    } catch (e) {
      // API call failed or offline, fallback to localStorage/defaults
    }

    // 2. If API returned no courses, check localStorage
    if (loadedCourses.length === 0) {
      const stored = localStorage.getItem('global_courses') || localStorage.getItem('skillsphere_global_courses');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedCourses = parsed;
          }
        } catch (e) {}
      }
    }

    // 3. If still empty, use realistic default courses
    if (loadedCourses.length === 0) {
      loadedCourses = DEFAULT_COURSES;
    }

    // Ensure all default courses exist in state
    syncToLocalStorage(loadedCourses);
    setCourses(loadedCourses);

    if (loadedCourses.length > 0) {
      setSelectedCourse(prev => {
        if (!prev) return loadedCourses[0];
        const match = loadedCourses.find(c => String(c.id) === String(prev.id));
        return match || loadedCourses[0];
      });
    }
  };

  useEffect(() => {
    loadCourses();
  }, [mentorEmail]);

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLesson.title.trim() || !newLesson.question.trim() || !newLesson.correctAnswer.trim()) return;

    if (!selectedCourse) return;

    const updatedCourses = courses.map(c => {
      if (String(c.id) === String(selectedCourse.id)) {
        const nextLessons = (c.totalLessons || 0) + 1;
        const currentModules = Array.isArray(c.modules) ? [...c.modules] : [];
        if (!currentModules.includes(newLesson.title.trim())) {
          currentModules.push(newLesson.title.trim());
        }
        return {
          ...c,
          totalLessons: nextLessons,
          modules: currentModules,
          currentLesson: {
            title: newLesson.title.trim(),
            question: newLesson.question.trim(),
            options: newLesson.options.filter(o => o.trim() !== ''),
            correctAnswer: newLesson.correctAnswer.trim(),
            explanation: newLesson.explanation.trim()
          }
        };
      }
      return c;
    });

    syncToLocalStorage(updatedCourses);
    setCourses(updatedCourses);

    const updatedSelected = updatedCourses.find(c => String(c.id) === String(selectedCourse.id));
    if (updatedSelected) setSelectedCourse(updatedSelected);

    if (onShowToast) {
      onShowToast('success', 'New lesson module compiled and saved to syllabus!');
    }

    // Reset Form
    setNewLesson({
      title: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
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
                  const match = courses.find(c => String(c.id) === String(e.target.value));
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
                  {(selectedCourse.modules && selectedCourse.modules.length > 0
                    ? selectedCourse.modules
                    : [
                        'Module 1: Foundational Frameworks',
                        'Module 2: Advanced Design Patterns',
                        'Module 3: Project Architecture'
                      ]
                  ).map((mod, idx) => (
                    <div key={idx} className="mb-2 text-dark">
                      <i className="bi bi-folder-fill text-warning me-2"></i>
                      {mod}
                    </div>
                  ))}
                  <div className="border-top pt-3 mt-3">
                    <span className="fw-bold text-dark">Active Lesson Simulator Configured:</span>
                    <p className="mb-0 text-success fw-bold small mt-1">
                      {selectedCourse.currentLesson ? selectedCourse.currentLesson.title : 'No active lesson config.'}
                    </p>
                    {selectedCourse.currentLesson?.question && (
                      <div className="mt-2 text-muted extra-small bg-white p-2 rounded border">
                        <div><strong>Q:</strong> {selectedCourse.currentLesson.question}</div>
                        {selectedCourse.currentLesson.correctAnswer && (
                          <div className="text-success mt-1"><strong>Ans:</strong> {selectedCourse.currentLesson.correctAnswer}</div>
                        )}
                      </div>
                    )}
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
