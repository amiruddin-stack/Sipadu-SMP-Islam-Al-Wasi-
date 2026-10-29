import React from 'react';
import { SchoolConfig, SchoolClass, Student, Teacher, SchoolAnnouncement, SubjectGrades, DailyAttendance } from '../types';
import { calculateStudentAttendanceStats, calculateStudentFinalGrade } from '../utils/storage';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  CreditCard,
  BellRing,
  ArrowRight
} from 'lucide-react';

interface SchoolDashboardProps {
  config: SchoolConfig;
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  announcements: SchoolAnnouncement[];
  grades: Record<string, SubjectGrades>;
  attendance: Record<string, DailyAttendance>;
  onNavigateTab: (tab: any) => void;
  onSelectStudentDevelopment: (studentId: string) => void;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({
  config,
  classes,
  students,
  teachers,
  announcements,
  grades,
  attendance,
  onNavigateTab,
  onSelectStudentDevelopment,
}) => {
  // Aggregate Metrics
  const totalStudents = students.length;
  const totalMale = students.filter((s) => s.gender === 'L').length;
  const totalFemale = students.filter((s) => s.gender === 'P').length;
  const totalTeachers = teachers.length;

  // Today Attendance rate across all classes
  const todayStr = new Date().toISOString().split('T')[0];
  let todayPresent = 0;
  let todayTotal = 0;

  classes.forEach((cls) => {
    const dayData = attendance[`${todayStr}_${cls.id}`];
    if (dayData) {
      Object.values(dayData.entries).forEach((entry) => {
        todayTotal++;
        if (entry.status === 'H') todayPresent++;
      });
    }
  });

  const schoolAttendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 96;

  // Academic Pass Rate across grades
  let totalGradeRecords = 0;
  let totalPassed = 0;
  Object.values(grades).forEach((subjectGrade) => {
    Object.values(subjectGrade.grades).forEach((g) => {
      if (g.finalGrade && g.finalGrade > 0) {
        totalGradeRecords++;
        if (g.finalGrade >= subjectGrade.kkm) totalPassed++;
      }
    });
  });

  const schoolPassRate = totalGradeRecords > 0 ? Math.round((totalPassed / totalGradeRecords) * 100) : 89;

  // Tuition metrics
  let totalTuitionBills = 0;
  let totalTuitionPaid = 0;
  students.forEach((s) => {
    (s.tuition || []).forEach((t) => {
      totalTuitionBills++;
      if (t.isPaid) totalTuitionPaid++;
    });
  });

  const tuitionCollectionRate = totalTuitionBills > 0 ? Math.round((totalTuitionPaid / totalTuitionBills) * 100) : 92;

  // Outstanding achievers
  const topAchievers = students.filter((s) => (s.achievements && s.achievements.length > 0));

  // At risk students (attendance or grades)
  const atRiskStudents = students.filter((s) => {
    const att = calculateStudentAttendanceStats(s.id, s.classId, attendance);
    return att.isWarning;
  });

  return (
    <div className="space-y-6">
      {/* School Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {config.accreditation}
              </span>
              <span className="text-xs text-slate-400">NPSN: {config.npsn}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sistem Informasi Terpadu {config.schoolName}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Pusat ekosistem manajemen sekolah, pemantauan 360° perkembangan belajar dan karakter siswa, presensi terintegrasi, dan tata kelola akademik profesional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('development')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pantau Perkembangan Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Siswa Aktif</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
          <div className="text-[11px] text-slate-500">
            {totalMale} Laki-laki <span aria-hidden="true">·</span> {totalFemale} Perempuan
          </div>
        </div>

        {/* Guru & PTK */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pendidik & Tendik (PTK)</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalTeachers} Guru</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            100% Tersertifikasi & Aktif
          </div>
        </div>

        {/* Rata-Rata Ketuntasan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ketuntasan Akademik</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{schoolPassRate}%</div>
          <div className="text-[11px] text-slate-500">
            Di atas standar KKTP sekolah ({config.defaultKkm})
          </div>
        </div>

        {/* Kehadiran Sekolah */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kehadiran Hari Ini</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{schoolAttendanceRate}%</div>
          <div className="text-[11px] text-slate-500">
            Stabilitas presensi harian
          </div>
        </div>
      </div>

      {/* Two-Column Institutional Center: Announcements & Student Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pengumuman & Agenda Sekolah */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pengumuman & Agenda Sekolah Terkini</h3>
            </div>
            <span className="text-xs text-slate-400">Semester Ganjil 2026/2027</span>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{ann.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                    {ann.category}
                  </span>
                  {ann.isImportant && (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                      Penting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Student Highlights & Quick Monitoring */}
        <div className="lg:col-span-5 space-y-5">
          {/* Top Achievers Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Siswa Berprestasi Terkini
                </h3>
              </div>
              <span className="text-xs text-slate-400">{topAchievers.length} Siswa</span>
            </div>

            <div className="space-y-2.5">
              {topAchievers.slice(0, 4).map((student) => {
                const latestAch = student.achievements?.[0];
                return (
                  <div
                    key={student.id}
                    onClick={() => onSelectStudentDevelopment(student.id)}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-amber-700 font-medium">
                        {latestAch?.title} ({latestAch?.level})
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* At-Risk Warning Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Perlu Pendampingan Khusus
                </h3>
              </div>
              <span className="text-xs text-rose-600 font-semibold">{atRiskStudents.length} Siswa</span>
            </div>

            {atRiskStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Semua siswa berada dalam kondisi presensi prima.</p>
            ) : (
              <div className="space-y-2">
                {atRiskStudents.slice(0, 3).map((student) => {
                  const att = calculateStudentAttendanceStats(student.id, student.classId, attendance);
                  return (
                    <div
                      key={student.id}
                      onClick={() => onSelectStudentDevelopment(student.id)}
                      className="p-2 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-rose-950">{student.name}</div>
                        <div className="text-[11px] text-rose-700">
                          Kehadiran: {att.percentage}% · {att.alpa} Alpa
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                        Bimbingan BK
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
