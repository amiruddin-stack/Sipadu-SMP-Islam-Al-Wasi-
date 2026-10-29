import React from 'react';
import { SchoolConfig, SchoolClass, SchoolSubject } from '../types';
import { 
  Building2,
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  Sparkles, 
  Users, 
  Sliders, 
  Printer, 
  X,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck
} from 'lucide-react';

export type AppNavigationTab = 
  | 'dashboard' 
  | 'development' 
  | 'attendance' 
  | 'grades' 
  | 'teachers' 
  | 'tuition' 
  | 'ai' 
  | 'students' 
  | 'settings';

interface SidebarProps {
  config: SchoolConfig;
  classes: SchoolClass[];
  subjects: SchoolSubject[];
  selectedClassId: string;
  selectedSubjectId: string;
  activeTab: AppNavigationTab;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onTabChange: (tab: AppNavigationTab) => void;
  onOpenReportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  classes,
  subjects,
  selectedClassId,
  selectedSubjectId,
  activeTab,
  isOpenMobile,
  onCloseMobile,
  onClassChange,
  onSubjectChange,
  onTabChange,
  onOpenReportModal,
}) => {
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const mainNavItems: {
    id: AppNavigationTab;
    label: string;
    subtitle: string;
    icon: any;
    highlight?: boolean;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Sekolah',
      subtitle: 'Ikhtisar & statistik sekolah',
      icon: Building2,
    },
    {
      id: 'development',
      label: 'Perkembangan Siswa',
      subtitle: '360° profil, P5 & karakter',
      icon: TrendingUp,
      highlight: true,
      badge: 'Penting',
    },
    {
      id: 'attendance',
      label: 'Presensi Siswa',
      subtitle: 'Pencatatan harian otomatis',
      icon: CalendarCheck,
    },
    {
      id: 'grades',
      label: 'Buku Nilai & KKTP',
      subtitle: 'Perhitungan nilai akhir',
      icon: BookOpen,
    },
    {
      id: 'teachers',
      label: 'Pendidik & Tendik (PTK)',
      subtitle: 'Dewan guru & beban jam',
      icon: GraduationCap,
    },
    {
      id: 'tuition',
      label: 'Administrasi & SPP',
      subtitle: 'Iuran sekolah & kas kelas',
      icon: CreditCard,
    },
    {
      id: 'ai',
      label: 'Asisten Cerdas (AI)',
      subtitle: 'Narasi rapor & analitik',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'students',
      label: 'Data Siswa & Rombel',
      subtitle: 'Daftar peserta didik & NISN',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Pengaturan Sekolah',
      subtitle: 'Identitas & bobot penilaian',
      icon: Sliders,
    },
  ];

  const handleNavClick = (tab: AppNavigationTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base truncate">
                  Smart School
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[140px]" title={config.schoolName}>
                {config.schoolName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Context Selectors */}
        <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-slate-50/60">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Kelas Aktif
            </label>
            <select
              aria-label="Pilih Kelas Aktif"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.totalStudents} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Mata Pelajaran
            </label>
            <select
              aria-label="Pilih Mata Pelajaran"
              value={selectedSubjectId}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modul Sekolah Terpadu
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? item.highlight
                          ? 'text-amber-400'
                          : 'text-white'
                        : item.highlight
                        ? 'text-amber-500'
                        : 'text-slate-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          isActive ? 'bg-amber-400 text-slate-900' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] leading-tight truncate ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Footer Shortcut */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cetak Rapor Siswa</span>
          </button>
        </div>
      </aside>
    </>
  );
};
