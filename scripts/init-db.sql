-- Инициализация базы данных для системы рецептов
-- Выполните этот скрипт в вашем Query Tool

-- Создание основной таблицы пользователей (если еще не существует)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы рецептов пользователей
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
);

-- Создание таблицы избранных рецептов пользователей
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL,
    recipe_type VARCHAR(50) DEFAULT 'user_recipe', -- 'user_recipe' или 'public_recipe'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id, recipe_type)
);

-- Создание таблицы лайков для рецептов пользователей
CREATE TABLE IF NOT EXISTS user_recipe_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- Создание таблицы комментариев к рецептам пользователей
CREATE TABLE IF NOT EXISTS user_recipe_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_id INTEGER REFERENCES user_recipe_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы статистики просмотров
CREATE TABLE IF NOT EXISTS user_recipe_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipes_category ON user_recipes(category);
CREATE INDEX IF NOT EXISTS idx_user_recipes_is_public ON user_recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_user_recipes_is_approved ON user_recipes(is_approved);
CREATE INDEX IF NOT EXISTS idx_user_recipes_created_at ON user_recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_likes_recipe_id ON user_recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_comments_recipe_id ON user_recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_views_recipe_id ON user_recipe_views(recipe_id);

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера к таблицам
DROP TRIGGER IF EXISTS update_user_recipes_updated_at ON user_recipes;
CREATE TRIGGER update_user_recipes_updated_at 
    BEFORE UPDATE ON user_recipes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_recipe_comments_updated_at ON user_recipe_comments;
CREATE TRIGGER update_user_recipe_comments_updated_at 
    BEFORE UPDATE ON user_recipe_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создание функции для обновления счетчика лайков
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
$$ language 'plpgsql';

-- Применение триггера для автоматического обновления счетчика лайков
DROP TRIGGER IF EXISTS trigger_update_recipe_likes_count ON user_recipe_likes;
CREATE TRIGGER trigger_update_recipe_likes_count
    AFTER INSERT OR DELETE ON user_recipe_likes
    FOR EACH ROW EXECUTE FUNCTION update_recipe_likes_count();

-- Вставка примера данных (опционально)
-- INSERT INTO users (email, password, name) VALUES 
-- ('test@example.com', 'hashed_password_here', 'Тестовый пользователь')
-- ON CONFLICT (email) DO NOTHING;

-- Проверка создания таблиц
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%recipe%' OR table_name = 'users'
ORDER BY table_name;

-- Проверка индексов
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND (tablename LIKE '%recipe%' OR tablename = 'users')
ORDER BY tablename, indexname;

COMMIT;
