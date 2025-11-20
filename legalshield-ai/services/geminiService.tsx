import { GoogleGenerativeAI } from "@google/generative-ai";

// Perbaikan: Menggunakan import.meta.env.VITE_API_KEY
// Pastikan environment variable di Vercel bernama: VITE_API_KEY
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export const analyzeDocument = async (text: string) => {
  try {
    // Menggunakan model flash agar cepat dan hemat kuota
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Bertindaklah sebagai Senior Legal Advisor.
    Analisis teks kontrak/dokumen berikut ini untuk mencari risiko hukum bagi orang awam.
    
    DOKUMEN:
    ${text}
    
    TUGAS ANDA:
    Berikan output analisis dalam Bahasa Indonesia yang tegas dan jelas:
    1. 🛡️ SKOR KEAMANAN (1-10)
    2. 🚩 RED FLAGS (Daftar pasal berbahaya & alasannya)
    3. 💰 POTENSI BIAYA TERSEMBUNYI
    4. ⚖️ KESIMPULAN AKHIR (Aman ditandatangani atau tidak?)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};
