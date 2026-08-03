
import { dogBreedSizeCategory, healthyWeightRangesByBreed } from "./healthyWeightRanges.js";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Determine healthy weight range based on species + breed
function getHealthyWeightRange(pet) {
    const species = pet.type?.toLowerCase();
    const breed = pet.breed?.toLowerCase();

    // --- 1. If species is dog and breed range exists ----
    if (species === "dog") {
        if (healthyWeightRangesByBreed.dog[breed]) {
            return healthyWeightRangesByBreed.dog[breed];
        }

        // --- 2. Use breed size category fallback ----
        const sizeCategory = dogBreedSizeCategory[breed];
        if (sizeCategory && healthyWeightRangesByBreed.fallback.dog[sizeCategory]) {
            return healthyWeightRangesByBreed.fallback.dog[sizeCategory];
        }

        // --- 3. Final fallback for unknown dog breeds ----
        return healthyWeightRangesByBreed.fallback.dog.medium; // reasonable default
    }

    // --- 4. Cats: check breed first ----
    if (species === "cat") {
        if (healthyWeightRangesByBreed.cat[breed]) {
            return healthyWeightRangesByBreed.cat[breed];
        }
        return healthyWeightRangesByBreed.fallback.cat;
    }

    // --- 5. Unknown species fallback ----
    return { min: 5, max: 20 };
}

export default function calculateOverallHealth(pet) {
    if (!pet) return 0;

    // -----------------------------------------------------
    // WEIGHT SCORE
    // -----------------------------------------------------
    const latestWeightItem = pet.weight?.[pet.weight.length - 1];
    let weightScore = 0;

    if (latestWeightItem) {
        const weight = latestWeightItem.value;

        const { min, max } = getHealthyWeightRange(pet);

        if (weight >= min && weight <= max) {
            weightScore = 100;
        } else {
            const nearest = weight < min ? min : max;
            const penalty = Math.min(100, Math.abs(weight - nearest) * 5); // softened penalty
            weightScore = clamp(100 - penalty, 0, 100);
        }
    }

    // -----------------------------------------------------
    // ACTIVITY LEVEL SCORE
    // -----------------------------------------------------
    let activityScore = 0;

    if (pet.activity_level?.length > 0) {
        const arr = pet.activity_level;
        const recent = arr[arr.length - 1].value;
        const prev = arr.length > 1 ? arr[arr.length - 2].value : recent;
        const trendBonus = clamp((recent - prev) * 0.2, -5, 5);

        activityScore = clamp(recent + trendBonus, 0, 100);
    }

    // -----------------------------------------------------
    // ENERGY LEVEL SCORE
    // -----------------------------------------------------
    let energyScore = 0;

    if (pet.energy_level?.length > 0) {
        const arr = pet.energy_level;
        const recent = arr[arr.length - 1].value;
        const prev = arr.length > 1 ? arr[arr.length - 2].value : recent;
        const trendBonus = clamp((recent - prev) * 0.2, -5, 5);

        energyScore = clamp(recent + trendBonus, 0, 100);
    }

    // -----------------------------------------------------
    // OVERALL HEALTH CALCULATION
    // -----------------------------------------------------
    const overallHealth =
        weightScore * 0.5 +
        activityScore * 0.25 +
        energyScore * 0.25;

    return Math.round(overallHealth);
}