// Extract first valid JSON object from string
export const extractJSON = (text: string) => {
    try {
        const firstBrace = text.indexOf("{");
        if (firstBrace === -1) return null;

        // Count braces to find matching closing brace
        let count = 0;
        let endIndex = -1;
        for (let i = firstBrace; i < text.length; i++) {
            if (text[i] === "{") count++;
            else if (text[i] === "}") count--;
            if (count === 0) {
                endIndex = i + 1;
                break;
            }
        }
        if (endIndex === -1) return null;

        const jsonString = text.slice(firstBrace, endIndex);
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}