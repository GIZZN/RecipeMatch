'use client';


import styles from '../page.module.css';
import Iridescence from '../../bg/Iridescence';



export default function RecipeHero() {
  return (
    <section className={styles.hero}>
      <Iridescence
        color={[1, 1, 1]}
        mouseReact={false}
        amplitude={0.1}
        speed={1.0}
      />
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          <span className={styles.brandName}>Рецепты</span>
          <span className={styles.subtitle}>Найдите идеальный рецепт для себя</span>
        </h1>
      </div>
    </section>
  );
}
