import express from "express";
import { getAffiliateStat } from "../controllers/affiliateStat.js";
const router = express.Router();
router.get("/affiliatestat", getAffiliateStat);

export default router;
