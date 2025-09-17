'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import styles from './page.module.css';
import { HiPlus, HiCheckCircle, HiClock, HiSparkles } from 'react-icons/hi2';
import { MdRestaurantMenu } from 'react-icons/md';

// Components
import ProfileHeader from './components/ProfileHeader';
import AddRecipeModal from './components/AddRecipeModal';
import PromoteRecipeModal from './components/PromoteRecipeModal';
import RecipeCard from './components/RecipeCard';

// Hooks and utils
import { useRecipeForm } from './hooks/useRecipeForm';
import { submitRecipe, uploadImage, publishRecipe, deleteRecipe, unpublishRecipe, shareRecipe } from './utils/recipeApi';
import { UserRecipe } from './types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedRecipeForPromotion, setSelectedRecipeForPromotion] = useState<UserRecipe | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<UserRecipe | null>(null);
  const [activeFilter, setActiveFilter] = useState('Все рецепты');
  
  const {
    recipeForm,
    selectedImage,
    imagePreview,
    categoryDropdownOpen,
    difficultyDropdownOpen,
    handleInputChange,
    handleIngredientChange,
    addIngredient,
    removeIngredient,
    handleImageSelect,
    removeImage,
    resetForm,
    loadRecipeForEdit,
    setCategoryDropdownOpen,
    setDifficultyDropdownOpen
  } = useRecipeForm();

  useEffect(() => {
    fetchUserRecipes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.customSelect}`)) {
        setCategoryDropdownOpen(false);
        setDifficultyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setCategoryDropdownOpen, setDifficultyDropdownOpen]);

  const fetchUserRecipes = async () => {
    try {
      const response = await fetch('/api/recipes', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitRecipe(recipeForm, editingRecipe);
      
      if (result.success && result.recipeId) {
        if (selectedImage) {
          try {
            await uploadImage(result.recipeId, selectedImage);
          } catch (error) {
            console.error('Error uploading image:', error);
            alert('Рецепт сохранен, но произошла ошибка при загрузке изображения');
          }
        }

        handleCloseModal();
        fetchUserRecipes();
        alert(editingRecipe ? 'Рецепт успешно обновлен!' : 'Рецепт успешно добавлен!');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Произошла ошибка при отправке рецепта');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddRecipe(false);
    setEditingRecipe(null);
    resetForm();
  };

  const handlePromoteRecipe = (recipe: UserRecipe) => {
    setSelectedRecipeForPromotion(recipe);
    setShowPromoteModal(true);
  };

  const submitPromotion = async () => {
    if (!selectedRecipeForPromotion) return;
    
    const result = await publishRecipe(selectedRecipeForPromotion.id);
    
    if (result.success) {
      alert('Рецепт успешно опубликован на странице рецептов!');
      fetchUserRecipes();
    } else {
      alert(result.error);
    }
    
    setShowPromoteModal(false);
    setSelectedRecipeForPromotion(null);
  };

  const handleEditRecipe = (recipe: UserRecipe) => {
    loadRecipeForEdit(recipe);
    setEditingRecipe(recipe);
    setShowAddRecipe(true);
  };

  const handleShareRecipe = async (recipe: UserRecipe) => {
    await shareRecipe(recipe);
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить.')) {
      return;
    }

    const result = await deleteRecipe(recipeId);
    
    if (result.success) {
      alert('Рецепт успешно удален!');
      fetchUserRecipes();
    } else {
      alert(result.error);
    }
  };

  const handleUnpublishRecipe = async (recipeId: number) => {
    if (!confirm('Вы уверены, что хотите снять рецепт с публикации?')) {
      return;
    }

    const result = await unpublishRecipe(recipeId);
    
    if (result.success) {
      alert('Рецепт снят с публикации!');
      fetchUserRecipes();
    } else {
      alert(result.error);
    }
  };

  const getFilteredRecipes = () => {
    switch (activeFilter) {
      case 'Опубликованные':
        return userRecipes.filter(r => r.is_public);
      case 'Черновики':
        return userRecipes.filter(r => !r.is_public);
      case 'Новые':
        return userRecipes.filter(r => {
          const createdDate = new Date(r.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        });
      default:
        return userRecipes;
    }
  };

  const filteredRecipes = getFilteredRecipes();

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <main className={styles.main}>
          <ProfileHeader user={user} userRecipes={userRecipes} />

          <section className={styles.actionsSection}>
            <div className={styles.actionsContainer}>
              <div className={styles.actionHeader}>
                <div className={styles.actionInfo}>
                  <h2 className={styles.actionTitle}>Мои рецепты</h2>
                  <p className={styles.actionDescription}>
                    Создавайте, редактируйте и делитесь своими кулинарными шедеврами
                  </p>
                </div>
                <button 
                  className={styles.addRecipeButton}
                  onClick={() => setShowAddRecipe(true)}
                >
                  <HiPlus size={20} />
                  <span>Создать рецепт</span>
                </button>
              </div>
              
              {!loading && (
                <div className={styles.recipesFilters}>
                  <div className={styles.filterChips}>
                    <button 
                      className={`${styles.filterChip} ${activeFilter === 'Все рецепты' ? styles.active : ''}`}
                      onClick={() => setActiveFilter('Все рецепты')}
                    >
                      <MdRestaurantMenu size={16} />
                      <span>Все рецепты</span>
                      <span className={styles.chipCount}>{userRecipes.length}</span>
                    </button>
                    <button 
                      className={`${styles.filterChip} ${activeFilter === 'Опубликованные' ? styles.active : ''}`}
                      onClick={() => setActiveFilter('Опубликованные')}
                    >
                      <HiCheckCircle size={16} />
                      <span>Опубликованные</span>
                      <span className={styles.chipCount}>{userRecipes.filter(r => r.is_public).length}</span>
                    </button>
                    <button 
                      className={`${styles.filterChip} ${activeFilter === 'Черновики' ? styles.active : ''}`}
                      onClick={() => setActiveFilter('Черновики')}
                    >
                      <HiClock size={16} />
                      <span>Черновики</span>
                      <span className={styles.chipCount}>{userRecipes.filter(r => !r.is_public).length}</span>
                    </button>

                    <button 
                      className={`${styles.filterChip} ${activeFilter === 'Новые' ? styles.active : ''}`}
                      onClick={() => setActiveFilter('Новые')}
                    >
                      <HiSparkles size={16} />
                      <span>Новые</span>
                      <span className={styles.chipCount}>{userRecipes.filter(r => {
                        const createdDate = new Date(r.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return createdDate > weekAgo;
                      }).length}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <AddRecipeModal
            showAddRecipe={showAddRecipe}
            editingRecipe={editingRecipe}
            recipeForm={recipeForm}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            submitting={submitting}
            categoryDropdownOpen={categoryDropdownOpen}
            difficultyDropdownOpen={difficultyDropdownOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onIngredientChange={handleIngredientChange}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onImageSelect={handleImageSelect}
            onRemoveImage={removeImage}
            setCategoryDropdownOpen={setCategoryDropdownOpen}
            setDifficultyDropdownOpen={setDifficultyDropdownOpen}
          />

          <PromoteRecipeModal
            showPromoteModal={showPromoteModal}
            selectedRecipeForPromotion={selectedRecipeForPromotion}
            onClose={() => {
              setShowPromoteModal(false);
              setSelectedRecipeForPromotion(null);
            }}
            onSubmitPromotion={submitPromotion}
          />
          
          <section className={styles.recipesSection}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner}></div>
                  <p className={styles.loadingText}>Загружаем ваши рецепты...</p>
                </div>
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className={styles.recipesContainer}>
                <div className={styles.recipesGrid}>
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onPromoteRecipe={handlePromoteRecipe}
                      onEditRecipe={handleEditRecipe}
                      onShareRecipe={handleShareRecipe}
                      onDeleteRecipe={handleDeleteRecipe}
                      onUnpublishRecipe={handleUnpublishRecipe}
                    />
                  ))}
                </div>
              </div>
            ) : userRecipes.length > 0 ? (
              <div className={styles.recipesContainer}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <MdRestaurantMenu size={64} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Нет рецептов в категории{activeFilter}</h3> 
                  <p className={styles.emptyStateDescription}>
                    Попробуйте выбрать другую категорию или создать новый рецепт
                  </p>
                  <button 
                    className={styles.createFirstRecipeButton}
                    onClick={() => setActiveFilter('Все рецепты')}
                  >
                    <span>Показать все рецепты</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.recipesContainer}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <MdRestaurantMenu size={64} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>У вас пока нет рецептов</h3>
                  <p className={styles.emptyStateDescription}>
                    Создайте свой первый рецепт, чтобы поделиться им с другими пользователями
                  </p>
                  <button 
                    className={styles.createFirstRecipeButton}
                    onClick={() => setShowAddRecipe(true)}
                  >
                    <HiPlus size={20} />
                    <span>Создать первый рецепт</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}