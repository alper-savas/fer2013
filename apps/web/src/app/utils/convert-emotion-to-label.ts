import { Label } from "@/backend/services/enums";

/**
 * Converts an emotion string to a Label enum value
 * 
 * @param {string} emotion - The emotion string to convert
 * @returns {Label} The corresponding Label enum value
 */
export function convertEmotionToLabel(emotion: string): Label {
    switch (emotion) {
        case "Angry":
            return Label.ANGRY;
        case "Fear":
            return Label.FEAR;
        case "Happy":
            return Label.HAPPY;
        case "Sad":
            return Label.SAD;
        case "Surprise":
            return Label.SURPRISE;
        case "Neutral":
            return Label.NEUTRAL;
        default:
            return Label.NEUTRAL;
    }
}