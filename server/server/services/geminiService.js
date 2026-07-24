const https = require("https");

// Lightweight wrapper — no extra npm package needed, uses Node's built-in https
// so we don't add another dependency just for this.
const callGemini = (prompt) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error("GEMINI_API_KEY is not set in .env"));
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || "Gemini API error"));
          }
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            return reject(new Error("Gemini returned no content"));
          }
          resolve(text);
        } catch (err) {
          reject(new Error("Failed to parse Gemini response: " + err.message));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
};

// Builds the exact instruction sent to Gemini and asks for strict JSON back,
// so we can save it straight into our Test model without extra parsing guesswork.
const generateTestWithAI = async ({ className, subject, chapters, difficulty, mcqCount = 5, shortCount = 3, longCount = 2 }) => {
  const prompt = `You are an expert teacher creating a school test.

Create a test for:
- Class: ${className}
- Subject: ${subject}
- Chapters: ${chapters.join(", ")}
- Difficulty: ${difficulty}

Generate exactly:
- ${mcqCount} multiple choice questions (MCQ) with 4 options each and one correct answer
- ${shortCount} short answer questions (a sentence or two expected)
- ${longCount} long answer questions (a paragraph expected)

Respond with ONLY valid JSON in exactly this shape, no extra commentary:
{
  "title": "string, a short descriptive test title",
  "questions": [
    { "type": "mcq", "questionText": "string", "options": ["string","string","string","string"], "correctAnswer": "string (must match one option exactly)", "maxMarks": 1 },
    { "type": "short", "questionText": "string", "maxMarks": 3 },
    { "type": "long", "questionText": "string", "maxMarks": 5 }
  ]
}`;

  const rawText = await callGemini(prompt);
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("=== GEMINI RETURNED NON-JSON TEXT ===");
    console.error(rawText);
    throw new Error("AI response was not valid JSON. Check server terminal for the raw text.");
  }

  if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    console.error("=== GEMINI JSON HAD NO QUESTIONS ===");
    console.error(JSON.stringify(parsed, null, 2));
    throw new Error("AI response had no questions array. Check server terminal for the raw JSON.");
  }

  return parsed;
};

module.exports = { generateTestWithAI, evaluateAnswer };

// Fetches an image URL (e.g. from Cloudinary) and returns base64 + mime type,
// since Gemini's vision input needs raw bytes, not a URL.
function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to fetch image: ${res.statusCode}`));
      const mimeType = res.headers["content-type"] || "image/jpeg";
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ base64: Buffer.concat(chunks).toString("base64"), mimeType }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Evaluates one short/long answer — either typed text or a photo of handwriting.
// Returns { marksAwarded, remark } where remark explains mistakes / improvements.
async function evaluateAnswer({ questionText, maxMarks, textAnswer, photoUrl }) {
  const instructions = `You are grading a student's answer for a school test.

Question: ${questionText}
Maximum marks: ${maxMarks}

Grade fairly based on correctness and completeness. If the answer is blank, wrong, or missing, award 0 and explain why.

Respond with ONLY valid JSON in exactly this shape, no extra commentary:
{ "marksAwarded": number (0 to ${maxMarks}), "remark": "string, 1-2 sentences explaining the score, mistakes, and how to improve" }`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

  let parts;
  if (photoUrl) {
    const { base64, mimeType } = await fetchImageAsBase64(photoUrl);
    parts = [
      { text: instructions + "\n\nThe student's answer is handwritten in the attached photo. Read the handwriting first, then grade it." },
      { inlineData: { mimeType, data: base64 } },
    ];
  } else {
    parts = [{ text: instructions + `\n\nStudent's answer: ${textAnswer || "(no answer given)"}` }];
  }

  const rawText = await new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1024 },
    });
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || "Gemini API error"));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error("Gemini returned no content"));
          resolve(text);
        } catch (err) {
          reject(new Error("Failed to parse Gemini response: " + err.message));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const result = JSON.parse(cleaned);
  return {
    marksAwarded: Math.max(0, Math.min(maxMarks, Number(result.marksAwarded) || 0)),
    remark: result.remark || "",
  };
}
