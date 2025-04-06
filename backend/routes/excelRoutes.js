// routes/excelRoutes.js
const express = require("express");
const { generateExcel } = require("../controllers/excelControllerFilter");
const { exportExcelPage2 } = require("../controllers/excelControllerPage2");
const router = express.Router();

router.post("/generate-excel", generateExcel);
router.post('/export-page2', exportExcelPage2);
module.exports = router;
