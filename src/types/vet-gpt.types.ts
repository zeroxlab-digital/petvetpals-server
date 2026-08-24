export type symptoms = {
    bodyPart: string;
    symptoms: string[];
}[]
export type conditions = {
    name: string;
    matchPercentage: number;
}[]
export interface GenerateSymptomReportDTO {
    pet: {
        type: 'dog' | 'cat';
        name: string;
        breed: string;
        age: number;
    },
    symptoms: symptoms,
    conditions: conditions
}


export interface NutritionReportDTO {
    pet: {
        type: 'dog' | 'cat';
        name: string;
        age: number;
        gender: 'male' | 'female';
        breed: string;
    };
    activityLevel: string;
    medicalConditions: string[];
    currentSymptoms: string[];
    treatmentGoals: string[];
    knownAllergies: string[];
    currentDiet: string[];
}


export interface AllergyReportDTO {
    pet: {
        type: 'dog' | 'cat';
        name: string;
        age: number;
        gender: 'male' | 'female';
        breed: string;
    };
    startDate: string;
    affectedAreas: string[];
    severity: number;
    visibleSigns: string[];
    currentSeason: string;
    recentChanges: string[];
    livingEnvironment: string;
    currentMedications: string[];
    knownAllergies: string[];
    previousTreatments: string
}
export interface SaveAllergyReportDTO {
    pet: string;
    episode: {
        length: string;
        severity: number;
        affected_areas: string[];
        visible_signs: string[];
    }
}