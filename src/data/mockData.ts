import { 
  SchoolClass, 
  SchoolSubject, 
  SchoolConfig, 
  Student, 
  DailyAttendance, 
  SubjectGrades, 
  Teacher, 
  SchoolAnnouncement 
} from '../types';

export const initialConfig: SchoolConfig = {
  schoolName: 'SMP Islam Al-Wasi Maros',
  npsn: '69871234',
  accreditation: 'Akreditasi A (Unggul)',
  principalName: 'Drs. H. Muhammad Ilyas, M.Pd.',
  principalNip: '19740512 199903 1 004',
  teacherName: 'Amiruddin, S.Pd., Gr.',
  teacherNip: '19880815 201502 1 002',
  address: 'Jl. Poros Maros - Pangkep, Kec. Lau, Kabupaten Maros, Sulawesi Selatan',
  defaultKkm: 75,
  monthlyTuitionFee: 250000,
};

export const initialClasses: SchoolClass[] = [
  {
    id: 'class-7a',
    name: 'Kelas 7A',
    gradeLevel: '7',
    homeroomTeacher: 'Amiruddin, S.Pd., Gr.',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    totalStudents: 16,
  },
  {
    id: 'class-7b',
    name: 'Kelas 7B',
    gradeLevel: '7',
    homeroomTeacher: 'Nur Azizah, S.Pd.',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    totalStudents: 15,
  },
  {
    id: 'class-8a',
    name: 'Kelas 8A',
    gradeLevel: '8',
    homeroomTeacher: 'Drs. Ridwan Hakim',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    totalStudents: 16,
  },
];

export const initialSubjects: SchoolSubject[] = [
  { id: 'sub-mat', code: 'MAT', name: 'Matematika', teacherName: 'Amiruddin, S.Pd., Gr.' },
  { id: 'sub-ipa', code: 'IPA', name: 'Ilmu Pengetahuan Alam (IPA)', teacherName: 'Dra. Mardiana' },
  { id: 'sub-bind', code: 'BIND', name: 'Bahasa Indonesia', teacherName: 'Syamsul Bahri, S.Pd.' },
  { id: 'sub-pai', code: 'PAI', name: 'Pendidikan Agama Islam (PAI)', teacherName: 'Ust. Fahruddin, S.Ag.' },
  { id: 'sub-bing', code: 'BING', name: 'Bahasa Inggris', teacherName: 'Faridah Nur, S.Pd.' },
  { id: 'sub-ips', code: 'IPS', name: 'Ilmu Pengetahuan Sosial (IPS)', teacherName: 'Hasnawati, S.Pd.' },
  { id: 'sub-pjok', code: 'PJOK', name: 'PJOK', teacherName: 'Rahmat Hidayat, S.Pd.' },
  { id: 'sub-infor', code: 'INFOR', name: 'Informatika', teacherName: 'Muh. Yusuf, S.Kom.' },
];

export const initialTeachers: Teacher[] = [
  {
    id: 't-01',
    name: 'Amiruddin, S.Pd., Gr.',
    nip: '19880815 201502 1 002',
    role: 'Wali Kelas 7A & Guru Matematika',
    subject: 'Matematika',
    education: 'S1 Pendidikan Matematika UNM',
    status: 'PNS',
    teachingHours: 24,
    phone: '081342119876',
    attendanceRate: 98,
  },
  {
    id: 't-02',
    name: 'Drs. H. Muhammad Ilyas, M.Pd.',
    nip: '19740512 199903 1 004',
    role: 'Kepala Sekolah',
    subject: 'Manajemen Pendidikan',
    education: 'S2 Manajemen Pendidikan',
    status: 'PNS',
    teachingHours: 6,
    phone: '081145678910',
    attendanceRate: 100,
  },
  {
    id: 't-03',
    name: 'Ust. Fahruddin, S.Ag.',
    nip: '19820311 201001 1 012',
    role: 'Koordinator Keagamaan & Guru PAI',
    subject: 'Pendidikan Agama Islam',
    education: 'S1 Tarbiyah UIN Alauddin',
    status: 'Yayasan',
    teachingHours: 22,
    phone: '085241908765',
    attendanceRate: 96,
  },
  {
    id: 't-04',
    name: 'Dra. Mardiana',
    nip: '19710923 199802 2 001',
    role: 'Guru Senior IPA & Kepala Laboratorium',
    subject: 'Ilmu Pengetahuan Alam',
    education: 'S1 Pendidikan Biologi UNM',
    status: 'PNS',
    teachingHours: 26,
    phone: '081242334455',
    attendanceRate: 95,
  },
  {
    id: 't-05',
    name: 'Siti Rahmawati, S.Pd.',
    nip: '19920418 202012 2 015',
    role: 'Guru Bimbingan Konseling (BK)',
    subject: 'Bimbingan Konseling',
    education: 'S1 Bimbingan Konseling UNM',
    status: 'PPPK',
    teachingHours: 24,
    phone: '085398761234',
    attendanceRate: 97,
  },
];

