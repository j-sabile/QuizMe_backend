import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  choices: { type: [String], required: true },
  correct_answer: { type: Number, required: true },
});

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true },
  username_id: { type: String, required: true },
  bio: { type: String },
  hashed_password: { type: String, required: true },
  friends: {
    received: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    sent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    current: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  privacy: { type: String, required: true },
  can_be_edited_by: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    default: [],
  },
  questions: { type: [questionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const quizRecordSchema = new mongoose.Schema({
  taken_by: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  questions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    required: true,
  },
  correct_answers: [{ type: Number, required: true }],
  user_answers: [{ type: Number }],
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model("Account", accountSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const QuizRecord = mongoose.model("QuizRecord", quizRecordSchema);

export { Account, Quiz, QuizRecord };
