import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const apiKey = import.meta.env.VITE_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

// PENTING: Nama fungsi ini HARUS 'analyzeContract' agar cocok dengan App.tsx
export const analyzeContract = async (text: string) => {
  try {
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
    throw error; // Lempar error agar UI tahu ada masalah
  }
};
