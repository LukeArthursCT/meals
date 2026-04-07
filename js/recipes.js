// recipes.js — Data layer for recipes

const Recipes = (() => {
  let indexCache = null;
  const recipeCache = {};

  async function loadIndex() {
    if (indexCache) return indexCache;
    const res = await fetch('data/recipes-index.json');
    const data = await res.json();
    indexCache = data.recipes;
    return indexCache;
  }

  async function loadRecipe(id) {
    if (recipeCache[id]) return recipeCache[id];
    const res = await fetch(`data/recipes/${id}.json`);
    const recipe = await res.json();
    recipeCache[id] = recipe;
    return recipe;
  }

  function filter(recipes, { mealType = null, tags = [], search = '' }) {
    return recipes.filter(r => {
      if (mealType && r.mealType !== mealType) return false;
      if (tags.length > 0 && !tags.every(t => r.tags.includes(t))) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = (r.name + ' ' + r.tags.join(' ')).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function getAllTags(recipes) {
    const tagSet = new Set();
    recipes.forEach(r => r.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  function getMealTypeEmoji(type) {
    const emojis = { breakfast: '\u{1F373}', lunch: '\u{1F957}', snack: '\u{1F34E}', dinner: '\u{1F355}' };
    return emojis[type] || '';
  }

  function getMealTypeLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return { loadIndex, loadRecipe, filter, getAllTags, getMealTypeEmoji, getMealTypeLabel };
})();
