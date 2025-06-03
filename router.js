import {
  deletequestion,
  editquestion,
  generateQuiz,
  getQuizQuestions,
  createQuiz,
  getPublicQuizzes,
  getQuizInfo,
  generateQuizRecord,
  takeQuiz,
  getQuizRecordInfo,
  getProfileInfo,
  useAiToGenerateQuestions,
  editQuiz,
  deleteQuiz,
  addAccount,
  acceptFriendRequest,
  getQuizFeed,
  search,
} from "./controller.js";

import { createAcc, logIn, logOut, isLoggedIn, getUsername } from "./controllers/auth_contoller.js";
import { addQuestion } from "./controllers/question.js";
import { editQuizInfo, getQuizzes, submitQuiz } from "./controllers/quiz.js";
import { getQuizRecord } from "./controllers/quizResult.js";
import isAuthenticated from "./middlewares/isAuthenticated.js";

// TODO: fix route names
const router = (app) => {
  // user
  app.post("/isloggedin", isLoggedIn);
  app.post("/createacc", createAcc);
  app.post("/login", logIn);
  app.post("/logout", logOut);
  app.post("/getusername", getUsername);
  app.post("/getprofileinfo", getProfileInfo);
  app.post("/addfriend", addAccount);
  app.post("/acceptfriendrequest", acceptFriendRequest);
  app.post("/search", search);

  // question
  // app.post("/addquestion", addquestion);
  app.post("/quizzes/:id/questions", isAuthenticated, addQuestion)
  app.post("/editquestion", editquestion);
  app.post("/deletequestion", deletequestion);

  // quiz
  app.post("/generatequiz", generateQuiz);
  app.get("/quiz", isAuthenticated, getQuizInfo);
  app.patch("/quiz", isAuthenticated, editQuizInfo)
  app.get("/quizzes", getQuizzes);
  app.post("/getquizquestions", getQuizQuestions);
  app.post("/quiz", createQuiz);
  app.post("/getpublicquizzes", getPublicQuizzes);
  app.post("/getquizfeed", getQuizFeed);
  app.post("/editquiz", editQuiz);
  app.post("/deletequiz", deleteQuiz);

  // takequiz
  app.post("/quizzes/:id/submissions", isAuthenticated, submitQuiz )
  app.get("/result/:id", isAuthenticated, getQuizRecord)



  app.post("/generatequizrecord", generateQuizRecord);
  app.post("/takequiz", takeQuiz);
  // app.post("/submitquiz", submitQuiz);
  app.post("/getquizrecordinfo", getQuizRecordInfo);

  // ai
  app.post("/generateaiquestions", useAiToGenerateQuestions);
};

export default router;
