import OpenAI from "openai";
import prompt from "./prompt";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL,
    "X-Title": process.env.SITE_NAME,
  },
});

export interface AnimationData {
  name: string;
  keyframes: string;
}

export async function generateAnimation(
  animationText: string
): Promise<AnimationData> {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-lite-001",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: animationText },
      ],
    });

    const content = completion.choices[0].message.content || "";

    // Log the raw content for debugging
    console.log("Raw API response:", content);

    // Extract JSON content from the response using regex
    let jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : content;

    // Clean the JSON string further
    jsonString = jsonString.trim();

    // Try to fix common JSON formatting issues
    // Replace single quotes with double quotes
    jsonString = jsonString.replace(/'/g, '"');

    // Handle potential trailing commas in objects which are invalid in JSON
    jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");

    // console.log("Cleaned JSON string:", jsonString);

    try {
      // Parse the JSON string
      const animationData = JSON.parse(jsonString) as AnimationData;

      // Validate that the required fields are present
      if (!animationData.name || !animationData.keyframes) {
        throw new Error(
          "Invalid animation data format: missing required fields"
        );
      }

      return {
        name: animationData.name,
        keyframes: animationData.keyframes,
      };
    } catch (parseError) {
      // console.error("JSON Parse error:", parseError);
      // Fallback: Try to extract name and keyframes directly if JSON parsing fails
      const nameMatch = content.match(/["']name["']\s*:\s*["']([^"']*)["']/);
      const keyframesMatch = content.match(
        /["']keyframes["']\s*:\s*["']([^"']*)["']/
      );

      if (nameMatch && keyframesMatch) {
        return {
          name: nameMatch[1],
          keyframes: keyframesMatch[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"'),
        };
      }

      throw new Error("Failed to parse animation data");
    }
  } catch (error) {
    console.error("Error generating animation:", error);
    throw new Error(
      `Failed to generate animation: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
