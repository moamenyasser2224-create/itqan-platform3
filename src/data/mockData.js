// بيانات تجريبية تحاكي شكل قاعدة البيانات الحقيقية (Supabase لاحقًا)

export const currentUser = {
  id: 'u1',
  role: 'teacher', // teacher | student
  full_name: 'أ. مؤمن الشناوي',
  email: 'moamen@itqan.app',
};

export const teacherProfile = {
  id: 't1',
  user_id: 'u1',
  subject: 'رياضيات - ثانوية عامة',
  subscription_status: 'active',
  subscription_expires_at: '2026-08-12',
};

export const classes = [
  {
    id: 'c1',
    title: 'الجبر والمعادلات - الصف الثالث الثانوي',
    description: 'شرح كامل لمنهج الجبر مع حل مسائل تطبيقية',
    students_count: 42,
    lessons_count: 12,
  },
  {
    id: 'c2',
    title: 'مراجعة نهائية - هندسة فراغية',
    description: 'مراجعة مكثفة قبل الامتحانات',
    students_count: 28,
    lessons_count: 6,
  },
];

export const lessons = [
  { id: 'l1', class_id: 'c1', title: 'مقدمة في المعادلات التربيعية', type: 'recorded', duration_minutes: 32, completed_by_percent: 78 },
  { id: 'l2', class_id: 'c1', title: 'حل المعادلات بالتحليل', type: 'recorded', duration_minutes: 28, completed_by_percent: 65 },
  { id: 'l3', class_id: 'c1', title: 'حصة مباشرة: مراجعة أسبوعية', type: 'live', scheduled_at: '2026-07-15T18:00:00', completed_by_percent: 0 },
  { id: 'l4', class_id: 'c1', title: 'القانون العام', type: 'recorded', duration_minutes: 40, completed_by_percent: 52 },
];

export const students = [
  { id: 's1', full_name: 'يوسف أحمد', progress_percent: 90, last_active: 'اليوم' },
  { id: 's2', full_name: 'مريم سامي', progress_percent: 74, last_active: 'أمس' },
  { id: 's3', full_name: 'كريم عادل', progress_percent: 45, last_active: 'منذ 3 أيام' },
  { id: 's4', full_name: 'سلمى محمود', progress_percent: 100, last_active: 'اليوم' },
];

export const studentEnrolledClasses = [
  { id: 'c1', title: 'الجبر والمعادلات - الصف الثالث الثانوي', teacher_name: 'أ. مؤمن الشناوي', progress_percent: 68 },
];
