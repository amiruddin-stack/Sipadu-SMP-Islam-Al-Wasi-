import { 
  Student, 
  DailyAttendance, 
  SubjectGrades, 
  SchoolClass, 
  SchoolSubject, 
  SchoolConfig,
  Teacher,
  SchoolAnnouncement
} from '../types';
import { 
  initialClasses, 
  initialConfig, 
  initialStudents, 
  initialSubjects, 
  initialTeachers,
  initialAnnouncements,
  generateSampleAttendance, 
  generateSampleGrades 
} from '../data/mockData';

const STORAGE_KEYS = {
  CONFIG: 'smart_school_config_v2',
  CLASSES: 'smart_school_classes_v2',
  SUBJECTS: 'smart_school_subjects_v2',
  STUDENTS: 'smart_school_students_v2',
  TEACHERS: 'smart_school_teachers_v2',
  ANNOUNCEMENTS: 'smart_school_announcements_v2',
  ATTENDANCE: 'smart_school_attendance_v2',
  GRADES: 'smart_school_grades_v2',
};

export const loadStoredData = () => {
  try {
    const config: SchoolConfig = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || 'null') || initialConfig;
    const classes: SchoolClass[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || 'null') || initialClasses;
    const subjects: SchoolSubject[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || 'null') || initialSubjects;
    const students: Student[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || 'null') || initialStudents;
    const teachers: Teacher[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || 'null') || initialTeachers;
    const announcements: SchoolAnnouncement[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || 'null') || initialAnnouncements;
    const attendance: Record<string, DailyAttendance> = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || 'null') || generateSampleAttendance();
    const grades: Record<string, SubjectGrades> = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || 'null') || generateSampleGrades();

    return { config, classes, subjects, students, teachers, announcements, attendance, grades };
  } catch (e) {
    console.error('Error loading stored data, falling back to defaults', e);
    return {
      config: initialConfig,
      classes: initialClasses,
      subjects: initialSubjects,
      students: initialStudents,
      teachers: initialTeachers,
      announcements: initialAnnouncements,
      attendance: generateSampleAttendance(),
      grades: generateSampleGrades(),
    };
  }
};

export const saveToStorage = (key: keyof typeof STORAGE_KEYS, data: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
};

export const resetToDefaultData = () => {
  localStorage.clear();
  return {
    config: initialConfig,
    classes: initialClasses,
    subjects: initialSubjects,
    students: initialStudents,
    teachers: initialTeachers,
    announcements: initialAnnouncements,
    attendance: generateSampleAttendance(),
    grades: generateSampleGrades(),
  };
};

// Calculations
export const calculateStudentAttendanceStats = (
  studentId: string,
  classId: string,
  allAttendance: Record<string, DailyAttendance>
) => {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  const relevantDays = Object.values(allAttendance).filter((att) => att.classId === classId);
  const totalDays = relevantDays.length;

  relevantDays.forEach((att) => {
    const entry = att.entries[studentId];
    if (entry) {
      if (entry.status === 'H') hadir++;
      else if (entry.status === 'S') sakit++;
      else if (entry.status === 'I') izin++;
      else if (entry.status === 'A') alpa++;
    }
  });

  const percentage = totalDays > 0 ? Math.round((hadir / totalDays) * 100) : 100;

  return {
    hadir,
    sakit,
    izin,
    alpa,
    totalDays,
    percentage,
    isWarning: alpa >= 3 || percentage < 80,
  };
};

export const calculateStudentFinalGrade = (
  studentGrade: any,
  weights = { tugas: 30, uh: 30, pts: 20, pas: 20 },
  kkm = 75
): {
  avgTugas: number;
  avgUh: number;
  finalGrade: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  isPassed: boolean;
} => {
  if (!studentGrade) return { avgTugas: 0, avgUh: 0, finalGrade: 0, predicate: 'D', isPassed: false };

  const { tugas1, tugas2, tugas3, uh1, uh2, pts, pas } = studentGrade;

  const tugasArr = [tugas1, tugas2, tugas3].filter((v) => v !== null && v !== undefined && !isNaN(v)) as number[];
  const uhArr = [uh1, uh2].filter((v) => v !== null && v !== undefined && !isNaN(v)) as number[];

  const avgTugas = tugasArr.length > 0 ? tugasArr.reduce((a, b) => a + b, 0) / tugasArr.length : 0;
  const avgUh = uhArr.length > 0 ? uhArr.reduce((a, b) => a + b, 0) / uhArr.length : 0;
  const scorePts = pts !== null && pts !== undefined ? pts : 0;
  const scorePas = pas !== null && pas !== undefined ? pas : 0;

  const totalWeight = weights.tugas + weights.uh + weights.pts + weights.pas;
  const normWeightTugas = (weights.tugas / totalWeight);
  const normWeightUh = (weights.uh / totalWeight);
  const normWeightPts = (weights.pts / totalWeight);
  const normWeightPas = (weights.pas / totalWeight);

  const finalGrade = Math.round(
    avgTugas * normWeightTugas +
    avgUh * normWeightUh +
    scorePts * normWeightPts +
    scorePas * normWeightPas
  );

  let predicate: 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalGrade >= 90) predicate = 'A';
  else if (finalGrade >= 80) predicate = 'B';
  else if (finalGrade >= 70) predicate = 'C';
  else predicate = 'D';

  const isPassed = finalGrade >= kkm;

  return {
    avgTugas: Math.round(avgTugas * 10) / 10,
    avgUh: Math.round(avgUh * 10) / 10,
    finalGrade,
    predicate,
    isPassed,
  };
};

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const content = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