export const initialAnnouncements: SchoolAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Pelaksanaan Asesmen Sumatif Tengah Semester (ASTS)',
    date: '2026-10-25',
    category: 'Akademik',
    content: 'Jadwal Asesmen Sumatif Tengah Semester akan diselenggarakan mulai tanggal 3 hingga 8 November 2026. Semua guru mata pelajaran dimohon merampungkan kisi-kisi dan rekap nilai harian.',
    isImportant: true,
  },
  {
    id: 'ann-2',
    title: 'Perkemahan Sabtu Minggu (Persami) Gugus Depan Al-Wasi',
    date: '2026-10-22',
    category: 'Kesiswaan',
    content: 'Kegiatan Persami Pramuka penggalang kelas 7 dan 8 akan dipusatkan di Bumi Perkemahan Bantimurung Maros. Surat izin orang tua telah diedarkan.',
    isImportant: false,
  },
  {
    id: 'ann-3',
    title: 'Pertemuan Komite & Konsolidasi Rapor Digital',
    date: '2026-10-18',
    category: 'Agenda',
    content: 'Undangan silaturahmi orang tua wali murid dan pengenalan portal digital perkembangan siswa berbasis profil karakter Profil Pelajar Pancasila.',
    isImportant: true,
  },
];

export const initialStudents: Student[] = [
  {
    id: 's-01',
    nisn: '009823101',
    name: 'Muhammad Fadil Ramadhan',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Ramli',
    parentPhone: '081234567890',
    birthDate: '2013-09-12',
    extracurriculars: ['Tahfidz Al-Qur\'an', 'Futsal', 'Pramuka'],
    achievements: [
      { id: 'ach-1', title: 'Juara 1 Lomba Tahfidz Juz 30', category: 'Keagamaan', level: 'Kabupaten/Kota', year: '2026', description: 'Musabaqah Hifdzil Quran tingkat Kabupaten Maros' },
      { id: 'ach-2', title: 'Juara 2 Olimpiade Sains Matematika', category: 'Akademik', level: 'Kecamatan', year: '2025' }
    ],
    characterP5: {
      beriman: 4,
      mandiri: 4,
      gotongRoyong: 4,
      bernalarKritis: 4,
      kreatif: 3,
      berkebinekaan: 4,
      notes: 'Ananda memiliki akhlak terpuji, konsisten memimpin shalat dhuha berjamaah dan aktif dalam diskusi kelompok.',
    },
    counselingLogs: [
      { id: 'c-1', date: '2026-10-15', category: 'Pengembangan Minat', description: 'Konsultasi minat bakat persiapan seleksi MTQ tingkat Provinsi Sulawesi Selatan.', actionTaken: 'Diberikan pendampingan intensif bersama guru PAI & Tahfidz.', counselor: 'Siti Rahmawati, S.Pd.' }
    ],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true, paidAt: '2026-07-10' },
      { month: 'Agustus 2026', amount: 250000, isPaid: true, paidAt: '2026-08-08' },
      { month: 'September 2026', amount: 250000, isPaid: true, paidAt: '2026-09-05' },
      { month: 'Oktober 2026', amount: 250000, isPaid: true, paidAt: '2026-10-04' },
    ],
  },
  {
    id: 's-02',
    nisn: '009823102',
    name: 'Siti Nurhaliza Zahra',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Sudirman',
    parentPhone: '081234567891',
    birthDate: '2013-04-18',
    extracurriculars: ['PMR (Palang Merah Remaja)', 'Seni Tari', 'English Club'],
    achievements: [
      { id: 'ach-3', title: 'Peringkat 1 Umum Akademik Kelas 7', category: 'Akademik', level: 'Sekolah', year: '2026' }
    ],
    characterP5: {
      beriman: 4,
      mandiri: 4,
      gotongRoyong: 4,
      bernalarKritis: 4,
      kreatif: 4,
      berkebinekaan: 4,
      notes: 'Sangat teliti, kepemimpinan tinggi, dan berinisiatif tinggi membantu teman yang kesulitan belajar.',
    },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true, paidAt: '2026-07-08' },
      { month: 'Agustus 2026', amount: 250000, isPaid: true, paidAt: '2026-08-05' },
      { month: 'September 2026', amount: 250000, isPaid: true, paidAt: '2026-09-02' },
      { month: 'Oktober 2026', amount: 250000, isPaid: true, paidAt: '2026-10-02' },
    ],
  },
  {
    id: 's-03',
    nisn: '009823103',
    name: 'Ahmad Zaki Al-Mubarak',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Mubarak',
    parentPhone: '081234567892',
    birthDate: '2013-11-20',
    extracurriculars: ['Robotik & Coding', 'Pramuka'],
    achievements: [],
    characterP5: {
      beriman: 3,
      mandiri: 4,
      gotongRoyong: 3,
      bernalarKritis: 4,
      kreatif: 4,
      berkebinekaan: 3,
      notes: 'Menunjukkan daya nalar analitis yang kuat terutama pada proyek sains dan teknologi.',
    },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true, paidAt: '2026-07-12' },
      { month: 'Agustus 2026', amount: 250000, isPaid: true, paidAt: '2026-08-11' },
      { month: 'September 2026', amount: 250000, isPaid: true, paidAt: '2026-09-15' },
      { month: 'Oktober 2026', amount: 250000, isPaid: true, paidAt: '2026-10-14' },
    ],
  },
  {
    id: 's-04',
    nisn: '009823104',
    name: 'Nur Aisyah Humairah',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Burhanuddin',
    parentPhone: '081234567893',
    birthDate: '2013-02-14',
    extracurriculars: ['Tahfidz Al-Qur\'an', 'PMR'],
    achievements: [],
    characterP5: {
      beriman: 4,
      mandiri: 3,
      gotongRoyong: 4,
      bernalarKritis: 3,
      kreatif: 3,
      berkebinekaan: 4,
      notes: 'Sopan, santun, rajin beribadah dan selalu menyelesaikan tugas tepat waktu.',
    },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true, paidAt: '2026-07-09' },
      { month: 'Agustus 2026', amount: 250000, isPaid: true, paidAt: '2026-08-09' },
      { month: 'September 2026', amount: 250000, isPaid: true, paidAt: '2026-09-09' },
      { month: 'Oktober 2026', amount: 250000, isPaid: true, paidAt: '2026-10-10' },
    ],
  },
  {
    id: 's-05',
    nisn: '009823105',
    name: 'Rizky Pratama Wijaya',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Wijaya',
    parentPhone: '081234567894',
    birthDate: '2013-08-05',
    extracurriculars: ['Futsal', 'Bulu Tangkis'],
    achievements: [
      { id: 'ach-4', title: 'Juara 1 Turnamen Futsal Antar Pelajar', category: 'Olahraga', level: 'Kabupaten/Kota', year: '2026' }
    ],
    characterP5: {
      beriman: 3,
      mandiri: 2,
      gotongRoyong: 4,
      bernalarKritis: 2,
      kreatif: 3,
      berkebinekaan: 3,
      notes: 'Jiwa sportivitas dan kerjasama tim sangat baik. Perlu ditingkatkan konsentrasi pada jam pelajaran akademik.',
    },
    counselingLogs: [
      { id: 'c-2', date: '2026-10-19', category: 'Bimbingan Belajar', description: 'Pendampingan remedial materi matematika dan jadwal belajar di rumah.', actionTaken: 'Disepakati pembuatan jadwal belajar mandiri 1 jam setiap malam bersama orang tua.', counselor: 'Siti Rahmawati, S.Pd.' }
    ],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true, paidAt: '2026-07-20' },
      { month: 'Agustus 2026', amount: 250000, isPaid: true, paidAt: '2026-08-25' },
      { month: 'September 2026', amount: 250000, isPaid: false },
      { month: 'Oktober 2026', amount: 250000, isPaid: false },
    ],
  },
  {
    id: 's-06',
    nisn: '009823106',
    name: 'Fathir Azzam An-Nafi',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Nafiuddin',
    parentPhone: '081234567895',
    birthDate: '2013-10-01',
    extracurriculars: ['Pramuka', 'Seni Hadrah'],
    achievements: [],
    characterP5: { beriman: 4, mandiri: 3, gotongRoyong: 4, bernalarKritis: 3, kreatif: 3, berkebinekaan: 3, notes: 'Aktif dalam kegiatan sosial keagamaan madrasah.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-07',
    nisn: '009823107',
    name: 'Khairunnisa Salsabila',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Basri',
    parentPhone: '081234567896',
    birthDate: '2013-05-22',
    extracurriculars: ['Seni Kaligrafi', 'Tahfidz Al-Qur\'an'],
    achievements: [
      { id: 'ach-5', title: 'Juara 3 Kaligrafi Islam Kontemporer', category: 'Seni', level: 'Provinsi', year: '2026' }
    ],
    characterP5: { beriman: 4, mandiri: 4, gotongRoyong: 4, bernalarKritis: 3, kreatif: 4, berkebinekaan: 4, notes: 'Bakat seni yang luar biasa dan tekun dalam berkarya.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-08',
    nisn: '009823108',
    name: 'Andi Muh. Raihan Pasha',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Andi Mappatunru',
    parentPhone: '081234567897',
    birthDate: '2013-07-15',
    extracurriculars: ['Paskibra', 'Futsal'],
    achievements: [],
    characterP5: { beriman: 3, mandiri: 3, gotongRoyong: 4, bernalarKritis: 3, kreatif: 3, berkebinekaan: 3, notes: 'Postur tegap, disiplin baris berbaris dan kepemimpinan tinggi.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-09',
    nisn: '009823109',
    name: 'Aqilah Syahla Putri',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Syahrir',
    parentPhone: '081234567898',
    birthDate: '2013-12-03',
    extracurriculars: ['PMR', 'Jurnalistik'],
    achievements: [],
    characterP5: { beriman: 4, mandiri: 4, gotongRoyong: 4, bernalarKritis: 4, kreatif: 4, berkebinekaan: 4, notes: 'Kemampuan komunikasi verbal dan tulisan yang sangat memikat.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-10',
    nisn: '009823110',
    name: 'Bilal Habibi Al-Farisi',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Farid',
    parentPhone: '081234567899',
    birthDate: '2013-03-29',
    extracurriculars: ['Tahfidz Al-Qur\'an', 'Pramuka'],
    achievements: [],
    characterP5: { beriman: 4, mandiri: 3, gotongRoyong: 3, bernalarKritis: 3, kreatif: 3, berkebinekaan: 3, notes: 'Tenang, santun, dan konsisten dalam tilawah harian.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-11',
    nisn: '009823111',
    name: 'Dina Amelia Safitri',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Safri',
    parentPhone: '081234567810',
    birthDate: '2013-06-11',
    extracurriculars: ['English Club', 'PMR'],
    achievements: [],
    characterP5: { beriman: 3, mandiri: 4, gotongRoyong: 4, bernalarKritis: 3, kreatif: 3, berkebinekaan: 4, notes: 'Ramah dan senang berkolaborasi dalam tugas kelompok.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-12',
    nisn: '009823112',
    name: 'Fikri Haikal Rahman',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Abdurrahman',
    parentPhone: '081234567811',
    birthDate: '2013-01-25',
    extracurriculars: ['Futsal'],
    achievements: [],
    characterP5: {
      beriman: 2,
      mandiri: 2,
      gotongRoyong: 3,
      bernalarKritis: 2,
      kreatif: 3,
      berkebinekaan: 3,
      notes: 'Memerlukan pembiasaan disiplin waktu masuk sekolah dan kehadiran yang lebih teratur.',
    },
    counselingLogs: [
      { id: 'c-3', date: '2026-10-21', category: 'Kedisiplinan', description: 'Pemanggilan terkait catatan 2 kali alpa tanpa surat keterangan.', actionTaken: 'Komunikasi bersama orang tua via telepon dan penandatanganan komitmen kehadiran.', counselor: 'Siti Rahmawati, S.Pd.' }
    ],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: false },
      { month: 'September 2026', amount: 250000, isPaid: false },
      { month: 'Oktober 2026', amount: 250000, isPaid: false },
    ],
  },
  {
    id: 's-13',
    nisn: '009823113',
    name: 'Nabila Azzahra Putri',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Zulkifli',
    parentPhone: '081234567812',
    birthDate: '2013-05-04',
    extracurriculars: ['Tahfidz Al-Qur\'an', 'Pramuka'],
    achievements: [
      { id: 'ach-6', title: 'Juara 2 Lomba Pidato Bahasa Arab', category: 'Keagamaan', level: 'Kabupaten/Kota', year: '2026' }
    ],
    characterP5: { beriman: 4, mandiri: 4, gotongRoyong: 4, bernalarKritis: 4, kreatif: 4, berkebinekaan: 4, notes: 'Sangat percaya diri, berprestasi seimbang di bidang akademik dan keagamaan.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-14',
    nisn: '009823114',
    name: 'Reyhan Danendra',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Darmansyah',
    parentPhone: '081234567813',
    birthDate: '2013-09-30',
    extracurriculars: ['Paskibra', 'Bulu Tangkis'],
    achievements: [],
    characterP5: { beriman: 3, mandiri: 3, gotongRoyong: 4, bernalarKritis: 3, kreatif: 3, berkebinekaan: 3, notes: 'Suka bergaul, bersahabat dan aktif dalam kegiatan luar kelas.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-15',
    nisn: '009823115',
    name: 'Syifa Nur Fauziah',
    gender: 'P',
    classId: 'class-7a',
    parentName: 'Fauzi',
    parentPhone: '081234567814',
    birthDate: '2013-11-17',
    extracurriculars: ['Seni Tari', 'PMR'],
    achievements: [],
    characterP5: { beriman: 4, mandiri: 3, gotongRoyong: 4, bernalarKritis: 3, kreatif: 4, berkebinekaan: 4, notes: 'Kreativitas seni tinggi dan santun dalam berbicara.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
  {
    id: 's-16',
    nisn: '009823116',
    name: 'Zahran Al-Ghifari',
    gender: 'L',
    classId: 'class-7a',
    parentName: 'Mustafa',
    parentPhone: '081234567815',
    birthDate: '2013-07-28',
    extracurriculars: ['Robotik & Coding', 'Futsal'],
    achievements: [],
    characterP5: { beriman: 3, mandiri: 3, gotongRoyong: 3, bernalarKritis: 3, kreatif: 3, berkebinekaan: 3, notes: 'Tertarik dengan eksperimen komputer dan perlu dorongan pada materi hafalan.' },
    counselingLogs: [],
    tuition: [
      { month: 'Juli 2026', amount: 250000, isPaid: true },
      { month: 'Agustus 2026', amount: 250000, isPaid: true },
      { month: 'September 2026', amount: 250000, isPaid: true },
      { month: 'Oktober 2026', amount: 250000, isPaid: true },
    ],
  },
];

export const generateSampleAttendance = (): Record<string, DailyAttendance> => {
  const result: Record<string, DailyAttendance> = {};
  
  const sampleDates = [
    '2026-10-24',
    '2026-10-25',
    '2026-10-26',
    '2026-10-27',
    '2026-10-28',
  ];

  sampleDates.forEach((date) => {
    const id = `${date}_class-7a`;
    const entries: Record<string, { studentId: string; status: 'H' | 'S' | 'I' | 'A'; note?: string }> = {};

    initialStudents
      .filter((s) => s.classId === 'class-7a')
      .forEach((student) => {
        let status: 'H' | 'S' | 'I' | 'A' = 'H';
        let note = '';

        if (student.id === 's-05' && date === '2026-10-27') {
          status = 'S';
          note = 'Demam';
        } else if (student.id === 's-12' && (date === '2026-10-26' || date === '2026-10-28')) {
          status = 'A';
          note = 'Tanpa surat';
        } else if (student.id === 's-08' && date === '2026-10-25') {
          status = 'I';
          note = 'Acara keluarga';
        }

        entries[student.id] = { studentId: student.id, status, note };
      });

    result[id] = {
      id,
      date,
      classId: 'class-7a',
      subjectId: 'sub-mat',
      entries,
      createdAt: new Date().toISOString(),
    };
  });

  return result;
};

export const generateSampleGrades = (): Record<string, SubjectGrades> => {
  const gradeConfigs = [
    { id: 's-01', t1: 88, t2: 90, t3: 85, uh1: 92, uh2: 88, pts: 90, pas: 91 },
    { id: 's-02', t1: 95, t2: 96, t3: 92, uh1: 96, uh2: 94, pts: 95, pas: 98 },
    { id: 's-03', t1: 82, t2: 85, t3: 80, uh1: 84, uh2: 82, pts: 86, pas: 85 },
    { id: 's-04', t1: 90, t2: 88, t3: 92, uh1: 89, uh2: 91, pts: 92, pas: 90 },
    { id: 's-05', t1: 68, t2: 70, t3: 65, uh1: 64, uh2: 68, pts: 65, pas: 70 },
    { id: 's-06', t1: 85, t2: 84, t3: 88, uh1: 86, uh2: 85, pts: 88, pas: 87 },
    { id: 's-07', t1: 92, t2: 94, t3: 90, uh1: 93, uh2: 95, pts: 94, pas: 93 },
    { id: 's-08', t1: 76, t2: 78, t3: 75, uh1: 75, uh2: 78, pts: 77, pas: 78 },
    { id: 's-09', t1: 89, t2: 90, t3: 88, uh1: 90, uh2: 88, pts: 91, pas: 92 },
    { id: 's-10', t1: 78, t2: 80, t3: 79, uh1: 76, uh2: 82, pts: 80, pas: 81 },
    { id: 's-11', t1: 84, t2: 86, t3: 85, uh1: 85, uh2: 87, pts: 88, pas: 86 },
    { id: 's-12', t1: 60, t2: 65, t3: 58, uh1: 62, uh2: 60, pts: 60, pas: 64 },
    { id: 's-13', t1: 94, t2: 92, t3: 95, uh1: 96, uh2: 93, pts: 95, pas: 96 },
    { id: 's-14', t1: 75, t2: 78, t3: 76, uh1: 74, uh2: 77, pts: 76, pas: 78 },
    { id: 's-15', t1: 88, t2: 86, t3: 90, uh1: 89, uh2: 88, pts: 90, pas: 89 },
    { id: 's-16', t1: 72, t2: 74, t3: 70, uh1: 70, uh2: 73, pts: 71, pas: 75 },
  ];

  const studentGradesMap: Record<string, any> = {};

  gradeConfigs.forEach((c) => {
    const avgTugas = (c.t1 + c.t2 + c.t3) / 3;
    const avgUh = (c.uh1 + c.uh2) / 2;
    const finalScore = Math.round(avgTugas * 0.3 + avgUh * 0.3 + c.pts * 0.2 + c.pas * 0.2);
    const kkm = 75;
    const isPassed = finalScore >= kkm;

    let predicate: 'A' | 'B' | 'C' | 'D' = 'C';
    if (finalScore >= 90) predicate = 'A';
    else if (finalScore >= 80) predicate = 'B';
    else if (finalScore >= 70) predicate = 'C';
    else predicate = 'D';

    studentGradesMap[c.id] = {
      studentId: c.id,
      tugas1: c.t1,
      tugas2: c.t2,
      tugas3: c.t3,
      uh1: c.uh1,
      uh2: c.uh2,
      pts: c.pts,
      pas: c.pas,
      finalGrade: finalScore,
      predicate,
      isPassed,
      aiNarrative: finalScore >= 90 
        ? 'Menunjukkan penguasaan yang sangat istimewa dalam menyelesaikan operasi aljabar dan pemecahan masalah kontekstual.'
        : finalScore >= 75
        ? 'Menunjukkan pemahaman yang baik dalam konsep dasar dan aktif mengikuti kegiatan pembelajaran.'
        : 'Perlu bimbingan intensif dalam pemahaman konsep persamaan linear dan penyelesaian soal cerita.',
      homeroomNote: finalScore >= 85 
        ? 'Pertahankan semangat belajar dan terus kembangkan bakat kepemimpinan dalam diskusi.'
        : 'Tingkatkan fokus saat jam pelajaran dan jangan ragu bertanya pada guru atau rekan sebaya.',
    };
  });

  const subjectGradeId = 'class-7a_sub-mat_Ganjil';
  return {
    [subjectGradeId]: {
      id: subjectGradeId,
      classId: 'class-7a',
      subjectId: 'sub-mat',
      semester: 'Ganjil',
      academicYear: '2026/2027',
      kkm: 75,
      weights: {
        tugas: 30,
        uh: 30,
        pts: 20,
        pas: 20,
      },
      grades: studentGradesMap,
    },
  };
};
