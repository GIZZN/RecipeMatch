import React from 'react';

export interface PublicRecipe {
  id: number;
  title: string;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string;
  time: string;
  servings: number;
  difficulty: string;
  likes_count: number;
  author_name: string;
  created_at: string;
  has_image: boolean;
}

export const RECIPE_CATEGORIES = [
  'Все',
  'Основные блюда',
  'Супы', 
  'Салаты',
  'Десерты',
  'Закуски',
  'Напитки',
  'Выпечка'
];

export interface CategoryIconMap {
  [key: string]: React.ReactElement;
}

export interface RecipeFiltersState {
  activeFilter: string;
  searchQuery: string;
}

export interface RecipeModalState {
  selectedRecipe: PublicRecipe | null;
  showRecipeModal: boolean;
}
