# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static meal prep recipe browser and meal plan viewer. Vanilla JavaScript, no build tools, no dependencies. Serve with any HTTP server (e.g. `python -m http.server 8000`).

## Architecture

- **`js/app.js`** — Hash-based router (`#/`, `#/recipe/:id`, `#/plans`, `#/plan/:id`) and app initialization
- **`js/recipes.js`** — Recipes data layer: fetches, caches, and filters recipe JSON
- **`js/mealplans.js`** — Meal plans data layer: fetches plans, computes daily nutrition totals
- **`js/renderer.js`** — All DOM rendering via custom `el()` helper function
- **`data/recipes-index.json`** — Index of all recipes (metadata used for browsing/filtering)
- **`data/recipes/`** — Individual recipe detail JSON files
- **`data/meal-plans/`** — Individual meal plan JSON files

## Adding a Recipe

1. Create `data/recipes/{recipe-id}.json` with full recipe details including `id`, `name`, `mealType` (breakfast|lunch|snack|dinner), `tags`, `nutrition` (calories, protein, carbs, fat), `servings`, `prepTime`, `cookTime`, `ingredientSections`, `steps`, and `dateAdded`.
2. Add a matching summary entry to `data/recipes-index.json` with `id`, `name`, `mealType`, `tags`, `calories`, `protein`, `servings`, and `prepTime`.

Both files must use the same `id`, and the id must match the recipe JSON filename (without `.json`).

## Adding a Meal Plan

1. Create `data/meal-plans/{plan-id}.json` with `id`, `name`, `description`, `tags`, `dailyCalorieTarget`, `days` array, and `dateAdded`.
2. Each day has a `label` and `meals` array. Each meal has `mealType` and `recipeId` referencing an existing recipe id.
3. Register the plan id in the `PLAN_IDS` array in `js/mealplans.js`.

## Git Workflow

Always push directly to `main`. No need to create feature branches or pull requests.

## Connecting Recipes to Plans

Plans reference recipes by `recipeId`. The renderer resolves recipe details from the cached index. `MealPlans.findPlansForRecipe()` finds all plans containing a given recipe. Every `recipeId` in a plan must correspond to an existing recipe in `data/recipes/` and `data/recipes-index.json`.
