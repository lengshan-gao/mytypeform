-- 清理问卷数据库中的脏数据
-- 1. 删除没有创建者的问卷
DELETE FROM surveys 
WHERE creator_id IS NULL 
   OR creator_id NOT IN (SELECT id FROM users);

-- 2. 删除没有关联问卷的问题
DELETE FROM questions 
WHERE survey_id NOT IN (SELECT id FROM surveys);

-- 3. 删除没有关联问题的选项
DELETE FROM question_options 
WHERE question_id NOT IN (SELECT id FROM questions);

-- 4. 删除没有关联问卷的回答记录
DELETE FROM responses 
WHERE survey_id NOT IN (SELECT id FROM surveys) 
   OR question_id NOT IN (SELECT id FROM questions);

-- 5. 删除没有关联选项的回答记录
DELETE FROM responses 
WHERE option_id IS NOT NULL 
   AND option_id NOT IN (SELECT id FROM question_options);

-- 6. 显示清理结果
SELECT '清理完成' as status;