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

const LEGAL_KNOWLEDGE_BASE = `
REFERENSI HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah) & 1338 (Kebebasan Berkontrak).
2. UU Cipta Kerja (Ketenagakerjaan).
3. UU ITE (Transaksi Elektronik).
4. Asas Proporsionalitas: Hak dan kewajiban harus seimbang.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    // --- KEMBALI KE GEMINI 2.5 FLASH ---
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Sesuai permintaanmu
      
      // --- WAJIB: MATIKAN SENSOR AGAR TIDAK 'SILENT FAIL' ---
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      
      generationConfig: {
        temperature: 0.0, // Fokus fakta
        maxOutputTokens: 8192,
      },
      
      systemInstruction: `
      PERAN:
      Anda adalah "VerifAI Neural Engine", auditor hukum spesialis Yurisdiksi Indonesia.
      
      MISI:
      Audit dokumen ini. Temukan celah risiko hukum & finansial bagi pengguna.

      DATABASE: ${LEGAL_KNOWLEDGE_BASE}

      ATURAN:
      1. KUTIP PASAL ASLI DARI DOKUMEN saat menjelaskan risiko.
      2. Gunakan Logika Hukum Indonesia.
      3. Format "CARD LIST" (Daftar ke bawah) untuk Red Flags.
      4. Bahasa tegas, profesional, dan to-the-point.

      FORMAT OUTPUT (MARKDOWN):
      1. 🛡️ STATUS RISIKO: [AMAN / WASPADA / BAHAYA]
      
      2. 📋 RINGKASAN EKSEKUTIF
      
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
    const prompt = "Lakukan Deep Legal Audit sekarang. Cari risiko yang merugikan pihak pengguna.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    
    if (!response || !response.text()) {
      throw new Error("Tidak ada respon dari AI. Kemungkinan dokumen terlalu kompleks atau sensor aktif.");
    }

    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Fallback error message
    if (error.message?.includes("404")) {
        throw new Error("Model gemini-2.5-flash sedang tidak merespon. Coba ganti ke gemini-1.5-flash.");
    }
    throw new Error(error.message || "Gagal menganalisa dokumen.");
  }
};
