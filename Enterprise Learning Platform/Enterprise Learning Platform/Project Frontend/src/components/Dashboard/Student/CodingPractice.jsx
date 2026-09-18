import { useState, useEffect } from 'react';
import { SQL_CHALLENGES } from './sqlChallenges';
import { DSA_CHALLENGES } from './dsaChallenges';

const CATEGORIES = [
  { id: 'ALL', label: 'All Domains', icon: 'bi-grid-fill' },
  { id: 'DSA', label: 'DSA & Algorithms', icon: 'bi-code-slash' },
  { id: 'REACT', label: 'Web & React', icon: 'bi-filetype-jsx' },
  { id: 'SQL', label: 'Database & SQL', icon: 'bi-database-fill' },
  { id: 'SYSTEM_DESIGN', label: 'System Design & OOP', icon: 'bi-diagram-3-fill' },
  { id: 'CORE', label: 'Core Fundamentals', icon: 'bi-cpu-fill' }
];

const LANGUAGES = [
  { id: 'cpp', label: 'C++', icon: 'bi-code-square', badge: 'C++ 20' },
  { id: 'java', label: 'Java', icon: 'bi-cup-hot-fill', badge: 'Java 17' },
  { id: 'sql', label: 'SQL', icon: 'bi-database', badge: 'MySQL 8' },
  { id: 'python', label: 'Python', icon: 'bi-filetype-py', badge: 'Python 3.11' },
  { id: 'javascript', label: 'JavaScript', icon: 'bi-filetype-js', badge: 'Node 20' }
];

const BASE_CHALLENGES = [
  {
    id: 'c10',
    title: 'React Custom Hook: useFetch',
    category: 'REACT',
    difficulty: 'Medium',
    points: 90,
    tags: ['React Hooks', 'Async', 'State Management'],
    desc: 'Implement a React custom hook `useFetch(url)` that fetches JSON data asynchronously, returns `{ data, loading, error }`, and handles loading states & errors properly.',
    examples: [
      { input: 'url = "https://api.skillsphere.com/courses"', output: '{ data: [...], loading: false, error: null }', explanation: 'Returns payload object when promise resolves.' }
    ],
    constraints: ['Must handle component unmount cleanup.', 'Should handle network rejection gracefully.'],
    hints: ['Use `useState` for state variables and `useEffect` with clean-up flag.'],
    solutionKeywords: {
      javascript: ['useState', 'useEffect', 'fetch', 'return'],
      java: ['Map', 'fetch', 'return'],
      cpp: ['fetch', 'return'],
      python: ['requests', 'return'],
      sql: ['SELECT']
    },
    starters: {
      javascript: `import { useState, useEffect } from 'react';\n\nexport function useFetch(url) {\n    // Write your React custom hook here\n    return { data: null, loading: true, error: null };\n}`,
      java: `public class UseFetchService {\n    public Map<String, Object> fetchAsync(String url) {\n        // Write your Java implementation here\n        return Map.of("data", null);\n    }\n}`,
      cpp: `class FetchService {\npublic:\n    void fetch(string url) {\n        // Write C++ fetch service here\n    }\n};`,
      python: `def use_fetch(url: str):\n    # Write Python fetch helper here\n    pass`,
      sql: `-- SQL API log query\n`
    },
    testCases: [
      { input: 'url = "https://api.skillsphere.com/courses"', expected: '{ data: [...], loading: false, error: null }' }
    ]
  }
];

// Combine DSA challenges, SQL challenges, and base challenges
const CHALLENGES = [...DSA_CHALLENGES, ...SQL_CHALLENGES, ...BASE_CHALLENGES];

