import mongoose from "mongoose";
import dotenv from "dotenv";
import { Account, Quiz, QuizRecord } from "./models/models.js";
import { Configuration, OpenAIApi } from "openai";
import { verifyJWT } from "./controllers/auth_contoller.js";

// loading .env file
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE = process.env.DATABASE;

// connecting to the database
try {
  await mongoose.connect(DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("\nConnected to mongodb database.");
} catch (e) {
  console.log(`\nCannot connect to mongodb database.\nError:${e}`);
}

const addquestion = async (req, res) => {
  const { quizId, questionItem } = req.body;
  console.log(`Adding question(${questionItem.question}) to quiz(${quizId})`);
  if (await addquestionfunc(quizId, questionItem)) {
    console.log(`Succesfully added.`);
    res.send({ code: 201, message: "Succesfully created a question" });
  } else {
    console.log(`Unsuccesfully added.`);
    res.send({ code: 500, message: "Internal Server Error" });
  }
};

const addquestionfunc = async (quizId, questionItem) => {
  const quiz = await Quiz.findById(quizId);
  const newQuestion = {
    question: questionItem.question,
    choices: questionItem.choices,
    correct_answer: questionItem.correct_answer,
  };
  quiz.questions.push(newQuestion);
  await quiz.save();
};

const deletequestion = async (req, res) => {
  const { quizId, questionId } = req.body;
  console.log(`Deleting question(${questionId}) in quiz(${quizId})`);
  await Quiz.findOneAndUpdate({ _id: quizId }, { $pull: { questions: { _id: questionId } } }, { new: true });
  console.log(`Successfully deleted.`);
  res.send({ code: 204, message: "Successfully deleted a question" });
};

const editquestion = async (req, res) => {
  const { quizId, questionItem } = req.body;
  console.log(`Editing question(${questionItem.question}) in quiz(${quizId})`);
  await Quiz.findOneAndUpdate({ _id: quizId, "questions._id": questionItem._id }, { $set: { "questions.$": questionItem } }, { new: true });
  console.log(`Succesfully edited question.`);
  res.send({ code: 200, message: "Successfully edited the question." });
};

const submitQuiz = async (req, res) => {
  const { quizRecordId, userAnswers } = req.body;
  try {
    const quizRecord = await QuizRecord.findById(quizRecordId);
    let score = 0;
    for (let i = 0; i < quizRecord.correct_answers.length; i++) {
      if (quizRecord.correct_answers[i] === userAnswers[i]) score++;
    }
    await QuizRecord.findByIdAndUpdate(quizRecordId, { user_answers: userAnswers, score: score });
    return res.send({ code: 200, message: "Successfully submitted quiz" });
  } catch (err) {
    console.log(err);
    return res.send({ code: 500, message: "Internal Server Error" });
  }
};

const generateQuiz = async (req, res) => {
  const questions = await Question.find({});
  questions.sort(() => Math.random() - 0.5);
  const newQuizRecord = await new QuizRecord({
    questions: questions.map((questions) => questions._id),
    correct_answers: questions.map((question) => question.correct_answer),
  }).save();
  res.send(newQuizRecord._id);
};

const getQuizQuestions = async (req, res) => {
  const quizRecordId = req.body._id;
  const questionIds = (await QuizRecord.findById(quizRecordId)).questions;
  const questions = [];
  for (let i = 0; i < questionIds.length; i++) {
    questions.push(await Question.findById(questionIds[i]));
  }
  res.send(questions);
};

// user-based

const createQuiz = async (req, res) => {
  const { title, description, privacy } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  if (payload) {
    const newQuiz = new Quiz({
      title: title,
      description: description,
      owner_id: payload._id,
      privacy: privacy,
    });
    await newQuiz.save();
    res.send({ code: 201, message: "Successfully created the quiz.", quizId: newQuiz._id });
  } else {
    res.send({ code: 401, message: "Log in to create a quiz." });
  }
};

const getPublicQuizzes = async (req, res) => {
  res.send(
    await Quiz.aggregate([
      { $match: { privacy: "Public" } },
      { $lookup: { from: "accounts", localField: "owner_id", foreignField: "_id", as: "account" } },
      { $project: { createdAt: 1, _id: 1, title: 1, description: 1, owner_username: { $arrayElemAt: ["$account.username", 0] } } },
    ]).sort({ createdAt: -1 })
  );
};

const generateQuizRecord = async (req, res) => {
  const { quizId } = req.body;
  const payload = verifyJWT(req.cookies.jwt);

  if (payload) {
    const quiz = await Quiz.findById(quizId);
    const newQuizRecord = new QuizRecord({
      quiz_id: quizId,
      questions: quiz.questions.map((q) => q._id),
      correct_answers: quiz.questions.map((q) => q.correct_answer),
      taken_by: payload._id,
      score: -1,
      user_answers: [],
    });
    newQuizRecord.save();
    res.send({ code: 201, message: "Successfully created a quiz record", quizRecordId: newQuizRecord._id });
  } else {
    res.send({ code: 401, message: "Login to take a quiz" });
  }
};

const takeQuiz = async (req, res) => {
  const { quizRecordId } = req.body;

  try {
    const quizRecord = await QuizRecord.findById(quizRecordId);
    if (!quizRecord) return res.status(404).send("QuizRecord not found");

    const quizId = quizRecord.quiz_id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).send("Quiz not found");

    const questionData = quizRecord.questions
      .map((questionId) => {
        const question = quiz.questions.find((q) => q._id.equals(questionId));
        return question ? { question: question.question, choices: question.choices } : null;
      })
      .filter(Boolean);

    return res.send({ code: 200, quizRecord: { title: quiz.title, description: quiz.description, questions: questionData } });
  } catch (error) {
    console.log(error);
    return res.send("Error retrieving questions");
  }
};

