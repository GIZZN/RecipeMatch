export interface UserRecipe {
  id: number;
  title: string;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string;
  time: string;
  servings: number;
  difficulty: string;
  image_url?: string;
  is_approved: boolean;
  is_public: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  has_image: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface RecipeForm {
  title: string;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string;
  time: string;
  servings: number;
  difficulty: string;
}

export const CATEGORIES = [
  'Основные блюда', 
  'Супы', 
  'Салаты', 
  'Десерты', 
  'Закуски', 
  'Напитки', 
  'Выпечка'
];

export const DIFFICULTIES = [
  'Легкая', 
  'Средняя', 
  'Сложная'
];

export const DEFAULT_RECIPE_FORM: RecipeForm = {
  title: '',
  category: 'Основные блюда',
  description: '',
  ingredients: [''],
  instructions: '',
  time: '',
  servings: 2,
  difficulty: 'Средняя'
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
