import { GROQ_API_KEY } from "../config.js";

const generateQuestions = async (notes, numberOfQuestions) => {
  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are an expert quiz generator AI. Analyze the provided educational notes and create multiple-choice questions that test core concepts. Follow these rules:
1. **Adaptive Question Count**: Decide the number of questions based on:
   - Note length (1 question per 150 words minimum).
   - Depth of key concepts (prioritize important topics).
2. **JSON Format**: Return ONLY a valid JSON array with:
   - "question": Clear, concise phrasing.
   - "choices": 4 options (1 correct, 3 plausible distractors).
   - "correctAnswer": Index (0–3) of the right choice.
   - "explanation": 1-sentence justification.
3. **Quality**:
   - Avoid trivial/obvious questions.
   - Ensure answers are unambiguous.
   - Order choices logically (e.g., alphabetical/numerical).
4. JSON Structure:
    {
     "questions": [
       {
         "question": "Clear question text?",
         "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
         "correctAnswer": 0,
         "explanation": "Brief justification"
       }
     ]
   }`,
      },
      {
        role: "user",
        content: `Generate a quiz based on these notes. Decide the number of questions automatically by analyzing content depth and length. Return ONLY valid JSON:

**Notes:**
${notes}

**Reminder:**
- Double-check for JSON validity.
- No extra text outside the JSON array.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 8192,
    response_format: { type: "json_object" },
  };
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const questions = JSON.parse(content);
    // console.log("Parsed Questions:\n", questions.questions);

    return questions.questions;
  } catch (err) {
    console.error("Failed to fetch or parse response:", err.message);
  }
};

export { generateQuestions };
