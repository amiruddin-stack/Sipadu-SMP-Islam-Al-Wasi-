import React, { useState } from 'react';
import { Student, SubjectGrades, StudentGrade } from '../types';
import { calculateStudentFinalGrade, exportToCSV } from '../utils/storage';
import { Calculator, Download, Filter, CheckCircle2, AlertCircle, ArrowUpDown, Wand2, Info } from 'lucide-react';

interface GradesManagerProps {
  students: Student[];
  grades: Record<string, SubjectGrades>;
  selectedClassId: string;
  selectedSubjectId: string;
  onUpdateGrades: (subjectGradeId: string, updated: SubjectGrades) => void;
  onSelectStudentForReport?: (studentId: string) => void;
}

export const GradesManager: React.FC<GradesManagerProps> = ({
  students,
  grades,
  selectedClassId,
  selectedSubjectId,
  onUpdateGrades,
  onSelectStudentForReport,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'remedial' | 'passed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'finalGrade' | 'nisn'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const subjectGradeId = `${selectedClassId}_${selectedSubjectId}_Ganjil`;
  const currentSubjectGrades: SubjectGrades = grades[subjectGradeId] || {
    id: subjectGradeId,
    classId: selectedClassId,
    subjectId: selectedSubjectId,
    semester: 'Ganjil',
    academicYear: '2026/2027',
    kkm: 75,
    weights: { tugas: 30, uh: 30, pts: 20, pas: 20 },
    grades: {},
  };

  const currentClassStudents = students.filter((s) => s.classId === selectedClassId);

  // Update specific score for a student
  const handleScoreChange = (
    studentId: string,
    field: 'tugas1' | 'tugas2' | 'tugas3' | 'uh1' | 'uh2' | 'pts' | 'pas',
    valueStr: string
  ) => {
    const val = valueStr === '' ? null : Math.min(100, Math.max(0, parseFloat(valueStr) || 0));
    const currentGrade = currentSubjectGrades.grades[studentId] || {
      studentId,
      tugas1: null,
      tugas2: null,
      tugas3: null,
      uh1: null,
      uh2: null,
      pts: null,
      pas: null,
    };

    const updatedGrade: StudentGrade = {
      ...currentGrade,
      [field]: val,
    };

    // Calculate final grade automatically
    const calc = calculateStudentFinalGrade(
      updatedGrade,
      currentSubjectGrades.weights,
      currentSubjectGrades.kkm
    );

    updatedGrade.finalGrade = calc.finalGrade;
    updatedGrade.predicate = calc.predicate;
    updatedGrade.isPassed = calc.isPassed;

    const newGradesMap = {
      ...currentSubjectGrades.grades,
      [studentId]: updatedGrade,
    };

    onUpdateGrades(subjectGradeId, {
      ...currentSubjectGrades,
      grades: newGradesMap,
    });
  };

  // Quick fill helper for teachers (e.g. set default 80 or fill empty)
  const handleFillDefaultScores = () => {
    if (!confirm('Apakah Anda ingin mengisi otomatis nilai standar (80) pada semua kolom nilai yang masih kosong?')) return;

    const updatedMap = { ...currentSubjectGrades.grades };
    currentClassStudents.forEach((s) => {
      const g = updatedMap[s.id] || { studentId: s.id };
      const filled: StudentGrade = {
        studentId: s.id,
        tugas1: g.tugas1 ?? 80,
        tugas2: g.tugas2 ?? 82,
        tugas3: g.tugas3 ?? 80,
        uh1: g.uh1 ?? 78,
        uh2: g.uh2 ?? 80,
        pts: g.pts ?? 80,
        pas: g.pas ?? 82,
      };

      const calc = calculateStudentFinalGrade(filled, currentSubjectGrades.weights, currentSubjectGrades.kkm);
      filled.finalGrade = calc.finalGrade;
      filled.predicate = calc.predicate;
      filled.isPassed = calc.isPassed;
      updatedMap[s.id] = filled;
    });

    onUpdateGrades(subjectGradeId, {
      ...currentSubjectGrades,
      grades: updatedMap,
    });
  };

  // Compile calculations for all students
  const compiledStudents = currentClassStudents.map((student) => {
    const rawGrade = currentSubjectGrades.grades[student.id];
    const calc = calculateStudentFinalGrade(
      rawGrade,
      currentSubjectGrades.weights,
      currentSubjectGrades.kkm
    );

    return {
      student,
      rawGrade: rawGrade || {
        studentId: student.id,
        tugas1: null,
        tugas2: null,
        tugas3: null,
        uh1: null,
        uh2: null,
        pts: null,
        pas: null,
      },
      ...calc,
    };
  });

  // Analytics summary
  const validGrades = compiledStudents.map((c) => c.finalGrade).filter((v) => v > 0);
  const classAvg = validGrades.length > 0 ? Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 0;
  const highest = validGrades.length > 0 ? Math.max(...validGrades) : 0;
  const lowest = validGrades.length > 0 ? Math.min(...validGrades) : 0;
  const passedCount = compiledStudents.filter((c) => c.isPassed && c.finalGrade > 0).length;
  const remedialCount = compiledStudents.filter((c) => !c.isPassed && c.finalGrade > 0).length;
  const passPercentage = compiledStudents.length > 0 ? Math.round((passedCount / compiledStudents.length) * 100) : 0;

  // Filter & Sort
  const filteredList = compiledStudents
    .filter((item) => {
      if (filterMode === 'remedial') return !item.isPassed;
      if (filterMode === 'passed') return item.isPassed;
      return true;
    })
    .filter(
      (item) =>
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.nisn.includes(searchQuery)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.student.name.localeCompare(b.student.name);
      else if (sortBy === 'finalGrade') comparison = a.finalGrade - b.finalGrade;
      else if (sortBy === 'nisn') comparison = a.student.nisn.localeCompare(b.student.nisn);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleToggleSort = (field: 'name' | 'finalGrade' | 'nisn') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Tugas 1',
      'Tugas 2',
      'Tugas 3',
      'Rata Tugas',
      'UH 1',
      'UH 2',
      'Rata UH',
      'PTS / STS',
      'PAS / SAS',
      'Nilai Akhir',
      'Predikat',
      'Status Ketuntasan',
    ];

    const rows: (string | number)[][] = compiledStudents.map((item, idx) => [
      idx + 1,
      item.student.nisn,
      item.student.name,
      item.rawGrade.tugas1 ?? '',
      item.rawGrade.tugas2 ?? '',
      item.rawGrade.tugas3 ?? '',
      item.avgTugas,
      item.rawGrade.uh1 ?? '',
      item.rawGrade.uh2 ?? '',
      item.avgUh,
      item.rawGrade.pts ?? '',
      item.rawGrade.pas ?? '',
      item.finalGrade,
      item.predicate,
      item.isPassed ? 'TUNTAS' : 'REMEDIAL',
    ]);

    exportToCSV(`Buku_Nilai_${selectedClassId}_${selectedSubjectId}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Analytics Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Buku Nilai & Ketercapaian Otomatis</h2>
            <p className="text-xs text-slate-500">
              Perhitungan nilai akhir terbobot otomatis, penentuan predikat, dan deteksi siswa remedial sesuai KKTP/KKM ({currentSubjectGrades.kkm}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDefaultScores}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Isi Nilai Otomatis</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Leger CSV</span>
            </button>
          </div>
        </div>

        {/* Weights Formula Info */}
        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calculator className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Formula Nilai Akhir:</span>
            <span>
              Formatif Tugas ({currentSubjectGrades.weights.tugas}%) + Sumatif UH ({currentSubjectGrades.weights.uh}%) + PTS ({currentSubjectGrades.weights.pts}%) + PAS ({currentSubjectGrades.weights.pas}%)
            </span>
          </div>
          <div className="text-slate-500 font-medium">
            Kriteria Ketuntasan (KKTP): <span className="font-bold text-slate-800">{currentSubjectGrades.kkm}</span>
          </div>
        </div>

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Rata-Rata Kelas</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{classAvg}</div>
            <div className="text-[11px] text-slate-400">Dari {validGrades.length} siswa dinilai</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <div className="text-emerald-700 font-medium flex items-center justify-between">
              <span>Tuntas</span>
              <span className="text-[11px] font-semibold">{passPercentage}%</span>
            </div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">{passedCount}</div>
            <div className="text-[11px] text-emerald-600">Nilai $\ge$ {currentSubjectGrades.kkm}</div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
            <div className="text-rose-700 font-medium">Perlu Remedial</div>
            <div className="text-xl font-bold text-rose-800 mt-0.5">{remedialCount}</div>
            <div className="text-[11px] text-rose-600">Nilai &lt; {currentSubjectGrades.kkm}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Nilai Tertinggi</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{highest || '-'}</div>
            <div className="text-[11px] text-slate-400">Pencapaian maksimal</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Nilai Terendah</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{lowest || '-'}</div>
            <div className="text-[11px] text-slate-400">Butuh pendampingan</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({compiledStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('remedial')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'remedial' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Remedial ({remedialCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('passed')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'passed' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tuntas ({passedCount})
              </button>
            </div>
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

      {/* Main Grade Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-xs">
              <tr className="text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th
                  onClick={() => handleToggleSort('nisn')}
                  className="py-3 px-3 w-28 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>NISN</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('name')}
                  className="py-3 px-4 min-w-[200px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Siswa</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-14 bg-slate-100/60">Tugas 1</th>
                <th className="py-3 px-2 text-center w-14 bg-slate-100/60">Tugas 2</th>
                <th className="py-3 px-2 text-center w-14 bg-slate-100/60">Tugas 3</th>
                <th className="py-3 px-2 text-center w-14 bg-slate-200/50 font-bold text-slate-800">R.Tgs</th>
                <th className="py-3 px-2 text-center w-14 bg-blue-50/50">UH 1</th>
                <th className="py-3 px-2 text-center w-14 bg-blue-50/50">UH 2</th>
                <th className="py-3 px-2 text-center w-14 bg-blue-100/40 font-bold text-blue-900">R.UH</th>
                <th className="py-3 px-2 text-center w-14 bg-purple-50/40">PTS</th>
                <th className="py-3 px-2 text-center w-14 bg-purple-50/40">PAS</th>
                <th
                  onClick={() => handleToggleSort('finalGrade')}
                  className="py-3 px-3 text-center w-20 bg-slate-100 font-bold cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>N.A</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-14">Predikat</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    Tidak ada siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const { student, rawGrade, avgTugas, avgUh, finalGrade, predicate, isPassed } = item;
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${!isPassed && finalGrade > 0 ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{student.nisn}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        <div>{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </td>

                      {/* Tugas 1, 2, 3 */}
                      <td className="py-2.5 px-1 text-center bg-slate-50/40">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.tugas1 ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'tugas1', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-1 text-center bg-slate-50/40">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.tugas2 ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'tugas2', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-1 text-center bg-slate-50/40">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.tugas3 ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'tugas3', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-indigo-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700 bg-slate-100/60">
                        {avgTugas}
                      </td>

                      {/* UH 1, 2 */}
                      <td className="py-2.5 px-1 text-center bg-blue-50/30">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.uh1 ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'uh1', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-1 text-center bg-blue-50/30">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.uh2 ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'uh2', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900 bg-blue-100/40">
                        {avgUh}
                      </td>

                      {/* PTS & PAS */}
                      <td className="py-2.5 px-1 text-center bg-purple-50/20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.pts ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'pts', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-purple-400 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-1 text-center bg-purple-50/20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rawGrade.pas ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'pas', e.target.value)}
                          className="w-12 text-center font-mono py-1 rounded bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-purple-400 focus:outline-none"
                        />
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-2.5 px-3 text-center bg-slate-50 font-mono font-bold text-sm">
                        <span className={finalGrade >= currentSubjectGrades.kkm ? 'text-slate-900' : 'text-rose-600'}>
                          {finalGrade || '-'}
                        </span>
                      </td>

                      {/* Predikat */}
                      <td className="py-2.5 px-2 text-center font-bold">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            predicate === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : predicate === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : predicate === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {predicate}
                        </span>
                      </td>

                      {/* Status Ketuntasan */}
                      <td className="py-2.5 px-3 text-center">
                        {finalGrade === 0 ? (
                          <span className="text-slate-400 text-[11px]">Belum Lengkap</span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tuntas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Remedial</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectStudentForReport && onSelectStudentForReport(student.id)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline"
                        >
                          Rapor
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
