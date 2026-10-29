import React, { useState } from 'react';
import { SchoolConfig, SubjectGrades } from '../types';
import { Sliders, Building, User, Award, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface SettingsManagerProps {
  config: SchoolConfig;
  selectedSubjectGrades: SubjectGrades;
  onUpdateConfig: (updated: SchoolConfig) => void;
  onUpdateWeightsAndKkm: (weights: { tugas: number; uh: number; pts: number; pas: number }, kkm: number) => void;
  onResetAllData: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  config,
  selectedSubjectGrades,
  onUpdateConfig,
  onUpdateWeightsAndKkm,
  onResetAllData,
}) => {
  // Form states for school configuration
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [npsn, setNpsn] = useState(config.npsn);
  const [address, setAddress] = useState(config.address);
  const [principalName, setPrincipalName] = useState(config.principalName);
  const [principalNip, setPrincipalNip] = useState(config.principalNip);
  const [teacherName, setTeacherName] = useState(config.teacherName);
  const [teacherNip, setTeacherNip] = useState(config.teacherNip);

  // Form states for weights
  const [kkm, setKkm] = useState(selectedSubjectGrades?.kkm || 75);
  const [weightTugas, setWeightTugas] = useState(selectedSubjectGrades?.weights?.tugas ?? 30);
  const [weightUh, setWeightUh] = useState(selectedSubjectGrades?.weights?.uh ?? 30);
  const [weightPts, setWeightPts] = useState(selectedSubjectGrades?.weights?.pts ?? 20);
  const [weightPas, setWeightPas] = useState(selectedSubjectGrades?.weights?.pas ?? 20);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalWeights = Number(weightTugas) + Number(weightUh) + Number(weightPts) + Number(weightPas);
  const isWeightsValid = totalWeights === 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightsValid) {
      alert('Total persentase bobot penilaian harus berjumlah 100%!');
      return;
    }

    onUpdateConfig({
      ...config,
      schoolName: schoolName.trim(),
      npsn: npsn.trim(),
      address: address.trim(),
      principalName: principalName.trim(),
      principalNip: principalNip.trim(),
      teacherName: teacherName.trim(),
      teacherNip: teacherNip.trim(),
      defaultKkm: Number(kkm),
    });

    onUpdateWeightsAndKkm(
      {
        tugas: Number(weightTugas),
        uh: Number(weightUh),
        pts: Number(weightPts),
        pas: Number(weightPas),
      },
      Number(kkm)
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* School Information Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Identitas Satuan Pendidikan & Sekolah</h3>
              <p className="text-xs text-slate-500">Nama sekolah dan alamat yang dicetak pada lembar rapor resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah:</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900"
                placeholder="Contoh: SMP Islam Al-Wasi Maros"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Pokok Sekolah Nasional (NPSN):</label>
              <input
                type="text"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="69871234"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Satuan Pendidikan:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Alamat jalan, kabupaten/kota, provinsi"
              />
            </div>
          </div>
        </div>

        {/* Teacher & Headmaster Signers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pejabat & Guru Penandatangan Dokumen</h3>
              <p className="text-xs text-slate-500">Nama dan NIP untuk pengesahan lembar buku nilai dan rapor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Guru Pengampu / Wali Kelas:</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nama lengkap beserta gelar"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Guru:</label>
              <input
                type="text"
                value={teacherNip}
                onChange={(e) => setTeacherNip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="19880815 201502 1 002"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah:</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nama kepala sekolah beserta gelar"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah:</label>
              <input
                type="text"
                value={principalNip}
                onChange={(e) => setPrincipalNip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="19740512 199903 1 004"
              />
            </div>
          </div>
        </div>

        {/* KKTP & Grading Weights Formula */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Kriteria Ketuntasan & Bobot Penilaian</h3>
              <p className="text-xs text-slate-500">
                Formula otomatis perhitungan Nilai Akhir (NA) siswa (Total bobot harus 100%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-800 mb-1">Standar KKTP / KKM:</label>
              <input
                type="number"
                min={50}
                max={95}
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Batas kelulusan</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-800 mb-1">Formatif / Tugas (%):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightTugas}
                onChange={(e) => setWeightTugas(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Rata-rata tugas</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-800 mb-1">Sumatif UH (%):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightUh}
                onChange={(e) => setWeightUh(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Ulangan harian</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-800 mb-1">PTS / STS (%):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightPts}
                onChange={(e) => setWeightPts(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Tengah semester</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-800 mb-1">PAS / SAS (%):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightPas}
                onChange={(e) => setWeightPas(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold font-mono text-base text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Akhir semester</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className={`font-semibold ${isWeightsValid ? 'text-emerald-700' : 'text-rose-600'}`}>
              Total Akumulasi Bobot: {totalWeights}% {isWeightsValid ? '(Valid 100%)' : '(Peringatan: harus 100%)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data default sekolah (SMP Islam Al-Wasi Maros)? Semua data perubahan saat ini akan di-reset.')) {
                onResetAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Data Demo Awal</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Simpan Semua Pengaturan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
