import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client initialization with mandatory User-Agent
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Generate narrative report card & teacher evaluation notes
app.post('/api/gemini/generate-report-narrative', async (req, res) => {
  try {
    const { studentName, className, subjectName, finalGrade, kkm, attendanceRate, assessments, strengths, challenges } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'Data siswa tidak lengkap' });
    }

    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
    }

    if (!aiClient) {
      // High-quality deterministic fallback if no API key
      const statusText = finalGrade >= kkm ? 'sangat baik dan telah tuntas mencapai kriteria ketercapaian' : 'memerlukan bimbingan lanjutan pada beberapa materi capaian';
      const fallbackNarrative = `Ananda ${studentName} menunjukkan perkembangan belajar yang ${finalGrade >= 85 ? 'sangat memuaskan' : finalGrade >= 75 ? 'baik' : 'cukup'}. Pada mata pelajaran ${subjectName || 'Umum'}, ananda ${statusText}. Dengan tingkat kehadiran ${attendanceRate || 100}%, ananda diharapkan terus mempertahankan disiplin belajar serta aktif dalam penugasan mandiri maupun kelompok.`;
      const fallbackAction = finalGrade < kkm 
        ? 'Rekomendasi remedial terarah untuk penguatan kompetensi dasar serta pendampingan belajar tutor sebaya.' 
        : 'Pertahankan prestasi belajar dan berikan materi pengayaan tingkat lanjut.';

      return res.json({
        narrative: fallbackNarrative,
        recommendation: fallbackAction,
        isFallback: true,
      });
    }

    const prompt = `Anda adalah seorang asisten ahli guru dan wali kelas di sekolah menengah Indonesia (Kurikulum Merdeka dan Kurikulum Nasional).
Tolong susun narasi capaian pembelajaran siswa dan catatan wali kelas untuk rapor dengan kriteria:
1. Nama Siswa: ${studentName}
2. Kelas: ${className || '7A'}
3. Mata Pelajaran: ${subjectName || 'Umum'}
4. Nilai Akhir: ${finalGrade} (KKTP/KKM: ${kkm})
5. Tingkat Kehadiran: ${attendanceRate}%
6. Rincian Asesmen: ${JSON.stringify(assessments || [])}
7. Potensi/Keunggulan: ${strengths || 'Kerapian dan partisipasi aktif'}
8. Catatan yang Perlu Diperbaiki: ${challenges || 'Konsistensi penyelesaian tugas tepat waktu'}

Berikan respons dalam format JSON persis:
{
  "narrative": "Deskripsi capaian kompetensi pembelajaran yang formal, apresiatif, mendidik, dan spesifik untuk buku rapor (1-2 paragraf pendek)",
  "homeroomNote": "Catatan singkat wali kelas yang memotivasi dan santun",
  "recommendation": "1-2 langkah tindak lanjut konkret (pengayaan/remedial/pendampingan)"
}
Pastikan berbahasa Indonesia baku, ramah, membangun, dan sesuai etika penilaian pendidikan.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini API call failed, providing high quality pedagogical fallback:', error?.message);
    const { studentName, subjectName, finalGrade = 75, kkm = 75, attendanceRate = 100 } = req.body || {};
    const statusText = Number(finalGrade) >= Number(kkm)
      ? 'sangat baik dan telah tuntas mencapai kriteria ketercapaian tujuan pembelajaran'
      : 'memerlukan bimbingan lanjutan dan remedial pada materi capaian tertentu';

    res.json({
      narrative: `Ananda ${studentName || 'Siswa'} menunjukkan perkembangan belajar yang ${Number(finalGrade) >= 85 ? 'sangat memuaskan' : Number(finalGrade) >= 75 ? 'baik' : 'cukup'}. Pada mata pelajaran ${subjectName || 'Umum'}, ananda ${statusText}. Dengan tingkat kehadiran ${attendanceRate}%, ananda diharapkan terus mempertahankan disiplin belajar serta aktif dalam penugasan mandiri maupun kelompok.`,
      homeroomNote: Number(finalGrade) >= 80 
        ? 'Pertahankan semangat belajar dan kepedulian sosial yang tinggi di kelas.' 
        : 'Tingkatkan fokus belajar dan manfaatkan kesempatan bimbingan guru dengan optimal.',
      recommendation: Number(finalGrade) < Number(kkm)
        ? 'Jadwalkan pendampingan remedial dan penugasan terstruktur.'
        : 'Berikan materi pengayaan tingkat lanjut untuk memperdalam wawasan siswa.',
      isFallback: true,
    });
  }
});

// API: Smart Class-wide Diagnostic & Recommendations
app.post('/api/gemini/analyze-class', async (req, res) => {
  try {
    const { className, subjectName, totalStudents, averageGrade, passRate, attendanceAverage, lowPerformers, topPerformers } = req.body;

    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
    }

    if (!aiClient) {
      return res.json({
        summary: `Kelas ${className || 'ini'} memiliki rata-rata nilai ${averageGrade || 0} dengan persentase ketuntasan ${passRate || 0}%. Kehadiran siswa berada di tingkat ${attendanceAverage || 0}%.`,
        strengths: ['Tingkat kehadiran siswa secara umum cukup stabil', 'Terdapat siswa dengan performa istimewa yang siap menjadi tutor sebaya'],
        weaknesses: ['Sebagian siswa masih di bawah KKTP dan membutuhkan bimbingan bertahap'],
        recommendedActions: [
          'Jadwalkan sesi remedial singkat fokus materi esensial untuk siswa tertinggal',
          'Terapkan pembelajaran diferensiasi dengan kelompok kolaboratif',
          'Kirimkan apresiasi dan rekap mingguan kepada orang tua wali'
        ],
        isFallback: true,
      });
    }

    const prompt = `Anda adalah konsultan pedagogik dan supervisor akademik sekolah di Indonesia.
