import { Question, Quiz } from "../models/models.js";

const addQuestion = async (req, res) => {
  const { question, choices, correctAnswer, explanation } = req.body;
  const { id } = req.params;
  try {
    const newQuestion = await new Question({ question, choices, correctAnswer, explanation }).save();
    await Quiz.findByIdAndUpdate(id, { $push: { questions: newQuestion._id } });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export { addQuestion };
