const express = require("express");
const router = express.Router();
const { handleTryOn } = require("../controllers/tryonController");

router.post("/", handleTryOn);

module.exports = router;
    