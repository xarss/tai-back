import { Router } from "@oak/oak";
import { fetchStructuredGPT, fetchGPT, getPlaces } from "../controllers/gptC.js";
import { getPlaceOverview } from "../controllers/gptC.js";
import { getPlacePhoto } from "../services/mapS.js";

const router = new Router();

router.get("/api", (context) => {
    context.response.body = "Api is Running!";
});
router.post("/api/gpt", fetchGPT);
router.post("/api/gpt/structured", fetchStructuredGPT);
router.post("/api/getPlaces", getPlaces);
router.post("/api/getPlaceOverview", getPlaceOverview);
router.get("/api/placePhoto", getPlacePhoto);

export default router;
