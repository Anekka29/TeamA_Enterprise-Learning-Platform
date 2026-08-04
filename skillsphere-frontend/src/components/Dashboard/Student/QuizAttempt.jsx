import { useState, useEffect } from 'react';
import QuizService from '../../../services/QuizService';
import EnrollmentService from '../../../services/EnrollmentService';

export const SYSTEM_QUIZZES = [
  {
    id: 'java-quiz-15',
    title: 'Java Core & OOP Quiz',
    category: 'Java',
    badge: 'Java',
    icon: 'bi-filetype-java',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#ffedd5',
    description: 'Test your understanding of Java OOP principles, JVM memory architecture, Collections framework, Exception handling, and core syntax.',
    totalQuestions: 15,
    timeLimitMinutes: 15,
    questions: [
      {
        id: 1,
        text: 'Which keyword is used to inherit a class in Java?',
        options: [
          { key: 'A', text: 'implements' },
          { key: 'B', text: 'extends' },
          { key: 'C', text: 'inherit' },
          { key: 'D', text: 'super' }
        ],
        correctOption: 'B',
        explanation: 'In Java, the `extends` keyword is used by a child class to inherit fields and methods from a parent class.'
      },
      {
        id: 2,
        text: 'Which JVM component manages memory?',
        options: [
          { key: 'A', text: 'Compiler' },
          { key: 'B', text: 'Class Loader' },
          { key: 'C', text: 'Garbage Collector' },
          { key: 'D', text: 'JIT' }
        ],
        correctOption: 'C',
        explanation: 'The Garbage Collector in the JVM automatically handles memory management by deallocating unreferenced objects.'
      },
      {
        id: 3,
        text: 'Which collection allows duplicate elements?',
        options: [
          { key: 'A', text: 'Set' },
          { key: 'B', text: 'HashSet' },
          { key: 'C', text: 'List' },
          { key: 'D', text: 'TreeSet' }
        ],
        correctOption: 'C',
        explanation: 'A `List` is an ordered collection that permits duplicate elements, unlike `Set` implementations.'
      },
      {
        id: 4,
        text: 'Which method is the Java entry point?',
        options: [
          { key: 'A', text: 'start()' },
          { key: 'B', text: 'init()' },
          { key: 'C', text: 'main()' },
          { key: 'D', text: 'run()' }
        ],
        correctOption: 'C',
        explanation: 'The `public static void main(String[] args)` method is the mandatory entry point for executing standard Java applications.'
      },
      {
        id: 5,
        text: 'Which exception is unchecked?',
        options: [
          { key: 'A', text: 'IOException' },
          { key: 'B', text: 'SQLException' },
          { key: 'C', text: 'NullPointerException' },
          { key: 'D', text: 'InterruptedException' }
        ],
        correctOption: 'C',
        explanation: '`NullPointerException` extends `RuntimeException` and is an unchecked exception (does not require mandatory try-catch or throws clause).'
      },
      {
        id: 6,
        text: 'Which keyword prevents inheritance?',
        options: [
          { key: 'A', text: 'final' },
          { key: 'B', text: 'static' },
          { key: 'C', text: 'private' },
          { key: 'D', text: 'const' }
        ],
        correctOption: 'A',
        explanation: 'Declaring a class with the `final` modifier prevents any other class from extending it.'
      },
      {
        id: 7,
        text: 'Which package is imported by default?',
        options: [
          { key: 'A', text: 'java.util' },
          { key: 'B', text: 'java.io' },
          { key: 'C', text: 'java.lang' },
          { key: 'D', text: 'java.sql' }
        ],
        correctOption: 'C',
        explanation: 'The `java.lang` package (containing Object, String, Math, System, etc.) is automatically imported by Java into every source file.'
      },
      {
        id: 8,
        text: 'Which interface supports lambda expressions most directly?',
        options: [
          { key: 'A', text: 'Serializable' },
          { key: 'B', text: 'Functional Interface' },
          { key: 'C', text: 'Cloneable' },
          { key: 'D', text: 'Runnable' }
        ],
        correctOption: 'B',
        explanation: 'A Functional Interface (an interface with exactly one abstract method) is the fundamental target type for Java lambda expressions.'
      },
      {
        id: 9,
        text: 'What is encapsulation?',
        options: [
          { key: 'A', text: 'Multiple inheritance' },
          { key: 'B', text: 'Wrapping data and methods together' },
          { key: 'C', text: 'Method overloading' },
          { key: 'D', text: 'Dynamic binding' }
        ],
        correctOption: 'B',
        explanation: 'Encapsulation is the fundamental OOP concept of bundling data attributes and operating methods within a single class unit.'
      },
      {
        id: 10,
        text: 'Which loop always executes at least once?',
        options: [
          { key: 'A', text: 'for' },
          { key: 'B', text: 'while' },
          { key: 'C', text: 'do-while' },
          { key: 'D', text: 'foreach' }
        ],
        correctOption: 'C',
        explanation: 'A `do-while` loop executes its block body before checking the conditional statement at the bottom.'
      },
      {
        id: 11,
        text: 'Which collection stores key-value pairs?',
        options: [
          { key: 'A', text: 'ArrayList' },
          { key: 'B', text: 'Queue' },
          { key: 'C', text: 'HashMap' },
          { key: 'D', text: 'Stack' }
        ],
        correctOption: 'C',
        explanation: '`HashMap` stores key-value mapping associations in Java.'
      },
      {
        id: 12,
        text: 'Which access modifier is most restrictive?',
        options: [
          { key: 'A', text: 'public' },
          { key: 'B', text: 'protected' },
          { key: 'C', text: 'default' },
          { key: 'D', text: 'private' }
        ],
        correctOption: 'D',
        explanation: '`private` is the most restrictive access modifier, limiting access strictly to code inside the same enclosing class.'
      },
      {
        id: 13,
        text: 'Method overloading occurs when:',
        options: [
          { key: 'A', text: 'Same method name, different parameters' },
          { key: 'B', text: 'Different class' },
          { key: 'C', text: 'Same return type only' },
          { key: 'D', text: 'Same parameters' }
        ],
        correctOption: 'A',
        explanation: 'Method overloading allows multiple methods in a single class to share the same name with different parameter signatures.'
      },
      {
        id: 14,
        text: 'Which keyword refers to the current object?',
        options: [
          { key: 'A', text: 'self' },
          { key: 'B', text: 'current' },
          { key: 'C', text: 'this' },
          { key: 'D', text: 'super' }
        ],
        correctOption: 'C',
        explanation: 'The `this` keyword acts as a reference variable referring to the active object instance.'
      },
      {
        id: 15,
        text: 'Java is primarily a:',
        options: [
          { key: 'A', text: 'Procedural language' },
          { key: 'B', text: 'Object-Oriented language' },
          { key: 'C', text: 'Functional language' },
          { key: 'D', text: 'Assembly language' }
        ],
        correctOption: 'B',
        explanation: 'Java is fundamentally designed and structured as an Object-Oriented Programming (OOP) language.'
      }
    ]
  },
  {
    id: 'cpp-quiz-15',
    title: 'C++ Programming & STL Quiz',
    category: 'C++',
    badge: 'C++',
    icon: 'bi-code-slash',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#dbeafe',
    description: 'Master dynamic memory management, virtual functions, scope resolution, STL containers, and OOP concepts in C++.',
    totalQuestions: 15,
    timeLimitMinutes: 15,
    questions: [
      {
        id: 1,
        text: 'Which operator allocates dynamic memory?',
        options: [
          { key: 'A', text: 'alloc' },
          { key: 'B', text: 'malloc' },
          { key: 'C', text: 'new' },
          { key: 'D', text: 'create' }
        ],
        correctOption: 'C',
        explanation: 'In C++, the `new` operator allocates memory dynamically on the heap and invokes constructors.'
      },
      {
        id: 2,
        text: 'Which operator deallocates memory allocated using new?',
        options: [
          { key: 'A', text: 'remove' },
          { key: 'B', text: 'free' },
          { key: 'C', text: 'delete' },
          { key: 'D', text: 'destroy' }
        ],
        correctOption: 'C',
        explanation: 'The `delete` operator frees heap memory created with the `new` operator.'
      },
      {
        id: 3,
        text: 'Which feature enables runtime polymorphism?',
        options: [
          { key: 'A', text: 'Templates' },
          { key: 'B', text: 'Virtual Functions' },
          { key: 'C', text: 'Macros' },
          { key: 'D', text: 'Namespaces' }
        ],
        correctOption: 'B',
        explanation: '`virtual` member functions allow member function overrides to be dynamically dispatched at runtime.'
      },
      {
        id: 4,
        text: 'Which symbol is used for scope resolution?',
        options: [
          { key: 'A', text: '->' },
          { key: 'B', text: '::' },
          { key: 'C', text: '.' },
          { key: 'D', text: '##' }
        ],
        correctOption: 'B',
        explanation: 'The double colon `::` is the C++ scope resolution operator used to specify global, namespace, or class scope.'
      },
      {
        id: 5,
        text: 'Which header is commonly used for input/output?',
        options: [
          { key: 'A', text: 'stdio.h' },
          { key: 'B', text: 'iostream' },
          { key: 'C', text: 'conio.h' },
          { key: 'D', text: 'string' }
        ],
        correctOption: 'B',
        explanation: '`<iostream>` is the standard C++ header for stream I/O operations such as `std::cout` and `std::cin`.'
      },
      {
        id: 6,
        text: 'What does STL stand for?',
        options: [
          { key: 'A', text: 'Standard Template Library' },
          { key: 'B', text: 'System Type Library' },
          { key: 'C', text: 'Simple Template Logic' },
          { key: 'D', text: 'Standard Type Logic' }
        ],
        correctOption: 'A',
        explanation: 'STL stands for Standard Template Library in C++.'
      },
      {
        id: 7,
        text: 'Which keyword creates a constant variable?',
        options: [
          { key: 'A', text: 'final' },
          { key: 'B', text: 'constant' },
          { key: 'C', text: 'const' },
          { key: 'D', text: 'static' }
        ],
        correctOption: 'C',
        explanation: 'The `const` keyword declares read-only variables whose values cannot be changed after initialization.'
      },
      {
        id: 8,
        text: 'Which loop is guaranteed to execute at least once?',
        options: [
          { key: 'A', text: 'for' },
          { key: 'B', text: 'while' },
          { key: 'C', text: 'do-while' },
          { key: 'D', text: 'range-for' }
        ],
        correctOption: 'C',
        explanation: '`do-while` loops evaluate the test condition after executing the body, guaranteeing at least one pass.'
      },
      {
        id: 9,
        text: 'Which container stores unique ordered values?',
        options: [
          { key: 'A', text: 'vector' },
          { key: 'B', text: 'list' },
          { key: 'C', text: 'set' },
          { key: 'D', text: 'queue' }
        ],
        correctOption: 'C',
        explanation: '`std::set` stores unique sorted elements in binary search tree structure.'
      },
      {
        id: 10,
        text: 'Which keyword is used for inheritance access?',
        options: [
          { key: 'A', text: 'extends' },
          { key: 'B', text: 'inherits' },
          { key: 'C', text: ':' },
          { key: 'D', text: 'using' }
        ],
        correctOption: 'C',
        explanation: 'C++ specifies inheritance deriving syntax using a colon `:` (e.g., `class Derived : public Base`).'
      },
      {
        id: 11,
        text: 'Which keyword prevents overriding?',
        options: [
          { key: 'A', text: 'const' },
          { key: 'B', text: 'override' },
          { key: 'C', text: 'final' },
          { key: 'D', text: 'static' }
        ],
        correctOption: 'C',
        explanation: 'Marking a virtual function as `final` prevents further overriding in derived classes.'
      },
      {
        id: 12,
        text: 'Which function is the program entry point?',
        options: [
          { key: 'A', text: 'start()' },
          { key: 'B', text: 'run()' },
          { key: 'C', text: 'init()' },
          { key: 'D', text: 'main()' }
        ],
        correctOption: 'D',
        explanation: 'The `main()` function serves as the execution starting point for all C++ programs.'
      },
      {
        id: 13,
        text: 'Templates provide:',
        options: [
          { key: 'A', text: 'Exception handling' },
          { key: 'B', text: 'Generic Programming' },
          { key: 'C', text: 'File handling' },
          { key: 'D', text: 'Memory allocation' }
        ],
        correctOption: 'B',
        explanation: 'Templates enable Generic Programming in C++ by allowing functions and classes to work with generic data types.'
      },
      {
        id: 14,
        text: 'Which keyword refers to the current object?',
        options: [
          { key: 'A', text: 'this' },
          { key: 'B', text: 'self' },
          { key: 'C', text: 'current' },
          { key: 'D', text: 'super' }
        ],
        correctOption: 'A',
        explanation: '`this` is an implicit pointer to the instance of the class executing the member function.'
      },
      {
        id: 15,
        text: 'C++ supports:',
        options: [
          { key: 'A', text: 'Object-Oriented Programming' },
          { key: 'B', text: 'Generic Programming' },
          { key: 'C', text: 'Procedural Programming' },
          { key: 'D', text: 'All of the above' }
        ],
        correctOption: 'D',
        explanation: 'C++ is a multi-paradigm language that fully supports Procedural, Object-Oriented, and Generic Programming.'
      }
    ]
  }
];

