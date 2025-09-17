import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const { title, category, description, ingredients, instructions, time, servings, difficulty } = await request.json();

    // Валидация
    if (!title || !category || !description || !ingredients || !instructions) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Создаем таблицу user_recipes если она не существует
    await query(`
      CREATE TABLE IF NOT EXISTS user_recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        ingredients TEXT[] NOT NULL,
        instructions TEXT NOT NULL,
        time VARCHAR(50),
        servings INTEGER DEFAULT 2,
        difficulty VARCHAR(50) DEFAULT 'Средняя',
        image_url VARCHAR(500),
        is_approved BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT FALSE,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Добавляем рецепт
    const result = await query(
      `INSERT INTO user_recipes (user_id, title, category, description, ingredients, instructions, time, servings, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, category, created_at`,
      [user.id, title, category, description, ingredients, instructions, time || '30 мин', servings || 2, difficulty || 'Средняя']
    );

    return NextResponse.json(
      { 
        message: 'Рецепт успешно добавлен!',
        recipe: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Получаем рецепты пользователя с дополнительной статистикой
    const result = await query(
      `SELECT 
        id, title, category, description, ingredients, instructions, 
        time, servings, difficulty, image_url, is_approved, is_public,
        views_count, likes_count, created_at, updated_at,
        CASE WHEN image_data IS NOT NULL THEN true ELSE false END as has_image
       FROM user_recipes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json(
      { recipes: result.rows },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
