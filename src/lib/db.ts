import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'RecipeMatch'}`;
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  return pool;
}

export async function query(text: string, params?: (string | number | boolean | null)[]): Promise<{ rows: unknown[]; rowCount: number | null }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    // Создание таблицы пользователей
    await query(` 
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы рецептов пользователей
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

    // Создание таблицы избранных рецептов
    await query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL,
        recipe_type VARCHAR(50) DEFAULT 'user_recipe',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, recipe_id, recipe_type)
      )
    `);

    // Создание таблицы лайков
    await query(`
      CREATE TABLE IF NOT EXISTS user_recipe_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, recipe_id)
      )
    `);

    // Создание таблицы комментариев
    await query(`
      CREATE TABLE IF NOT EXISTS user_recipe_comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        parent_id INTEGER REFERENCES user_recipe_comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы статистики просмотров
    await query(`
      CREATE TABLE IF NOT EXISTS user_recipe_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание индексов
    await query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_category ON user_recipes(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_is_public ON user_recipes(is_public)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_is_approved ON user_recipes(is_approved)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_recipe_likes_recipe_id ON user_recipe_likes(recipe_id)`);

    // Создание функции обновления updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Создание триггеров
    await query(`
      DROP TRIGGER IF EXISTS update_user_recipes_updated_at ON user_recipes;
      CREATE TRIGGER update_user_recipes_updated_at 
          BEFORE UPDATE ON user_recipes 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_user_recipe_comments_updated_at ON user_recipe_comments;
      CREATE TRIGGER update_user_recipe_comments_updated_at 
          BEFORE UPDATE ON user_recipe_comments 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // Функция для обновления счетчика лайков
    await query(`
      CREATE OR REPLACE FUNCTION update_recipe_likes_count()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              UPDATE user_recipes 
              SET likes_count = likes_count + 1 
              WHERE id = NEW.recipe_id;
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              UPDATE user_recipes 
              SET likes_count = likes_count - 1 
              WHERE id = OLD.recipe_id;
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ language 'plpgsql'
    `);

    await query(`
      DROP TRIGGER IF EXISTS trigger_update_recipe_likes_count ON user_recipe_likes;
      CREATE TRIGGER trigger_update_recipe_likes_count
          AFTER INSERT OR DELETE ON user_recipe_likes
          FOR EACH ROW EXECUTE FUNCTION update_recipe_likes_count()
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
