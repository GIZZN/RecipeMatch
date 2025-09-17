-- Быстрое исправление проблем с избранными рецептами
-- Выполните этот скрипт в Query Tool

-- Добавляем столбец recipe_type в таблицу user_favorites
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS recipe_type VARCHAR(50) DEFAULT 'user_recipe';

-- Обновляем существующие записи
UPDATE user_favorites 
SET recipe_type = 'user_recipe' 
WHERE recipe_type IS NULL;

-- Удаляем старый уникальный ключ и создаем новый
DO $$ 
BEGIN
    -- Проверяем существование старого ключа и удаляем его
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_favorites_user_id_recipe_id_key'
        AND table_name = 'user_favorites'
    ) THEN
        ALTER TABLE user_favorites DROP CONSTRAINT user_favorites_user_id_recipe_id_key;
    END IF;
    
    -- Создаем новый уникальный ключ
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_favorites_user_id_recipe_id_recipe_type_key'
        AND table_name = 'user_favorites'
    ) THEN
        ALTER TABLE user_favorites ADD CONSTRAINT user_favorites_user_id_recipe_id_recipe_type_key 
            UNIQUE (user_id, recipe_id, recipe_type);
    END IF;
END $$;

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_favorites' 
ORDER BY ordinal_position;

COMMIT;
