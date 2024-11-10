export function buildLocationPrompt (prompt, currentLocation) {
    return `
      1. You must shorten prompts given by a user inside the tags <PROMPT> </PROMPT> in order to select only the important aspects of the prompt. The user is looking for places and it's your job to separate the right keywords so that the place can be found.
      1.1 All keywords must be place related. If a user wants to buy snacks for example, the keywords could be "supermaket", "convenience store".
      1.2 The keywords must always describe the place that will deliver what the user asked for. So if the user is asking to something to drink, never use words like "beer" or "alcohool", always choose words like "bar".
      1.3 The tags <CURRENT_LOCATION></CURRENT_LOCATION> will only contain true or false values and there can only be 4 outcomes: A, B, C or D
      1.3.A If the value inside the tags <CURRENT_LOCATION> </CURRENT_LOCATION> is TRUE, leave the tag <LOCATION/> empty. Skip outcomes B, C and D
      1.3.B If the value inside the tags <CURRENT_LOCATION> </CURRENT_LOCATION> is TRUE but the user is refering to a diferent location, the <SUCCESS/> tag value should be the word false and add a descriptive message in the tag <MESSAGE></MESSAGE> explaining why he can't say a location if he is already using it's own. Skip outcomes C and D.
      1.3.C If the value inside the tags <CURRENT_LOCATION> </CURRENT_LOCATION> is FALSE, use the source location the user mentioned as the value for <LOCATION/>. For example: "Coffees in Grece", the location should be Grece. Skip outcome D
      1.3.D If the value inside the tags <CURRENT_LOCATION> </CURRENT_LOCATION> is FALSE and the user did not mention any location, the <SUCCESS/> tag value should be the word false and add a descriptive message in the tag <MESSAGE></MESSAGE> explaining why he has to say a location if he is not using it's own
      2. Your response should focus on filling the values as indicated inside the <JSON> </JSON> tags.
      3. Replace the Tag <KEYWORDS/> with the shortened text from the initial user prompt containing only the keywords
      3.1. The <KEYWORDS/> response should contain between 3 and 7 words, with the most important keywords to represent the users prompt. You must avoid using verbs. If the verb is "buy", you might want to consider using "store", what matches most in the context.
      4. Place inside the tag <PRIMARY_TYPES/> all types that describe what the user wants.
      5. If the user's prompt does not seem promissing enought to describe minimally it's desires, you must replace the <SUCCESS/> tag with the word false, otherwize, if the user prompt is descriptive enought, replace <SUCCESS/> with the word true. Also, come up with a short explanation on why you don't understand the prompt, and write it inside the tags <MESSAGE></MESSAGE>
      6. If the response is successfull, add inside the <MESSAGE></MESSAGE> tags with a text as if you were answering the prompt presenting the places: "here are some places that ...". Be creative with the text.
  
      <JSON>
      {
          "success": <SUCCESS/>,
          "message": "<MESSAGE></MESSAGE>",
          "location": "<LOCATION/>",
          "keywords": "<KEYWORDS/>",
          "primary_types": "<PRIMARY_TYPES/>"
      }
      </JSON>
  
      <CURRENT_LOCATION>${currentLocation ? "TRUE" : "FALSE"}</CURRENT_LOCATION>
      <PROMPT>${prompt}</PROMPT>
    `;
};

function getPlaceTag(place) {
    return `
        <NAME> ${place.name} </NAME>
        <TYPE> ${place.type
        } </TYPE>
        <WEBSITEURL> ${place.websiteUri} </WEBSITEURL>
        <OPENNOW> ${place.open
            ? "Open Now"
            : "Closed"
        } </OPENNOW>
        <RATING> ${place.rating} </RATING>
      `.trim();
}

function getPreferencesTag(preferences) {
    return `
      <NATUREVSCITY>${preferences.natureVsCity}</NATUREVSCITY>
      <BUDGET>${preferences.budget}</BUDGET>
      <CULTURE>${preferences.culturalInterests}</CULTURE>
    `;
}

