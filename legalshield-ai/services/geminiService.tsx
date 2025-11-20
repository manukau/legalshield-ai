import { GoogleGenerativeAI } from "@google/generative-ai";

// KODE BARU YANG LEBIH STABIL:
// Kita menggunakan 'import.meta.env.VITE_API_KEY'
// Pastikan di Vercel namanya sudah diganti jadi VITE_API_KEY
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export const analyzeDocument = async (text: string) => {
  try {
    // Menggunakan model flash agar cepat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Bertindaklah sebagai Senior Legal Advisor. 
    Analisis teks berikut ini untuk mencari risiko hukum bagi orang awam.
    
    TEKS DOKUMEN:
    ${text}
    
    TUGAS:
    Berikan output: (1) Skor Keamanan, (2) Pasal Berbahaya (Red Flags), (3) Potensi Biaya Tersembunyi, (4) Kesimpulan.
    Gunakan Bahasa Indonesia.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};