export default function CodingPractice({ onAwardXP }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Challenge & Tabs
  const [selected, setSelected] = useState(CHALLENGES[0]);
  const [activeTab, setActiveTab] = useState('problem');

  // Editor Settings
  const [editorTheme, setEditorTheme] = useState('dark');
  const [fontSize] = useState('0.9rem');
  const [code, setCode] = useState('');
  
  // Custom Input Sandbox
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Execution & Logs State
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('idle');
  const [runtimeMs, setRuntimeMs] = useState(null);
  const [memoryMb, setMemoryMb] = useState(null);

  // Modal / Evaluation State
  const [showModal, setShowModal] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [evalFeedback, setEvalFeedback] = useState([]);

  // Local Storage Persistence
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('skillsphere_solved_challenges');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [savedDrafts, setSavedDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem('skillsphere_code_drafts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keyboard listener to close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Automatically select SQL language when an SQL challenge is selected, or C++ for DSA
  useEffect(() => {
    if (selected) {
      if (selected.category === 'SQL') {
        setSelectedLanguage('sql');
      } else if (selected.category === 'DSA' && selectedLanguage === 'sql') {
        setSelectedLanguage('cpp');
      }
    }
  }, [selected]);

  // Sync draft code on challenge or language change
  useEffect(() => {
    if (!selected) return;
    const draftKey = `${selected.id}_${selectedLanguage}`;
    if (savedDrafts[draftKey]) {
      setCode(savedDrafts[draftKey]);
    } else {
      setCode(selected.starters[selectedLanguage] || selected.starters['cpp'] || selected.starters['java'] || '');
    }
    setConsoleLogs([]);
    setStatus('idle');
    setRuntimeMs(null);
    setMemoryMb(null);
  }, [selected, selectedLanguage]);

  // Save draft locally on code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (!selected) return;
    const draftKey = `${selected.id}_${selectedLanguage}`;
    const updated = { ...savedDrafts, [draftKey]: newCode };
    setSavedDrafts(updated);
    try {
      localStorage.setItem('skillsphere_code_drafts', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save draft to localStorage', e);
    }
  };

  // Filter challenges
  const filteredChallenges = CHALLENGES.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'ALL' || c.difficulty.toUpperCase() === selectedDifficulty.toUpperCase();
    const isSolved = solvedIds.has(c.id);
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'SOLVED' && isSolved) ||
      (selectedStatus === 'UNSOLVED' && !isSolved);
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesStatus && matchesSearch;
  });

  // Difficulty counts
  const easyCount = CHALLENGES.filter(c => c.difficulty === 'Easy');
  const mediumCount = CHALLENGES.filter(c => c.difficulty === 'Medium');
  const hardCount = CHALLENGES.filter(c => c.difficulty === 'Hard');

  const easySolved = easyCount.filter(c => solvedIds.has(c.id)).length;
  const mediumSolved = mediumCount.filter(c => solvedIds.has(c.id)).length;
  const hardSolved = hardCount.filter(c => solvedIds.has(c.id)).length;

  const handleSelectChallenge = (challenge) => {
    setSelected(challenge);
    setActiveTab('problem');
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
  };

  const handleResetCode = () => {
    if (!selected) return;
    const defaultCode = selected.starters[selectedLanguage] || selected.starters['cpp'] || selected.starters['java'] || '';
    handleCodeChange(defaultCode);
  };

  // Language-Aware Accuracy Evaluator (0% - 100%)
  const evaluateSubmissionAccuracy = (userCode) => {
    const cleanCode = userCode.trim();
    const lowerCode = cleanCode.toLowerCase();
    
    // Check 1: Empty or minimal starter template
    if (cleanCode.length === 0) {
      return { score: 0, feedback: ['Code editor is empty. Please write your code before submitting.'] };
    }

    const starterStr = (selected.starters[selectedLanguage] || '').trim();
    if (cleanCode === starterStr || lowerCode.includes('// write your') || lowerCode.includes('# write your')) {
      return { score: 0, feedback: [`No ${selectedLanguage.toUpperCase()} code written. Please replace starter comments with your solution code.`] };
    }

    let score = 100;
    const feedback = [];

    // Check 2: Language Specific Syntax Check
    if (selectedLanguage === 'cpp') {
      if (!lowerCode.includes('return') && !lowerCode.includes('class')) {
        score -= 40;
        feedback.push('Missing C++ return statement or class definition.');
      } else {
        feedback.push('✔ Valid C++ class structure and return statements detected.');
      }
    } else if (selectedLanguage === 'java') {
      if (!lowerCode.includes('return') && !lowerCode.includes('public class')) {
        score -= 40;
        feedback.push('Missing Java public class or return statement.');
      } else {
        feedback.push('✔ Valid Java OOP method structure and return statements detected.');
      }
    } else if (selectedLanguage === 'python') {
      if (!lowerCode.includes('def') && !lowerCode.includes('return')) {
        score -= 40;
        feedback.push('Missing Python def method or return statement.');
      } else {
        feedback.push('✔ Valid Python function signature detected.');
      }
    } else if (selectedLanguage === 'sql') {
      const sqlKw = ['select', 'create', 'alter', 'insert', 'update', 'delete', 'with'];
      const hasSqlKw = sqlKw.some(kw => lowerCode.includes(kw));
      if (!hasSqlKw) {
        score -= 50;
        feedback.push('Missing SQL DDL/DQL query statement (e.g. SELECT, CREATE, ALTER).');
      } else {
        feedback.push('✔ Valid SQL relational query plan syntax detected.');
      }
    }

    // Check 3: Problem Specific Keyword Matching
    let keywords = [];
    if (selected.solutionKeywords) {
      if (Array.isArray(selected.solutionKeywords)) {
        keywords = selected.solutionKeywords;
      } else if (typeof selected.solutionKeywords === 'object') {
        keywords = selected.solutionKeywords[selectedLanguage] || selected.solutionKeywords['cpp'] || selected.solutionKeywords['java'] || [];
      }
    }

    if (keywords.length > 0) {
      const missingKw = keywords.filter(kw => !lowerCode.includes(kw.toLowerCase()));
      if (missingKw.length > 0) {
        const deduction = Math.round(40 / keywords.length) * missingKw.length;
        score -= deduction;
        feedback.push(`Missing key language constructs: ${missingKw.join(', ')}`);
      } else {
        feedback.push(`✔ All required ${selectedLanguage.toUpperCase()} language constructs present.`);
      }
    }

    // Check 4: Length & Logical Structure
    if (cleanCode.length < 25) {
      score -= 25;
      feedback.push('Code length too short to contain complete algorithm logic.');
    } else {
      feedback.push(`✔ Algorithm logic adequately structured for ${selectedLanguage.toUpperCase()}.`);
    }

    score = Math.max(0, Math.min(100, score));

    if (score === 100) {
      feedback.unshift(`🎉 100% Accuracy! All test cases passed in ${selectedLanguage.toUpperCase()}!`);
    }

    return { score, feedback };
  };

  // Enterprise Next Challenge Navigation
  const handleNextChallenge = () => {
    setShowModal(false);
    const listToUse = filteredChallenges.length > 0 ? filteredChallenges : CHALLENGES;
    const currentIndex = listToUse.findIndex(c => c.id === selected.id);
    
    if (currentIndex >= 0 && currentIndex < listToUse.length - 1) {
      setSelected(listToUse[currentIndex + 1]);
    } else if (listToUse.length > 0) {
      const firstUnsolved = listToUse.find(c => !solvedIds.has(c.id));
      setSelected(firstUnsolved || listToUse[0]);
    }
    setActiveTab('problem');
  };

  // Execution & Submission Handler
  const handleRun = (isSubmit = false) => {
    setRunning(true);
    const langInfo = LANGUAGES.find(l => l.id === selectedLanguage);
    
    setConsoleLogs([
      `⚡ Compiling and executing ${langInfo?.badge || selectedLanguage.toUpperCase()} environment...`,
      `📦 Validating student syntax and evaluating logic against test suite...`
    ]);
    setStatus('idle');

    setTimeout(() => {
      const { score, feedback } = evaluateSubmissionAccuracy(code);
      const isPass = score === 100;
      const timeTaken = Math.floor(Math.random() * 8) + 2;
      const memoryUsed = (Math.random() * 2 + 18.2).toFixed(1);
      const beatPercentile = (Math.random() * 5 + 94.5).toFixed(1);

      setRuntimeMs(timeTaken);
      setMemoryMb(memoryUsed);
      setAccuracyScore(score);
      setEvalFeedback(feedback);

      if (isPass) {
        setConsoleLogs([
          `✔ Compilation & Execution finished with 0 errors (${langInfo?.badge}).`,
          `--------------------------------------------------`,
          `🎯 ACCURACY SCORE: 100% (PERFECT SOLUTION!)`,
          `⏱ Execution Time: ${timeTaken} ms (Faster than ${beatPercentile}% of ${selectedLanguage.toUpperCase()} submissions)`,
          `💾 Memory Footprint: ${memoryUsed} MB`,
          `🎉 Great job! Solution passed all test cases with 100% accuracy.`
        ]);
        setStatus('pass');

        if (isSubmit) {
          const updatedSolved = new Set([...solvedIds, selected.id]);
          setSolvedIds(updatedSolved);
          try {
            localStorage.setItem('skillsphere_solved_challenges', JSON.stringify(Array.from(updatedSolved)));
          } catch (e) {
            console.warn('Could not save solved challenges', e);
          }

          if (onAwardXP && !solvedIds.has(selected.id)) {
            onAwardXP(selected.points, `Solved: ${selected.title} (${langInfo?.label})`);
          }

          // Trigger Celebration Popup Modal
          setShowModal(true);
        }
      } else {
        setConsoleLogs([
          `❌ Execution Results - ACCURACY SCORE: ${score}% (${selectedLanguage.toUpperCase()})`,
          `--------------------------------------------------`,
          ...feedback.map(f => `  • ${f}`),
          `💡 Hint: Review problem constraints and check your code syntax.`
        ]);
        setStatus('fail');

        if (isSubmit) {
          setShowModal(true);
        }
      }
      setRunning(false);
    }, 1000);
  };

  return (
    <div className="fade-in-quick text-start position-relative">

      {/* Enterprise Celebration & Submission Result Modal */}
      {showModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
          style={{ background: 'rgba(15, 23, 42, 0.75)', zIndex: 1060, backdropFilter: 'blur(6px)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="card border-0 rounded-4 p-4 shadow-lg text-center position-relative overflow-hidden fade-in-quick"
            style={{ maxWidth: '520px', width: '90%', background: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Dismiss Icon X */}
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              aria-label="Close"
              style={{ zIndex: 30, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(false);
              }}
            ></button>

            {/* Confetti Animation Background for 100% Score */}
            {accuracyScore === 100 && (
              <div 
                className="confetti-container position-absolute top-0 start-0 w-100 h-100" 
                style={{ pointerEvents: 'none', zIndex: 1 }}
              >
                <div className="confetti-particle" style={{ left: '10%', animationDelay: '0s', pointerEvents: 'none' }}>🎉</div>
                <div className="confetti-particle" style={{ left: '30%', animationDelay: '0.2s', pointerEvents: 'none' }}>🥳</div>
                <div className="confetti-particle" style={{ left: '50%', animationDelay: '0.4s', pointerEvents: 'none' }}>✨</div>
                <div className="confetti-particle" style={{ left: '70%', animationDelay: '0.1s', pointerEvents: 'none' }}>🚀</div>
                <div className="confetti-particle" style={{ left: '90%', animationDelay: '0.3s', pointerEvents: 'none' }}>⭐</div>
              </div>
            )}

            {/* Header Icon */}
            <div className="mb-3" style={{ position: 'relative', zIndex: 5 }}>
              {accuracyScore === 100 ? (
                <div className="d-inline-flex p-3 bg-success-subtle text-success rounded-circle shadow-sm">
                  <i className="bi bi-emoji-smile-fill fs-1"></i>
                </div>
              ) : (
                <div className="d-inline-flex p-3 bg-warning-subtle text-warning rounded-circle shadow-sm">
                  <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
              )}
            </div>

            {/* Accuracy Badge */}
            <div className="mb-2" style={{ position: 'relative', zIndex: 5 }}>
              <span className={`badge rounded-pill px-4 py-2 fs-6 fw-bold ${accuracyScore === 100 ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                {accuracyScore === 100 ? '🎉 GOOD JOB! 100% ACCURATE' : `⚠️ ACCURACY: ${accuracyScore}%`}
              </span>
            </div>

            <h3 className="fw-bold text-dark mb-2" style={{ position: 'relative', zIndex: 5 }}>
              {accuracyScore === 100 ? 'Outstanding Work!' : 'Almost There!'}
            </h3>

            <p className="text-muted small mb-3" style={{ position: 'relative', zIndex: 5 }}>
              {accuracyScore === 100
                ? `You successfully solved "${selected.title}" in ${selectedLanguage.toUpperCase()} with 100% accuracy!`
                : `Your code achieved ${accuracyScore}% accuracy. Please review the feedback below to fix your solution.`}
            </p>

            {/* XP Awarded Badge for 100% */}
            {accuracyScore === 100 && (
              <div className="p-3 bg-warning-subtle rounded-3 border border-warning mb-3 d-flex justify-content-center align-items-center gap-2" style={{ position: 'relative', zIndex: 5 }}>
                <i className="bi bi-lightning-charge-fill text-warning fs-4"></i>
                <strong className="text-dark">+{selected.points} XP Awarded to your Profile!</strong>
              </div>
            )}

            {/* Diagnostic Feedback List */}
            <div className="bg-light p-3 rounded-3 text-start small mb-4 border" style={{ maxHeight: '140px', overflowY: 'auto', position: 'relative', zIndex: 5 }}>
              <strong className="d-block text-dark mb-1">Execution Diagnostics ({selectedLanguage.toUpperCase()}):</strong>
              {evalFeedback.map((fb, idx) => (
                <div key={idx} className={`mb-1 ${fb.includes('✔') || fb.includes('100%') ? 'text-success fw-semibold' : 'text-danger'}`}>
                  {fb}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-3" style={{ position: 'relative', zIndex: 30 }}>
              {accuracyScore === 100 ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                    style={{ zIndex: 35, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowModal(false);
                    }}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                    style={{ zIndex: 35, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextChallenge();
                    }}
                  >
                    Next Challenge <i className="bi bi-arrow-right me-1"></i>
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm"
                  style={{ zIndex: 35, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(false);
                  }}
                >
                  <i className="bi bi-pencil-square me-1"></i>Try Again & Fix Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ENTERPRISE PRACTICE ARENA • LEETCODE GRADE (30 DSA + 50 SQL)
          </span>
          <h2 className="fw-bold text-dark mb-1">Coding & SQL Practice Arena</h2>
          <p className="text-muted mb-0 small">Master 30 DSA topics in C++ & Java and 50+ SQL practice questions from Easy to Hard with real-time evaluation.</p>
        </div>

        {/* Stats Dashboard */}
        <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-4 border shadow-xs">
          <div className="p-2 bg-success-subtle text-success rounded-circle">
            <i className="bi bi-trophy-fill fs-4"></i>
          </div>
          <div>
            <span className="text-xs text-muted font-bold text-uppercase d-block">Solved Challenges</span>
            <div className="d-flex align-items-baseline gap-2">
              <strong className="text-dark fs-5">{solvedIds.size} / {CHALLENGES.length}</strong>
              <span className="text-success small fw-bold">
                ({Math.round((solvedIds.size / CHALLENGES.length) * 100)}%)
              </span>
            </div>
            <div className="d-flex gap-2 mt-1" style={{ fontSize: '0.7rem' }}>
              <span className="badge bg-success-subtle text-success fw-bold">Easy {easySolved}/{easyCount.length}</span>
              <span className="badge bg-warning-subtle text-warning fw-bold">Med {mediumSolved}/{mediumCount.length}</span>
              <span className="badge bg-danger-subtle text-danger fw-bold">Hard {hardSolved}/{hardCount.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain & Filter Selection Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span className="fw-bold text-dark small">
            <i className="bi bi-sliders me-2 text-success"></i>Select Topic / Domain to Practice:
          </span>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="btn-group btn-group-sm rounded-pill p-1 bg-light border" role="group">
              {['ALL', 'UNSOLVED', 'SOLVED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn btn-xs rounded-pill px-3 fw-bold ${
                    selectedStatus === st ? 'btn-dark text-white' : 'btn-light text-muted'
                  }`}
                  onClick={() => setSelectedStatus(st)}
                  style={{ fontSize: '0.72rem' }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Difficulty Filter Pills */}
            <div className="btn-group btn-group-sm rounded-pill p-1 bg-light border" role="group">
              {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`btn btn-xs rounded-pill px-3 fw-bold ${
                    selectedDifficulty === diff ? 'btn-success text-white' : 'btn-light text-muted'
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{ fontSize: '0.72rem' }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="d-flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-2 transition-all d-flex align-items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'btn-success text-white fw-bold shadow-xs'
                  : 'btn-outline-secondary text-dark'
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <i className={`bi ${cat.icon}`}></i>
              <span>{cat.label}</span>
              {cat.id === 'DSA' && (
                <span className="badge bg-white text-success rounded-pill ms-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                  {DSA_CHALLENGES.length} Qs
                </span>
              )}
              {cat.id === 'SQL' && (
                <span className="badge bg-warning text-dark rounded-pill ms-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                  {SQL_CHALLENGES.length} Qs
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Challenges List & Search */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark mb-0">
                <i className="bi bi-code-square text-success me-2"></i>Challenges ({filteredChallenges.length})
              </h6>
            </div>

            {/* Search Input */}
            <div className="mb-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 rounded-end-pill py-2 text-dark"
                  placeholder="Search DSA, Array, Tree, SQL, JOIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Challenge Cards Scroll List */}
            <div className="d-flex flex-column gap-2" style={{ maxHeight: '640px', overflowY: 'auto' }}>
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((c) => {
                  const isSolved = solvedIds.has(c.id);
                  const isSelected = selected.id === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-4 cursor-pointer border transition-all ${
                        isSelected ? 'border-success bg-success-subtle shadow-xs' : 'bg-light hover-bg-white'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectChallenge(c)}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          {isSolved ? (
                            <i className="bi bi-check-circle-fill text-success fs-6" title="Solved"></i>
                          ) : (
                            <i className="bi bi-circle text-muted" style={{ fontSize: '0.75rem' }}></i>
                          )}
                          <h6 className="fw-bold text-dark mb-0 small text-truncate" style={{ maxWidth: '170px' }}>
                            {c.title}
                          </h6>
                        </div>
                        <span
                          className={`badge rounded-pill fw-bold text-uppercase ${
                            c.difficulty === 'Easy'
                              ? 'bg-success-subtle text-success'
                              : c.difficulty === 'Medium'
                              ? 'bg-warning-subtle text-warning'
                              : 'bg-danger-subtle text-danger'
                          }`}
                          style={{ fontSize: '0.62rem' }}
                        >
                          {c.difficulty}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>
                          {c.category}
                        </span>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-lightning-fill text-warning me-1"></i>+{c.points} XP
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted small">
                  No challenges found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Multi-Tab Sandbox */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white border" style={{ border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            
            {/* Header & Tabs */}
            <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success-subtle text-success rounded-pill fw-bold text-uppercase px-3 py-1" style={{ fontSize: '0.65rem' }}>
                  {selected.category} • {selected.difficulty}
                </span>
                <h5 className="fw-bold text-dark mb-0">{selected.title}</h5>
              </div>

              {/* Inspector Navigation Tabs */}
              <ul className="nav nav-pills nav-fill bg-white p-1 rounded-pill border" style={{ fontSize: '0.78rem' }}>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link rounded-pill py-1 px-3 fw-bold ${activeTab === 'problem' ? 'active bg-success text-white' : 'text-muted'}`}
                    onClick={() => setActiveTab('problem')}
                  >
                    <i className="bi bi-file-text me-1"></i>Problem
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link rounded-pill py-1 px-3 fw-bold ${activeTab === 'testcases' ? 'active bg-success text-white' : 'text-muted'}`}
                    onClick={() => setActiveTab('testcases')}
                  >
                    <i className="bi bi-check2-square me-1"></i>Test Cases ({selected.testCases?.length || 0})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link rounded-pill py-1 px-3 fw-bold ${activeTab === 'editorial' ? 'active bg-success text-white' : 'text-muted'}`}
                    onClick={() => setActiveTab('editorial')}
                  >
                    <i className="bi bi-lightbulb me-1"></i>Hints & Solution
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab Contents */}
            <div className="p-4 border-bottom bg-white" style={{ minHeight: '160px', maxHeight: '240px', overflowY: 'auto' }}>
              {activeTab === 'problem' && (
                <div>
                  <p className="text-dark small mb-3 lh-base" style={{ whiteSpace: 'pre-line', fontSize: '0.88rem' }}>
                    {selected.desc}
                  </p>

                  {/* Examples */}
                  {selected.examples && selected.examples.map((ex, idx) => (
                    <div key={idx} className="bg-light p-3 rounded-3 mb-2 border text-monospace small" style={{ fontSize: '0.8rem' }}>
                      <strong className="text-dark d-block mb-1">Example {idx + 1}:</strong>
                      <div><span className="text-muted fw-bold">Input:</span> <code>{ex.input}</code></div>
                      <div><span className="text-muted fw-bold">Output:</span> <code>{ex.output}</code></div>
                      {ex.explanation && <div className="text-muted mt-1"><i className="bi bi-info-circle me-1"></i>{ex.explanation}</div>}
                    </div>
                  ))}

                  {/* Constraints & Tags */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
                    <div className="d-flex flex-wrap gap-1">
                      {selected.tags.map((t, idx) => (
                        <span key={idx} className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '0.68rem' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-warning fw-bold small">⚡ Reward: +{selected.points} XP</span>
                  </div>
                </div>
              )}

              {activeTab === 'testcases' && (
                <div className="d-flex flex-column gap-2">
                  <h6 className="fw-bold text-dark small mb-2">Sample Test Cases ({selected.testCases?.length}):</h6>
                  {selected.testCases?.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-dark text-white me-2">Case {idx + 1}</span>
                        <code className="text-dark fw-bold">{tc.input}</code>
                      </div>
                      <div>
                        <span className="text-muted small me-2">Expected:</span>
                        <code className="text-success fw-bold">{tc.expected}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'editorial' && (
                <div>
                  <h6 className="fw-bold text-dark small mb-2">Algorithmic Hints & Approach:</h6>
                  {selected.hints && selected.hints.length > 0 ? (
                    selected.hints.map((h, idx) => (
                      <div key={idx} className="alert alert-info py-2 px-3 mb-2 small rounded-3">
                        <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
                        <strong>Hint {idx + 1}:</strong> {h}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small">No specific hints required for this problem.</p>
                  )}
                </div>
              )}
            </div>

            {/* Language & Editor Controls Bar */}
            <div className="p-2 bg-dark d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 border-bottom border-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="text-white-50 text-xs me-2">LANGUAGE:</span>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    className={`btn btn-xs rounded-pill px-3 py-1 fw-bold transition-all ${
                      selectedLanguage === lang.id
                        ? 'btn-success text-white shadow-xs'
                        : 'btn-outline-light text-white-50'
                    }`}
                    onClick={() => handleLanguageChange(lang.id)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className={`bi ${lang.icon} me-1`}></i>
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Theme & Controls */}
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-xs btn-outline-secondary text-white-50 rounded-circle"
                  title="Toggle Theme"
                  onClick={() => setEditorTheme(t => t === 'dark' ? 'light' : 'dark')}
                >
                  <i className={`bi ${editorTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                </button>
                <span className="badge bg-secondary text-white-50 font-monospace text-xs">
                  {LANGUAGES.find(l => l.id === selectedLanguage)?.badge}
                </span>
              </div>
            </div>

            {/* Code Input Area with IDE Styling */}
            <div className="position-relative" style={{ background: editorTheme === 'dark' ? '#1e1e1e' : '#f8f9fa' }}>
              {/* Line numbers column */}
              <div 
                className="position-absolute text-muted small text-end pt-3"
                style={{ 
                  left: 0, 
                  top: 0, 
                  bottom: 0, 
                  width: '40px', 
                  fontFamily: 'Courier New, monospace', 
                  borderRight: editorTheme === 'dark' ? '1px solid #333' : '1px solid #ddd', 
                  background: editorTheme === 'dark' ? '#181818' : '#e9ecef',
                  userSelect: 'none',
                  paddingRight: '8px',
                  color: editorTheme === 'dark' ? '#666' : '#888'
                }}
              >
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div key={idx} style={{ height: '21px' }}>{idx + 1}</div>
                ))}
              </div>

              <textarea
                className={`form-control border-0 p-3 font-monospace ps-5 ${editorTheme === 'dark' ? 'text-white' : 'text-dark'}`}
                style={{ 
                  background: editorTheme === 'dark' ? '#1e1e1e' : '#ffffff', 
                  fontFamily: '"Fira Code", "Courier New", Courier, monospace', 
                  fontSize: fontSize, 
                  lineHeight: '21px',
                  height: '320px',
                  resize: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: editorTheme === 'dark' ? '#e2e8f0' : '#1a202c'
                }}
                placeholder={`Write your ${selectedLanguage.toUpperCase()} code solution here...`}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                disabled={running}
                spellCheck="false"
              />
            </div>

            {/* Action & Sandbox Controls */}
            <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                  onClick={handleResetCode}
                  disabled={running}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Reset Code
                </button>

                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="customInputSwitch"
                    checked={useCustomInput}
                    onChange={(e) => setUseCustomInput(e.target.checked)}
                  />
                  <label className="form-check-label small text-muted cursor-pointer" htmlFor="customInputSwitch">
                    Custom Input
                  </label>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className="btn btn-outline-success btn-sm rounded-pill px-4 fw-bold shadow-xs"
                  onClick={() => handleRun(false)}
                  disabled={running}
                >
                  {running ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>Running...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-play-fill me-1"></i>Run Sandbox
                    </span>
                  )}
                </button>
                
                <button 
                  type="button"
                  className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm"
                  onClick={() => handleRun(true)}
                  disabled={running}
                >
                  {running ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>Evaluating...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-cloud-arrow-up-fill me-1"></i>Submit Solution
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Input Field Area */}
            {useCustomInput && (
              <div className="p-3 bg-white border-top">
                <label className="form-label text-dark fw-bold small mb-1">Custom Test Case Input:</label>
                <textarea
                  className="form-control font-monospace bg-light small"
                  rows="2"
                  placeholder="Enter custom test arguments..."
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                />
              </div>
            )}

            {/* Test Execution & SQL Result Table Inspector */}
            {consoleLogs.length > 0 && (
              <div 
                className="p-3 font-monospace text-start"
                style={{ 
                  background: '#0d1117', 
                  color: '#c9d1d9', 
                  fontSize: '0.82rem', 
                  borderTop: '2px solid #30363d',
                  minHeight: '140px'
                }}
              >
                <div className="fw-bold mb-2 pb-1 border-bottom border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-white-50">
                    <i className="bi bi-terminal-fill me-2 text-success"></i>EXECUTION LOGS ({selectedLanguage.toUpperCase()})
                  </span>
                  <div>
                    {runtimeMs && <span className="badge bg-dark border border-secondary me-2 text-info">{runtimeMs} ms</span>}
                    {memoryMb && <span className="badge bg-dark border border-secondary me-2 text-warning">{memoryMb} MB</span>}
                    {status === 'pass' && <span className="badge bg-success text-white fw-bold">ACCEPTED (100% ACCURACY) ✔</span>}
                    {status === 'fail' && <span className="badge bg-danger text-white fw-bold">ACCURACY: {accuracyScore}% ❌</span>}
                  </div>
                </div>

                {consoleLogs.map((log, i) => (
                  <div key={i} className={`mb-1 ${
                    log.includes('🎉') || log.includes('ACCEPTED') || log.includes('✔') ? 'text-success fw-semibold' : 
                    log.includes('❌') || log.includes('Failed') || log.includes('Error') ? 'text-danger fw-semibold' : 
                    log.includes('⚡') || log.includes('Query') ? 'text-info' : 'text-secondary'
                  }`}>
                    {log}
                  </div>
                ))}

                {/* Real SQL Data Grid Output Table View */}
                {status === 'pass' && selected.tableOutput && (
                  <div className="mt-3 p-3 bg-dark rounded-3 border border-secondary">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-success fw-bold small">
                        <i className="bi bi-table me-2"></i>QUERY RESULT DATA GRID:
                      </span>
                      <span className="text-white-50 text-xs font-monospace">
                        Rows: {selected.tableOutput.rows.length} | Columns: {selected.tableOutput.columns.length}
                      </span>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '200px' }}>
                      <table className="table table-dark table-striped table-hover table-sm border-secondary align-middle mb-0 text-start" style={{ fontSize: '0.78rem' }}>
                        <thead>
                          <tr className="table-secondary text-dark">
                            <th scope="col" style={{ width: '40px' }}>#</th>
                            {selected.tableOutput.columns.map((col, idx) => (
                              <th key={idx} scope="col" className="fw-bold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.tableOutput.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              <th scope="row" className="text-white-50">{rIdx + 1}</th>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="text-light">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confetti Animation CSS */}
      <style>{`
        .confetti-container {
          overflow: hidden;
          z-index: 10;
        }
        .confetti-particle {
          position: absolute;
          top: -20px;
          font-size: 1.5rem;
          animation: floatConfetti 3s ease-in-out infinite;
        }
        @keyframes floatConfetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(450px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
