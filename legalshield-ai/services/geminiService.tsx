import { GoogleGenAI } from "@google/genai";

// Validasi API Key agar user tahu jika lupa memasukkan di Vercel
const apiKey = process.env.API_KEY;

// Inisialisasi AI. Jika apiKey kosong saat build/dev (sebelum di-set di Vercel), 
// gunakan dummy string agar tidak crash saat inisialisasi awal.
// Pengecekan asli dilakukan saat fungsi analyzeContract dipanggil.
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY_FOR_BUILD" });

const SYSTEM_INSTRUCTION = `
Anda adalah pengacara senior. Tugas Anda adalah mencari pasal berbahaya dalam kontrak sewa/kerjasama. 
Berikan output berupa: 
(1) Skor Keamanan 1-10, 
(2) Daftar Pasal 'Red Flag' (Berbahaya) dan alasannya, 
(3) Potensi Biaya Tersembunyi. 

Gunakan bahasa Indonesia yang mudah dimengerti orang awam. 
Format jawaban dalam Markdown yang rapi dengan heading, bullet points, dan bold text untuk penekanan.
`;

/**
 * Converts a File object to a Base64 string required by the Gemini API.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeContract = async (file: File): Promise<string> => {
  // Cek validitas API Key sebelum request ke Google
  if (!apiKey || apiKey === "DUMMY_KEY_FOR_BUILD" || apiKey.length < 10) {
    throw new Error("API Key tidak ditemukan atau tidak valid. Pastikan Anda sudah memasukkan 'API_KEY' di Settings > Environment Variables pada Vercel.");
  }

  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Tolong analisa dokumen ini sesuai instruksi sistem."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, 
      }
    });

    return response.text || "Maaf, tidak ada hasil analisa yang dihasilkan.";

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("Model AI tidak ditemukan. Mohon tunggu sebentar dan coba lagi, atau pastikan konfigurasi model sudah benar.");
    }
    
    throw new Error(error.message || "Gagal melakukan analisa. Pastikan file PDF tidak terkunci password.");
  }
};
