import { Router } from "express";
import multer from "multer";
import { createScreenshot } from "../controllers/screenshotController.js";
import { createComposite } from "../controllers/compositeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

router.post("/screenshot", createScreenshot);
router.post("/mockup/render", upload.single("screenshot"), createComposite);

export default router;
