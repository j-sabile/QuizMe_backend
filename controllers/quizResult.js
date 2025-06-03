import { QuizRecord } from "../models/models.js";

const getQuizRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const quizResult = await QuizRecord.findById(id).populate("questions");
    res.status(200).json({ quizResult });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export { getQuizRecord };
