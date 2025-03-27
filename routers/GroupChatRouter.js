const express = require("express");
const { createGroupChat, getGroupChatsByUserId, createChatLog, getChatLogsByGroupChatId, getGroupChatByGroupChatId } = require("../controllers/GroupChatController.js");
const ValidateAuth = require("../middlewares/ValidateAuth.js");

const router = express.Router();

router.get("/getGroupChatsByUserId", ValidateAuth, getGroupChatsByUserId);
router.get("/getGroupChatByGroupChatId/:groupChatId", ValidateAuth, getGroupChatByGroupChatId);
router.get("/getChatLogsByGroupChatId/:groupChatId", ValidateAuth, getChatLogsByGroupChatId);
router.post("/createGroupChat", ValidateAuth, createGroupChat);
router.post("/createChatLog", ValidateAuth, createChatLog);

module.exports = router;