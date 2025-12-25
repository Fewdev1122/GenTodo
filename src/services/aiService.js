// ใส่ API Key ล่าสุดของคุณที่นี่
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export const generateProjectPlan = async (userPrompt) => {
  try {
    // ---------------------------------------------------------
    // 1. Auto-detect Model (ใช้ Logic เดิมของคุณ)
    // ---------------------------------------------------------
    let targetModel = "models/gemini-1.5-flash"; // Default

    try {
      const modelsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
      );
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const validModel = modelsData.models?.find(
          m => m.name.includes('gemini') && 
               !m.name.includes('vision') && 
               m.supportedGenerationMethods.includes('generateContent')
        );
        if (validModel) targetModel = validModel.name;
      }
    } catch (e) {
      console.warn("Auto-detect failed, using fallback.");
    }

    console.log("🤖 Using Model:", targetModel);

    // ---------------------------------------------------------
    // 2. สร้าง Prompt แบบ "One-Shot" (ให้ตัวอย่างชัดเจน)
    // ---------------------------------------------------------
    const systemPrompt = `
      You are AETHRA, an expert Technical Project Manager.
      
      GOAL: Break down the user's idea into a detailed technical plan with granular tasks.
      
      CRITICAL RULES:
      1. Language: MUST be THAI (ภาษาไทย) only.
      2. Format: Return ONLY raw JSON. No Markdown.
      3. Depth: Each 'feature' MUST have at least 3-5 specific 'tasks'.
      4. Do NOT return empty task lists.
      
      REQUIRED JSON STRUCTURE (Follow this exactly):
      {
        "title": "Project Name",
        "description": "Short summary",
        "complexity": "Simple | Moderate | Complex",
        "features": [
          {
            "name": "Feature Name (e.g. ระบบสมาชิก)",
            "tasks": [
              { "title": "Actionable task 1", "priority": "high", "estimate": "2d" },
              { "title": "Actionable task 2", "priority": "medium", "estimate": "4h" },
              { "title": "Actionable task 3", "priority": "low", "estimate": "1d" }
            ]
          }
        ]
      }
    `;

    // ---------------------------------------------------------
    // 3. ยิง API
    // ---------------------------------------------------------
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: systemPrompt + "\n\nUser Request: " + userPrompt }] 
          }]
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API Error");
    }

    // ---------------------------------------------------------
    // 4. Clean & Parse Logic
    // ---------------------------------------------------------
    let contentText = data.candidates[0].content.parts[0].text;
    
    // ลบ Markdown (```json ... ```)
    contentText = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // ตัดเอาเฉพาะ JSON {...}
    const jsonStartIndex = contentText.indexOf('{');
    const jsonEndIndex = contentText.lastIndexOf('}') + 1;
    if (jsonStartIndex !== -1) {
      contentText = contentText.substring(jsonStartIndex, jsonEndIndex);
    }
    
    const result = JSON.parse(contentText);

    // 🛠️ FIX: กันเหนียว ถ้า AI ไม่ส่ง tasks มา ให้เติม array ว่าง หรือสร้าง dummy task
    if (result.features) {
      result.features.forEach(feature => {
        if (!feature.tasks) {
          feature.tasks = [{ title: "ออกแบบโครงสร้างระบบ", priority: "high", estimate: "1d" }];
        }
      });
    }

    // 🛠️ FIX 2: ถ้า AI ส่งกลับมาผิด format (ไม่มี features เลย) ให้แปลง tasks ธรรมดาเป็น features
    if (!result.features && result.tasks) {
       result.features = [{ name: "General Tasks", tasks: result.tasks }];
    }

    console.log("✅ Parsed Plan:", result); // ดู Log ตรงนี้ได้เลยว่ามาครบไหม
    return result;

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};