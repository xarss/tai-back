const MAPS_API_KEY = Deno.env.get("MAPS_API_KEY");

export const searchText = async (keyword, address) => {
  const textQuery = `${keyword} near ${address}`;
  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.googleMapsUri,places.displayName,places.websiteUri,places.shortFormattedAddress,places.rating,places.currentOpeningHours,places.photos,places.primaryTypeDisplayName,places.userRatingCount,places.priceLevel",
      },
      body: JSON.stringify({ textQuery }),
    }
  );
  const data = await response.json();
  return data.places || [];
};

export const coorsToAddress = async (latitude, longitude) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_API_KEY}`
  );
  const data = await response.json();
  return data.results[0]?.formatted_address || "me";
};

export const addressToCoors = async (address) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${MAPS_API_KEY}`
  );
  const data = await response.json();
  if (data.results.length === 0) {
    throw new Error("No place was provided");
  }
  return {
    latitude: data.results[0].geometry.location.lat,
    longitude: data.results[0].geometry.location.lng,
  };
};

export const searchNearby = async (lat, lng, primaryTypes, radius = 3000) => {
  const places = [];
  for (const type of primaryTypes) {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": MAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "places.id,places.googleMapsUri,places.displayName,places.websiteUri,places.shortFormattedAddress,places.rating,places.currentOpeningHours,places.photos,places.primaryTypeDisplayName,places.userRatingCount,places.priceLevel",
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: { center: { latitude: lat, longitude: lng }, radius: radius },
          },
          includedTypes: [type],
        }),
      }
    );
    const data = await response.json();
    places.push(...(data.places || []));
  }
  return places;
};

export const getPlacePhoto = (context) => {
  const photoReference = context.request.url.searchParams.get("photoReference");
  if (!photoReference) {
    context.response.body = { error: "Missing photo reference" };
  }

  const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?max_height_px=1000&key=${MAPS_API_KEY}`;
  context.response.body = { url: photoUrl };
};
