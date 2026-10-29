import React from 'react';
import { SchoolConfig, SchoolClass, SchoolSubject } from '../types';
import { AppNavigationTab } from './Sidebar';
import { Menu, Printer } from 'lucide-react';

interface HeaderProps {
  config: SchoolConfig;
  classes: SchoolClass[];
  subjects: SchoolSubject[];
  selectedClassId: string;
  selectedSubjectId: string;
  activeTab: AppNavigationTab;
  onToggleMobileSidebar: () => void;
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onOpenReportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  classes,
  subjects,
  selectedClassId,
  selectedSubjectId,
  activeTab,
  onToggleMobileSidebar,
  onClassChange,
  onSubjectChange,
  onOpenReportModal,
}) => {
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const pageTitles: Record<AppNavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Eksekutif Sekolah',
      subtitle: `${config.schoolName} · Ikhtisar Manajemen & Kinerja Sekolah`,
    },
    development: {
      title: 'Perkembangan & Portofolio Siswa (360°)',
      subtitle: 'Pelacakan Holistik: Akademik, Profil Karakter P5, Ekstrakurikuler & BK',
    },
    attendance: {
      title: 'Presensi Harian Siswa',
      subtitle: `${currentClass.name} · ${currentSubject.name}`,
    },
    grades: {
      title: 'Buku Nilai & Ketercapaian (KKTP)',
      subtitle: `${currentClass.name} · ${currentSubject.name} · Formula Nilai Akhir`,
    },
    teachers: {
      title: 'Pendidik & Tenaga Kependidikan (PTK)',
      subtitle: 'Direktori Dewan Guru, Beban Mengajar & Kepegawaian',
    },
    tuition: {
      title: 'Administrasi & Iuran SPP Siswa',
      subtitle: `${currentClass.name} · Rekapitulasi Iuran Sekolah & Kas Kelas`,
    },
    ai: {
      title: 'Asisten Cerdas Sekolah (AI)',
      subtitle: 'Penyusun Narasi Rapor Otomatis, Analitik Kelas & Surat Resmi',
    },
    students: {
      title: 'Data Siswa & Rombel',
      subtitle: `${currentClass.name} · Total ${currentClass.totalStudents} Siswa Terdaftar`,
    },
    settings: {
      title: 'Pengaturan Satuan Pendidikan',
      subtitle: 'Identitas Sekolah, Kurikulum & Formula Bobot Penilaian',
    },
  };

  const currentPage = pageTitles[activeTab] || pageTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile hamburger & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                {currentPage.title}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {currentPage.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Context Controls & Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <span className="text-slate-400 font-medium">Kelas:</span>
              <select
                aria-label="Pilih Kelas"
                value={selectedClassId}
                onChange={(e) => onClassChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <span className="text-slate-400 font-medium">Mapel:</span>
              <select
                aria-label="Pilih Mata Pelajaran"
                value={selectedSubjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Cetak Rapor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
