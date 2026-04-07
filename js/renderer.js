// renderer.js — All DOM rendering functions

const Renderer = (() => {
  const app = () => document.getElementById('app');

  // ── Helpers ─────────────────────────────────────
  function el(tag, attrs = {}, children = []) {
    const elem = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') elem.className = v;
      else if (k === 'textContent') elem.textContent = v;
      else if (k === 'innerHTML') elem.innerHTML = v;
      else if (k.startsWith('on')) elem.addEventListener(k.slice(2).toLowerCase(), v);
      else elem.setAttribute(k, v);
    }
    children.forEach(c => {
      if (typeof c === 'string') elem.appendChild(document.createTextNode(c));
      else if (c) elem.appendChild(c);
    });
    return elem;
  }

  // ── Navigation ──────────────────────────────────
  function renderNav(currentRoute) {
    const isHome = !currentRoute || currentRoute === '/';
    const isPlans = currentRoute === '/plans';

    const nav = el('nav', { className: 'site-nav' }, [
      el('a', { className: 'logo', href: '#/', textContent: 'Meal Prep' }),
      el('div', { className: 'nav-links' }, [
        el('a', {
          href: '#/',
          className: isHome ? 'active' : '',
          textContent: 'Recipes'
        }),
        el('a', {
          href: '#/plans',
          className: isPlans ? 'active' : '',
          textContent: 'Meal Plans'
        })
      ])
    ]);
    return nav;
  }

  // ── Home / Browse Page ──────────────────────────
  function renderHomePage(recipes, allTags, filters, onFilterChange) {
    const container = document.createDocumentFragment();
    container.appendChild(renderNav('/'));

    // Hero
    const hero = el('div', { className: 'hero' }, [
      el('p', { className: 'tagline', textContent: 'Recipe Collection' }),
      el('h1', { innerHTML: 'Meal Prep<br>Recipes' }),
      el('p', { className: 'subtitle', textContent: 'High-protein, calorie-conscious recipes with searchable tags and ready-made meal plans.' })
    ]);
    container.appendChild(hero);

    // Controls
    const controls = el('div', { className: 'controls' });

    // Search
    const searchWrap = el('div', { className: 'search-wrap' }, [
      el('span', { className: 'search-icon', textContent: '\u{1F50D}' }),
      (() => {
        const input = el('input', {
          type: 'text',
          placeholder: 'Search recipes...',
          value: filters.search || ''
        });
        input.addEventListener('input', (e) => {
          onFilterChange({ ...filters, search: e.target.value });
        });
        return input;
      })()
    ]);
    controls.appendChild(searchWrap);

    // Meal type filter pills
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const filterBar = el('div', { className: 'filter-bar' });

    const allPill = el('button', {
      className: 'filter-pill' + (!filters.mealType ? ' active' : ''),
      textContent: 'All',
      onClick: () => onFilterChange({ ...filters, mealType: null })
    });
    filterBar.appendChild(allPill);

    mealTypes.forEach(type => {
      const isActive = filters.mealType === type;
      const pill = el('button', {
        className: 'filter-pill' + (isActive ? ` active-${type}` : ''),
        textContent: Recipes.getMealTypeEmoji(type) + ' ' + Recipes.getMealTypeLabel(type),
        onClick: () => onFilterChange({ ...filters, mealType: isActive ? null : type })
      });
      filterBar.appendChild(pill);
    });
    controls.appendChild(filterBar);

    // Tag pills
    if (allTags.length > 0) {
      const tagFilters = el('div', { className: 'tag-filters' });
      allTags.forEach(tag => {
        const isActive = filters.tags.includes(tag);
        const pill = el('button', {
          className: 'tag-pill' + (isActive ? ' active' : ''),
          textContent: tag,
          onClick: () => {
            const newTags = isActive
              ? filters.tags.filter(t => t !== tag)
              : [...filters.tags, tag];
            onFilterChange({ ...filters, tags: newTags });
          }
        });
        tagFilters.appendChild(pill);
      });
      controls.appendChild(tagFilters);
    }

    container.appendChild(controls);

    // Recipe grid
    const filtered = Recipes.filter(recipes, filters);
    const grid = el('div', { className: 'recipe-grid' });

    if (filtered.length === 0) {
      grid.appendChild(el('div', { className: 'no-results' }, [
        el('p', { textContent: '\u{1F50D}' }),
        el('p', { textContent: 'No recipes match your filters. Try adjusting your search or clearing some filters.' })
      ]));
    } else {
      filtered.forEach(recipe => {
        grid.appendChild(renderRecipeCard(recipe));
      });
    }

    container.appendChild(grid);
    return container;
  }

  // ── Recipe Card ─────────────────────────────────
  function renderRecipeCard(recipe) {
    const card = el('div', {
      className: 'recipe-card',
      onClick: () => { window.location.hash = `#/recipe/${recipe.id}`; }
    });

    const top = el('div', { className: 'card-top' }, [
      el('p', {
        className: `meal-label ${recipe.mealType}`,
        textContent: Recipes.getMealTypeEmoji(recipe.mealType) + ' ' + Recipes.getMealTypeLabel(recipe.mealType)
      }),
      el('h3', { textContent: recipe.name }),
      el('div', { className: `protein-badge ${recipe.mealType}` }, [
        el('strong', { textContent: recipe.protein + 'g' }),
        document.createTextNode('protein')
      ]),
      el('div', { className: 'card-meta' }, [
        el('span', { textContent: '\u{1F525} ' + recipe.calories + ' cal' }),
        el('span', { textContent: '\u{1F4E6} ' + recipe.servings + ' servings' }),
        recipe.prepTime ? el('span', { textContent: '\u23F1 ' + recipe.prepTime + ' min' }) : null
      ].filter(Boolean))
    ]);
    card.appendChild(top);

    if (recipe.tags && recipe.tags.length > 0) {
      const bottom = el('div', { className: 'card-bottom' });
      recipe.tags.forEach(tag => {
        bottom.appendChild(el('span', { className: 'card-tag', textContent: tag }));
      });
      card.appendChild(bottom);
    }

    return card;
  }

  // ── Recipe Detail Page ──────────────────────────
  function renderRecipeDetail(recipe, linkedPlans) {
    const container = document.createDocumentFragment();
    container.appendChild(renderNav('/recipe'));

    const detail = el('div', { className: `recipe-detail detail-${recipe.mealType}` });

    // Back link
    detail.appendChild(el('a', {
      className: 'back-link',
      onClick: () => { window.history.back(); },
      innerHTML: '&larr; Back to recipes'
    }));

    // Meal type label
    detail.appendChild(el('p', {
      className: `meal-label ${recipe.mealType}`,
      textContent: Recipes.getMealTypeEmoji(recipe.mealType) + ' ' + Recipes.getMealTypeLabel(recipe.mealType)
    }));

    // Title
    detail.appendChild(el('h1', { textContent: recipe.name }));

    // Description
    if (recipe.description) {
      detail.appendChild(el('p', { className: 'description', textContent: recipe.description }));
    }

    // Nutrition strip
    const n = recipe.nutrition;
    const strip = el('div', { className: 'nutrition-strip' }, [
      renderStat('Calories', n.calories, ''),
      renderStat('Protein', n.protein, 'g'),
      renderStat('Carbs', n.carbs, 'g'),
      renderStat('Fat', n.fat, 'g')
    ]);
    detail.appendChild(strip);

    // Meta bar
    const metaItems = [];
    if (recipe.prepTime) metaItems.push(el('span', { textContent: '\u23F1 Prep: ' + recipe.prepTime + ' min' }));
    if (recipe.cookTime) metaItems.push(el('span', { textContent: '\u{1F525} Cook: ' + recipe.cookTime + ' min' }));
    if (recipe.servings) metaItems.push(el('span', { textContent: '\u{1F4E6} ' + recipe.servings + ' servings' }));
    if (metaItems.length) {
      detail.appendChild(el('div', { className: 'meta-bar' }, metaItems));
    }

    // Ingredients
    detail.appendChild(el('p', { className: 'section-heading', textContent: 'Ingredients' }));
    recipe.ingredientSections.forEach(section => {
      const sec = el('div', { className: 'ingredient-section' });
      if (section.heading) {
        sec.appendChild(el('h4', { textContent: section.heading }));
      }
      const ul = el('ul', { className: 'ingredient-list' });
      section.items.forEach(item => {
        ul.appendChild(el('li', { textContent: item }));
      });
      sec.appendChild(ul);
      detail.appendChild(sec);
    });

    // Divider
    detail.appendChild(el('div', { className: 'detail-divider' }));

    // Steps
    detail.appendChild(el('p', { className: 'section-heading', textContent: 'Method' }));
    const ol = el('ol', { className: 'step-list' });
    recipe.steps.forEach(step => {
      ol.appendChild(el('li', { textContent: step }));
    });
    detail.appendChild(ol);

    // Notes
    if (recipe.notes) {
      detail.appendChild(el('div', { className: 'recipe-notes' }, [
        el('strong', { textContent: 'Note: ' }),
        document.createTextNode(recipe.notes)
      ]));
    }

    // Tags
    if (recipe.tags && recipe.tags.length > 0) {
      const tagsDiv = el('div', { className: 'detail-tags' });
      recipe.tags.forEach(tag => {
        tagsDiv.appendChild(el('span', {
          className: 'card-tag',
          textContent: tag,
          onClick: () => { window.location.hash = `#/tag/${tag}`; }
        }));
      });
      detail.appendChild(tagsDiv);
    }

    // Linked meal plans
    if (linkedPlans && linkedPlans.length > 0) {
      const linked = el('div', { className: 'linked-plans' });
      linked.appendChild(el('p', { className: 'section-heading', textContent: 'Part of these meal plans' }));
      linkedPlans.forEach(plan => {
        linked.appendChild(el('a', {
          className: 'linked-plan-card',
          onClick: () => { window.location.hash = `#/plan/${plan.id}`; }
        }, [
          el('div', { className: 'plan-name', textContent: plan.name }),
          el('div', { className: 'plan-meta', textContent: `Target: ~${plan.dailyCalorieTarget} cal/day` })
        ]));
      });
      detail.appendChild(linked);
    }

    container.appendChild(detail);
    return container;
  }

  function renderStat(label, value, unit) {
    return el('div', { className: 'stat' }, [
      el('div', { className: 'stat-label', textContent: label }),
      el('div', { className: 'stat-value' }, [
        document.createTextNode(value),
        unit ? el('small', { textContent: unit }) : null
      ].filter(Boolean))
    ]);
  }

  // ── Meal Plans List ─────────────────────────────
  function renderPlansPage(plans, recipesIndex) {
    const container = document.createDocumentFragment();
    container.appendChild(renderNav('/plans'));

    const page = el('div', { className: 'plans-page' });

    page.appendChild(el('div', { className: 'page-title' }, [
      el('h1', { textContent: 'Meal Plans' }),
      el('p', { textContent: 'Pre-built meal plans combining recipes into balanced daily menus.' })
    ]));

    const list = el('div', { className: 'plan-list' });
    plans.forEach(plan => {
      const totalMeals = plan.days.reduce((sum, d) => sum + d.meals.length, 0);
      const dayCount = plan.days.length;

      const card = el('div', {
        className: 'plan-card',
        onClick: () => { window.location.hash = `#/plan/${plan.id}`; }
      }, [
        el('h3', { textContent: plan.name }),
        el('p', { className: 'plan-desc', textContent: plan.description }),
        el('div', { className: 'plan-stats' }, [
          el('div', { innerHTML: `<span>Target</span> <strong>~${plan.dailyCalorieTarget} cal/day</strong>` }),
          el('div', { innerHTML: `<span>Days</span> <strong>${dayCount}</strong>` }),
          el('div', { innerHTML: `<span>Meals</span> <strong>${totalMeals}</strong>` })
        ])
      ]);

      if (plan.tags && plan.tags.length > 0) {
        const tagsDiv = el('div', { className: 'plan-tags' });
        plan.tags.forEach(tag => {
          tagsDiv.appendChild(el('span', { className: 'card-tag', textContent: tag }));
        });
        card.appendChild(tagsDiv);
      }

      list.appendChild(card);
    });

    page.appendChild(list);
    container.appendChild(page);
    return container;
  }

  // ── Meal Plan Detail ────────────────────────────
  function renderPlanDetail(plan, recipesIndex) {
    const container = document.createDocumentFragment();
    container.appendChild(renderNav('/plan'));

    const detail = el('div', { className: 'plan-detail' });

    detail.appendChild(el('a', {
      className: 'back-link',
      onClick: () => { window.history.back(); },
      innerHTML: '&larr; Back to meal plans'
    }));

    detail.appendChild(el('h1', { textContent: plan.name }));

    if (plan.description) {
      detail.appendChild(el('p', { className: 'plan-description', textContent: plan.description }));
    }

    plan.days.forEach(day => {
      const dayDiv = el('div', { className: 'plan-day' });
      dayDiv.appendChild(el('h2', { textContent: day.label }));

      const mealsGrid = el('div', { className: 'plan-meals' });

      day.meals.forEach(meal => {
        const recipe = recipesIndex.find(r => r.id === meal.recipeId);
        if (!recipe) return;

        const mealCard = el('div', {
          className: 'plan-meal-card',
          onClick: () => { window.location.hash = `#/recipe/${recipe.id}`; }
        }, [
          el('p', {
            className: `meal-label ${meal.mealType}`,
            textContent: Recipes.getMealTypeEmoji(meal.mealType) + ' ' + Recipes.getMealTypeLabel(meal.mealType)
          }),
          el('h4', { textContent: recipe.name }),
          el('div', { className: 'meal-macros', innerHTML: `<strong>${recipe.calories}</strong> cal &middot; <strong>${recipe.protein}g</strong> protein` })
        ]);

        mealsGrid.appendChild(mealCard);
      });

      dayDiv.appendChild(mealsGrid);

      // Day totals
      const totals = MealPlans.computeDayTotals(day, recipesIndex);
      const totalsBar = el('div', { className: 'day-totals' }, [
        el('div', { innerHTML: `<span>Calories</span><strong>~${totals.calories}</strong>` }),
        el('div', { innerHTML: `<span>Protein</span><strong>${totals.protein}g</strong>` })
      ]);
      dayDiv.appendChild(totalsBar);

      detail.appendChild(dayDiv);
    });

    container.appendChild(detail);
    return container;
  }

  // ── Mount helper ────────────────────────────────
  function mount(content) {
    const root = app();
    root.innerHTML = '';
    root.appendChild(content);
    window.scrollTo(0, 0);
  }

  return { renderHomePage, renderRecipeDetail, renderPlansPage, renderPlanDetail, mount };
})();
