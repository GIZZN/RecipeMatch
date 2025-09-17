-- Добавление поддержки изображений для рецептов
-- Выполните этот скрипт в Query Tool

-- Обновляем таблицу user_recipes для хранения изображений
ALTER TABLE user_recipes 
ADD COLUMN IF NOT EXISTS image_data BYTEA,
ADD COLUMN IF NOT EXISTS image_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_size INTEGER;

-- Создаем индекс для оптимизации поиска рецептов с изображениями
CREATE INDEX IF NOT EXISTS idx_user_recipes_has_image ON user_recipes(id) WHERE image_data IS NOT NULL;

-- Проверяем обновленную структуру таблицы
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_recipes' 
AND column_name IN ('image_data', 'image_type', 'image_size', 'image_url')
ORDER BY ordinal_position;

COMMIT;
