'use client';

import { HiFire } from 'react-icons/hi2';
import PastaIcon from '../../components/icons/PastaIcon';
import SoupIcon from '../../components/icons/SoupIcon';
import CakeIcon from '../../components/icons/CakeIcon';
import SaladIcon from '../../components/icons/SaladIcon';
import styles from '../page.module.css';
import { PublicRecipe, RECIPE_CATEGORIES } from '../types';

interface RecipeFiltersProps {
  recipes: PublicRecipe[];
  filteredRecipes: PublicRecipe[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function RecipeFilters({ 
  recipes, 
  filteredRecipes, 
  activeFilter, 
  onFilterChange 
}: RecipeFiltersProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Основные блюда': return <PastaIcon size={16} />;
      case 'Супы': return <SoupIcon size={16} />;
      case 'Десерты': return <CakeIcon size={16} />;
      case 'Салаты': return <SaladIcon size={16} />;
      case 'Паста': return <PastaIcon size={16} />;
      default: return <HiFire size={16} />;
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'Все') return recipes.length;
    return recipes.filter(recipe => recipe.category === category).length;
  };

  const getUniqueCategories = () => {
    const categories = recipes.map(recipe => recipe.category);
    return ['Все', ...Array.from(new Set(categories))];
  };

  const filterCategories = getUniqueCategories();

  return (
    <section className={styles.filters}>
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>Категории блюд</h3>
          <span className={styles.filtersCount}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'рецепт' : 
              filteredRecipes.length < 5 ? 'рецепта' : 'рецептов'}
          </span>
        </div>
        <div className={styles.filterButtons}>
          {filterCategories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${activeFilter === category ? styles.active : ''}`}
              onClick={() => onFilterChange(category)}
            >
              <span className={styles.filterIcon}>
                {getCategoryIcon(category)}
              </span>
              <span className={styles.filterText}>{category}</span>
              <span className={styles.filterCount}>
                {getCategoryCount(category)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
