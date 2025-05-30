import { AWANLLM_API_KEY } from "../config.js";

const generatePrompt = (inputText, numberOfQuestions) => {
  return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an AI assistant that generates multiple-choice questions (MCQs) based on provided text. Each question should have four options labeled A to D, with one correct answer. Respond strictly in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "choices": [
        "Index 0 text",
        "Index 1 text",
        "Index 2 text",
        "Index 3 text"
      ],
      "correct_answer": "Correct option index (0/1/2/3)"
    }
    // Additional questions...
  ]
}
<|eot_id|><|start_header_id|>user<|end_header_id|>
Generate ${numberOfQuestions} multiple-choice questions based on the following text:

${inputText}

<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
};

const extractQuestions = (text) => {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  const jsonString = text.substring(jsonStart, jsonEnd);
  const questions = JSON.parse(jsonString).questions;
  console.log(questions);
  return questions;
};

const generateQuestions = async (text, numberOfQuestions) => {
  const res = await fetch("https://api.awanllm.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AWANLLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "Meta-Llama-3.1-8B-Instruct",
      prompt: generatePrompt(text, numberOfQuestions),
      repetition_penalty: 1.1,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      max_tokens: 2048,
      stream: false,
    }),
  });
  const data = await res.json();
  const questions = extractQuestions(data.choices[0].text);
  console.log(questions);
  return questions;
};

export { generateQuestions };
