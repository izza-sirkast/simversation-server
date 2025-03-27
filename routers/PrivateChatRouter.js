const express = require("express");
const { getByUserId, getFriends, createChatLog, getChatLogsByPrivateChatId } = require("../controllers/PrivateChatController.js");
const ValidateAuth = require("../middlewares/ValidateAuth.js");

const router = express.Router();

router.post("/getByUserId", getByUserId);
router.get("/getFriends/:userId", ValidateAuth, getFriends);
router.post("/createChatLog", ValidateAuth, createChatLog);
router.get("/getChatLogsByPrivateChatId/:privateChatId", ValidateAuth, getChatLogsByPrivateChatId);

module.exports = router;