Analisis data kelas berikut dan berikan evaluasi cerdas otomatis untuk guru:
- Kelas: ${className}
- Mata Pelajaran: ${subjectName}
- Jumlah Siswa: ${totalStudents}
- Nilai Rata-rata: ${averageGrade}
- Tingkat Kelulusan/Ketuntasan: ${passRate}%
- Rata-rata Kehadiran: ${attendanceAverage}%
- Siswa Perlu Remedial/Bimbingan: ${JSON.stringify(lowPerformers || [])}
- Siswa Berprestasi Terbaik: ${JSON.stringify(topPerformers || [])}

Keluarkan dalam JSON:
{
  "summary": "Ringkasan eksekutif performa kelas (2-3 kalimat tajam dan solutif)",
  "strengths": ["Poin kelebihan kelas 1", "Poin kelebihan kelas 2"],
  "weaknesses": ["Poin kelemahan/risiko kelas 1", "Poin kelemahan/risiko kelas 2"],
  "recommendedActions": ["Aksi konkrit 1 untuk guru minggu depan", "Aksi konkrit 2", "Aksi konkrit 3"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini class analysis error, using pedagogical fallback:', error?.message);
    const { className = 'Kelas', averageGrade = 78, passRate = 85, attendanceAverage = 95 } = req.body || {};
    res.json({
      summary: `${className} menunjukkan capaian yang solid dengan rata-rata kelas ${averageGrade} dan ketuntasan ${passRate}%. Kehadiran siswa sangat mendukung dinamika belajar di angka ${attendanceAverage}%.`,
      strengths: [
        'Sebagian besar siswa telah melampaui kriteria ketuntasan minimal (KKTP)',
        'Dinamika kelas aktif dan tingkat kehadiran harian stabil',
      ],
      weaknesses: [
        'Masih terdapat kesenjangan capaian pada penilaian sumatif akhir',
        'Siswa kategori remedial membutuhkan penugasan terfokus pada kompetensi esensial',
      ],
      recommendedActions: [
        'Lakukan pembelajaran diferensiasi dengan membentuk kelompok belajar kolaboratif',
        'Jadwalkan program remedial terstruktur berbobot latihan konsep dasar',
        'Kirimkan rekapan kemajuan berkala kepada wali murid untuk pengawasan rumah',
      ],
      isFallback: true,
    });
  }
});

// Setup dev server with Vite middlewares or production static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Teacher server running on http://0.0.0.0:${port}`);
  });
}

startServer();
