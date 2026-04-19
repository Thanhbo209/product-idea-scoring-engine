-- TABLE: users
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    full_name     VARCHAR(100),
    avatar_url    TEXT,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER'
                  CHECK (role IN ('USER', 'ADMIN')),
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- TABLE: ideas
CREATE TABLE ideas (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                 CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    is_public    BOOLEAN      NOT NULL DEFAULT FALSE,
    share_token  VARCHAR(64)  UNIQUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- TABLE: idea_versions
CREATE TABLE idea_versions (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id        UUID           NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    version_number INT            NOT NULL,
    description    TEXT,
    target_users   TEXT,
    problem        TEXT,
    monetization   TEXT,
    risks          TEXT,
    clarity_score  NUMERIC(4, 2),
    market_score   NUMERIC(4, 2),
    risk_score     NUMERIC(4, 2),
    total_score    NUMERIC(4, 2),
    ai_feedback    TEXT,
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),

    UNIQUE (idea_id, version_number)
);

-- TABLE: tags
CREATE TABLE tags (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7)
);

-- TABLE: idea_tags
CREATE TABLE idea_tags (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id  UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id   UUID NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,

    UNIQUE (idea_id, tag_id)
);

-- INDEXES
-- users
CREATE INDEX idx_users_role       ON users(role);

-- ideas
CREATE INDEX idx_ideas_user_id    ON ideas(user_id);
CREATE INDEX idx_ideas_status     ON ideas(status);
CREATE INDEX idx_ideas_is_public  ON ideas(is_public);

-- idea_versions
CREATE INDEX idx_versions_total_score ON idea_versions(total_score DESC);

-- idea_tags
CREATE INDEX idx_idea_tags_tag_id  ON idea_tags(tag_id);