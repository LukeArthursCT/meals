// app.js — Router, state management, initialization

const App = (() => {
  const state = {
    recipesIndex: [],
    mealPlans: [],
    filters: {
      mealType: null,
      tags: [],
      search: ''
    }
  };

  function parseRoute() {
    const hash = window.location.hash.replace('#', '') || '/';
    const parts = hash.split('/').filter(Boolean);

    if (parts.length === 0) return { view: 'home' };
    if (parts[0] === 'recipe' && parts[1]) return { view: 'recipe', id: parts[1] };
    if (parts[0] === 'plans') return { view: 'plans' };
    if (parts[0] === 'plan' && parts[1]) return { view: 'plan', id: parts[1] };
    if (parts[0] === 'tag' && parts[1]) return { view: 'home', tag: decodeURIComponent(parts[1]) };
    return { view: 'home' };
  }

  async function navigate() {
    const route = parseRoute();

    // Ensure data is loaded
    if (state.recipesIndex.length === 0) {
      state.recipesIndex = await Recipes.loadIndex();
    }
    if (state.mealPlans.length === 0) {
      state.mealPlans = await MealPlans.loadAll();
    }

    switch (route.view) {
      case 'home':
        // If navigating via tag link, set that tag filter
        if (route.tag) {
          state.filters = { mealType: null, tags: [route.tag], search: '' };
        }
        renderHome();
        break;

      case 'recipe':
        await renderRecipe(route.id);
        break;

      case 'plans':
        renderPlans();
        break;

      case 'plan':
        await renderPlan(route.id);
        break;

      default:
        renderHome();
    }
  }

  function renderHome() {
    const allTags = Recipes.getAllTags(state.recipesIndex);
    const content = Renderer.renderHomePage(
      state.recipesIndex,
      allTags,
      state.filters,
      (newFilters) => {
        state.filters = newFilters;
        renderHome();
      }
    );
    Renderer.mount(content);
  }

  async function renderRecipe(id) {
    try {
      const recipe = await Recipes.loadRecipe(id);
      const linkedPlans = MealPlans.findPlansForRecipe(state.mealPlans, id);
      const content = Renderer.renderRecipeDetail(recipe, linkedPlans);
      Renderer.mount(content);
    } catch (e) {
      Renderer.mount(
        document.createTextNode('Recipe not found.')
      );
    }
  }

  function renderPlans() {
    const content = Renderer.renderPlansPage(state.mealPlans, state.recipesIndex);
    Renderer.mount(content);
  }

  async function renderPlan(id) {
    try {
      const plan = await MealPlans.loadPlan(id);
      const content = Renderer.renderPlanDetail(plan, state.recipesIndex);
      Renderer.mount(content);
    } catch (e) {
      Renderer.mount(
        document.createTextNode('Meal plan not found.')
      );
    }
  }

  // Initialize
  function init() {
    window.addEventListener('hashchange', navigate);
    navigate();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { state };
})();
