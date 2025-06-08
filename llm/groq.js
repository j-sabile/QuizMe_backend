import { GROQ_API_KEY } from "../config.js";

const generateQuestions = async (notes, numberOfQuestions) => {
  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a quiz generator AI. Create multiple-choice questions with **brief, natural-sounding explanations** that:
1. **First state why the correct answer is right**  
2. **Subtly hint why key distractors are wrong** (without saying "Option X")  
3. **Keep explanations to 1-2 sentences max**  

**Output Format (ONLY return valid JSON):**  
{
  "questions": [
    {
      "question": "Clear question text?",
      "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
      "correctAnswer": 0,
      "explanation": "Brief justification mentioning correct + incorrect reasoning naturally."
    }
  ]
}

**Rules:**  
- **For correct answers:** Focus on the key reason.  
- **For incorrect answers:** Lightly contrast with the right answer (e.g., "while [distractor] was known for...").  
- **No labels** like "Option A" or "Choice B is wrong."  
- **Prioritize clarity** over completeness.`,
      },
      {
        role: "user",
        content: `Generate quiz questions based on these notes. Keep explanations **short and subtle** about incorrect choices:

**Notes:**  
${notes}

**Reminder:**  
- Only return valid JSON.**.`,
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
