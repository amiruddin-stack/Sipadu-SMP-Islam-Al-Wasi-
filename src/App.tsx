import React, { useState } from 'react';
import { 
  SchoolConfig, 
  SchoolClass, 
  SchoolSubject, 
  Student, 
  DailyAttendance, 
  SubjectGrades,
  Teacher,
  SchoolAnnouncement 
} from './types';
import { loadStoredData, saveToStorage, resetToDefaultData } from './utils/storage';
import { Sidebar, AppNavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { SchoolDashboard } from './components/SchoolDashboard';
import { StudentDevelopmentTracker } from './components/StudentDevelopmentTracker';
import { AttendanceManager } from './components/AttendanceManager';
import { GradesManager } from './components/GradesManager';
import { TeachersManager } from './components/TeachersManager';
import { TuitionManager } from './components/TuitionManager';
import { AiAssistant } from './components/AiAssistant';
import { StudentsManager } from './components/StudentsManager';
import { SettingsManager } from './components/SettingsManager';
import { StudentReportModal } from './components/StudentReportModal';

export default function App() {
  const [data, setData] = useState(() => loadStoredData());
  const [selectedClassId, setSelectedClassId] = useState<string>('class-7a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-mat');
  const [activeTab, setActiveTab] = useState<AppNavigationTab>('dashboard');
  const [selectedStudentForDev, setSelectedStudentForDev] = useState<string>('s-01');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [reportModalStudentId, setReportModalStudentId] = useState<string | null>(null);

  // Sync Attendance
  const handleUpdateAttendance = (attendanceId: string, daily: DailyAttendance) => {
    setData((prev) => {
      const nextAtt = { ...prev.attendance, [attendanceId]: daily };
      saveToStorage('ATTENDANCE', nextAtt);
      return { ...prev, attendance: nextAtt };
    });
  };

  // Sync Grades
  const handleUpdateGrades = (subjectGradeId: string, updated: SubjectGrades) => {
    setData((prev) => {
      const nextGrades = { ...prev.grades, [subjectGradeId]: updated };
      saveToStorage('GRADES', nextGrades);
      return { ...prev, grades: nextGrades };
    });
  };

  // Sync Narrative from AI Assistant
  const handleSaveStudentNarrative = (studentId: string, narrative: string, homeroomNote: string) => {
    const subjectGradeId = `${selectedClassId}_${selectedSubjectId}_Ganjil`;
    setData((prev) => {
      const existingSub = prev.grades[subjectGradeId] || {
        id: subjectGradeId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        semester: 'Ganjil',
        academicYear: '2026/2027',
        kkm: 75,
        weights: { tugas: 30, uh: 30, pts: 20, pas: 20 },
        grades: {},
      };

      const existingStudentGrade = existingSub.grades[studentId] || { studentId };
      const updatedGradesMap = {
        ...existingSub.grades,
        [studentId]: {
          ...existingStudentGrade,
          aiNarrative: narrative,
          homeroomNote: homeroomNote,
        },
      };

      const nextGrades = {
        ...prev.grades,
        [subjectGradeId]: {
          ...existingSub,
          grades: updatedGradesMap,
        },
      };

      saveToStorage('GRADES', nextGrades);
      return { ...prev, grades: nextGrades };
    });
  };

  // Student CRUD & Holistic Profile Updates
  const handleAddStudent = (newStudent: Student) => {
    setData((prev) => {
      const nextStudents = [...prev.students, newStudent];
      saveToStorage('STUDENTS', nextStudents);
      return { ...prev, students: nextStudents };
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setData((prev) => {
      const nextStudents = prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      saveToStorage('STUDENTS', nextStudents);
      return { ...prev, students: nextStudents };
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setData((prev) => {
      const nextStudents = prev.students.filter((s) => s.id !== studentId);
      saveToStorage('STUDENTS', nextStudents);
      return { ...prev, students: nextStudents };
    });
  };

  // Teachers CRUD
  const handleAddTeacher = (teacher: Teacher) => {
    setData((prev) => {
      const nextTeachers = [...prev.teachers, teacher];
      saveToStorage('TEACHERS', nextTeachers);
      return { ...prev, teachers: nextTeachers };
    });
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    setData((prev) => {
      const nextTeachers = prev.teachers.map((t) => (t.id === teacher.id ? teacher : t));
      saveToStorage('TEACHERS', nextTeachers);
      return { ...prev, teachers: nextTeachers };
    });
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setData((prev) => {
      const nextTeachers = prev.teachers.filter((t) => t.id !== teacherId);
      saveToStorage('TEACHERS', nextTeachers);
      return { ...prev, teachers: nextTeachers };
    });
  };

  // Config & School Settings
  const handleUpdateConfig = (updatedConfig: SchoolConfig) => {
    setData((prev) => {
      saveToStorage('CONFIG', updatedConfig);
      return { ...prev, config: updatedConfig };
    });
  };

  const handleUpdateWeightsAndKkm = (
    weights: { tugas: number; uh: number; pts: number; pas: number },
    kkm: number
  ) => {
    const subjectGradeId = `${selectedClassId}_${selectedSubjectId}_Ganjil`;
    setData((prev) => {
      const existing = prev.grades[subjectGradeId] || {
        id: subjectGradeId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        semester: 'Ganjil',
        academicYear: '2026/2027',
        grades: {},
      };

      const nextGrades = {
        ...prev.grades,
        [subjectGradeId]: {
          ...existing,
          weights,
          kkm,
        },
      };

      saveToStorage('GRADES', nextGrades);
      return { ...prev, grades: nextGrades };
    });
  };

  const handleResetAllData = () => {
    const fresh = resetToDefaultData();
    setData(fresh);
    setSelectedClassId('class-7a');
    setSelectedSubjectId('sub-mat');
    setActiveTab('dashboard');
  };

  const currentClass = data.classes.find((c) => c.id === selectedClassId) || data.classes[0];
  const currentSubject = data.subjects.find((s) => s.id === selectedSubjectId) || data.subjects[0];
  const currentSubjectGrades = data.grades[`${selectedClassId}_${selectedSubjectId}_Ganjil`] || {
    id: `${selectedClassId}_${selectedSubjectId}_Ganjil`,
    classId: selectedClassId,
    subjectId: selectedSubjectId,
    semester: 'Ganjil',
    academicYear: '2026/2027',
    kkm: data.config.defaultKkm || 75,
    weights: { tugas: 30, uh: 30, pts: 20, pas: 20 },
    grades: {},
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white flex">
      {/* Comprehensive Sidebar */}
      <Sidebar
        config={data.config}
        classes={data.classes}
        subjects={data.subjects}
        selectedClassId={selectedClassId}
        selectedSubjectId={selectedSubjectId}
        activeTab={activeTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onClassChange={setSelectedClassId}
        onSubjectChange={setSelectedSubjectId}
        onTabChange={setActiveTab}
        onOpenReportModal={() => {
          const firstStudent = data.students.find((s) => s.classId === selectedClassId) || data.students[0];
          if (firstStudent) setReportModalStudentId(firstStudent.id);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Topbar Header */}
        <Header
          config={data.config}
          classes={data.classes}
          subjects={data.subjects}
          selectedClassId={selectedClassId}
          selectedSubjectId={selectedSubjectId}
          activeTab={activeTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onClassChange={setSelectedClassId}
          onSubjectChange={setSelectedSubjectId}
          onOpenReportModal={() => {
            const firstStudent = data.students.find((s) => s.classId === selectedClassId) || data.students[0];
            if (firstStudent) setReportModalStudentId(firstStudent.id);
          }}
        />

        {/* Dynamic Workspace Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <SchoolDashboard
              config={data.config}
              classes={data.classes}
              students={data.students}
              teachers={data.teachers}
              announcements={data.announcements}
              grades={data.grades}
              attendance={data.attendance}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectStudentDevelopment={(studentId) => {
                setSelectedStudentForDev(studentId);
                setActiveTab('development');
              }}
            />
          )}

          {activeTab === 'development' && (
            <StudentDevelopmentTracker
              students={data.students}
              classes={data.classes}
              subjects={data.subjects}
              grades={data.grades}
              attendance={data.attendance}
              config={data.config}
              selectedStudentId={selectedStudentForDev}
              onSelectStudent={(id) => setSelectedStudentForDev(id)}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManager
              students={data.students}
              attendance={data.attendance}
              selectedClassId={selectedClassId}
              selectedSubjectId={selectedSubjectId}
              onUpdateAttendance={handleUpdateAttendance}
            />
          )}

          {activeTab === 'grades' && (
            <GradesManager
              students={data.students}
              grades={data.grades}
              selectedClassId={selectedClassId}
              selectedSubjectId={selectedSubjectId}
              onUpdateGrades={handleUpdateGrades}
              onSelectStudentForReport={(studentId) => setReportModalStudentId(studentId)}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersManager
              teachers={data.teachers}
              config={data.config}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {activeTab === 'tuition' && (
            <TuitionManager
              students={data.students}
              currentClass={currentClass}
              config={data.config}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {activeTab === 'ai' && (
            <AiAssistant
              students={data.students}
              grades={data.grades}
              attendance={data.attendance}
              config={data.config}
              currentClass={currentClass}
              currentSubject={currentSubject}
              onSaveStudentNarrative={handleSaveStudentNarrative}
            />
          )}

          {activeTab === 'students' && (
            <StudentsManager
              students={data.students}
              currentClass={currentClass}
              classes={data.classes}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              config={data.config}
              selectedSubjectGrades={currentSubjectGrades}
              onUpdateConfig={handleUpdateConfig}
              onUpdateWeightsAndKkm={handleUpdateWeightsAndKkm}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Smart School & Teacher</span>
              <span aria-hidden="true">·</span>
              <span>{data.config.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{data.config.accreditation}</span>
            </div>
            <div>
              <span>Sistem Manajemen Sekolah & Pemantauan Perkembangan Siswa Terpadu</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Official Printable Report Card Modal */}
      {reportModalStudentId && (
        <StudentReportModal
          isOpen={!!reportModalStudentId}
          studentId={reportModalStudentId}
          students={data.students}
          config={data.config}
          currentClass={currentClass}
          subjects={data.subjects}
          grades={data.grades}
          attendance={data.attendance}
          onClose={() => setReportModalStudentId(null)}
        />
      )}
    </div>
  );
}
