import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// FUNGSI BANTUAN: UBAH FILE KE BASE64
async function fileToGenerativePart(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve({
        inlineData: { data: base64String, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- CHEAT SHEET HUKUM (CONTEXT INJECTION) ---
// Ini membuat AI lebih pintar tanpa harus googling sendiri
const LEGAL_KNOWLEDGE_BASE = `
REFERENSI HUKUM UTAMA (INDONESIA):
1. KUHPerdata (BW):
   - Pasal 1320: Syarat sah perjanjian (Sepakat, Cakap, Hal Tertentu, Sebab Halal).
   - Pasal 1338: Asas kebebasan berkontrak & itikad baik.
   - Pasal 1266: Syarat pembatalan perjanjian lewat pengadilan (sering dikesampingkan).
2. UU Cipta Kerja (Ketenagakerjaan):
   - PKWT (Kontrak Waktu Tertentu) maksimal 5 tahun.
   - Pesangon wajib dibayar sesuai masa kerja.
   - Larangan menahan ijazah asli karyawan.
3. UU ITE & Perlindungan Data Pribadi (PDP):
   - Wajib ada klausul persetujuan pemrosesan data.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      
      // --- SYSTEM INSTRUCTION YANG SUDAH DI-UPGRADE ---
      systemInstruction: `
      PERAN:
      Anda adalah "VerifAI Neural Engine", sistem audit hukum tercanggih yang dilatih dengan standar Senior Corporate Lawyer (Pengalaman 20+ Tahun).
      
      MISI:
      Lindungi pengguna dari kerugian finansial dan jebakan hukum. Audit dokumen ini dengan ketelitian ekstrem.

      PENGETAHUAN DASAR (CONTEXT):
      Gunakan referensi berikut sebagai standar kepatuhan:
      ${LEGAL_KNOWLEDGE_BASE}

      ATURAN AUDIT (STRICT):
      1. TONE: Tegas, Objektif, Tanpa Basa-basi. Jangan gunakan kata "Mungkin" atau "Sepertinya".
      2. SITASI: Jika menemukan pelanggaran, SEBUTKAN DASAR HUKUMNYA (Misal: "Melanggar UU Cipta Kerja Pasal...").
      3. SOLUSI: Jangan cuma menyalahkan. Berikan "Rekomendasi Revisi Redaksi" untuk memperbaiki pasal tersebut.
      4. IDENTITAS: Tetap mengaku sebagai Sistem AI, bukan Manusia (untuk keamanan liabilitas).

      FORMAT LAPORAN (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      2. 📋 EKSEKUTIF SUMMARY (3 Kalimat inti untuk CEO sibuk)
      3. 🚩 RED FLAGS & TEMUAN KRITIS (Tabel: Pasal Asli | Risiko | Dasar Hukum | Saran Revisi)
      4. 💰 POTENSI BIAYA TERSEMBUNYI (Denda, Pajak, Admin)
      5. ⚖️ KESIMPULAN AKHIR
      `
    });

    const filePart = await fileToGenerativePart(file);
    
    // Prompt User
    const prompt = "Lakukan Deep Audit pada dokumen ini. Cari celah yang bisa merugikan saya secara finansial atau hukum.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("404")) throw new Error("Model AI sedang sibuk. Coba lagi.");
    throw new Error("Gagal menganalisa. Pastikan file PDF bisa dibaca.");
  }
};