const getQuizInfo = async (req, res) => {
  try {
    const payload = verifyJWT(req.cookies.jwt);
    const quiz = await Quiz.findById(req.body.quizId).lean();
    if (payload._id === quiz.owner_id.toString()) {
      quiz.admin = true;
      return res.send(quiz);
    } else {
      quiz.admin = false;
      return res.send(quiz);
    }
  } catch (err) {
    return res.send("ERROR");
  }
};

const deleteQuiz = async (req, res) => {
  const { quizId } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  const quiz = await Quiz.findById(quizId);
  if (payload._id === quiz.owner_id.toString()) {
    await Quiz.findByIdAndDelete(quizId);
    res.send({ code: 204, message: "Successfully deleted the quiz" });
  } else {
    res.send({ code: 401, message: "Unauthorized " });
  }
};

const getQuizRecordInfo = async (req, res) => {
  try {
    const { quizRecordId } = req.body;
    const payload = verifyJWT(req.cookies.jwt);
    const quizRecord = await QuizRecord.findById(quizRecordId);
    if (quizRecord.taken_by == payload._id) return res.send(quizRecord);
    else return res.send("You do not have access to this quiz record");
  } catch (err) {
    return res.send("ERROR");
  }
};

// getting quiz feed in homepage
const getQuizFeed = async (req, res) => {
  const payload = verifyJWT(req.cookies.jwt);

  // if logged in
  if (payload) {
    const myAccount = await Account.findById(payload._id);
    const publicQuizzes = await Quiz.find({
      $or: [
        { privacy: "Public", owner_id: { $ne: payload._id } },
        { privacy: "Friends", owner_id: { $in: myAccount.friends.current, $nin: [payload._id] } },
      ],
    })
      .populate({ path: "owner_id", select: "username" })
      .sort({ createdAt: -1 });
    res.send({ code: 200, message: "Success (Logged In)", quizFeed: publicQuizzes });
  } else {
    const publicQuizzes = await Quiz.find({ privacy: "Public" }).select("-can_be_edited_by -questions").populate({ path: "owner_id", select: "username" }).sort({ createdAt: -1 });
    res.send({ code: 200, message: "Success (Not Logged In)", quizFeed: publicQuizzes });
  }
};

