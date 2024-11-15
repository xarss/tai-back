import { askStructuredGPT } from "../services/gptS.js";
import { buildPlaceScorePrompt } from "../services/promptS.js";
import placeScoreStructure from "./placeSchema.json" with { type: "json" };

export class Place {
  static seenIds = new Set();

  static priceLevelMap = {
    PRICE_LEVEL_UNSPECIFIED : 0,
    PRICE_LEVEL_FREE : 0,
    PRICE_LEVEL_INEXPENSIVE : 1,
    PRICE_LEVEL_MODERATE : 2,
    PRICE_LEVEL_EXPENSIVE : 3,
    PRICE_LEVEL_VERY_EXPENSIVE : 4
  }

  constructor(placeData) {
    if (Place.seenIds.has(placeData.id)) {
      return null;
    }
    Place.seenIds.add(placeData.id);

    this.id = placeData.id;
    this.open = placeData.currentOpeningHours?.openNow || false;
    this.rating = placeData.rating || null;
    this.ratingCount = placeData.userRatingCount || null;
    this.name = placeData.displayName.text;
    this.type = placeData.primaryTypeDisplayName?.text || null;
    this.mapsUri = placeData.googleMapsUri || "";
    this.websiteUri = placeData.websiteUri || null;
    this.photoRef = placeData.photos?.[0]?.name || null;
    this.priceLevel = Place.priceLevelMap[placeData.priceLevel]

    this.score = null;
  }

  async calculateScore(prompt, preferences) {
    const placeScorePrompt = buildPlaceScorePrompt(prompt, this, preferences);
    const response = await askStructuredGPT(placeScorePrompt, placeScoreStructure);
    const parsedResponse = JSON.parse(response);
    this.score = parseInt(parsedResponse.score);
    return this.score;
  }
}
