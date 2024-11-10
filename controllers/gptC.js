import { askGPT, askStructuredGPT } from "../services/gptS.js";
import {
  coorsToAddress,
  addressToCoors,
  searchText,
  searchNearby,
} from "../services/mapS.js";
import { Place } from "../models/placeM.js";
import {
  buildLocationPrompt,
  buildPlaceOverviewPrompt,
} from "../services/promptS.js";
import responseSchema from "../models/responseSchema.json" with { type: "json" };

export async function getPlaces(context) {
  try {
    const { prompt: userPrompt, currentLocation, latitude, longitude, preferences } = await context.request.body.json();
    let address = null;
    let lat = null;
    let lon = null;

    const fullPrompt = buildLocationPrompt(userPrompt, currentLocation);
    const gptLocationResponse = await askStructuredGPT(fullPrompt, responseSchema);
    const parsedLocationResponse = JSON.parse(gptLocationResponse);

    if (!parsedLocationResponse.success) {
      context.response.body = { success: false, message: parsedLocationResponse.message };
    }

    // Handle location information
    if (currentLocation) {
      address = await coorsToAddress(latitude, longitude);
      lat = latitude;
      lon = longitude;
    } else {
      address = parsedLocationResponse.location;
      const coors = await addressToCoors(address);
      lat = coors.latitude;
      lon = coors.longitude;
    }

    const placesText = await searchText(parsedLocationResponse.keywords, address);
    const placesNearby = await searchNearby(lat, lon, parsedLocationResponse.primary_types);

    const rawPlaces = [...placesText, ...placesNearby];

    // Create Place instances and calculate scores in parallel using Promise.all
    const placeInstances = await Promise.all(
      rawPlaces.map(async (placeData) => {
        const placeInstance = new Place(placeData);

        // Calculate score and assign it to the place instance
        await placeInstance.calculateScore(userPrompt, preferences);

        return placeInstance;
      })
    );

    const validPlaces = placeInstances.filter((place) => {
      if (place === null) {
        return false;
      }

      if (place.score === 0) {
        return false;
      }

      return true;
    });

    if (validPlaces.length === 0) {
      context.response.body = {
        success: true,
        places: [],
        message: "Could not find any places that matched this description.",
      };
      return;
    }

    validPlaces.sort((a, b) => b.score - a.score);

    context.response.body = {
      success: true,
      places: validPlaces, // Return the places with their scores
      message: parsedLocationResponse.message,
    };
  } catch (error) {
    context.response.body = { success: false, message: `Error: ${error}` };
    console.log(error);
  }
};

export const getPlaceOverview = async (context) => {
  try {
    const { place } = await context.request.body.json();

    const prompt = buildPlaceOverviewPrompt(place);
    const response = await askGPT(prompt);

    context.response.body = {
      success: true,
      message: response,
    };
  } catch (error) {
    context.response.body = { success: false, message: `Error: ${error.message}` };
    console.log(error);
  }
};

export async function fetchStructuredGPT(context) {
  const body = await context.request.body.json();
  if (!body.prompt) {
    throw new Error("Prompt is required");
  }
  if (!body.schema) {
    throw new Error("Schema is required");
  }

  const stringResponse = await askStructuredGPT(body.prompt, body.schema);
  context.response.body = JSON.parse(stringResponse);
}

export async function fetchGPT(context) {
  const body = await context.request.body.json();
  if (!body.prompt) {
    throw new Error("Prompt is required");
  }

  context.response.body = { content: await askGPT(body.prompt) };
}