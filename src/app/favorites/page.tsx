'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Iridescence from '../bg/Iridescence';
import PastaIcon from '../components/icons/PastaIcon';
import SoupIcon from '../components/icons/SoupIcon';
import CakeIcon from '../components/icons/CakeIcon';
import SaladIcon from '../components/icons/SaladIcon';
import { HiClock, HiUsers, HiFire, HiHeart, HiTrash, HiEye } from 'react-icons/hi2';
import { MdRestaurantMenu, MdFavorite } from 'react-icons/md';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { useFavorites } from '../context/FavoritesContext';
import RecipeModal from './components/RecipeModal';

interface FavoriteRecipe {
  id: number;
  title: string;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string;
  time: string;
  servings: number;
  difficulty: string;
  views_count: number;
  likes_count: number;
  author_name: string;
  favorited_at: string;
  has_image: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<FavoriteRecipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { clearFavorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (recipeId: number) => {
    await toggleFavorite(recipeId);
    setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  const clearAllFavorites = async () => {
    await clearFavorites();
    setFavorites([]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Основные блюда': return <PastaIcon size={24} />;
      case 'Супы': return <SoupIcon size={24} />;
      case 'Десерты': return <CakeIcon size={24} />;
      case 'Салаты': return <SaladIcon size={24} />;
      case 'Паста': return <PastaIcon size={24} />;
      default: return <HiFire size={24} />;
    }
  };

  const openModal = (recipe: FavoriteRecipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setShowModal(false);
  };

  return (
    <ProtectedRoute>
      <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <Iridescence
            color={[1, 1, 1]}
            mouseReact={false}
            amplitude={0.1}
            speed={1.0}
          />
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              <span className={styles.brandName}>Избранное</span>
              <span className={styles.subtitle}>Ваши любимые рецепты в одном месте</span>
            </h1>
            <div className={styles.statsBar}>
              <div className={styles.stat}>
                <MdFavorite className={styles.statIcon} />
                <span className={styles.statNumber}>{favorites.length}</span>
                <span className={styles.statLabel}>
                  {favorites.length === 1 ? 'рецепт' : 
                    favorites.length < 5 ? 'рецепта' : 'рецептов'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Favorites Section */}
        <section className={styles.favoritesSection}>
          <div className={styles.favoritesContainer}>
            {favorites.length > 0 && (
              <div className={styles.favoritesHeader}>
                <h2 className={styles.favoritesTitle}>Мои избранные рецепты</h2>
                <button 
                  className={styles.clearButton}
                  onClick={clearAllFavorites}
                >
                  <HiTrash />
                  <span>Очистить все</span>
                </button>
              </div>
            )}

            <div className={styles.favoritesGrid}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Загружаем избранные рецепты...</p>
                </div>
              ) : favorites.length > 0 ? (
                favorites.map((recipe) => (
                  <div key={recipe.id} className={styles.favoriteCard}>
                    <div className={styles.favoriteImage}>
                      {recipe.has_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img  
                          src={`/api/recipes/${recipe.id}/image`} 
                          alt={recipe.title}
                          className={styles.favoriteImg}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          <MdRestaurantMenu size={48} />
                        </div>
                      )}
                      <div className={styles.favoriteCategory}>
                        {getCategoryIcon(recipe.category)}
                        <span>{recipe.category}</span>
                      </div>
                      <button 
                        className={styles.removeButton}
                        onClick={() => removeFromFavorites(recipe.id)}
                        title="Удалить из избранного"
                      >
                        <HiHeart />
                      </button>
                    </div>
                    
                    <div className={styles.favoriteContent}>
                      <h3 className={styles.favoriteTitle}>{recipe.title}</h3>
                      <p className={styles.favoriteDescription}>{recipe.description}</p>
                      
                      <div className={styles.favoriteMeta}>
                        <div className={styles.metaItem}>
                          <HiClock />
                          <span>{recipe.time}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <HiUsers />
                          <span>{recipe.servings} порций</span>
                        </div>
                        <div className={styles.metaItem}>
                          <HiEye />
                          <span>{recipe.views_count}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <HiFire />
                          <span>{recipe.difficulty}</span>
                        </div>
                      </div>

                      <div className={styles.favoriteIngredients}>
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

                      <div className={styles.favoriteAuthor}>
                        <span>Автор: {recipe.author_name}</span>
                      </div>

                      <div className={styles.favoriteDate}>
                        <span>Добавлено в избранное: {new Date(recipe.favorited_at).toLocaleDateString('ru-RU')}</span>
                      </div>

                      <button 
                        className={styles.favoriteButton}
                        onClick={() => openModal(recipe)}
                      >
                        <MdRestaurantMenu />
                        <span>Открыть рецепт</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <HiHeart size={64} />
                  </div>
                  <h3 className={styles.emptyTitle}>Пока нет избранных рецептов</h3>
                  <p className={styles.emptyText}>
                    Добавляйте понравившиеся рецепты в избранное, чтобы быстро находить их позже
                  </p>
                  <Link href="/recipes" className={styles.browseButton}>
                    <MdRestaurantMenu />
                    <span>Найти рецепты</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <RecipeModal 
        recipe={selectedRecipe}
        showModal={showModal}
        onClose={closeModal}
      />
      </div>
    </ProtectedRoute>
  );
}
