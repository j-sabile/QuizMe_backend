import { Question, Quiz, QuizRecord } from "../models/models.js";

const getQuizzes = async (req, res) => {
  const { type, sort, items = 10 } = req.query;
  try {
    const filter = type ? { type } : {};
    const sortOption = { createdAt: sort === "oldest" ? 1 : -1 };
    const limit = parseInt(items) || 10;
    const quizzes = await Quiz.find(filter).sort(sortOption).limit(limit);
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

const editQuizInfo = async (req, res) => {
  try {
    const { title, shortDescription } = req.body;
    let patch = {};
    if (title) patch.title = title;
    if (shortDescription) patch.shortDescription = shortDescription;
    await Quiz.findByIdAndUpdate(req.query.id, patch);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { userAnswers, questionIds, dateTaken, durationSeconds } = req.body;
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const questions = await Question.find({ _id: { $in: questionIds } }, "correctAnswer").lean();
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q.correctAnswer]));
    const score = questionIds.reduce((score, qId, ind) => (questionMap.get(qId) === userAnswers[ind] ? score + 1 : score), 0);
    const newQuizRecord = await new QuizRecord({
      takenBy: req.userId,
      quizId: id,
      questions: questionIds,
      userAnswers,
      dateTaken,
      durationSeconds,
      score,
    }).save();
    return res.status(200).json({ message: "Success", resultId: newQuizRecord._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export { getQuizzes, editQuizInfo, submitQuiz };
