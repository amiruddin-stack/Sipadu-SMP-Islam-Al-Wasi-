import React, { useState } from 'react';
import { Student, SubjectGrades, SchoolConfig, SchoolClass, SchoolSubject, DailyAttendance } from '../types';
import { calculateStudentAttendanceStats, calculateStudentFinalGrade } from '../utils/storage';
import { Sparkles, Copy, Check, FileText, Bot, AlertTriangle, Send, RefreshCw, Printer } from 'lucide-react';

interface AiAssistantProps {
  students: Student[];
  grades: Record<string, SubjectGrades>;
  attendance: Record<string, DailyAttendance>;
  config: SchoolConfig;
  currentClass: SchoolClass;
  currentSubject: SchoolSubject;
  onSaveStudentNarrative: (studentId: string, narrative: string, homeroomNote: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  students,
  grades,
  attendance,
  config,
  currentClass,
  currentSubject,
  onSaveStudentNarrative,
}) => {
  const currentClassStudents = students.filter((s) => s.classId === currentClass.id);
  const subjectGradeId = `${currentClass.id}_${currentSubject.id}_Ganjil`;
  const currentGrades = grades[subjectGradeId];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentClassStudents[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'narrative' | 'diagnostic' | 'parentNotice'>('narrative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // AI Output states
  const [narrativeOutput, setNarrativeOutput] = useState<{
    narrative: string;
    homeroomNote: string;
    recommendation: string;
  } | null>(null);

  const [diagnosticOutput, setDiagnosticOutput] = useState<{
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendedActions: string[];
  } | null>(null);

  const [parentNoticeOutput, setParentNoticeOutput] = useState<string | null>(null);

  const selectedStudent = currentClassStudents.find((s) => s.id === selectedStudentId);
  const selectedStudentRawGrade = currentGrades?.grades[selectedStudentId];
  const selectedStudentCalc = calculateStudentFinalGrade(
    selectedStudentRawGrade,
    currentGrades?.weights,
    currentGrades?.kkm
  );
  const selectedStudentAttendance = selectedStudentId
    ? calculateStudentAttendanceStats(selectedStudentId, currentClass.id, attendance)
    : null;

  // Generate Report Card Narrative
  const handleGenerateNarrative = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      const payload = {
        studentName: selectedStudent.name,
        className: currentClass.name,
        subjectName: currentSubject.name,
        finalGrade: selectedStudentCalc.finalGrade,
        kkm: currentGrades?.kkm || 75,
        attendanceRate: selectedStudentAttendance?.percentage || 100,
        assessments: [
          { name: 'Tugas', score: selectedStudentCalc.avgTugas },
          { name: 'Ulangan Harian', score: selectedStudentCalc.avgUh },
          { name: 'PTS', score: selectedStudentRawGrade?.pts || 0 },
          { name: 'PAS', score: selectedStudentRawGrade?.pas || 0 },
        ],
        strengths: selectedStudentCalc.finalGrade >= 80 ? 'Pemahaman konseptual dan ketepatan tugas' : 'Kemauan belajar dan kehadiran',
        challenges: selectedStudentCalc.finalGrade < 75 ? 'Perlu perbanyak latihan soal aplikasi' : 'Mempertahankan konsistensi',
      };

      const res = await fetch('/api/gemini/generate-report-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal memanggil API narasi rapor');
      const data = await res.json();
      setNarrativeOutput({
        narrative: data.narrative || '',
        homeroomNote: data.homeroomNote || '',
        recommendation: data.recommendation || '',
      });

      // Auto save to grade record
      if (data.narrative) {
        onSaveStudentNarrative(selectedStudent.id, data.narrative, data.homeroomNote || '');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kendala saat menyusun narasi: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Class Diagnostic
  const handleGenerateDiagnostic = async () => {
    setIsGenerating(true);
    try {
      const compiled = currentClassStudents.map((s) => {
        const raw = currentGrades?.grades[s.id];
        const calc = calculateStudentFinalGrade(raw, currentGrades?.weights, currentGrades?.kkm);
        return { name: s.name, finalGrade: calc.finalGrade, isPassed: calc.isPassed };
      });

      const gradesArr = compiled.map((c) => c.finalGrade).filter((v) => v > 0);
      const avg = gradesArr.length > 0 ? Math.round(gradesArr.reduce((a, b) => a + b, 0) / gradesArr.length) : 0;
      const passed = compiled.filter((c) => c.isPassed).length;
      const passRate = compiled.length > 0 ? Math.round((passed / compiled.length) * 100) : 0;

      const low = compiled.filter((c) => !c.isPassed).map((c) => `${c.name} (${c.finalGrade})`);
      const top = compiled.filter((c) => c.finalGrade >= 90).map((c) => `${c.name} (${c.finalGrade})`);

      const payload = {
        className: currentClass.name,
        subjectName: currentSubject.name,
        totalStudents: currentClassStudents.length,
        averageGrade: avg,
        passRate,
        attendanceAverage: 92,
        lowPerformers: low,
        topPerformers: top,
      };

      const res = await fetch('/api/gemini/analyze-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal menganalisis kelas');
      const data = await res.json();
      setDiagnosticOutput(data);
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan analitik: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Parent Notice Letter
  const handleGenerateParentNotice = () => {
    if (!selectedStudent || !selectedStudentAttendance) return;

    const dateToday = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const isAttendanceIssue = selectedStudentAttendance.alpa >= 2 || selectedStudentAttendance.percentage < 85;
    const isAcademicIssue = selectedStudentCalc.finalGrade < (currentGrades?.kkm || 75);

    let subjectMatter = 'Laporan Perkembangan Belajar Siswa';
    if (isAttendanceIssue && isAcademicIssue) subjectMatter = 'Pemberitahuan Akademik & Presensi Siswa';
    else if (isAttendanceIssue) subjectMatter = 'Pemberitahuan Ketidakhadiran Siswa';
    else if (isAcademicIssue) subjectMatter = 'Undangan Pendampingan & Remedial Siswa';
    else subjectMatter = 'Surat Apresiasi Capaian Belajar Siswa';

    const letter = `PEMERINTAH KABUPATEN MAROS / YAYASAN PENDIDIKAN
${config.schoolName.toUpperCase()}
${config.address}
NPSN: ${config.npsn}

--------------------------------------------------------------------------------------------------
Nomor   : 421.3/${currentClass.name}/ST/${new Date().getFullYear()}
Perihal : ${subjectMatter}
Lampiran: 1 Lembar Ringkasan Hasil Belajar

Kepada Yth.
Bapak/Ibu Orang Tua / Wali dari Ananda:
${selectedStudent.name} (NISN: ${selectedStudent.nisn})
Di Tempat.

Assalamu’alaikum Warahmatullahi Wabarakatuh,
Salam sejahtera untuk kita semua.

Melalui surat ini, kami dari pihak ${config.schoolName} menyampaikan laporan perkembangan putra/putri Bapak/Ibu pada Semester ${currentClass.semester} Tahun Pelajaran ${currentClass.academicYear} untuk mata pelajaran ${currentSubject.name}:

1. Nama Siswa         : ${selectedStudent.name}
2. Kelas / Rombel     : ${currentClass.name}
3. Nilai Akhir Saat Ini : ${selectedStudentCalc.finalGrade} (Kriteria Ketuntasan/KKTP: ${currentGrades?.kkm || 75}) - Predikat: ${selectedStudentCalc.predicate}
4. Rekapitulasi Presensi: ${selectedStudentAttendance.hadir} Hadir (${selectedStudentAttendance.percentage}%), ${selectedStudentAttendance.sakit} Sakit, ${selectedStudentAttendance.izin} Izin, ${selectedStudentAttendance.alpa} Alpa (Tanpa Keterangan).

Catatan Evaluasi Guru:
${
  isAcademicIssue
    ? `Ananda memerlukan bimbingan tambahan dan program remedial terjadwal pada kompetensi yang belum tuntas agar dapat mencapai standar ketuntasan minimal.`
    : `Ananda menunjukkan perkembangan belajar yang memuaskan dan telah tuntas mencapai kriteria ketercapaian.`
}
${
  isAttendanceIssue
    ? `Kami mengimbau kerja sama Bapak/Ibu untuk memantau kedisiplinan kehadiran ananda di sekolah demi kelancaran proses pembelajaran.`
    : `Tingkat kehadiran ananda sangat baik dan mendukung capaian akademiknya.`
}

Demikian pemberitahuan ini kami sampaikan. Atas perhatian dan kerja sama yang baik dari Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.

Maros, ${dateToday}
Mengetahui,
Wali Kelas / Guru Mata Pelajaran,



${config.teacherName}
NIP. ${config.teacherNip}`;

    setParentNoticeOutput(letter);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Asisten Cerdas Guru (AI Smart Teacher)</h2>
              <p className="text-xs text-slate-500">
                Pembangkit narasi buku rapor otomatis (Kurikulum Merdeka), analisis diagnostik kelas, dan draf surat resmi orang tua siswa.
              </p>
            </div>
          </div>

          {/* Segmented Sub-Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('narrative')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'narrative' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Narasi Rapor Otomatis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diagnostic')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'diagnostic' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnostik Kelas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parentNotice')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'parentNotice' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surat Resmi Orang Tua
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: AI Report Card Narrative Generator */}
      {activeTab === 'narrative' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Selector & Actual Academic Profile */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Siswa untuk Dibuatkan Narasi:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currentClassStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nisn} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Profil Akademik Terkini</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      selectedStudentCalc.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedStudentCalc.isPassed ? 'Tuntas' : 'Perlu Remedial'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nilai Akhir:</span>
                    <span className="font-bold text-base text-slate-900">{selectedStudentCalc.finalGrade}</span>
                    <span className="text-slate-500 text-[11px] ml-1">/ KKTP {currentGrades?.kkm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Predikat:</span>
                    <span className="font-bold text-base text-slate-900">Predikat {selectedStudentCalc.predicate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rata Tugas:</span>
                    <span className="font-semibold">{selectedStudentCalc.avgTugas}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rata UH:</span>
                    <span className="font-semibold">{selectedStudentCalc.avgUh}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PTS / PAS:</span>
                    <span className="font-semibold">
                      {selectedStudentRawGrade?.pts || '-'} / {selectedStudentRawGrade?.pas || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kehadiran:</span>
                    <span className="font-semibold">
                      {selectedStudentAttendance?.percentage}% ({selectedStudentAttendance?.hadir}H/{selectedStudentAttendance?.alpa}A)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateNarrative}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyusun Narasi dengan AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Susun Narasi Rapor Otomatis</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Generated Narrative & Report Note Card */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Hasil Draf Narasi Rapor & Wali Kelas</h3>
              {narrativeOutput && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${narrativeOutput.narrative}\n\nCatatan Wali Kelas:\n${narrativeOutput.homeroomNote}`,
                      'narrative'
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {copiedKey === 'narrative' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'narrative' ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              )}
            </div>

            {narrativeOutput ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Deskripsi Capaian Pembelajaran ({currentSubject.name}):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(narrativeOutput.narrative, 'n1')}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      {copiedKey === 'n1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded border border-slate-200">
                    "{narrativeOutput.narrative}"
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Catatan Wali Kelas:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(narrativeOutput.homeroomNote, 'n2')}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      {copiedKey === 'n2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200">
                    "{narrativeOutput.homeroomNote || 'Pertahankan semangat belajar dan terus kembangkan potensimu.'}"
                  </p>
                </div>

                {narrativeOutput.recommendation && (
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-900">
                    <span className="font-semibold block mb-0.5">Rekomendasi Tindak Lanjut Guru:</span>
                    <p className="text-indigo-800">{narrativeOutput.recommendation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">Belum ada narasi dibuat</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Pilih siswa di sebelah kiri dan klik tombol "Susun Narasi Rapor Otomatis" untuk menghasilkan deskripsi capaian sesuai standar Kurikulum Merdeka.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Class Diagnostics */}
      {activeTab === 'diagnostic' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Analisis Diagnostik & Rekomendasi Kelas</h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan otomatis kesenjangan belajar, pola ketuntasan, dan strategi intervensi untuk {currentClass.name}.
              </p>
            </div>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateDiagnostic}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Jalankan Diagnostik AI Kelas</span>
                </>
              )}
            </button>
          </div>

          {diagnosticOutput ? (
            <div className="space-y-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-1">Ringkasan Evaluasi:</h4>
                <p className="text-slate-700 leading-relaxed">{diagnosticOutput.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-2">
                  <h4 className="font-bold text-emerald-900">Kekuatan & Potensi Kelas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    {diagnosticOutput.strengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg space-y-2">
                  <h4 className="font-bold text-amber-900">Titik Rawan / Perlu Perhatian:</h4>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    {diagnosticOutput.weaknesses?.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2">
                <h4 className="font-bold text-indigo-950">Rekomendasi Tindakan Guru untuk Pembelajaran Selanjutnya:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {diagnosticOutput.recommendedActions?.map((act, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-indigo-100 text-indigo-900">
                      <div className="font-bold text-indigo-700 mb-1">Langkah 0{idx + 1}</div>
                      <div>{act}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Bot className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">Diagnostik Belum Dijalankan</p>
              <p className="text-[11px] max-w-md mx-auto">
                Klik tombol "Jalankan Diagnostik AI Kelas" untuk memproses data buku nilai dan presensi secara komprehensif.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Official Parent Notice Letter Generator */}
      {activeTab === 'parentNotice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Siswa yang Ingin Diberi Surat:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currentClassStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nisn} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="text-slate-600 space-y-1">
                  <div>
                    <span className="text-slate-400">Nama Orang Tua: </span>
                    <span className="font-medium text-slate-800">{selectedStudent.parentName || 'Bapak/Ibu Wali'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Nilai: </span>
                    <span className={`font-semibold ${selectedStudentCalc.isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {selectedStudentCalc.finalGrade} ({selectedStudentCalc.isPassed ? 'Tuntas' : 'Remedial'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Presensi: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedStudentAttendance?.percentage}% ({selectedStudentAttendance?.alpa} Alpa)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateParentNotice}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draf Surat Resmi Otomatis</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Draf Surat Resmi Sekolah untuk Orang Tua</h3>
              {parentNoticeOutput && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(parentNoticeOutput, 'letter')}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {copiedKey === 'letter' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'letter' ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Cetak Surat</span>
                  </button>
                </div>
              )}
            </div>

            {parentNoticeOutput ? (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {parentNoticeOutput}
                </pre>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">Surat Belum Digenerate</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Pilih siswa di sebelah kiri dan klik "Draf Surat Resmi Otomatis" untuk menghasilkan surat formal pemberitahuan kepada orang tua.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
