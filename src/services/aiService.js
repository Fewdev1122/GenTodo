// ใส่ API Key ล่าสุดของคุณที่นี่
const API_KEY = "AIzaSyDtf6TL1f4hdsfzESE4NH2pj9INPqEE2oI"; 

export const generateProjectPlan = async (userPrompt) => {
  try {
    // 1. ขั้นตอนพิเศษ: ถาม Google ว่า "บัญชีนี้ใช้ Model อะไรได้บ้าง?"
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const modelsData = await modelsResponse.json();
    
    // หา Model ที่ชื่อมีคำว่า 'gemini' และรองรับการ generateContent
    const validModel = modelsData.models?.find(
      m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')
    );

    // ถ้าหาไม่เจอ ให้ลองบังคับใช้ตัวมาตรฐาน (กันเหนียว)
    // หมายเหตุ: validModel.name จะมาในรูป "models/gemini-1.5-flash" เราใช้ได้เลย
    const targetModel = validModel ? validModel.name : "models/gemini-1.5-flash";
    
    console.log("🤖 Auto-detected Model:", targetModel); // เช็คใน Console ได้ว่ามันเลือกตัวไหน

    // 2. เริ่มสร้าง Project Plan
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${API_KEY}`;

    const systemPrompt = `
      You are AETHRA, an elite AI Project Manager.
      Break down the user's idea into a technical plan.
      RETURN ONLY JSON. NO MARKDOWN.
      
      Structure:
      {
        "title": "string",
        "description": "string",
        "complexity": "simple" | "moderate" | "complex",
        "tasks": [
          { "id": 1, "title": "string", "estimate": "string", "priority": "high" | "medium" | "low" }
        ]
      }
    `;

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\nUser Input: " + userPrompt }] }]
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("API Error:", data);
      throw new Error(data.error?.message || "Gemini API Error");
    }

    let contentText = data.candidates[0].content.parts[0].text;
    
    // Clean up JSON
    const jsonStartIndex = contentText.indexOf('{');
    const jsonEndIndex = contentText.lastIndexOf('}') + 1;
    if (jsonStartIndex !== -1) {
      contentText = contentText.substring(jsonStartIndex, jsonEndIndex);
    }
    
    return JSON.parse(contentText);

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};