-- Обновление существующей таблицы user_recipes
-- Выполните этот скрипт в вашем Query Tool

-- Добавляем недостающие столбцы в таблицу user_recipes
ALTER TABLE user_recipes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

ALTER TABLE user_recipes 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

ALTER TABLE user_recipes 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

ALTER TABLE user_recipes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновляем существующие записи, если они есть
UPDATE user_recipes 
SET 
    is_public = FALSE,
    views_count = 0,
    likes_count = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE is_public IS NULL OR views_count IS NULL OR likes_count IS NULL OR updated_at IS NULL;

-- Добавляем недостающие столбцы в таблицу user_favorites
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS recipe_type VARCHAR(50) DEFAULT 'user_recipe';

-- Обновляем существующие записи
UPDATE user_favorites 
SET recipe_type = 'user_recipe' 
WHERE recipe_type IS NULL;

-- Удаляем старый уникальный ключ и создаем новый (если нужно)
ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS user_favorites_user_id_recipe_id_key;
ALTER TABLE user_favorites ADD CONSTRAINT user_favorites_user_id_recipe_id_recipe_type_key 
    UNIQUE (user_id, recipe_id, recipe_type);

-- Создаем недостающие таблицы (если их нет)
CREATE TABLE IF NOT EXISTS user_recipe_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS user_recipe_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipe_id INTEGER REFERENCES user_recipes(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем недостающие индексы
CREATE INDEX IF NOT EXISTS idx_user_recipes_is_public ON user_recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_user_recipe_likes_recipe_id ON user_recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_views_recipe_id ON user_recipe_views(recipe_id);

-- Создаем функцию для обновления updated_at (если не существует)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_user_recipes_updated_at ON user_recipes;
CREATE TRIGGER update_user_recipes_updated_at 
    BEFORE UPDATE ON user_recipes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для обновления счетчика лайков
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

-- Создаем триггер для автоматического обновления счетчика лайков
DROP TRIGGER IF EXISTS trigger_update_recipe_likes_count ON user_recipe_likes;
CREATE TRIGGER trigger_update_recipe_likes_count
    AFTER INSERT OR DELETE ON user_recipe_likes
    FOR EACH ROW EXECUTE FUNCTION update_recipe_likes_count();

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_recipes' 
ORDER BY ordinal_position;

COMMIT;
