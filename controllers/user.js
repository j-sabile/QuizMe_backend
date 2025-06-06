import { Account, Quiz, QuizRecord } from "../models/models.js";

// add limit
const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const isOwner = id === req.userId;
    let query = Account.findById(id).select("-hashedPassword");

    query = query.populate({
      path: "quizzesCreated",
      select: "title type createdAt questions",
      options: { limit: 20, sort: { createdAt: -1 } },
    });
    if (isOwner) {
      query = query.populate({
        path: "quizzesTaken",
        select: "questions score durationSeconds dateTaken",
        options: { limit: 20 },
        populate: {
          path: "quizId",
          select: "title type",
        },
      });
    }
    const user = await query.exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    const [quizzesCreatedCount, quizzesTakenCount] = await Promise.all([
      Quiz.countDocuments({ userId: id }),
      isOwner ? QuizRecord.countDocuments({ takenBy: id }) : Promise.resolve(0),
    ]);
    const userObj = user.toObject();
    userObj.isOwner = isOwner;
    userObj.quizzesCreatedCount = quizzesCreatedCount;
    userObj.quizzesTakenCount = quizzesTakenCount;
    userObj.aveScorePercent = Math.floor(
      (userObj.quizzesTaken.reduce((acc, quiz) => acc + quiz.score, 0) / userObj.quizzesTaken.reduce((acc, quiz) => acc + quiz.questions.length, 0)) * 100
    );
    if (!isOwner) delete userObj.quizzesTaken;

    res.status(200).json({ user: userObj });
  } catch (error) {
    console.log(error);

    console.error(error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export { getUser };
