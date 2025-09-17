'use client';

import { HiClock, HiUsers, HiHeart, HiFire } from 'react-icons/hi2';
import PastaIcon from '../../components/icons/PastaIcon';
import SoupIcon from '../../components/icons/SoupIcon';
import CakeIcon from '../../components/icons/CakeIcon';
import SaladIcon from '../../components/icons/SaladIcon';
import styles from '../page.module.css';

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

interface RecipeModalProps {
  recipe: FavoriteRecipe | null;
  showModal: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, showModal, onClose }: RecipeModalProps) {
  if (!showModal || !recipe) return null;

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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.recipeModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalCategory}>
              {getCategoryIcon(recipe.category)}
              <span>{recipe.category}</span>
            </div>
            <h2 className={styles.modalTitle}>{recipe.title}</h2>
            <p className={styles.modalDescription}>{recipe.description}</p>
            
            <div className={styles.modalMeta}>
              <div className={styles.metaItem}>
                <HiClock />
                <span>{recipe.time}</span>
              </div>
              <div className={styles.metaItem}>
                <HiUsers />
                <span>{recipe.servings} порций</span>
              </div>
              <div className={styles.metaItem}>
                <HiHeart />
                <span>{recipe.likes_count} лайков</span>
              </div>
              <div className={styles.metaItem}>
                <HiFire />
                <span>{recipe.difficulty}</span>
              </div>
            </div>
            
            <div className={styles.modalAuthor}>
              <span>Автор: {recipe.author_name}</span>
            </div>
          </div>
          
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.modalSection}>
            <div className={styles.sectionHeader}>
              <h3>Ингредиенты</h3>
              <span className={styles.sectionCount}>{recipe.ingredients.length} шт.</span>
            </div>
            <ul className={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className={styles.ingredientItem}>
                  <span className={styles.ingredientBullet}>•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.sectionHeader}>
              <h3>Приготовление</h3>
            </div>
            <div className={styles.instructionsText}>
              {recipe.instructions.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
