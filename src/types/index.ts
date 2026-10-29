export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface StudentAchievement {
  id: string;
  title: string;
  category: 'Akademik' | 'Seni' | 'Olahraga' | 'Keagamaan' | 'Lainnya';
  level: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional';
  year: string;
  description?: string;
}

export interface StudentCounselingLog {
  id: string;
  date: string;
  category: 'Bimbingan Belajar' | 'Kedisiplinan' | 'Sosial & Emosional' | 'Pengembangan Minat';
  description: string;
  actionTaken: string;
  counselor: string;
}

export interface StudentCharacterP5 {
  beriman: number; // 1-4 scale
  mandiri: number;
  gotongRoyong: number;
  bernalarKritis: number;
  kreatif: number;
  berkebinekaan: number;
  notes: string;
}

export interface StudentTuition {
  month: string; // e.g., "Juli 2026", "Agustus 2026"
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  parentPhone?: string;
  parentName?: string;
  birthDate?: string;
  extracurriculars?: string[];
  achievements?: StudentAchievement[];
  characterP5?: StudentCharacterP5;
  counselingLogs?: StudentCounselingLog[];
  tuition?: StudentTuition[];
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface DailyAttendance {
  id: string; // date_classId
  date: string; // YYYY-MM-DD
  classId: string;
  subjectId?: string;
  entries: Record<string, AttendanceEntry>; // studentId -> entry
  createdAt: string;
}

export interface StudentGrade {
  studentId: string;
  tugas1: number | null;
  tugas2: number | null;
  tugas3: number | null;
  uh1: number | null;
  uh2: number | null;
  pts: number | null;
  pas: number | null;
  finalGrade?: number;
  predicate?: 'A' | 'B' | 'C' | 'D';
  isPassed?: boolean;
  aiNarrative?: string;
  homeroomNote?: string;
  remedialNote?: string;
}

export interface SubjectGrades {
  id: string; // classId_subjectId_semester
  classId: string;
  subjectId: string;
  semester: 'Ganjil' | 'Genap';
  academicYear: string;
  grades: Record<string, StudentGrade>; // studentId -> grade
  kkm: number;
  weights: {
    tugas: number;
    uh: number;
    pts: number;
    pas: number;
  };
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: '7' | '8' | '9' | '10' | '11' | '12';
  homeroomTeacher: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  totalStudents: number;
}

export interface SchoolSubject {
  id: string;
  code: string;
  name: string;
  teacherName: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  role: string;
  subject: string;
  education: string;
  status: 'PNS' | 'PPPK' | 'GTT' | 'Yayasan';
  teachingHours: number;
  phone: string;
  attendanceRate: number;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  date: string;
  category: 'Akademik' | 'Kesiswaan' | 'Kepegawaian' | 'Agenda';
  content: string;
  isImportant?: boolean;
}

export interface SchoolConfig {
  schoolName: string;
  npsn: string;
  principalName: string;
  principalNip: string;
  teacherName: string;
  teacherNip: string;
  address: string;
  defaultKkm: number;
  accreditation: string; // e.g. "Akreditasi A"
  monthlyTuitionFee: number;
}
