import { GROQ_API_KEY } from "../config.js";

const generateQuestions = async (notes, numberOfQuestions) => {
  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates quiz questions from educational notes.",
      },
      {
        role: "user",
        content: `You are a helpful AI assistant. Given the following student notes, generate ${numberOfQuestions} multiple-choice questions in JSON format.

Each item should include:
- "question": the question string
- "choices": an array of 4 answer choices
- "correct_answer": the index (0-3) of the correct answer

Only return a JSON array. No explanation or text before or after.

Student Notes:
${notes}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
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
    // console.log("Parsed Questions:\n", questions);

    return questions;
  } catch (err) {
    console.error("Failed to fetch or parse response:", err.message);
  }
};

export { generateQuestions };
