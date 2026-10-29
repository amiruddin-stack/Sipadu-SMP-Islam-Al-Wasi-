import React, { useState } from 'react';
import { Student, SchoolClass, SchoolConfig } from '../types';
import { CreditCard, CheckCircle2, Clock, Download, Search, Filter, Printer, DollarSign } from 'lucide-react';
import { exportToCSV } from '../utils/storage';

interface TuitionManagerProps {
  students: Student[];
  currentClass: SchoolClass;
  config: SchoolConfig;
  onUpdateStudent: (updated: Student) => void;
}

export const TuitionManager: React.FC<TuitionManagerProps> = ({
  students,
  currentClass,
  config,
  onUpdateStudent,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const months = ['Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026'];
  const monthlyFee = config.monthlyTuitionFee || 250000;

  const currentClassStudents = students.filter((s) => s.classId === currentClass.id);

  // Toggle payment status for a student in a specific month
  const handleTogglePayment = (student: Student, monthName: string) => {
    const currentTuition = student.tuition || [];
    const existingIndex = currentTuition.findIndex((t) => t.month === monthName);

    let updatedTuition = [...currentTuition];
    if (existingIndex >= 0) {
      const currentStatus = updatedTuition[existingIndex].isPaid;
      updatedTuition[existingIndex] = {
        ...updatedTuition[existingIndex],
        isPaid: !currentStatus,
        paidAt: !currentStatus ? new Date().toISOString().split('T')[0] : undefined,
      };
    } else {
      updatedTuition.push({
        month: monthName,
        amount: monthlyFee,
        isPaid: true,
        paidAt: new Date().toISOString().split('T')[0],
      });
    }

    onUpdateStudent({
      ...student,
      tuition: updatedTuition,
    });
  };

  // Compile calculations
  let totalBilled = 0;
  let totalCollected = 0;

  const studentTuitionData = currentClassStudents.map((student) => {
    const tuitionList = student.tuition || [];
    let paidMonthsCount = 0;

    months.forEach((m) => {
      totalBilled += monthlyFee;
      const t = tuitionList.find((item) => item.month === m);
      if (t?.isPaid) {
        paidMonthsCount++;
        totalCollected += monthlyFee;
      }
    });

    const isFullyPaid = paidMonthsCount === months.length;
    const unpaidCount = months.length - paidMonthsCount;

    return {
      student,
      paidMonthsCount,
      unpaidCount,
      isFullyPaid,
      totalUnpaidAmount: unpaidCount * monthlyFee,
    };
  });

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Filter
  const filteredList = studentTuitionData
    .filter((item) => {
      if (filterMode === 'paid') return item.isFullyPaid;
      if (filterMode === 'unpaid') return !item.isFullyPaid;
      return true;
    })
    .filter(
      (item) =>
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.nisn.includes(searchQuery)
    );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', ...months, 'Total Bulan Lunas', 'Status Tunggakan'];
    const rows = currentClassStudents.map((s, idx) => {
      const tuitionList = s.tuition || [];
      const monthStatuses = months.map((m) => {
        const found = tuitionList.find((item) => item.month === m);
        return found?.isPaid ? 'LUNAS' : 'BELUM';
      });

      const paidCount = months.filter((m) => tuitionList.find((item) => item.month === m)?.isPaid).length;
      return [
        idx + 1,
        s.nisn,
        s.name,
        ...monthStatuses,
        `${paidCount} dari ${months.length} Bulan`,
        paidCount === months.length ? 'LUNAS' : `Menunggak ${months.length - paidCount} Bulan`,
      ];
    });

    exportToCSV(`Laporan_SPP_${currentClass.name}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Administrasi & Iuran SPP Siswa ({currentClass.name})</h2>
            <p className="text-xs text-slate-500">
              Pencatatan pembayaran SPP/Syahriah bulanan siswa (Tarif: {formatRupiah(monthlyFee)} / bulan).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Rekap SPP</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Target Kas Kelas</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{formatRupiah(totalBilled)}</div>
            <div className="text-[11px] text-slate-400">Total 4 Bulan (Jul - Okt)</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <div className="text-emerald-700 font-medium flex items-center justify-between">
              <span>Realisasi Penerimaan</span>
              <span className="text-[11px] font-semibold">{collectionRate}%</span>
            </div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{formatRupiah(totalCollected)}</div>
            <div className="text-[11px] text-emerald-600">Kas telah diterima bendahara</div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <div className="text-amber-700 font-medium">Sisa Piutang / Tunggakan</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">
              {formatRupiah(totalBilled - totalCollected)}
            </div>
            <div className="text-[11px] text-amber-600">Iuran belum dilunasi</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 font-medium">Siswa Menunggak</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {studentTuitionData.filter((s) => !s.isFullyPaid).length} Siswa
            </div>
            <div className="text-[11px] text-slate-400">Dari {currentClassStudents.length} total siswa</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({studentTuitionData.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('paid')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'paid' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lunas ({studentTuitionData.filter((s) => s.isFullyPaid).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unpaid')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterMode === 'unpaid' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggak ({studentTuitionData.filter((s) => !s.isFullyPaid).length})
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

      {/* Main Tuition Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Siswa & NISN</th>
                {months.map((m) => (
                  <th key={m} className="py-3 px-3 text-center min-w-[110px]">
                    {m.split(' ')[0]}
                  </th>
                ))}
                <th className="py-3 px-3 text-center w-28">Status</th>
                <th className="py-3 px-3 text-right w-32">Tunggakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item, idx) => {
                const { student, isFullyPaid, totalUnpaidAmount } = item;
                const tuitionList = student.tuition || [];

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</div>
                    </td>

                    {/* Checkboxes/Buttons for each month */}
                    {months.map((m) => {
                      const t = tuitionList.find((item) => item.month === m);
                      const isPaid = t?.isPaid ?? false;

                      return (
                        <td key={m} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePayment(student, m)}
                            title={isPaid ? `Lunas pada ${t?.paidAt || 'tercatat'} (Klik untuk ubah)` : 'Belum Lunas (Klik untuk tandai Lunas)'}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Lunas</span>
                              </>
                            ) : (
                              <span>Belum</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isFullyPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isFullyPaid ? 'Tuntas Lunas' : 'Menunggak'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={totalUnpaidAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {totalUnpaidAmount > 0 ? formatRupiah(totalUnpaidAmount) : 'Rp 0'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
