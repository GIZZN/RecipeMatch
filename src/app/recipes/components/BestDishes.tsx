'use client';

import { HiClock, HiFire, HiHeart } from 'react-icons/hi2';
import { MdRestaurantMenu } from 'react-icons/md';
import styles from '../page.module.css';
import { PublicRecipe } from '../types';

interface BestDishesProps {
  recipes: PublicRecipe[];
}

export default function BestDishes({ recipes }: BestDishesProps) {
  if (recipes.length === 0) return null;

  const bestRecipes = recipes
    .sort((a, b) => b.likes_count - a.likes_count)
    .slice(0, 3);

  return (
    <section className={styles.bestDishes}>
      <div className={styles.bestDishesContainer}>
        <div className={styles.bestDishesHeader}>
          <span className={styles.bestDishesTag}>⭐ Рекомендуем</span>
          <h2 className={styles.bestDishesTitle}>Лучшие блюда</h2>
          <p className={styles.bestDishesSubtitle}>
            Самые популярные рецепты от наших пользователей
          </p>
        </div>
        
        <div className={styles.bestDishesGrid}>
          {bestRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.featuredDish}>
              <div className={styles.featuredDishImage}>
                {recipe.has_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={`/api/recipes/${recipe.id}/image`} 
                    alt={recipe.title}
                    className={styles.featuredDishImg}
                  />
                ) : (
                  <div className={styles.featuredNoImage}>
                    <MdRestaurantMenu size={32} />
                  </div>
                )}
                <div className={styles.featuredDishBadge}>
                  <HiHeart />
                  <span>{recipe.likes_count}</span>
                </div>
              </div>
              <div className={styles.featuredDishContent}>
                <h3>{recipe.title}</h3>
                <p>{recipe.description.length > 80 ? recipe.description.slice(0, 80) + '...' : recipe.description}</p>
                <div className={styles.featuredDishStats}>
                  <span><HiClock /> {recipe.time}</span>
                  <span><HiFire /> {recipe.difficulty}</span>
                </div>
                <div className={styles.featuredDishAuthor}>
                  Автор: {recipe.author_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
