CREATE TABLE IF NOT EXISTS portfolio_messages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(32) NOT NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_hash CHAR(64) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    form_version VARCHAR(30) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_portfolio_messages_public_id (public_id),
    KEY idx_portfolio_messages_submitted_at (submitted_at),
    KEY idx_portfolio_messages_ip_hash (ip_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
