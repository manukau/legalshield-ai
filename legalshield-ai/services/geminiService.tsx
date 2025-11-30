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
DASAR HUKUM INDONESIA:
1. KUHPerdata Pasal 1320 (Syarat Sah): Sepakat, Cakap, Hal Tertentu, Sebab Halal.
2. KUHPerdata Pasal 1338 (Kebebasan Berkontrak) & 1266 (Pembatalan Lewat Pengadilan).
3. UU Cipta Kerja & UU ITE.
4. Asas Proporsionalitas & Itikad Baik.
`;

export const analyzeContract = async (file: File) => {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("API Key Error. Cek Vercel Environment Variables.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      // --- PENGATURAN PENTING: MATIKAN SENSOR SENSITIF ---
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.1, // Sedikit naikan supaya lebih lancar
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
      systemInstruction: `
      PERAN: Auditor Hukum AI "VerifAI".
      DATABASE: ${LEGAL_KNOWLEDGE_BASE}
      
      ATURAN:
      1. Audit dokumen ini.
      2. Gunakan format "CARD LIST" (Daftar ke bawah) untuk Red Flags.
      3. Bahasa tegas, profesional, Indonesia.
      
      FORMAT OUTPUT:
      1. 🛡️ STATUS RISIKO: [AMAN/WASPADA/BAHAYA]
      2. 📋 RINGKASAN EKSEKUTIF
      3. 🚩 RED FLAGS (Format: #### [Judul] ... )
      4. 💰 POTENSI BIAYA TERSEMBUNYI
      5. ⚖️ KESIMPULAN AKHIR
      `
    });

    const filePart = await fileToGenerativePart(file);
    const prompt = "Lakukan audit deep-scan pada dokumen ini. Cari risiko hukum.";
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    
    // Cek apakah ada respon
    if (!response || !response.text()) {
      throw new Error("AI tidak memberikan respon. Coba dokumen lain.");
    }

    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Pesan error yang lebih jelas buat user
    if (error.message?.includes("SAFETY")) {
      throw new Error("Dokumen ditolak oleh filter keamanan Google. Coba dokumen lain.");
    }
    if (error.message?.includes("404")) {
      throw new Error("Model AI sedang sibuk/down. Tunggu 1 menit lalu coba lagi.");
    }
    throw new Error("Gagal menganalisa. Pastikan file PDF bisa dibaca.");
  }
};
