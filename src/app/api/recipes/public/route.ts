import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Получение публичных рецептов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT 
        ur.id, ur.title, ur.category, ur.description, ur.ingredients, ur.instructions,
        ur.time, ur.servings, ur.difficulty, ur.image_url, ur.views_count, ur.likes_count,
        ur.created_at, ur.updated_at,
        u.name as author_name, u.email as author_email,
        CASE WHEN ur.image_data IS NOT NULL THEN true ELSE false END as has_image
      FROM user_recipes ur
      JOIN users u ON ur.user_id = u.id
      WHERE ur.is_public = true AND ur.is_approved = true
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Фильтр по категории
    if (category && category !== 'all') {
      queryText += ` AND ur.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Поиск по названию и описанию
    if (search) {
      queryText += ` AND (
        LOWER(ur.title) LIKE LOWER($${paramIndex}) OR 
        LOWER(ur.description) LIKE LOWER($${paramIndex + 1}) OR
        EXISTS (
          SELECT 1 FROM unnest(ur.ingredients) AS ingredient 
          WHERE LOWER(ingredient) LIKE LOWER($${paramIndex + 2})
        )
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramIndex += 3;
    }

    // Сортировка
    queryText += ` ORDER BY ur.created_at DESC`;
    
    // Пагинация
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Получаем общее количество рецептов для пагинации
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user_recipes ur
      WHERE ur.is_public = true AND ur.is_approved = true
    `;

    const countParams: (string | number)[] = [];
    let countParamIndex = 1;

    if (category && category !== 'all') {
      countQuery += ` AND ur.category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (
        LOWER(ur.title) LIKE LOWER($${countParamIndex}) OR 
        LOWER(ur.description) LIKE LOWER($${countParamIndex + 1}) OR
        EXISTS (
          SELECT 1 FROM unnest(ur.ingredients) AS ingredient 
          WHERE LOWER(ingredient) LIKE LOWER($${countParamIndex + 2})
        )
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as { total: string } | undefined)?.total || '0');

    return NextResponse.json(
      { 
        recipes: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching public recipes:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
