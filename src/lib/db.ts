import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    // Детальная диагностика переменных окружения
    console.log('=== DATABASE CONNECTION DIAGNOSTICS ===');
    console.log('All environment variables:', Object.keys(process.env).filter(key => key.startsWith('DB_') || key === 'DATABASE_URL' || key === 'NODE_ENV' || key === 'VERCEL'));
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
    console.log('DB_HOST:', process.env.DB_HOST || '[NOT SET]');
    console.log('DB_PORT:', process.env.DB_PORT || '[NOT SET]');
    console.log('DB_NAME:', process.env.DB_NAME || '[NOT SET]');
    console.log('DB_USER:', process.env.DB_USER || '[NOT SET]');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
    console.log('DB_SSL:', process.env.DB_SSL || '[NOT SET]');
    console.log('NODE_ENV:', process.env.NODE_ENV || '[NOT SET]');
    console.log('VERCEL:', process.env.VERCEL || '[NOT SET]');
    console.log('==========================================');

    // Проверяем наличие обязательных переменных
    if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME)) {
      const missingVars = [];
      if (!process.env.DATABASE_URL) missingVars.push('DATABASE_URL');
      if (!process.env.DB_HOST) missingVars.push('DB_HOST');
      if (!process.env.DB_USER) missingVars.push('DB_USER');
      if (!process.env.DB_PASSWORD) missingVars.push('DB_PASSWORD');
      if (!process.env.DB_NAME) missingVars.push('DB_NAME');
      
      console.error('Missing environment variables:', missingVars);
      throw new Error(`Database configuration missing. Missing variables: ${missingVars.join(', ')}`);
    }

    // Определяем нужен ли SSL
    const forceNoSSL = process.env.DISABLE_SSL === 'true';
    const sslRequired = process.env.DB_SSL === 'require' || 
                       process.env.DATABASE_URL?.includes('sslmode=require');
    
    // Если есть проблемы с самоподписанными сертификатами, можно отключить SSL
    const hasSelfSignedCertIssue = process.env.ALLOW_SELF_SIGNED_CERT === 'true';
    
    const needsSSL = !forceNoSSL && (
      sslRequired ||
      (process.env.NODE_ENV === 'production' && process.env.DB_HOST && process.env.DB_HOST !== 'localhost') ||
      process.env.VERCEL
    );
    
    // Формируем строку подключения
    let connectionString = process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME}`;
    
    // Если отключаем SSL, добавляем параметр в строку подключения
    if (forceNoSSL && !process.env.DATABASE_URL) {
      connectionString += '?sslmode=disable';
      console.log('SSL disabled in connection string');
    }
    
    console.log('Connection string (masked):', connectionString.replace(/:([^:@]+)@/, ':****@'));
    
    // Логируем информацию о подключении (без паролей)
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT || '5432',
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_SSL: process.env.DB_SSL,
      HAS_PASSWORD: !!process.env.DB_PASSWORD
    });
    
    console.log('SSL configuration:', { 
      needsSSL, 
      forceNoSSL, 
      sslRequired,
      hasSelfSignedCertIssue,
      dbHost: process.env.DB_HOST,
      nodeEnv: process.env.NODE_ENV 
    });
    
    let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;
    if (needsSSL) {
      sslConfig = { 
        rejectUnauthorized: false // Разрешаем самоподписанные сертификаты
      };
      
      // Для дополнительной совместимости с самоподписанными сертификатами
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.log('SSL configured to accept self-signed certificates');
    }
    
    pool = new Pool({
      connectionString,
      ssl: sslConfig,
      // Настройки для Vercel и внешнего PostgreSQL
      max: 10, // уменьшаем для внешнего сервера
      min: 0, // минимальное количество соединений
      idleTimeoutMillis: 30000, // время ожидания перед закрытием неактивного соединения
      connectionTimeoutMillis: 10000, // увеличиваем для внешнего сервера
      // Дополнительные настройки для стабильности
      statement_timeout: 60000, // увеличиваем таймаут для SQL запросов
      query_timeout: 60000,
      // Keepalive для поддержания соединения через интернет
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      // Настройки для работы с внешним сервером
      application_name: 'RecipeMatch-Vercel',
    });
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    pool.on('connect', () => {
      console.log('New database connection established');
    });
  }
  return pool;
}

export async function query(text: string, params?: (string | number | boolean | null)[]): Promise<{ rows: unknown[]; rowCount: number | null }> {
  const pool = getPool();
  let client;
  
  try {
    console.log('Attempting to connect to database...');
    client = await pool.connect();
    console.log('Database connection successful');
    
    const result = await client.query(text, params);
    console.log('Query executed successfully');
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      errno: error && typeof error === 'object' && 'errno' in error ? error.errno : undefined,
      syscall: error && typeof error === 'object' && 'syscall' in error ? error.syscall : undefined,
      address: error && typeof error === 'object' && 'address' in error ? error.address : undefined,
      port: error && typeof error === 'object' && 'port' in error ? error.port : undefined
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Функция для корректного закрытия пула соединений
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      console.log('Database pool closed successfully');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
}

// Функция для проверки подключения к базе данных
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as test');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Database initialization
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Проверяем подключение перед инициализацией
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error('Cannot connect to database before initialization');
    }
    console.log('Database connection verified, proceeding with initialization...');
    
    // Создание таблицы пользователей
    console.log('Creating users table...');
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
    console.error('Database initialization failed with details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      detail: error && typeof error === 'object' && 'detail' in error ? error.detail : undefined
    });
    throw error; // Re-throw чтобы API endpoints могли обработать ошибку
  }
}
