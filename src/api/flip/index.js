const express = require("express");
const router = express.Router();
const flipController = require("./controller");

router.get("/get_history", flipController.getHistory);
router.get("/get_account_history", flipController.getHistoryByAccount);
router.post("/set_history", flipController.setHistory);
router.get("/get_status", flipController.getGameStatus);
router.get("/get_users", flipController.getUserInfo);

module.exports = router;
