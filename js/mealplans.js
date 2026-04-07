// mealplans.js — Data layer for meal plans

const MealPlans = (() => {
  let plansCache = null;
  const planCache = {};

  // Since we don't have directory listing on GitHub Pages,
  // we maintain a small list of plan IDs here.
  const PLAN_IDS = [
    '3-day-high-protein-1200'
  ];

  async function loadAll() {
    if (plansCache) return plansCache;
    const promises = PLAN_IDS.map(id => loadPlan(id));
    plansCache = await Promise.all(promises);
    return plansCache;
  }

  async function loadPlan(id) {
    if (planCache[id]) return planCache[id];
    const res = await fetch(`data/meal-plans/${id}.json`);
    const plan = await res.json();
    planCache[id] = plan;
    return plan;
  }

  function computeDayTotals(day, recipesIndex) {
    const totals = { calories: 0, protein: 0 };
    day.meals.forEach(meal => {
      const recipe = recipesIndex.find(r => r.id === meal.recipeId);
      if (recipe) {
        totals.calories += recipe.calories;
        totals.protein += recipe.protein;
      }
    });
    return totals;
  }

  function findPlansForRecipe(plans, recipeId) {
    return plans.filter(plan =>
      plan.days.some(day =>
        day.meals.some(meal => meal.recipeId === recipeId)
      )
    );
  }

  return { loadAll, loadPlan, computeDayTotals, findPlansForRecipe, PLAN_IDS };
})();
