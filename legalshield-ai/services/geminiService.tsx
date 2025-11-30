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

// CONTEKAN HUKUM INDONESIA (VERSI C)
const LEGAL_KNOWLEDGE_BASE = `
DASAR HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah Perjanjian): Sepakat, Cakap, Hal Tertentu, Sebab Halal.
2. KUHPerdata Pasal 1338 (Asas Kebebasan Berkontrak): Perjanjian berlaku sebagai undang-undang bagi pembuatnya.
3. KUHPerdata Pasal 1266 (Pembatalan Lewat Pengadilan): Sering dikesampingkan, perlu diperhatikan.
4. UU Cipta Kerja (Ketenagakerjaan) & UU ITE (Transaksi Elektronik).
5. Asas Proporsionalitas: Hak dan kewajiban para pihak harus seimbang.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.0, // KREATIVITAS MATI (Hanya Fakta)
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
      systemInstruction: `
      PERAN:
      Anda adalah "VerifAI Neural Engine", auditor hukum spesialis Yurisdiksi Indonesia.
      
      MISI:
      Audit dokumen ini secara ketat. Temukan celah risiko hukum & finansial.

      DATABASE PENGETAHUAN:
      ${LEGAL_KNOWLEDGE_BASE}

      ATURAN MUTLAK:
      1. HANYA gunakan informasi yang ada di dokumen. JANGAN berhalusinasi.
      2. JANGAN PERNAH GUNAKAN FORMAT TABEL.
      3. Gunakan format "CARD LIST" (Daftar ke bawah) untuk Red Flags agar mudah dibaca.
      4. TETAP mengaku sebagai Sistem AI, bukan Pengacara.

      FORMAT OUTPUT (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      
      2. 📋 RINGKASAN EKSEKUTIF (Singkat & Padat)
      
      3. 🚩 RED FLAGS & TEMUAN KRITIS
      (Ulangi format ini untuk setiap temuan):
      #### [Judul Pasal / Isu]
      * **Risiko:** [Penjelasan risiko...]
      * **Dasar Hukum:** [Pasal/UU yang relevan]
      * **Saran:** [Rekomendasi perbaikan]
      ---
      
      4. 💰 POTENSI BIAYA TERSEMBUNYI
      
      5. ⚖️ KESIMPULAN AKHIR
      `
    });

    const filePart = await fileToGenerativePart(file);
    
    const prompt = "Lakukan audit deep-scan pada dokumen ini. Identifikasi risiko hukum & finansial secara mendetail.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("404")) throw new Error("Model AI sedang sibuk. Coba lagi.");
    throw new Error("Gagal menganalisa. Pastikan file PDF tidak rusak/terkunci.");
  }
};
