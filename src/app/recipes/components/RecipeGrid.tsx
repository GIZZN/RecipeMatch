'use client';

import { HiClock, HiUsers, HiFire, HiHeart } from 'react-icons/hi2';
import { MdRestaurantMenu, MdSearch } from 'react-icons/md';
import PastaIcon from '../../components/icons/PastaIcon';
import SoupIcon from '../../components/icons/SoupIcon';
import CakeIcon from '../../components/icons/CakeIcon';
import SaladIcon from '../../components/icons/SaladIcon';
import styles from '../page.module.css';
import { PublicRecipe } from '../types';

interface RecipeGridProps {
  recipes: PublicRecipe[];
  loading: boolean;
  searchQuery: string;
  activeFilter: string;
  favorites: number[];
  likedRecipes: Set<number>;
  onResetFilters: () => void;
  onOpenRecipe: (recipe: PublicRecipe) => void;
  onToggleFavorite: (recipeId: number) => void;
}

export default function RecipeGrid({
  recipes,
  loading,
  searchQuery,
  activeFilter,
  favorites, // eslint-disable-line @typescript-eslint/no-unused-vars
  likedRecipes,
  onResetFilters,
  onOpenRecipe,
  onToggleFavorite
}: RecipeGridProps) {
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

  return (
    <section className={styles.recipesSection}>
      <div className={styles.recipesGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загружаем рецепты...</p>
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              <div className={styles.recipeImage}>
                {recipe.has_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={`/api/recipes/${recipe.id}/image`} 
                    alt={recipe.title}
                    className={styles.recipeImg}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <MdRestaurantMenu size={48} />
                  </div>
                )}
                <div className={styles.recipeCategory}>
                  {getCategoryIcon(recipe.category)}
                  <span>{recipe.category}</span>
                </div>
                <div className={styles.recipeButtons}>
                  <button 
                    className={`${styles.favoriteButton} 
                    ${favorites.includes(recipe.id) ? styles.favoriteActive : ''}`}
                    onClick={() => onToggleFavorite(recipe.id)}
                    title={favorites.includes(recipe.id) ? "Убрать из избранного и лайк" : "Добавить в избранное и лайк"}
                  >
                    <HiHeart />
                    <span>{recipe.likes_count}</span>
                  </button>
                </div>
              </div>
              
              <div className={styles.recipeContent}>
                <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                <p className={styles.recipeDescription}>{recipe.description}</p>
                
                <div className={styles.recipeMeta}>
                  <div className={styles.metaItem}>
                    <HiClock />
                    <span>{recipe.time}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <HiUsers />
                    <span>{recipe.servings} порций</span>
                  </div>
                  <div className={styles.metaItem}>
                    <HiFire />
                    <span>{recipe.difficulty}</span>
                  </div>
                </div>

                <div className={styles.recipeIngredients}>
                  <h4>Ингредиенты:</h4>
                  <ul>
                    {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li>+{recipe.ingredients.length - 3} еще...</li>
                    )}
                  </ul>
                </div>

                <div className={styles.recipeAuthor}>
                  <span>Автор: {recipe.author_name}</span>
                </div>

                <button 
                  className={styles.recipeButton}
                  onClick={() => onOpenRecipe(recipe)}
                >
                  <MdRestaurantMenu />
                  <span>Открыть рецепт</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>
              <MdSearch size={48} />
            </div>
            <h3 className={styles.noResultsTitle}>Рецепты не найдены</h3>
            <p className={styles.noResultsText}>
              {searchQuery ? 
                `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос.` :
                `В категории "${activeFilter}" пока нет рецептов.`
              }
            </p>
            <button 
              className={styles.resetButton}
              onClick={onResetFilters}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
