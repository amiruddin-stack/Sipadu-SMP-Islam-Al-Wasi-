import React, { useState } from 'react';
import { Student, SchoolClass } from '../types';
import { UserPlus, Trash2, Edit2, Download, Upload, Users, Search, Check } from 'lucide-react';
import { exportToCSV } from '../utils/storage';

interface StudentsManagerProps {
  students: Student[];
  currentClass: SchoolClass;
  classes: SchoolClass[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updated: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  currentClass,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const currentClassStudents = students.filter((s) => s.classId === currentClass.id);
  const filteredStudents = currentClassStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setNisn(`00982${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setGender('L');
    setParentName('');
    setParentPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setNisn(student.nisn);
    setName(student.name);
    setGender(student.gender);
    setParentName(student.parentName || '');
    setParentPhone(student.parentPhone || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nisn.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        nisn: nisn.trim(),
        name: name.trim(),
        gender,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
      });
    } else {
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        classId: currentClass.id,
        nisn: nisn.trim(),
        name: name.trim(),
        gender,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
      };
      onAddStudent(newStudent);
    }

    setIsModalOpen(false);
  };

  const handleExportStudents = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Jenis Kelamin', 'Kelas', 'Nama Orang Tua', 'Nomor Kontak'];
    const rows = currentClassStudents.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.name,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      currentClass.name,
      s.parentName || '-',
      s.parentPhone || '-',
    ]);
    exportToCSV(`Daftar_Siswa_${currentClass.name}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Data Siswa {currentClass.name}</h2>
            <p className="text-xs text-slate-500">
              Pengelolaan rombongan belajar, NISN, profil peserta didik, dan data kontak wali murid.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportStudents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Data</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            Total Terdaftar: <span className="font-bold text-slate-900">{currentClassStudents.length} Siswa</span>
            {' '}({currentClassStudents.filter((s) => s.gender === 'L').length} Laki-laki · {currentClassStudents.filter((s) => s.gender === 'P').length} Perempuan)
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NISN</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 w-16 text-center">JK</th>
                <th className="py-3 px-4">Nama Orang Tua / Wali</th>
                <th className="py-3 px-4 w-36">Kontak Telepon</th>
                <th className="py-3 px-3 text-center w-28">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{student.nisn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{student.name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-semibold ${student.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{student.parentName || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{student.parentPhone || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Siswa"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${student.name}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru ke ' + currentClass.name}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Siswa Nasional (NISN):</label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="009823101"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Contoh: Muhammad Fauzan"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="L"
                      checked={gender === 'L'}
                      onChange={() => setGender('L')}
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="P"
                      checked={gender === 'P'}
                      onChange={() => setGender('P')}
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nama ayah/ibu/wali"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Kontak / WhatsApp:</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="081234567890"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
