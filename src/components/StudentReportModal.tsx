import React from 'react';
import { Student, SchoolConfig, SchoolClass, SchoolSubject, SubjectGrades, DailyAttendance } from '../types';
import { calculateStudentAttendanceStats, calculateStudentFinalGrade } from '../utils/storage';
import { Printer, X } from 'lucide-react';

interface StudentReportModalProps {
  isOpen: boolean;
  studentId: string;
  students: Student[];
  config: SchoolConfig;
  currentClass: SchoolClass;
  subjects: SchoolSubject[];
  grades: Record<string, SubjectGrades>;
  attendance: Record<string, DailyAttendance>;
  onClose: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  studentId,
  students,
  config,
  currentClass,
  subjects,
  grades,
  attendance,
  onClose,
}) => {
  if (!isOpen) return null;

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const attStats = calculateStudentAttendanceStats(student.id, currentClass.id, attendance);
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const p5ScaleNames = ['', 'Mulai Berkembang', 'Sedang Berkembang', 'Berkembang Sesuai Harapan', 'Sangat Berkembang'];

  const p5Items = [
    { key: 'beriman', label: 'Beriman & Bertakwa kepada Tuhan YME', val: student.characterP5?.beriman || 3 },
    { key: 'mandiri', label: 'Kemandirian Belajar', val: student.characterP5?.mandiri || 3 },
    { key: 'gotongRoyong', label: 'Gotong Royong & Kerjasama', val: student.characterP5?.gotongRoyong || 4 },
    { key: 'bernalarKritis', label: 'Bernalar Kritis & Analitis', val: student.characterP5?.bernalarKritis || 3 },
    { key: 'kreatif', label: 'Kreativitas & Daya Cipta', val: student.characterP5?.kreatif || 3 },
    { key: 'berkebinekaan', label: 'Berkebinekaan Global & Toleransi', val: student.characterP5?.berkebinekaan || 4 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Action Header (Hidden on Print) */}
        <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Laporan Hasil Belajar & Perkembangan Siswa Terpadu</span>
            <span className="text-xs text-slate-400">· Siap Cetak (A4/F4)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white" id="printable-report">
          {/* Kop Surat Resmi */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
            <h1 className="text-lg font-bold tracking-wide uppercase">
              {config.schoolName}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              NPSN: {config.npsn} · {config.accreditation} · {config.address}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-800 pt-1">
              LAPORAN PERKEMBANGAN BELAJAR & PROFIL PESERTA DIDIK
            </p>
          </div>

          {/* Student & Class Meta */}
          <div className="grid grid-cols-2 gap-4 py-3 text-xs border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 text-slate-500">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {student.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Nomor Induk / NISN</span>
                <span className="font-mono text-slate-800">: {student.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Jenis Kelamin</span>
                <span className="text-slate-800">: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 text-slate-500">Kelas / Fase</span>
                <span className="font-bold text-slate-900">: {currentClass.name} (Fase D)</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Semester / TP</span>
                <span className="text-slate-800">: {currentClass.semester} / {currentClass.academicYear}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">Wali Kelas</span>
                <span className="text-slate-800">: {currentClass.homeroomTeacher}</span>
              </div>
            </div>
          </div>

          {/* A. Academic Table */}
          <div className="mt-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              A. Capaian Kompetensi Akademik (Kurikulum Merdeka)
            </h2>
            <table className="w-full text-left border border-slate-300 text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                  <th className="py-1.5 px-2 border-r border-slate-300 w-8 text-center">No</th>
                  <th className="py-1.5 px-3 border-r border-slate-300 w-44">Mata Pelajaran</th>
                  <th className="py-1.5 px-2 border-r border-slate-300 w-14 text-center">KKTP</th>
                  <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">Nilai Akhir</th>
                  <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">Predikat</th>
                  <th className="py-1.5 px-3">Deskripsi Capaian Pembelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((sub, idx) => {
                  const sGradeId = `${currentClass.id}_${sub.id}_Ganjil`;
                  const sGradeObj = grades[sGradeId];
                  const rawGrade = sGradeObj?.grades[student.id];
                  const calc = calculateStudentFinalGrade(rawGrade, sGradeObj?.weights, sGradeObj?.kkm || 75);

                  const defaultNarrative = calc.finalGrade >= 85
                    ? `Menunjukkan penguasaan sangat baik dalam capaian materi pembelajaran ${sub.name}. Aktif dan konsisten.`
                    : calc.finalGrade >= 75
                    ? `Telah mencapai kriteria ketercapaian tujuan pembelajaran pada materi ${sub.name} dengan baik.`
                    : `Perlu pendampingan dan latihan tambahan untuk penguatan kompetensi dasar pada mata pelajaran ${sub.name}.`;

                  return (
                    <tr key={sub.id} className="border-b border-slate-300">
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-semibold text-slate-800">{sub.name}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{sGradeObj?.kkm || 75}</td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-900">
                        {calc.finalGrade || '-'}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold">
                        {calc.predicate}
                      </td>
                      <td className="py-1.5 px-3 text-[11px] leading-relaxed text-slate-700">
                        {rawGrade?.aiNarrative || defaultNarrative}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* B. Karakter Profil Pelajar Pancasila (P5) */}
          <div className="mt-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              B. Perkembangan Karakter Profil Pelajar Pancasila (P5)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {p5Items.map((item) => (
                <div key={item.key} className="p-2 border border-slate-300 rounded bg-slate-50/50">
                  <div className="font-medium text-slate-700 text-[11px] truncate">{item.label}</div>
                  <div className="font-bold text-indigo-900 mt-0.5">
                    {p5ScaleNames[item.val]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Ekstrakurikuler, Prestasi & Presensi */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                C. Kegiatan Ekstrakurikuler & Prestasi
              </h2>
              <div className="border border-slate-300 p-2.5 text-xs space-y-1.5 min-h-[85px] bg-slate-50/50">
                <div>
                  <span className="text-slate-500 font-medium">Ekstrakurikuler: </span>
                  <span className="font-semibold text-slate-800">
                    {(student.extracurriculars || ['Pramuka']).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Prestasi: </span>
                  <span className="font-semibold text-amber-800">
                    {student.achievements && student.achievements.length > 0
                      ? student.achievements.map((a) => `${a.title} (${a.level})`).join('; ')
                      : 'Aktif berpartisipasi dalam kegiatan sekolah'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                D. Rekapitulasi Presensi
              </h2>
              <table className="w-full border border-slate-300 text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="py-1 px-3 bg-slate-50 border-r border-slate-300 text-slate-600">Sakit (S)</td>
                    <td className="py-1 px-3 font-semibold text-slate-800">{attStats.sakit} hari</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="py-1 px-3 bg-slate-50 border-r border-slate-300 text-slate-600">Izin (I)</td>
                    <td className="py-1 px-3 font-semibold text-slate-800">{attStats.izin} hari</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="py-1 px-3 bg-slate-50 border-r border-slate-300 text-slate-600">Tanpa Keterangan (A)</td>
                    <td className="py-1 px-3 font-semibold text-slate-800">{attStats.alpa} hari</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-3 bg-slate-100 border-r border-slate-300 font-bold text-slate-800">
                      Tingkat Kehadiran
                    </td>
                    <td className="py-1 px-3 font-bold text-slate-900">{attStats.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* E. Catatan Wali Kelas */}
          <div className="mt-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              E. Catatan Wali Kelas & Rekomendasi Bimbingan
            </h2>
            <div className="border border-slate-300 p-2.5 text-xs leading-relaxed text-slate-800 bg-slate-50">
              {grades[`${currentClass.id}_sub-mat_Ganjil`]?.grades[student.id]?.homeroomNote ||
                student.characterP5?.notes ||
                'Ananda menunjukkan kedisiplinan dan sopan santun yang baik. Terus pertahankan semangat belajar dan kembangkan potensi terbaik ananda.'}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center mt-8 text-xs pt-2">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Orang Tua / Wali</p>
              <div className="h-14"></div>
              <p className="font-bold border-b border-slate-400 inline-block px-8 pb-1">
                {student.parentName || '................................'}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Maros, {dateFormatted}</p>
              <p className="font-semibold text-slate-800">Wali Kelas</p>
              <div className="h-14"></div>
              <p className="font-bold border-b border-slate-400 inline-block px-4 pb-1">
                {currentClass.homeroomTeacher}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">NIP. {config.teacherNip}</p>
            </div>

            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Kepala Sekolah</p>
              <div className="h-14"></div>
              <p className="font-bold border-b border-slate-400 inline-block px-4 pb-1">
                {config.principalName}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">NIP. {config.principalNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
