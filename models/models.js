import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    choices: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: false },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

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

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: false },
    image: { type: String, required: true },
    type: { type: [String], default: [] },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    privacy: { type: String, required: true },
    can_be_edited_by: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
      default: [],
    },
    questions: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

const quizRecordSchema = new mongoose.Schema({
  takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  questions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    required: true,
  },
  userAnswers: [{ type: Number }],
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model("Account", accountSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const QuizRecord = mongoose.model("QuizRecord", quizRecordSchema);
const Question = mongoose.model("Question", questionSchema);

export { Account, Quiz, QuizRecord, Question };
