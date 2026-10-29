import React, { useState } from 'react';
import { Student, DailyAttendance, AttendanceStatus } from '../types';
import { calculateStudentAttendanceStats, exportToCSV } from '../utils/storage';
import { CheckCheck, Download, Calendar, AlertTriangle, UserCheck, ShieldAlert, FileSpreadsheet } from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  attendance: Record<string, DailyAttendance>;
  selectedClassId: string;
  selectedSubjectId: string;
  onUpdateAttendance: (attendanceId: string, daily: DailyAttendance) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  attendance,
  selectedClassId,
  selectedSubjectId,
  onUpdateAttendance,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'daily' | 'matrix'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const currentClassStudents = students.filter((s) => s.classId === selectedClassId);
  const attendanceId = `${selectedDate}_${selectedClassId}`;
  const currentDaily: DailyAttendance = attendance[attendanceId] || {
    id: attendanceId,
    date: selectedDate,
    classId: selectedClassId,
    subjectId: selectedSubjectId,
    entries: {},
    createdAt: new Date().toISOString(),
  };

  // Status counts for current date
  let countH = 0;
  let countS = 0;
  let countI = 0;
  let countA = 0;

  currentClassStudents.forEach((student) => {
    const status = currentDaily.entries[student.id]?.status || 'H';
    if (status === 'H') countH++;
    else if (status === 'S') countS++;
    else if (status === 'I') countI++;
    else if (status === 'A') countA++;
  });

  const totalCurrent = currentClassStudents.length;
  const attendanceRate = totalCurrent > 0 ? Math.round((countH / totalCurrent) * 100) : 0;

  // Change single student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    const updatedEntries = {
      ...currentDaily.entries,
      [studentId]: {
        studentId,
        status,
        note: currentDaily.entries[studentId]?.note || '',
      },
    };

    onUpdateAttendance(attendanceId, {
      ...currentDaily,
      date: selectedDate,
      classId: selectedClassId,
      entries: updatedEntries,
    });
  };

  // Change note
  const handleSetNote = (studentId: string, note: string) => {
    const currentStatus = currentDaily.entries[studentId]?.status || 'H';
    const updatedEntries = {
      ...currentDaily.entries,
      [studentId]: {
        studentId,
        status: currentStatus,
        note,
      },
    };

    onUpdateAttendance(attendanceId, {
      ...currentDaily,
      entries: updatedEntries,
    });
  };

  // 1-Click: Mark all as Present (Hadir)
  const handleMarkAllPresent = () => {
    const updatedEntries: Record<string, any> = {};
    currentClassStudents.forEach((student) => {
      updatedEntries[student.id] = {
        studentId: student.id,
        status: 'H',
        note: currentDaily.entries[student.id]?.note || '',
      };
    });

    onUpdateAttendance(attendanceId, {
      ...currentDaily,
      date: selectedDate,
      classId: selectedClassId,
      entries: updatedEntries,
    });
  };

  // Filter students
  const filteredStudents = currentClassStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  // Warning students (< 80% attendance or >= 3 alpa)
  const atRiskStudents = currentClassStudents
    .map((s) => ({
      student: s,
      stats: calculateStudentAttendanceStats(s.id, selectedClassId, attendance),
    }))
    .filter((item) => item.stats.isWarning);

  // Export Daily / Matrix to CSV
  const handleExportCSV = () => {
    if (viewMode === 'daily') {
      const headers = ['No', 'NISN', 'Nama Siswa', 'JK', 'Tanggal', 'Status Kehadiran', 'Keterangan'];
      const rows = currentClassStudents.map((s, idx) => {
        const entry = currentDaily.entries[s.id];
        const statusMap = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpa' };
        return [
          idx + 1,
          s.nisn,
          s.name,
          s.gender,
          selectedDate,
          statusMap[entry?.status || 'H'],
          entry?.note || '-',
        ];
      });
      exportToCSV(`Presensi_${selectedClassId}_${selectedDate}`, headers, rows);
    } else {
      // Rekap Semesteran Matrix
      const allClassDates = Object.values(attendance)
        .filter((a) => a.classId === selectedClassId)
        .map((a) => a.date)
        .sort();

      const uniqueDates = Array.from(new Set(allClassDates));
      const headers = ['No', 'NISN', 'Nama Siswa', 'JK', ...uniqueDates, 'Total H', 'Total S', 'Total I', 'Total A', '% Kehadiran'];
      
      const rows = currentClassStudents.map((s, idx) => {
        const stats = calculateStudentAttendanceStats(s.id, selectedClassId, attendance);
        const dateStatuses = uniqueDates.map((date) => {
          const dayData = attendance[`${date}_${selectedClassId}`];
          return dayData?.entries[s.id]?.status || '-';
        });

        return [
          idx + 1,
          s.nisn,
          s.name,
          s.gender,
          ...dateStatuses,
          stats.hadir,
          stats.sakit,
          stats.izin,
          stats.alpa,
          `${stats.percentage}%`,
        ];
      });

      exportToCSV(`Rekap_Presensi_Semester_${selectedClassId}`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Statistics Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pengelolaan Presensi Siswa</h2>
            <p className="text-xs text-slate-500">
              Pencatatan absensi harian otomatis, pemantauan ketidakhadiran, dan rekapitulasi semester.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'daily' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Input Harian
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Matriks
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Date Selector & Mass Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 font-medium">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Hadir (1-Klik)</span>
            </button>
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

        {/* Summary Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Total Siswa</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{totalCurrent}</div>
            <div className="text-[11px] text-slate-400">Terdaftar di kelas</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <div className="text-emerald-700 font-medium flex items-center justify-between">
              <span>Hadir (H)</span>
              <span className="text-[11px] font-semibold">{attendanceRate}%</span>
            </div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{countH}</div>
            <div className="text-[11px] text-emerald-600">Siswa hadir hari ini</div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <div className="text-amber-700 font-medium">Sakit (S)</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">{countS}</div>
            <div className="text-[11px] text-amber-600">Dengan surat / keterangan</div>
          </div>

          <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100">
            <div className="text-sky-700 font-medium">Izin (I)</div>
            <div className="text-lg font-bold text-sky-800 mt-0.5">{countI}</div>
            <div className="text-[11px] text-sky-600">Izin resmi orang tua</div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
            <div className="text-rose-700 font-medium">Alpa (A)</div>
            <div className="text-lg font-bold text-rose-800 mt-0.5">{countA}</div>
            <div className="text-[11px] text-rose-600">Tanpa keterangan</div>
          </div>
        </div>
      </div>

      {/* Early Warning Banner for At-Risk Attendance */}
      {atRiskStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-semibold text-amber-950">
              Peringatan Kehadiran Otomatis: {atRiskStudents.length} siswa memerlukan perhatian khusus
            </p>
            <p className="text-amber-800">
              Siswa berikut memiliki akumulasi alpa $\ge$ 3 hari atau persentase kehadiran di bawah 80%:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {atRiskStudents.map(({ student, stats }) => (
                <span
                  key={student.id}
                  className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded text-[11px] text-amber-900 font-medium"
                >
                  {student.name} ({stats.percentage}% hadir · {stats.alpa} Alpa)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Table: Daily View or Matrix View */}
      {viewMode === 'daily' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa, NIS & Catatan</th>
                  <th className="py-3 px-4 text-center w-64">Status Presensi ({selectedDate})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const currentEntry = currentDaily.entries[student.id];
                    const status = currentEntry?.status || 'H';
                    const note = currentEntry?.note || '';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 text-center text-slate-500 font-mono align-top pt-4">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 space-y-1.5">
                          {/* Nama Siswa */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                student.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                              }`}
                            >
                              {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>

                          {/* NISN di bawah Nama */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                            <span>NISN: <strong className="text-slate-700">{student.nisn}</strong></span>
                            {student.parentName && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="font-sans text-[11px] text-slate-500">Wali: {student.parentName}</span>
                              </>
                            )}
                          </div>

                          {/* Menu Catatan di bawah Nama & NISN */}
                          <div className="pt-0.5 max-w-md">
                            <input
                              type="text"
                              placeholder="Tambah catatan kehadiran (opsional)..."
                              value={note}
                              onChange={(e) => handleSetNote(student.id, e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-md focus:outline-none text-slate-700 placeholder:text-slate-400 shadow-2xs transition-colors"
                            />
                          </div>
                        </td>

                        {/* Status Presensi (H, S, I, A) */}
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'H')}
                              title="Hadir"
                              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                status === 'H'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              H
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'S')}
                              title="Sakit"
                              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                status === 'S'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              S
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'I')}
                              title="Izin"
                              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                status === 'I'
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                              }`}
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'A')}
                              title="Alpa / Tanpa Keterangan"
                              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                                status === 'A'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Matrix View: Multi-date ledger */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Buku Rekap Matriks Presensi Semester</h3>
              <p className="text-[11px] text-slate-500">Melihat rekam jejak kehadiran per tanggal pertemuan</p>
            </div>
            <span className="text-xs text-slate-500">
              Total {Object.values(attendance).filter((a) => a.classId === selectedClassId).length} Pertemuan Tercatat
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 min-w-[180px]">Nama Siswa</th>
                  {Object.values(attendance)
                    .filter((a) => a.classId === selectedClassId)
                    .map((a) => a.date)
                    .sort()
                    .map((d) => (
                      <th key={d} className="py-3 px-2 text-center font-mono text-[10px] min-w-[44px]">
                        {d.split('-').slice(1).join('/')}
                      </th>
                    ))}
                  <th className="py-3 px-2 text-center text-emerald-700 w-12">H</th>
                  <th className="py-3 px-2 text-center text-amber-700 w-12">S</th>
                  <th className="py-3 px-2 text-center text-sky-700 w-12">I</th>
                  <th className="py-3 px-2 text-center text-rose-700 w-12">A</th>
                  <th className="py-3 px-3 text-center w-16">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.map((student, idx) => {
                  const stats = calculateStudentAttendanceStats(student.id, selectedClassId, attendance);
                  const sortedDates = Object.values(attendance)
                    .filter((a) => a.classId === selectedClassId)
                    .map((a) => a.date)
                    .sort();

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{student.name}</td>
                      {sortedDates.map((date) => {
                        const dayData = attendance[`${date}_${selectedClassId}`];
                        const st = dayData?.entries[student.id]?.status || '-';
                        const colorMap: Record<string, string> = {
                          H: 'text-emerald-700 bg-emerald-50/70',
                          S: 'text-amber-700 bg-amber-50/70',
                          I: 'text-sky-700 bg-sky-50/70',
                          A: 'text-rose-700 bg-rose-50/70',
                        };

                        return (
                          <td key={date} className="py-2.5 px-1 text-center font-mono font-bold">
                            <span className={`inline-block w-6 h-6 leading-6 rounded text-center ${colorMap[st] || 'text-slate-400'}`}>
                              {st}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700">{stats.hadir}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700">{stats.sakit}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-sky-700">{stats.izin}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700">{stats.alpa}</td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={stats.isWarning ? 'text-rose-600' : 'text-slate-800'}>
                          {stats.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
