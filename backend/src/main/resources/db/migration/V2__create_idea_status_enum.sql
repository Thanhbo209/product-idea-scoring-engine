DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'idea_status') THEN
        CREATE TYPE idea_status AS ENUM ('DRAFT', 'PUBLISHED');
    END IF;
END$$;