export function buildPlaceScorePrompt(prompt, place, preferences) {
    const placeTag = getPlaceTag(place);
    const preferencesTag = getPreferencesTag(preferences);

    return `
      1. You are a Travel Assistant which helps the user find places that match their interests. You will be given a place inside the <PLACE></PLACE> tags, the user preferences inside the <PREFERENCES></PREFERENCES> tag, the user prompt inside the <PROMPT></PROMPT> tags and will score the place from 0 to 100 based on how much the place represents the needs of the user. Good matches should be assigned a score closer to 100 and bad matches closer to 0.
      2. You must always focus on what the user has asked. If the name of a certain place is mentioned, focus on places that perhaps match that name.
      3. You will use the user preferences under <PREFERENCES></PREFERENCES> tags and user prompt under <PROMPT></PROMPT> tags to identify the score of the selected places. The preferences should only take up 25 points, while the compatibility with what the user asked should take 75.
      4. The place score should always be a number between 0 and 100, where 100 is a perfect match and 0 a miss.
      5. A place that is no match at all to what the user requested should be assigned a 0.
      6. Use all the information from the place, but mostly read the website using the <WEBSITEURL></WEBSITEURL> tags, for learning what the place offers.
      7. Use the context of the user's prompt to decide how relevant the place is, if the user didn't ask for open places, you should not give closed places a bad score
      8. If a place is repeated, remove the other instances by scoring them 0.
      9. Regarding the place inside the <PLACE></PLACE> tags:
      9.1. <NAME> </NAME> is the name of the place.
      9.2. <TYPE> </TYPE> is the primary type of the place, which describes what it offers.
      9.3. <WEBSITEURL> </WEBSITEURL> is the url to the place website, in case it has one.
      9.4. <OPENNOW> </OPENNOW> it's values will be Open or Closed. It refers to if the place is open at the moment.
      9.5. <RATING> </RATING> is the rating of the place on google maps.
      10. Regarding the user preferences under <PREFERENCES></PREFERENCES> tags:
      10.1 <NATUREVSCITY> </NATUREVSCITY> tags goes from 0 to 100 in which 0 means the user prefers nature strongly and 100 means user prefers city strongly.
      10.2 <BUDGET> </BUDGET> goes from 0 to 4, in which 0 is super cheap and 4 is super expensive.
      10.3 <CULTURE> </CULTURE> goes from 0 to 100 in which 0 means no interest in local culture and 100 means strong interest in local culture.
  
      <PREFERENCES>
        ${preferencesTag}
      </PREFERENCES>
  
      <PLACE>
        ${placeTag}
      </PLACE>
  
      <PROMPT>
        ${prompt}
      </PROMPT>
    `.trim();
};

export function buildPlaceOverviewPrompt(place) {
    const placeTag = getPlaceTag(place);
    return `
      1. You are a Travel Assistant that will generate accurate overviews of places. You will receive place information inside the tags <PLACE></PLACE> and will, by reading the website in the url inside the tags <WEBSITEURL></WEBSITEURL>, create an overview of the given place.
      2. You can use any additional information about the place to further describe it.
      3. If the tags <WEBSITEURL></WEBSITEURL> are empty, you must only create an overview if certain about the information of this place, otherwize, just explain you don't have enought data to describe it.
      4. Regarding the place inside the <PLACE></PLACE> tags:
      4.1. <NAME> </NAME> is the name of the place.
      4.2. <TYPE> </TYPE> is the primary type of the place, which describes what it offers.
      4.3. <WEBSITEURL> </WEBSITEURL> is the url to the place website, in case it has one.
      4.4. <OPENNOW> </OPENNOW> it's values will be Open or Closed. It refers to if the place is open at the moment.
      4.5. <RATING> </RATING> is the rating of the place on google maps.
  
      <PLACE>
        ${placeTag}
      </PLACE>
    `.trim();
}