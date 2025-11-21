import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

// Fungsi pembantu: Ubah File PDF jadi format yang dimengerti AI
async function fileToGenerativePart(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: { data: base64String, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Kita ubah inputnya dari 'string' menjadi 'File'
export const analyzeContract = async (file: File) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Bertindaklah sebagai Senior Legal Advisor.
    Analisis dokumen yang saya lampirkan ini.
    
    TUGAS:
    Berikan output analisis risiko hukum dalam Bahasa Indonesia:
    1. 🛡️ SKOR KEAMANAN (1-10)
    2. 🚩 RED FLAGS (Pasal Berbahaya & Alasannya)
    3. 💰 POTENSI BIAYA TERSEMBUNYI
    4. ⚖️ KESIMPULAN
    `;

    // Proses file dulu
    const filePart = await fileToGenerativePart(file);

    // Kirim prompt + file ke AI
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};
