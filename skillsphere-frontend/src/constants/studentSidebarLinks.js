export const STUDENT_SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '/student-dashboard#dashboard' },
  { icon: 'bi-book-fill', label: 'Catalog', href: '/student-dashboard#learning' },
  { icon: 'bi-play-circle-fill', label: 'My Courses', href: '/student-dashboard#my-courses' },
  { icon: 'bi-robot', label: 'AI Tutor', href: '/student-dashboard#ai-assistant' },
  { icon: 'bi-map-fill', label: 'Roadmap', href: '/student-dashboard#ai-roadmap' },
  { icon: 'bi-graph-down', label: 'Skill Gap', href: '/student-dashboard#skill-gap' },
  { icon: 'bi-file-earmark-person-fill', label: 'Resume', href: '/student-dashboard#resume-builder' },
  { icon: 'bi-code-square', label: 'Practice', href: '/student-dashboard#coding-practice' },
  { icon: 'bi-journal-text', label: 'Assignments', href: '/student-dashboard#assignments' },
  { icon: 'bi-question-circle-fill', label: 'Quizzes', href: '/student-dashboard#quizzes' },
  { icon: 'bi-award-fill', label: 'Certificates', href: '/student-dashboard#certificates' },
  { icon: 'bi-briefcase-fill', label: 'Careers', href: '/student-dashboard#internships' },
  { icon: 'bi-calendar-check-fill', label: 'Sessions', href: '/student-dashboard#sessions' },
  { icon: 'bi-bar-chart-line-fill', label: 'Analytics', href: '/student-dashboard#progress' },
  { icon: 'bi-bell-fill', label: 'Notifications', href: '/student-dashboard#notifications' },
  { icon: 'bi-person-fill-gear', label: 'Profile', href: '/profile/my' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '/profile/settings' },
];

export const MENTOR_SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '/mentor-dashboard#dashboard' },
  { icon: 'bi-collection-play-fill', label: 'My Courses', href: '/mentor-dashboard#courses' },
  { icon: 'bi-folder-fill', label: 'Lessons', href: '/mentor-dashboard#modules' },
  { icon: 'bi-file-earmark-text-fill', label: 'Grading', href: '/mentor-dashboard#assignments' },
  { icon: 'bi-patch-question-fill', label: 'Quizzes', href: '/mentor-dashboard#quizzes' },
  { icon: 'bi-calendar-event-fill', label: 'Sessions', href: '/mentor-dashboard#sessions' },
  { icon: 'bi-briefcase-fill', label: 'Internships', href: '/mentor-dashboard#internships' },
  { icon: 'bi-journal-check', label: 'Roster', href: '/mentor-dashboard#analytics' },
  { icon: 'bi-chat-left-text-fill', label: 'Inbox', href: '/mentor-dashboard#messages' },
  { icon: 'bi-bell-fill', label: 'Notifications & Broadcast', href: '/mentor-dashboard#notifications' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '/mentor-dashboard#settings' },
];

export const ADMIN_SIDEBAR_LINKS = [
  { icon: 'bi-house-fill', label: 'Dashboard', href: '/admin-dashboard#dashboard' },
  { icon: 'bi-people-fill', label: 'Users', href: '/admin-dashboard#users' },
  { icon: 'bi-person-badge-fill', label: 'Roles', href: '/admin-dashboard#roles' },
  { icon: 'bi-check-circle-fill', label: 'Approvals', href: '/admin-dashboard#approvals' },
  { icon: 'bi-briefcase-fill', label: 'Internships', href: '/admin-dashboard#internships' },
  { icon: 'bi-chat-left-text-fill', label: 'Complaints Desk', href: '/admin-dashboard#complaints' },
  { icon: 'bi-shield-lock-fill', label: 'Audits', href: '/admin-dashboard#audits' },
  { icon: 'bi-gear-fill', label: 'Settings', href: '/admin-dashboard#settings' },
];

export function getRoleSidebarLinks(role = 'STUDENT', activeRoute = '') {
  const normalizedRole = (role || 'STUDENT').toUpperCase();
  let baseLinks = STUDENT_SIDEBAR_LINKS;

  if (normalizedRole === 'MENTOR') {
    baseLinks = MENTOR_SIDEBAR_LINKS;
  } else if (normalizedRole === 'ADMIN') {
    baseLinks = ADMIN_SIDEBAR_LINKS;
  }

  const activeStr = String(activeRoute || '');

  return baseLinks.map((link) => {
    let isActive = Boolean(link.active);

    if (!isActive && activeStr) {
      if (activeStr.includes('/profile') && link.label === 'Profile') {
        isActive = true;
      } else if (activeStr.includes('/settings') && link.label === 'Settings') {
        isActive = true;
      } else if (link.href === activeStr || activeStr.endsWith(link.href)) {
        isActive = true;
      } else {
        const hash = activeStr.includes('#') ? '#' + activeStr.split('#')[1] : '';
        if (hash && link.href.endsWith(hash)) {
          isActive = true;
        }
      }
    }

    return {
      ...link,
      active: isActive,
    };
  });
}
