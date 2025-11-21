import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Validasi API Key agar user tahu jika lupa memasukkan di Vercel
const apiKey = process.env.API_KEY;

// Gunakan dummy key jika kosong agar aplikasi tidak crash saat load awal, 
// tapi nanti akan dicek ulang saat fungsi dipanggil.
const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

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
  if (!apiKey || apiKey === "DUMMY_KEY") {
    throw new Error("API Key tidak ditemukan. Pastikan Anda sudah memasukkan 'API_KEY' di Settings > Environment Variables pada Vercel.");
  }

  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Pastikan menggunakan model 2.5 Flash terbaru
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type, // Should be 'application/pdf'
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
    
    // Penanganan error spesifik agar user paham
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("Model AI tidak ditemukan. Pastikan kode sudah menggunakan 'gemini-2.5-flash'.");
    }
    
    throw new Error(error.message || "Gagal melakukan analisa. Pastikan API Key valid dan file adalah PDF.");
  }
};
