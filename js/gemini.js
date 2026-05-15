class GeminiManager {
    constructor(app) {
        this.app = app;
        this.apiKey = "";
    }

    async generateSoundEffect(description) {
        const systemPrompt = `
        You are a sound effect generator for a chiptune/8-bit audio synthesizer.
        User will describe a sound or effect.
        
        Output ONLY valid JSON in this exact format:
        {
            "waveform": "square"|"sine"|"triangle"|"sawtooth"|"noise",
            "attack": 0-1,
            "sustain": 0-2,
            "decay": 0-2,
            "punch": 0-100,
            "frequency": 20-3000,
            "slide": -2 to 2,
            "vibratoDepth": 0-100,
            "vibratoSpeed": 0-50,
            "duty": 0-100,
            "bitcrush": 1-8
        }
        
        Rules:
        - No text outside JSON
        - All values must be within specified ranges
        - Interpret description for appropriate chiptune-style values
        `;

        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    waveform: { type: "string", enum: ["square", "sine", "triangle", "sawtooth", "noise"] },
                    attack: { type: "number" },
                    sustain: { type: "number" },
                    decay: { type: "number" },
                    punch: { type: "number" },
                    frequency: { type: "number" },
                    slide: { type: "number" },
                    vibratoDepth: { type: "number" },
                    vibratoSpeed: { type: "number" },
                    duty: { type: "number" },
                    bitcrush: { type: "number" }
                },
                required: ["waveform", "attack", "sustain", "decay", "punch", "frequency"]
            }
        };

        try {
            const result = await this.callGemini(description, systemPrompt, generationConfig);
            let cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Gemini Sound Effect Generation Error:", e);
            throw e;
        }
    }

    async generateScene(description) {
        const systemPrompt = `
        You are a 3D scene generator. 
        You MUST output ONLY valid JSON.
        The JSON should be an Array of objects representing a 3D scene.
        
        Available types and properties:
        1. Shapes: { "type": "shape", "shapeType": "box"|"sphere"|"cone"|"cylinder"|"pyramid"|"plane"|"torus", "position": {x,y,z}, "rotation": {x,y,z}, "scale": {x,y,z}, "color": "#hex" }
        2. Figures: { "type": "figure", "gender": "male"|"female", "position": {x,y,z}, "rotation": {x,y,z}, "scale": {x,y,z} }
        3. Lights: { "type": "light", "lightType": "point"|"spot"|"directional", "position": {x,y,z}, "color": "#hex", "intensity": number }

        Rules:
        - Place objects logically based on the description.
        - Default "y" position for shapes/figures should be 0 or 1 to sit on the floor.
        - "plane" is usually the floor, rotate x: -1.57 (approx -90 deg).
        - Do not wrap in markdown code blocks. Return raw JSON string.
        `;

        const userPrompt = `Generate a 3D scene layout for: "${description}"`;

        try {
            const response = await this.callGemini(userPrompt, systemPrompt);
            // Clean response if it includes markdown fencing
            let cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            return data;
        } catch (e) {
            console.error("Gemini Scene Generation Error:", e);
            throw e;
        }
    }

    async generateMaterialColor(description) {
        const systemPrompt = `
        You are a color theory expert for 3D materials.
        User will describe a material or mood.
        You MUST output ONLY a hex color code (e.g., #FF0000).
        No text, no json, just the hex code.
        `;

        try {
            const color = await this.callGemini(description, systemPrompt);
            return color.trim();
        } catch (e) {
            console.error("Gemini Color Generation Error:", e);
            return "#ffffff"; // Fallback
        }
    }

    async callGemini(userText, systemText, generationConfig = null) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userText }] }],
            system_instruction: { parts: [{ text: systemText }] }
        };

        if (generationConfig) {
            payload.generationConfig = generationConfig;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error ${response.status}: ${text}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("No candidates returned");
        }
    }
}