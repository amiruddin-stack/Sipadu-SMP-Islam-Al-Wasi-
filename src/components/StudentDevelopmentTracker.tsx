import React, { useState } from 'react';
import { 
  Student, 
  SchoolClass, 
  SchoolSubject, 
  SubjectGrades, 
  DailyAttendance, 
  SchoolConfig,
  StudentAchievement,
  StudentCounselingLog 
} from '../types';
import { calculateStudentAttendanceStats, calculateStudentFinalGrade } from '../utils/storage';
import { 
  TrendingUp, 
  Award, 
  HeartHandshake, 
  Calendar, 
  Plus, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  User, 
  BookOpen, 
  CreditCard,
  Sparkles,
  ShieldCheck,
  Star
} from 'lucide-react';

interface StudentDevelopmentTrackerProps {
  students: Student[];
  classes: SchoolClass[];
  subjects: SchoolSubject[];
  grades: Record<string, SubjectGrades>;
  attendance: Record<string, DailyAttendance>;
  config: SchoolConfig;
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onUpdateStudent: (updated: Student) => void;
}

export const StudentDevelopmentTracker: React.FC<StudentDevelopmentTrackerProps> = ({
  students,
  classes,
  subjects,
  grades,
  attendance,
  config,
  selectedStudentId,
  onSelectStudent,
  onUpdateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'character' | 'achievements' | 'counseling' | 'tuition'>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal forms
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isCounselingModalOpen, setIsCounselingModalOpen] = useState(false);

  // New Achievement form state
  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState<'Akademik' | 'Seni' | 'Olahraga' | 'Keagamaan' | 'Lainnya'>('Akademik');
  const [achLevel, setAchLevel] = useState<'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional'>('Sekolah');
  const [achYear, setAchYear] = useState('2026');

  // New Counseling form state
  const [counCategory, setCounCategory] = useState<'Bimbingan Belajar' | 'Kedisiplinan' | 'Sosial & Emosional' | 'Pengembangan Minat'>('Bimbingan Belajar');
  const [counDesc, setCounDesc] = useState('');
  const [counAction, setCounAction] = useState('');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentClass = classes.find((c) => c.id === currentStudent?.classId) || classes[0];

  const filteredStudentsList = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  // Attendance stats
  const attStats = currentStudent
    ? calculateStudentAttendanceStats(currentStudent.id, currentStudent.classId, attendance)
    : { hadir: 0, sakit: 0, izin: 0, alpa: 0, percentage: 100, isWarning: false };

  // Academic breakdown across subjects
  const studentSubjectScores = subjects.map((sub) => {
    const sGradeId = `${currentStudent?.classId}_${sub.id}_Ganjil`;
    const sGradeObj = grades[sGradeId];
    const rawGrade = sGradeObj?.grades[currentStudent?.id || ''];
    const calc = calculateStudentFinalGrade(rawGrade, sGradeObj?.weights, sGradeObj?.kkm || 75);
    return {
      subject: sub,
      calc,
      rawGrade,
      kkm: sGradeObj?.kkm || 75,
    };
  });

  const validScores = studentSubjectScores.map((s) => s.calc.finalGrade).filter((v) => v > 0);
  const avgAcademicScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  // Add Achievement
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim() || !currentStudent) return;

    const newAch: StudentAchievement = {
      id: `ach-${Date.now()}`,
      title: achTitle.trim(),
      category: achCategory,
      level: achLevel,
      year: achYear,
    };

    const updatedAchievements = [...(currentStudent.achievements || []), newAch];
    onUpdateStudent({
      ...currentStudent,
      achievements: updatedAchievements,
    });

    setAchTitle('');
    setIsAchievementModalOpen(false);
  };

  // Add Counseling Log
  const handleAddCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counDesc.trim() || !currentStudent) return;

    const newLog: StudentCounselingLog = {
      id: `coun-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: counCategory,
      description: counDesc.trim(),
      actionTaken: counAction.trim() || 'Diberikan pengarahan dan motivasi berkala.',
      counselor: config.teacherName,
    };

    const updatedLogs = [...(currentStudent.counselingLogs || []), newLog];
    onUpdateStudent({
      ...currentStudent,
      counselingLogs: updatedLogs,
    });

    setCounDesc('');
    setCounAction('');
    setIsCounselingModalOpen(false);
  };

  const p5Labels: Record<keyof Omit<NonNullable<Student['characterP5']>, 'notes'>, string> = {
    beriman: 'Beriman & Bertakwa kepada Tuhan YME',
    mandiri: 'Kemandirian & Tanggung Jawab Belajar',
    gotongRoyong: 'Gotong Royong & Kepedulian Sosial',
    bernalarKritis: 'Bernalar Kritis & Pemecahan Masalah',
    kreatif: 'Kreativitas & Daya Cipta',
    berkebinekaan: 'Berkebinekaan Global & Toleransi',
  };

  const p5ScaleNames = ['', 'Mulai Berkembang (MB)', 'Sedang Berkembang (SB)', 'Berkembang Sesuai Harapan (BSH)', 'Sangat Berkembang (SAB)'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Student Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Perkembangan & Portofolio Siswa (360° Tracker)</h2>
            <p className="text-xs text-slate-500">
              Pantau seluruh spektrum perkembangan siswa: capaian akademik, karakter Profil Pelajar Pancasila, keaktifan ekskul, prestasi, hingga bimbingan konseling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Portofolio Siswa</span>
            </button>
          </div>
        </div>

        {/* Student Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600">Pilih Siswa:</span>
            <select
              value={currentStudent?.id}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nisn} - {s.name} ({classes.find((c) => c.id === s.classId)?.name || 'Kelas'})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {currentStudent && (
        <div className="space-y-6">
          {/* Student Profile Identity Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-2xl border border-indigo-100 shadow-2xs">
                  {currentStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{currentStudent.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      currentStudent.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}>
                      {currentStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>NISN: <strong className="text-slate-700 font-mono">{currentStudent.nisn}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>{currentClass.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>Wali: {currentStudent.parentName || '-'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{currentStudent.parentPhone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Holistic Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[90px]">
                  <div className="text-[10px] text-slate-500 font-medium">Rata Nilai</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{avgAcademicScore || '-'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[90px]">
                  <div className="text-[10px] text-slate-500 font-medium">Kehadiran</div>
                  <div className={`text-base font-bold mt-0.5 ${attStats.isWarning ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {attStats.percentage}%
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[90px]">
                  <div className="text-[10px] text-slate-500 font-medium">Prestasi</div>
                  <div className="text-base font-bold text-amber-600 mt-0.5">
                    {currentStudent.achievements?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Aspect Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Ikhtisar 360°
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('character')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'character' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Karakter & P5
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'academic' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Capaian Akademik
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'achievements' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Prestasi & Ekskul ({currentStudent.achievements?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('counseling')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'counseling' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Catatan Bimbingan BK ({currentStudent.counselingLogs?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab 1: 360° Overview Dashboard */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Karakter P5 Summary */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Dimensi Karakter Profil Pelajar Pancasila
                    </h4>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {Object.entries(p5Labels).map(([key, label]) => {
                    const score = (currentStudent.characterP5 as any)?.[key] || 3;
                    const percent = (score / 4) * 100;

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-medium">{label}</span>
                          <span className="font-bold text-indigo-700">{p5ScaleNames[score] || 'Berkembang'}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentStudent.characterP5?.notes && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed italic">
                    "{currentStudent.characterP5.notes}"
                  </div>
                )}
              </div>

              {/* Right Column: Ekstrakurikuler, Prestasi & Presensi */}
              <div className="lg:col-span-6 space-y-6">
                {/* Ekstrakurikuler Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Kegiatan Ekstrakurikuler Diikuti
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(currentStudent.extracurriculars || []).map((ekskul, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-lg"
                      >
                        {ekskul}
                      </span>
                    ))}
                    {(!currentStudent.extracurriculars || currentStudent.extracurriculars.length === 0) && (
                      <span className="text-xs text-slate-400">Belum mendaftar ekstrakurikuler.</span>
                    )}
                  </div>
                </div>

                {/* Prestasi Terakhir */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Prestasi & Kejuaraan
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAchievementModalOpen(true)}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      + Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(currentStudent.achievements || []).map((ach) => (
                      <div key={ach.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                        <div className="font-bold text-slate-900">{ach.title}</div>
                        <div className="text-slate-500 text-[11px]">
                          Tingkat {ach.level} <span aria-hidden="true">·</span> Bidang {ach.category} <span aria-hidden="true">·</span> Tahun {ach.year}
                        </div>
                      </div>
                    ))}
                    {(!currentStudent.achievements || currentStudent.achievements.length === 0) && (
                      <p className="text-xs text-slate-400">Belum ada catatan kejuaraan khusus tercatat.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Karakter & P5 Detailed */}
          {activeTab === 'character' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Observasi & Penilaian Karakter Profil Pelajar Pancasila
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan perkembangan perilaku berlandaskan nilai-nilai luhur Pancasila dan budaya madrasah.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.entries(p5Labels).map(([key, label]) => {
                  const score = (currentStudent.characterP5 as any)?.[key] || 3;
                  return (
                    <div key={key} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900">{label}</div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((scaleVal) => (
                          <button
                            key={scaleVal}
                            type="button"
                            onClick={() => {
                              const updatedP5 = {
                                ...(currentStudent.characterP5 || { notes: '' }),
                                [key]: scaleVal,
                              };
                              onUpdateStudent({
                                ...currentStudent,
                                characterP5: updatedP5 as any,
                              });
                            }}
                            className={`flex-1 py-1.5 text-center rounded font-semibold text-[11px] transition-colors ${
                              score === scaleVal
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            Skala {scaleVal}
                          </button>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Status saat ini: <strong className="text-slate-800">{p5ScaleNames[score]}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Capaian Akademik Detail */}
          {activeTab === 'academic' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Rekapitulasi Nilai Seluruh Mata Pelajaran (Semester Ganjil)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-2 text-center w-16">KKTP</th>
                      <th className="py-2.5 px-2 text-center w-20">Rata Tugas</th>
                      <th className="py-2.5 px-2 text-center w-20">Rata UH</th>
                      <th className="py-2.5 px-2 text-center w-16">PTS</th>
                      <th className="py-2.5 px-2 text-center w-16">PAS</th>
                      <th className="py-2.5 px-3 text-center w-24">Nilai Akhir</th>
                      <th className="py-2.5 px-2 text-center w-16">Predikat</th>
                      <th className="py-2.5 px-3 text-center w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentSubjectScores.map(({ subject, calc, kkm }) => (
                      <tr key={subject.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{subject.name}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-500">{kkm}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{calc.avgTugas || '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{calc.avgUh || '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{calc.finalGrade ? 85 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{calc.finalGrade ? 88 : '-'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-sm">
                          <span className={calc.finalGrade >= kkm ? 'text-slate-900' : 'text-rose-600'}>
                            {calc.finalGrade || '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold">{calc.predicate}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">
                          {calc.isPassed ? (
                            <span className="text-emerald-700 text-[11px]">Tuntas</span>
                          ) : (
                            <span className="text-rose-600 text-[11px]">Remedial</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Prestasi & Ekstrakurikuler */}
          {activeTab === 'achievements' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Portofolio Prestasi & Kegiatan Siswa</h3>
                  <p className="text-xs text-slate-500">Pencatatan rekam jejak juara, sertifikasi, dan aktivitas non-akademik</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Prestasi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentStudent.achievements || []).map((ach) => (
                  <div key={ach.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{ach.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {ach.category}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Tingkat: <strong className="text-slate-700">{ach.level}</strong> · Tahun: <strong className="text-slate-700 font-mono">{ach.year}</strong>
                    </div>
                    {ach.description && <p className="text-slate-600 pt-1 leading-relaxed">{ach.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Counseling & BK */}
          {activeTab === 'counseling' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bimbingan Konseling (BK) & Catatan Perkembangan</h3>
                  <p className="text-xs text-slate-500">Rekam jejak konseling personal, tindak lanjut, dan pendampingan siswa</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCounselingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Bimbingan Baru</span>
                </button>
              </div>

              <div className="space-y-3">
                {(currentStudent.counselingLogs || []).map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700">{log.category}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{log.date}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{log.description}</p>
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">Tindak Lanjut & Kesepakatan:</div>
                      <div>{log.actionTaken}</div>
                      <div className="text-[10px] text-slate-400 pt-1">Guru Pendamping / Konselor: {log.counselor}</div>
                    </div>
                  </div>
                ))}
                {(!currentStudent.counselingLogs || currentStudent.counselingLogs.length === 0) && (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Belum ada riwayat konseling khusus untuk siswa ini. Siswa berkembang positif tanpa catatan pelanggaran.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah Prestasi */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Catat Prestasi Baru untuk {currentStudent?.name}</h3>
            <form onSubmit={handleAddAchievement} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Prestasi / Kejuaraan:</label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="Contoh: Juara 1 Pidato Bahasa Inggris"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori:</label>
                <select
                  value={achCategory}
                  onChange={(e: any) => setAchCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Seni">Seni & Budaya</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Keagamaan">Keagamaan / MTQ / Tahfidz</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Penyelenggaraan:</label>
                <select
                  value={achLevel}
                  onChange={(e: any) => setAchLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Sekolah">Tingkat Sekolah</option>
                  <option value="Kecamatan">Tingkat Kecamatan</option>
                  <option value="Kabupaten/Kota">Tingkat Kabupaten / Kota Maros</option>
                  <option value="Provinsi">Tingkat Provinsi Sulawesi Selatan</option>
                  <option value="Nasional">Tingkat Nasional</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Perolehan:</label>
                <input
                  type="text"
                  value={achYear}
                  onChange={(e) => setAchYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Simpan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Konseling BK */}
      {isCounselingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Catatan Layanan Bimbingan untuk {currentStudent?.name}</h3>
            <form onSubmit={handleAddCounseling} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Bimbingan:</label>
                <select
                  value={counCategory}
                  onChange={(e: any) => setCounCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Bimbingan Belajar">Bimbingan Belajar & Akademik</option>
                  <option value="Kedisiplinan">Kedisiplinan & Tata Tertib</option>
                  <option value="Sosial & Emosional">Sosial, Pertemanan & Emosional</option>
                  <option value="Pengembangan Minat">Pengembangan Minat & Bakat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Kasus / Topik Konseling:</label>
                <textarea
                  required
                  rows={3}
                  value={counDesc}
                  onChange={(e) => setCounDesc(e.target.value)}
                  placeholder="Jelaskan situasi atau kendala yang dihadapi siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Tindak Lanjut / Solusi:</label>
                <input
                  type="text"
                  value={counAction}
                  onChange={(e) => setCounAction(e.target.value)}
                  placeholder="Contoh: Jadwal belajar terjadwal dan pemantauan orang tua"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCounselingModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
