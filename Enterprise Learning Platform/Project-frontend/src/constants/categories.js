export const COURSE_CATEGORIES = [
  'Design',
  'Marketing',
  'Programming',
  'Soft Skills',
  'AI & ML',
  'Business',
  'Cloud',
  'Cyber Security',
  'Data Science',
];

export const COURSE_FILTER_CATEGORIES = ['All', ...COURSE_CATEGORIES];

export function getCategoryBadgeClass(category) {
  const normalized = (category || '').trim().toLowerCase();

  switch (normalized) {
    case 'design':
      return 'badge-design';
    case 'marketing':
      return 'bg-warning text-dark';
    case 'programming':
    case 'tech':
      return 'badge-tech';
    case 'soft skills':
      return 'bg-info text-dark';
    case 'ai & ml':
    case 'ai':
      return 'bg-primary text-white';
    case 'business':
      return 'badge-business';
    case 'cloud':
      return 'bg-info text-white';
    case 'cyber security':
      return 'bg-danger text-white';
    case 'data science':
      return 'bg-success text-white';
    default:
      return 'bg-secondary text-white';
  }
}