// addding a friend
const addAccount = async (req, res) => {
  const { username } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  const targetAccount = await Account.findOne({ username_id: username.toLowerCase() });

  // if logged in and found targetAccount
  if (targetAccount && payload) {
    await Account.findByIdAndUpdate(targetAccount._id, { $push: { "friends.received": payload._id } });
    await Account.findByIdAndUpdate(payload._id, { $push: { "friends.sent": targetAccount._id } });
    res.send({ code: 200, message: "Successfully sent a request" });
  } else res.send({ code: 500, message: "Error" });
};

// accepting friend request
const acceptFriendRequest = async (req, res) => {
  const { username } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  const targetAccount = await Account.findOne({ username_id: username.toLowerCase() });

  // if logged in and found targetAccount
  if (targetAccount && payload) {
    await Account.findByIdAndUpdate(payload._id, { $pull: { "friends.received": targetAccount._id }, $push: { "friends.current": targetAccount._id } });
    await Account.findByIdAndUpdate(targetAccount._id, { $pull: { "friends.sent": payload._id }, $push: { "friends.current": payload._id } });
    res.send({ code: 200, message: "Successfully accepted request" });
  } else res.send({ code: 500, message: "Error" });
};

// visiting a profile
const getProfileInfo = async (req, res) => {
  const { username } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  const myAccount = await Account.findById(payload._id);
  const targetAccount = await Account.findOne({ username_id: username.toLowerCase() });

  // if target acc is found and logged in
  if (targetAccount && payload) {
    // if own account
    if (targetAccount._id.toString() === payload._id) {
      const quizzes_created = await Quiz.find({ owner_id: targetAccount._id }).sort({ createdAt: -1 });
      const quizzes_taken = await QuizRecord.find({ taken_by: targetAccount._id }).populate({ path: "quiz_id", select: "title description" }).sort({ createdAt: -1 });

      res.send({
        code: 200,
        message: "Success (Own Account)",
        profileInfo: {
          userInfo: { id: targetAccount._id, username: targetAccount.username, bio: targetAccount.bio },
          quizzes_created: quizzes_created,
          quizzes_taken: quizzes_taken,
        },
      });
    }
    // if currently friends
    else if (myAccount.friends.current.includes(targetAccount._id.toString())) {
      const quizzes_created = await Quiz.find({ owner_id: targetAccount._id, privacy: { $in: ["Public", "Friends"] } })
        .select("-can_be_edited_by -questions")
        .sort({ createdAt: -1 });
      res.send({
        code: 206,
        message: "Success (Friend's Account)",
        profileInfo: { userInfo: { id: targetAccount._id, username: targetAccount.username, bio: targetAccount.bio }, quizzes_created: quizzes_created, quizzes_taken: [] },
      });
      // not friend
    } else {
      const quizzes_created = await Quiz.find({ owner_id: targetAccount._id, privacy: "Public" }).select("-can_be_edited_by -questions").sort({ createdAt: -1 });

      // if received a friend request
      if (myAccount.friends.received.includes(targetAccount._id.toString())) {
        res.send({
          code: 206,
          message: "Success (Received Friend Request)",
          profileInfo: { userInfo: { username: targetAccount.username, bio: targetAccount.bio }, quizzes_created: quizzes_created, quizzes_taken: [] },
        });

        // if sent a friend request
      } else if (myAccount.friends.sent.includes(targetAccount._id.toString())) {
        res.send({
          code: 206,
          message: "Success (Sent Friend Request)",
          profileInfo: { userInfo: { username: targetAccount.username, bio: targetAccount.bio }, quizzes_created: quizzes_created, quizzes_taken: [] },
        });

        // else
      } else {
        res.send({
          code: 206,
          message: "Success (Not Friend)",
          profileInfo: { userInfo: { username: targetAccount.username, bio: targetAccount.bio }, quizzes_created: quizzes_created, quizzes_taken: [] },
        });
      }
    }

    // if target acc is found but not logged in
  } else if (targetAccount) {
    const quizzes_created = await Quiz.find({ owner_id: targetAccount._id, privacy: "Public" }).select("-can_be_edited_by -questions").sort({ createdAt: -1 });

    res.send({
      code: 206,
      message: "Success (Not Logged In)",
      profileInfo: { userInfo: { username: targetAccount.username, bio: targetAccount.bio }, quizzes_created: quizzes_created, quizzes_taken: [] },
    });

    // if target acc is not found
  } else res.send({ code: 404, message: "Not Found" });
};

