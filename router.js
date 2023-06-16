import {
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
} from "./controller.js";

import { createAcc, logIn, logOut, isLoggedIn, getUsername } from "./controllers/auth_contoller.js";

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
  app.post("/addquestion", addquestion);
  app.post("/editquestion", editquestion);
  app.post("/deletequestion", deletequestion);

  // quiz
  app.post("/generatequiz", generateQuiz);
  app.post("/getquizinfo", getQuizInfo);
  app.post("/getquizquestions", getQuizQuestions);
  app.post("/createquiz", createQuiz);
  app.post("/getpublicquizzes", getPublicQuizzes);
  app.post("/getquizfeed", getQuizFeed);
  app.post("/editquiz", editQuiz);
  app.post("/deletequiz", deleteQuiz);

  // takequiz
  app.post("/generatequizrecord", generateQuizRecord);
  app.post("/takequiz", takeQuiz);
  app.post("/submitquiz", submitQuiz);
  app.post("/getquizrecordinfo", getQuizRecordInfo);

  // ai
  app.post("/generateaiquestions", useAiToGenerateQuestions);
};

export default router;
