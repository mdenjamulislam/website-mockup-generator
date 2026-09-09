import { Router } from "express";
import multer from "multer";
import { createScreenshot, createMultiScreenshot } from "../controllers/screenshotController.js";
import { createComposite } from "../controllers/compositeController.js";
import { renderMultiComposite } from "../controllers/multiCompositeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

router.post("/screenshot", createScreenshot);
router.post("/screenshot/multi", createMultiScreenshot);
router.post("/mockup/render", upload.single("screenshot"), createComposite);
router.post("/mockup/render-multi", renderMultiComposite);

export default router;

