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

const accountSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    bio: { type: String, default: "" },
    hashedPassword: { type: String, required: false },
    googleEmail: { type: String, required: false },
    isOauth: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now() },
  },
  {
    toJSON: { virtuals: true, transform: removeSensitiveFields },
    toObject: { virtuals: true, transform: removeSensitiveFields },
  }
);

function removeSensitiveFields(_, ret) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
}

accountSchema.virtual("quizzesTaken", {
  ref: "QuizRecord",
  localField: "_id",
  foreignField: "takenBy",
});

accountSchema.virtual("quizzesCreated", {
  ref: "Quiz",
  localField: "_id",
  foreignField: "userId",
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: false },
    image: { type: String, required: true },
    type: { type: [String], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    isPrivate: { type: Boolean, default: true },
    // can_be_edited_by: {
    //   type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    //   default: [],
    // },
    questions: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], default: [] },
    createdAt: { type: Number, default: Date.now() },
  },
  {
    toJSON: { virtuals: true, transform: removeSensitiveFields },
    toObject: { virtuals: true, transform: removeSensitiveFields },
  }
);

const quizRecordSchema = new mongoose.Schema(
  {
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    questions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      default: [],
    },
    dateTaken: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    userAnswers: { type: [{ type: Number }], required: true },
    score: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true, transform: removeSensitiveFields },
    toObject: { virtuals: true, transform: removeSensitiveFields },
  }
);

const Account = mongoose.model("Account", accountSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const QuizRecord = mongoose.model("QuizRecord", quizRecordSchema);
const Question = mongoose.model("Question", questionSchema);

export { Account, Quiz, QuizRecord, Question };