const useAiToGenerateQuestions = async (req, res) => {
  const { text, quizId, numberOfQuestions } = req.body;
  console.log(`Generating AI questions \n\ttext: ${text}\n\tquizId: ${quizId}\n\tNum of Q:${numberOfQuestions}`);
  // res.send({ code: 200, text: text, numberOfQuestions: numberOfQuestions });
  try {
    const rawAiText = (await autoGenerateQuestions(text, numberOfQuestions))[0].message.content;
    if (rawAiText === "Error") {
      res.send({ code: 500, message: "Internal Server Error" });
    } else {
      const questionsArray = rawAiText.split(/\d+\.\s+/).slice(1);
      for (let i = 0; i < questionsArray.length; i++) {
        const choices = questionsArray[i].trim().split(/\n/).slice(1); // remove the question and split the choices
        let correct_answer = -1;
        for (let j = 0; j < choices.length; j++) {
          if (choices[j].includes("||")) {
            correct_answer = j;
            choices[j] = choices[j].replace(/\s?\|\|(\s|$)/g, "");
          }
          choices[j] = choices[j].replace(/(A|B|C|D)\.(\s)?/g, "");
        }
        await addquestionfunc(quizId, {
          question: questionsArray[i].split(/\n/)[0].trim(),
          choices: choices,
          correct_answer: correct_answer,
        });
      }
      res.send({ code: 200, message: "Successful" });
    }
  } catch (err) {
    console.log(err);
    res.send({ code: 500, message: "Internal Server Error" });
  }
};

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const autoGenerateQuestions = async (text, numberOfQuestions) => {
  // const prompt = `Strictly follow these instructions.\nExamine the text below in detail then create 2 tricky questions that have 4 tricky choices each which only one is correct. Use letters to enumerate choices and ensure that the end of the correct choice is marked ||. Format: <QuestionNumber>.<Question>\n<Choices>\n\nText: ${text}`;
  const prompt = `Examine the text below in detail, then create ${numberOfQuestions} tricky questions that have 4 tricky choices each of which only one is correct. Use letters to enumerate choices and ensure that the end of the correct choice is marked ||. Format: <QuestionNumber>.<Question>\n<Choices>\n\nText: ${text}`;
  try {
    const rawAiText = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 3000,
    });
    console.log(rawAiText.data.usage);
    console.log(rawAiText.data.choices[0]);
    return rawAiText.data.choices;
  } catch {
    return "Error";
  }
};

const editQuiz = async (req, res) => {
  const { quizId, privacy } = req.body;
  const payload = verifyJWT(req.cookies.jwt);
  const quiz = await Quiz.findById(quizId);
  if (quiz.owner_id.toString() === payload._id) {
    await Quiz.findByIdAndUpdate(quizId, { privacy: privacy }, { new: true });
    res.send({ code: 200, message: "Successfully edited the quiz" });
  } else {
    res.send({ code: 500, message: "Internal Server Error" });
  }
};

const search = async (req, res) => {
  const { searchRequest } = req.body;
  try {
    const regex = new RegExp(searchRequest, "i");
    const searchResults = await Account.find({ username: regex });
    res.status(200).json({ success: true, req: searchResults });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

export {
  addquestion,
  deletequestion,
  editquestion,
  generateQuiz,
  getQuizQuestions,
  createQuiz,
  getPublicQuizzes,
  getQuizInfo,
  generateQuizRecord,
  takeQuiz,
  submitQuiz,
  getQuizRecordInfo,
  getProfileInfo,
  useAiToGenerateQuestions,
  editQuiz,
  deleteQuiz,
  addAccount,
  acceptFriendRequest,
  getQuizFeed,
  search,
};
