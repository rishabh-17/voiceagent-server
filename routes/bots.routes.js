const router = require("express").Router();
const BotsController = require("../controller/bots.controller");
const authMiddleware = require("../middleware/auth");

router.get("/get-bots-by-user", authMiddleware, BotsController.getBotsByUser);
router.post("/create-bot", authMiddleware, BotsController.createBot);
router.get("/get-bot", authMiddleware, BotsController.getBot);
router.put("/update-bot", authMiddleware, BotsController.updateBot);
router.delete("/delete-bot", authMiddleware, BotsController.deleteBot);
router.get("/tts-config", authMiddleware, BotsController.getTTSConfig);

module.exports = router;
