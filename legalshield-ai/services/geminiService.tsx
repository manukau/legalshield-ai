import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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

// DATABASE HUKUM VERIFAI
const LEGAL_KNOWLEDGE_BASE = `
REFERENSI HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah Perjanjian).
2. KUHPerdata Pasal 1338 (Asas Kebebasan Berkontrak) & Pasal 1266.
3. UU Cipta Kerja (Terkait PKWT/Ketenagakerjaan).
4. UU ITE (Informasi & Transaksi Elektronik).
5. Asas Proporsionalitas & Itikad Baik dalam bisnis.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    // --- UPGRADE KE MESIN TERCANGGIH: GEMINI 3.0 PRO ---
    // Menggunakan versi preview terbaru untuk kecerdasan maksimal
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-pro-preview", 
      
      // --- MATIKAN SENSOR (SUPAYA TIDAK BISU SAAT BACA PASAL SANKSI) ---
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      
      generationConfig: {
        temperature: 0.1, // Kreativitas rendah agar analisisnya faktual
        maxOutputTokens: 8192,
      },
      
      systemInstruction: `
      PERAN:
      Anda adalah "VerifAI Neural Engine", konsultan hukum AI tercanggih dengan spesialisasi Hukum Bisnis Indonesia.
      
      MISI:
      Lakukan audit forensik pada dokumen ini. Lindungi pengguna dari risiko hukum & finansial.

      DATABASE: ${LEGAL_KNOWLEDGE_BASE}

      ATURAN AUDIT:
      1. KUTIP PASAL DOKUMEN: Setiap temuan harus merujuk ke teks asli (misal: "Pada Pasal 5 ayat 2...").
      2. ANALISIS TAJAM: Gunakan logika hukum senior. Jangan hanya meringkas.
      3. FORMAT RAPI: Gunakan "Card List" (bukan tabel).
      4. IDENTITAS: Tetap sebagai Sistem AI.

      FORMAT OUTPUT (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      
      2. 📋 RINGKASAN EKSEKUTIF (Executive Summary)
      
      3. 🚩 RED FLAGS & TEMUAN KRITIS
      (Format Berulang):
      #### [Judul Isu/Pasal]
      * **Risiko:** [Analisis Risiko...]
      * **Dasar Hukum:** [Pelanggaran UU/Asas...]
      * **Solusi VerifAI:** [Saran Perbaikan...]
      ---
      
      4. 💰 POTENSI BIAYA TERSEMBUNYI
      
      5. ⚖️ KESIMPULAN & REKOMENDASI
      `
    });

    const filePart = await fileToGenerativePart(file);
    const prompt = "Lakukan Deep Legal Audit sekarang. Berikan analisis yang tajam dan kritikal.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    
    if (!response || !response.text()) {
      throw new Error("Analisis terhenti oleh sistem keamanan. Coba dokumen lain.");
    }

    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Fallback jika Gemini 3.0 belum aktif di akunmu, otomatis turun ke 2.5 Pro (Stable)
    if (error.message?.includes("404") || error.message?.includes("not found")) {
        throw new Error("Mesin Gemini 3.0 sedang sibuk/belum tersedia di region ini. Coba ganti kode ke 'gemini-2.5-pro' di file geminiService.");
    }
    throw new Error(error.message || "Gagal menganalisa dokumen.");
  }
};
