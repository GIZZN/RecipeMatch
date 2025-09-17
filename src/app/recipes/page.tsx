'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import { useFavorites } from '../context/FavoritesContext';

// Components
import RecipeHero from './components/RecipeHero';
import RecipeFilters from './components/RecipeFilters';
import BestDishes from './components/BestDishes';
import RecipeGrid from './components/RecipeGrid';
import RecipeModal from './components/RecipeModal';

// Hooks
import { useRecipes, useRecipeFilters } from './hooks/useRecipes';
import { useRecipeModal } from './hooks/useRecipeModal';

export default function RecipesPage() {
  const { toggleFavorite, favorites } = useFavorites();
  
  // Recipe data and operations
  const { recipes, loading, likedRecipes, toggleLike } = useRecipes();
  
  // Filtering and search
  const { 
    activeFilter,
    filteredRecipes, 
    setActiveFilter, 
    resetFilters 
  } = useRecipeFilters(recipes);
  
  // Modal state
  const { 
    selectedRecipe, 
    showRecipeModal, 
    openRecipeModal, 
    closeRecipeModal,
    updateSelectedRecipe 
  } = useRecipeModal();

  const handleFavoriteAndLike = async (recipeId: number) => {
    try {
      // Сначала переключаем лайк
      const likeData = await toggleLike(recipeId);
      
      // Если лайк поставлен, добавляем в избранное
      // Если лайк убран, убираем из избранного
      if (likeData.isLiked && !favorites.includes(recipeId)) {
        await toggleFavorite(recipeId);
      } else if (!likeData.isLiked && favorites.includes(recipeId)) {
        await toggleFavorite(recipeId);
      }

      // Обновляем данные в модальном окне, если оно открыто
      updateSelectedRecipe(recipeId, { likes_count: likeData.likesCount });
    } catch (error) {
      console.error('Error handling favorite and like:', error);
      alert('Произошла ошибка при изменении лайка и избранного');
    }
  };

  return (
    <ProtectedRoute>
      <div className="page">
        <main className="main">
          <RecipeHero 
            
          />

          <RecipeFilters
            recipes={recipes}
            filteredRecipes={filteredRecipes}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <BestDishes recipes={recipes} />

          <RecipeGrid
            recipes={filteredRecipes}
            loading={loading}
            searchQuery={''}
            activeFilter={activeFilter}
            favorites={favorites}
            likedRecipes={likedRecipes}
            onResetFilters={resetFilters}
            onOpenRecipe={openRecipeModal}
            onToggleFavorite={handleFavoriteAndLike}
          />

          <RecipeModal
            recipe={selectedRecipe}
            showModal={showRecipeModal}
            onClose={closeRecipeModal}
          />
      </main>
      </div>
    </ProtectedRoute>
  );
}