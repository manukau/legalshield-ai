import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

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

// CONTEKAN HUKUM (DIPERSINGKAT AGAR HEMAT TOKEN TAPI EFEKTIF)
const LEGAL_KNOWLEDGE_BASE = `
DASAR HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah): Sepakat, Cakap, Hal Tertentu, Sebab Halal.
2. KUHPerdata Pasal 1338 (Kebebasan Berkontrak): Semua perjanjian sah berlaku sebagai undang-undang bagi mereka yang membuatnya.
3. UU Cipta Kerja (Jika terkait Ketenagakerjaan).
4. Asas Proporsionalitas: Hak dan kewajiban harus seimbang.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      
      // --- PERBAIKAN 1: MEMATIKAN KREATIVITAS (TEMPERATURE 0) ---
      generationConfig: {
        temperature: 0.0, // Kreativitas dimatikan total. Hanya fakta.
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },

     systemInstruction: `
      PERAN:
      Anda adalah "VerifAI Neural Engine", auditor hukum spesialis Yurisdiksi Indonesia.
      
      MISI:
      Audit dokumen ini secara ketat. Temukan celah yang merugikan pengguna.

      DATABASE PENGETAHUAN:
      ${LEGAL_KNOWLEDGE_BASE}

      ATURAN MUTLAK:
      1. HANYA gunakan informasi yang tertulis di dalam dokumen.
      2. JANGAN membuat teks filler/halusinasi.
      3. JANGAN PERNAH GUNAKAN FORMAT TABEL (MARKDOWN TABLE) UNTUK RED FLAGS. Itu sulit dibaca.
      4. Gunakan format "CARD LIST" (lihat contoh di bawah).

      FORMAT OUTPUT (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      
      2. 📋 RINGKASAN EKSEKUTIF (Maksimal 3 paragraf pendek)
      
      3. 🚩 RED FLAGS & TEMUAN KRITIS
      (Gunakan format berulang ini untuk setiap temuan):
      
      #### [Judul Pasal / Isu Utama]
      * **Risiko:** [Jelaskan risikonya di sini...]
      * **Dasar Hukum:** [Sebutkan UU/Pasal yang dilanggar]
      * **Saran:** [Saran perbaikan redaksi]
      ---
      
      4. 💰 POTENSI BIAYA TERSEMBUNYI
      
      5. ⚖️ KESIMPULAN AKHIR
      `
    });

    const filePart = await fileToGenerativePart(file);
    
    // Prompt User yang lebih spesifik
    const prompt = `
    Analisa dokumen yang dilampirkan ini. 
    Fokus cari: Ketidakjelasan pembayaran, Sanksi yang tidak adil, dan Cara pembatalan perjanjian yang sulit.
    Pastikan output Tabel Red Flags terisi dengan benar sesuai teks dokumen.
    `;
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("404")) throw new Error("Model AI sedang sibuk. Coba lagi.");
    throw new Error("Gagal menganalisa. Pastikan file PDF bisa dibaca dan tidak dikunci.");
  }
};