export default function QuizAttempt({ onShowToast }) {
  const [quizHistory, setQuizHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [globalQuizzes, setGlobalQuizzes] = useState([]);

  useEffect(() => {
    loadQuizHistory();

    EnrollmentService.getMyEnrollments()
      .then(res => {
        const list = res?.data || res || [];
        setEnrolledCourses(list);
      })
      .catch(() => {});

    try {
      const stored = localStorage.getItem('skillsphere_global_quizzes');
      if (stored) setGlobalQuizzes(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const getSavedLocalHistory = () => {
    try {
      const stored = localStorage.getItem('skillsphere_quiz_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalHistory = (newResult) => {
    try {
      const existing = getSavedLocalHistory();
      const updated = [newResult, ...existing];
      localStorage.setItem('skillsphere_quiz_history', JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [newResult];
    }
  };

  const loadQuizHistory = async () => {
    setLoading(true);
    const localData = getSavedLocalHistory();
    try {
      const serverData = await QuizService.getStudentQuizHistory();
      const combined = [...(Array.isArray(serverData) ? serverData : []), ...localData];
      // Deduplicate by ID
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setQuizHistory(unique);
    } catch (error) {
      setQuizHistory(localData);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setAnswers({});
    setShowQuizModal(true);
  };

  const handleOptionSelect = (questionId, selectedKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedKey
    }));
  };

  const handleViewResult = async (result) => {
    if (typeof result === 'object' && result.answers) {
      setSelectedResult(result);
    } else if (typeof result === 'number' || typeof result === 'string') {
      const local = getSavedLocalHistory().find(r => r.id === result);
      if (local) {
        setSelectedResult(local);
        return;
      }
      try {
        const data = await QuizService.getQuizResult(result);
        setSelectedResult(data);
      } catch (error) {
        if (onShowToast) onShowToast('error', 'Failed to load quiz result');
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const totalQuestions = currentQuiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(`You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    let score = 0;
    const detailedAnswers = currentQuiz.questions.map(q => {
      const userSelected = answers[q.id] || 'Unanswered';
      const isCorrect = userSelected === q.correctOption;
      if (isCorrect) score += 1;

      const userOptObj = q.options.find(o => o.key === userSelected);
      const correctOptObj = q.options.find(o => o.key === q.correctOption);

      return {
        questionId: q.id,
        questionText: q.text,
        selectedOption: userSelected !== 'Unanswered' ? `${userSelected}. ${userOptObj?.text || ''}` : 'No Answer',
        correctOption: `${q.correctOption}. ${correctOptObj?.text || ''}`,
        isCorrect,
        pointsEarned: isCorrect ? 1 : 0,
        explanation: q.explanation
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    const resultRecord = {
      id: `res_${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      category: currentQuiz.category,
      score,
      totalPoints: totalQuestions,
      percentage,
      completedAt: new Date().toISOString(),
      answers: detailedAnswers
    };

    // Save submission payload for Mentor Quiz Performance Analytics
    const submissionPayload = {
      id: `quiz_sub_${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      courseTitle: currentQuiz.category || currentQuiz.courseTitle || 'General Course',
      studentName: 'Chandni Singh',
      studentEmail: 'chandni@skillsphere.com',
      completedAt: new Date().toISOString(),
      score,
      totalPoints: totalQuestions,
      percentage,
      status: percentage >= 70 ? 'PASSED' : 'FAILED',
      answers: detailedAnswers
    };

    try {
      const existingSubs = JSON.parse(localStorage.getItem('skillsphere_quiz_submissions') || '[]');
      localStorage.setItem('skillsphere_quiz_submissions', JSON.stringify([submissionPayload, ...existingSubs]));
    } catch (e) {
      console.warn('Could not save quiz submission for mentor review', e);
    }

    // Attempt backend submission silently if API available
    try {
      await QuizService.submitQuiz({
        quizId: currentQuiz.id,
        answers: Object.entries(answers).map(([qId, val]) => ({ questionId: parseInt(qId), selectedOption: val }))
      });
    } catch (e) {
      // Graceful fallback to client calculation
    }

    const updatedHistory = saveLocalHistory(resultRecord);
    setQuizHistory(updatedHistory);

    setShowQuizModal(false);
    setSelectedResult(resultRecord);
    setCurrentQuiz(null);
    setAnswers({});

    if (onShowToast) {
      onShowToast('success', `Quiz Submitted! Score: ${score}/${totalQuestions} (${percentage}%)`);
    }
  };

  const studentEnrolledTitles = new Set(enrolledCourses.map(c => String(c.courseTitle || c.course?.title || '').toLowerCase().trim()));
  const studentEnrolledIds = new Set(enrolledCourses.map(c => String(c.courseId || c.course?.id).trim()));

  const filteredGlobalQuizzes = globalQuizzes.filter(q => {
    return (
      studentEnrolledIds.has(String(q.courseId).trim()) ||
      studentEnrolledTitles.has(String(q.courseTitle).toLowerCase().trim()) ||
      enrolledCourses.length === 0
    );
  }).map(q => ({
    id: q.id,
    title: q.title,
    category: q.courseTitle || 'Course Assessment',
    badge: 'Course Quiz',
    icon: 'bi-patch-question-fill',
    color: '#10b981',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: q.description || 'Assessment quiz created by mentor for your course.',
    totalQuestions: q.questions?.length || q.totalQuestions || 5,
    timeLimitMinutes: q.timeLimitMinutes || 15,
    questions: q.questions || []
  }));

  const allAvailableQuizzes = [...filteredGlobalQuizzes, ...SYSTEM_QUIZZES];

  return (
    <div className="fade-in-quick text-start">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-patch-question-fill text-success fs-3"></i>
            Quizzes Centre
          </h2>
          <p className="text-muted mb-0">Select a quiz to test your programming skills and earn performance scores.</p>
        </div>
        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
          <i className="bi bi-award-fill me-1"></i> {allAvailableQuizzes.length} Quizzes Available
        </span>
      </div>

      {/* QUIZ CONTAINERS SECTION */}
      <div className="mb-5">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-grid-1x2-fill text-primary"></i>
          Available Practice Quizzes
        </h5>
        
        <div className="row g-4">
          {allAvailableQuizzes.map((quiz) => {
            const answeredCount = quizHistory.filter(h => h.quizTitle === quiz.title || h.quizId === quiz.id).length;
            const highestScore = quizHistory
              .filter(h => h.quizTitle === quiz.title || h.quizId === quiz.id)
              .reduce((max, h) => Math.max(max, h.percentage), 0);

            return (
              <div key={quiz.id} className="col-lg-6">
                <div 
                  className="card border-0 shadow-sm rounded-4 p-4 h-100 position-relative overflow-hidden transition-all hover-lift"
                  style={{ 
                    background: `linear-gradient(135deg, ${quiz.bgColor} 0%, #ffffff 100%)`,
                    borderLeft: `5px solid ${quiz.color}`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-4 p-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                        style={{ backgroundColor: quiz.color, width: '56px', height: '56px' }}
                      >
                        <i className={`${quiz.icon} fs-2`}></i>
                      </div>
                      <div>
                        <span className="badge rounded-pill fw-bold px-3 py-1 mb-1" style={{ backgroundColor: `${quiz.color}20`, color: quiz.color }}>
                          {quiz.badge}
                        </span>
                        <h4 className="fw-bold text-dark mb-0">{quiz.title}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                    {quiz.description}
                  </p>

                  <div className="d-flex align-items-center gap-3 text-muted small mb-4 flex-wrap">
                    <span className="d-flex align-items-center gap-1 bg-white px-3 py-2 rounded-3 border shadow-sm fw-semibold">
                      <i className="bi bi-question-circle text-primary"></i>
                      {quiz.totalQuestions} Questions
                    </span>
                    <span className="d-flex align-items-center gap-1 bg-white px-3 py-2 rounded-3 border shadow-sm fw-semibold">
                      <i className="bi bi-clock text-warning"></i>
                      {quiz.timeLimitMinutes} Mins
                    </span>
                    {answeredCount > 0 && (
                      <span className="d-flex align-items-center gap-1 bg-success-subtle text-success px-3 py-2 rounded-3 border border-success-subtle fw-bold ms-auto">
                        <i className="bi bi-trophy-fill"></i>
                        Best: {highestScore}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="btn w-100 rounded-pill fw-bold py-3 text-white shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                    style={{ 
                      backgroundColor: quiz.color,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <i className="bi bi-play-circle-fill fs-5"></i>
                    Start {quiz.badge} Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUIZ HISTORY SECTION */}
      <div className="row g-4">
        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-success"></i>
                Quiz Attempt History
              </h5>
              <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                {quizHistory.length} Attempts Recorded
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-5 text-muted small">
                <i className="bi bi-hourglass-split fs-1 text-success"></i>
                <p className="mt-2 mb-0">Loading quiz history...</p>
              </div>
            ) : quizHistory.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                <i className="bi bi-clipboard-x fs-1 mb-2 text-muted"></i>
                <p className="mb-0">No quiz attempts yet. Click on any quiz container above to start!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
                    <tr className="text-muted small border-bottom" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th>Quiz Title</th>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Date Completed</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizHistory.map(result => (
                      <tr key={result.id}>
                        <td>
                          <span className="fw-bold text-dark small">{result.quizTitle}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border small fw-semibold">
                            {result.category || 'Programming'}
                          </span>
                        </td>
                        <td>
                          <span className={`fw-bold small ${result.percentage >= 70 ? 'text-success' : result.percentage >= 50 ? 'text-warning' : 'text-danger'}`}>
                            {result.score} / {result.totalPoints}
                          </span>
                        </td>
                        <td>
                          <span className={`badge px-3 py-1 rounded-pill ${result.percentage >= 70 ? 'bg-success' : result.percentage >= 50 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td>
                          <span className="text-muted small">
                            {result.completedAt ? new Date(result.completedAt).toLocaleString() : 'Just now'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            className="btn btn-outline-primary btn-sm rounded-pill fw-bold px-3 d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => handleViewResult(result)}
                          >
                            <i className="bi bi-eye-fill"></i>
                            View Breakdown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUIZ ATTEMPT RUNNER MODAL */}
      {showQuizModal && currentQuiz && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div 
                className="modal-header border-0 text-white p-4"
                style={{ backgroundColor: currentQuiz.color }}
              >
                <div>
                  <span className="badge bg-white text-dark fw-bold mb-1 px-3 py-1 rounded-pill">
                    {currentQuiz.category} Assessment
                  </span>
                  <h4 className="modal-title fw-bold text-white mb-0">{currentQuiz.title}</h4>
                  <p className="small text-white-50 mb-0 mt-1">
                    Answer all 15 questions to complete your quiz evaluation.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white ms-auto"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to exit? Progress will be lost.')) {
                      setShowQuizModal(false);
                      setCurrentQuiz(null);
                    }
                  }}
                ></button>
              </div>

              {/* Progress Bar */}
              <div className="px-4 py-2 bg-light border-bottom d-flex align-items-center justify-content-between gap-3">
                <div className="flex-grow-1">
                  <div className="progress rounded-pill" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: `${(Object.keys(answers).length / currentQuiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="fw-bold small text-muted">
                  {Object.keys(answers).length} / {currentQuiz.questions.length} Answered
                </span>
              </div>

              {/* Modal Body - 15 Questions */}
              <div className="modal-body p-4 bg-light">
                <div className="d-flex flex-column gap-4">
                  {currentQuiz.questions.map((q, index) => {
                    const isAnswered = !!answers[q.id];
                    return (
                      <div 
                        key={q.id} 
                        className={`card border-0 shadow-sm rounded-4 p-4 transition-all ${isAnswered ? 'bg-white border-start border-4 border-success' : 'bg-white'}`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill">
                            Question {index + 1} of {currentQuiz.questions.length}
                          </span>
                          {isAnswered ? (
                            <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill d-flex align-items-center gap-1">
                              <i className="bi bi-check-circle-fill"></i> Answered
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary fw-semibold px-3 py-1 rounded-pill">
                              Pending
                            </span>
                          )}
                        </div>

                        <h6 className="fw-bold text-dark mb-3 fs-5" style={{ lineHeight: '1.5' }}>
                          {q.text}
                        </h6>

                        {/* Options */}
                        <div className="row g-2">
                          {q.options.map(opt => {
                            const selected = answers[q.id] === opt.key;
                            return (
                              <div key={opt.key} className="col-md-6">
                                <button
                                  type="button"
                                  onClick={() => handleOptionSelect(q.id, opt.key)}
                                  className={`btn w-100 text-start p-3 rounded-3 transition-all d-flex align-items-center gap-3 border ${
                                    selected 
                                      ? 'btn-primary border-primary shadow-sm text-white fw-bold' 
                                      : 'btn-outline-light text-dark bg-light hover-bg-white border-secondary-subtle'
                                  }`}
                                >
                                  <span 
                                    className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                                      selected ? 'bg-white text-primary' : 'bg-white border text-secondary'
                                    }`}
                                    style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.85rem' }}
                                  >
                                    {opt.key}
                                  </span>
                                  <span className="small flex-grow-1">{opt.text}</span>
                                  {selected && <i className="bi bi-check2-circle fs-5 text-white"></i>}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer border-top bg-white p-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i> Make sure to review all answers before submission.
                </span>
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light rounded-pill px-4 fw-semibold"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel? Progress will be lost.')) {
                        setShowQuizModal(false);
                        setCurrentQuiz(null);
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                    onClick={handleSubmitQuiz}
                  >
                    <i className="bi bi-send-check-fill"></i>
                    Submit Quiz Answers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RESULT BREAKDOWN MODAL */}
      {selectedResult && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1070 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-white p-4">
                <div>
                  <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1">
                    Performance Summary
                  </span>
                  <h4 className="modal-title fw-bold text-dark">{selectedResult.quizTitle}</h4>
                </div>
                <button type="button" className="btn-close ms-auto" onClick={() => setSelectedResult(null)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                {/* Result Hero Banner */}
                <div 
                  className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center text-white overflow-hidden position-relative"
                  style={{ 
                    background: selectedResult.percentage >= 70 
                      ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' 
                      : selectedResult.percentage >= 50 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' 
                        : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  }}
                >
                  <div className="fs-1 mb-2">
                    {selectedResult.percentage >= 80 ? '🏆' : selectedResult.percentage >= 70 ? '🎉' : selectedResult.percentage >= 50 ? '👍' : '📚'}
                  </div>
                  <h2 className="fw-bold mb-1 display-5">{selectedResult.percentage}%</h2>
                  <p className="fs-5 fw-semibold mb-2">
                    Score: {selectedResult.score} / {selectedResult.totalPoints} Points
                  </p>
                  <p className="small mb-0 text-white-50">
                    {selectedResult.percentage >= 70 
                      ? 'Outstanding performance! You have mastered this core topic.' 
                      : selectedResult.percentage >= 50 
                        ? 'Good effort! Review the detailed answers below to reach perfection.' 
                        : 'Keep practicing! Check the answer breakdown below to learn.'}
                  </p>
                </div>

                {/* Detailed Answer Breakdown */}
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-list-check text-primary"></i>
                  Detailed Question Breakdown
                </h6>

                <div className="d-flex flex-column gap-3">
                  {selectedResult.answers?.map((ans, idx) => (
                    <div 
                      key={idx} 
                      className={`card border-0 shadow-sm rounded-4 p-3 ${ans.isCorrect ? 'bg-white border-start border-4 border-success' : 'bg-white border-start border-4 border-danger'}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="fw-bold small text-dark">
                          Q{idx + 1}. {ans.questionText}
                        </span>
                        <span className={`badge px-3 py-1 rounded-pill ${ans.isCorrect ? 'bg-success-subtle text-success fw-bold' : 'bg-danger-subtle text-danger fw-bold'}`}>
                          {ans.isCorrect ? '+1 Point' : '0 Points'}
                        </span>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <div className={`p-2 rounded-3 small ${ans.isCorrect ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            <strong>Your Answer:</strong> {ans.selectedOption}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-2 rounded-3 small bg-success-subtle text-success">
                            <strong>Correct Answer:</strong> {ans.correctOption}
                          </div>
                        </div>
                      </div>

                      {ans.explanation && (
                        <p className="text-muted small mb-0 mt-1 fst-italic bg-light p-2 rounded-3">
                          <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                          {ans.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer border-top bg-white p-3">
                <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedResult(null)}>
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
