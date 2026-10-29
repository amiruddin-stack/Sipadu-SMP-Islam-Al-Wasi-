import React, { useState } from 'react';
import { Teacher, SchoolConfig } from '../types';
import { UserCheck, UserPlus, Trash2, Edit2, Download, Search, Briefcase, GraduationCap } from 'lucide-react';
import { exportToCSV } from '../utils/storage';

interface TeachersManagerProps {
  teachers: Teacher[];
  config: SchoolConfig;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export const TeachersManager: React.FC<TeachersManagerProps> = ({
  teachers,
  config,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [role, setRole] = useState('');
  const [subject, setSubject] = useState('');
  const [education, setEducation] = useState('');
  const [status, setStatus] = useState<'PNS' | 'PPPK' | 'GTT' | 'Yayasan'>('Yayasan');
  const [teachingHours, setTeachingHours] = useState(24);
  const [phone, setPhone] = useState('');

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.includes(searchQuery) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setNip(`198${Math.floor(100000000000000 + Math.random() * 900000000000000)}`);
    setRole('Guru Mata Pelajaran');
    setSubject('Matematika');
    setEducation('S1 Pendidikan');
    setStatus('PNS');
    setTeachingHours(24);
    setPhone('081234567890');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setNip(teacher.nip);
    setRole(teacher.role);
    setSubject(teacher.subject);
    setEducation(teacher.education);
    setStatus(teacher.status);
    setTeachingHours(teacher.teachingHours);
    setPhone(teacher.phone);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        name: name.trim(),
        nip: nip.trim(),
        role: role.trim(),
        subject: subject.trim(),
        education: education.trim(),
        status,
        teachingHours: Number(teachingHours),
        phone: phone.trim(),
      });
    } else {
      const newT: Teacher = {
        id: `t-${Date.now()}`,
        name: name.trim(),
        nip: nip.trim(),
        role: role.trim(),
        subject: subject.trim(),
        education: education.trim(),
        status,
        teachingHours: Number(teachingHours),
        phone: phone.trim(),
        attendanceRate: 100,
      };
      onAddTeacher(newT);
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Nama Guru & Gelar', 'NIP / NUPTK', 'Tugas / Jabatan', 'Mata Pelajaran', 'Pendidikan', 'Status Kepegawaian', 'Jam Mengajar/Mgg', 'Nomor HP'];
    const rows = teachers.map((t, idx) => [
      idx + 1,
      t.name,
      t.nip,
      t.role,
      t.subject,
      t.education,
      t.status,
      t.teachingHours,
      t.phone,
    ]);
    exportToCSV(`Daftar_Guru_PTK_${config.schoolName}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pendidik & Tenaga Kependidikan (PTK)</h2>
            <p className="text-xs text-slate-500">
              Direktori dewan guru dan tenaga kependidikan {config.schoolName}, pemenuhan jam mengajar, dan status kepegawaian.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Data PTK</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            Total Dewan Guru: <span className="font-bold text-slate-900">{teachers.length} Orang</span>
            {' '}({teachers.filter((t) => t.status === 'PNS').length} PNS · {teachers.filter((t) => t.status === 'PPPK').length} PPPK · {teachers.filter((t) => t.status === 'Yayasan').length} Yayasan)
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari guru, NIP, atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Teachers Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pendidik & NIP</th>
                <th className="py-3 px-4">Tugas / Jabatan</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
                <th className="py-3 px-3 w-20 text-center">Beban Jam</th>
                <th className="py-3 px-3 w-20 text-center">Kehadiran</th>
                <th className="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher, idx) => (
                <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{teacher.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">NIP: {teacher.nip}</div>
                    <div className="text-[10px] text-slate-400">{teacher.education}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{teacher.role}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-700">{teacher.subject}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      teacher.status === 'PNS'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : teacher.status === 'PPPK'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {teacher.teachingHours} Jam
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                    {teacher.attendanceRate}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(teacher)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus data ${teacher.name}?`)) {
                            onDeleteTeacher(teacher.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Data Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              {editingTeacher ? 'Edit Data Pendidik' : 'Tambah Guru Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Amiruddin, S.Pd., Gr."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK:</label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="19880815 201502 1 002"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tugas / Jabatan:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Wali Kelas 7A & Guru Matematika"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir:</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="S1 Pendidikan Matematika"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian:</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Yayasan">Yayasan / Tetap</option>
                    <option value="GTT">GTT / Honorer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beban Mengajar (Jam/Mgg):</label>
                  <input
                    type="number"
                    value={teachingHours}
                    onChange={(e) => setTeachingHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
