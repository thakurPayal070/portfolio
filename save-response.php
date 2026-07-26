<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Referrer-Policy: strict-origin-when-cross-origin');

/**
 * Return a JSON response and stop execution.
 */
function respond(int $statusCode, bool $success, string $message): never
{
    http_response_code($statusCode);
    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
        ],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

/**
 * Read a submitted string without accepting arrays or objects.
 */
function submittedString(array $data, string $key): string
{
    $value = $data[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

/**
 * Use multibyte string length when available.
 */
function textLength(string $value): int
{
    return function_exists('mb_strlen')
        ? mb_strlen($value, 'UTF-8')
        : strlen($value);
}

/**
 * Remove control characters that are not useful in contact-form text.
 */
function cleanSingleLine(string $value): string
{
    $cleaned = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value);
    return trim(preg_replace('/\s+/u', ' ', $cleaned ?? $value) ?? $value);
}

/**
 * Load and validate private database configuration.
 */
function loadConfiguration(): array
{
    $configFile = __DIR__ . DIRECTORY_SEPARATOR . 'config.php';

    if (!is_file($configFile)) {
        error_log('Portfolio contact form: config.php is missing.');
        respond(503, false, 'The contact form has not been configured yet.');
    }

    $config = require $configFile;

    if (!is_array($config) || !isset($config['database'], $config['security'])) {
        error_log('Portfolio contact form: config.php has an invalid structure.');
        respond(503, false, 'The contact form configuration is invalid.');
    }

    $database = $config['database'];
    $required = ['host', 'name', 'username', 'password'];

    foreach ($required as $key) {
        if (!isset($database[$key]) || !is_string($database[$key]) || trim($database[$key]) === '') {
            error_log("Portfolio contact form: missing database setting {$key}.");
            respond(503, false, 'The contact form database is not configured yet.');
        }
    }

    $placeholderText = implode(' ', [
        $database['host'],
        $database['name'],
        $database['username'],
        $database['password'],
    ]);

    if (
        str_contains($placeholderText, 'XXX') ||
        str_contains($placeholderText, 'YOUR_') ||
        str_contains($placeholderText, 'XXXXXXXX')
    ) {
        respond(503, false, 'The contact form database is not configured yet.');
    }

    return $config;
}

/**
 * Create a secure PDO connection.
 */
function connectDatabase(array $database): PDO
{
    $host = trim((string) $database['host']);
    $port = (int) ($database['port'] ?? 3306);
    $name = trim((string) $database['name']);
    $charset = trim((string) ($database['charset'] ?? 'utf8mb4'));

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

    return new PDO(
        $dsn,
        (string) $database['username'],
        (string) $database['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]
    );
}

/**
 * Create the message table the first time the form is used.
 */
function ensureMessageTable(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS portfolio_messages (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Only POST submissions are accepted.');
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 20_000) {
    respond(413, false, 'The submitted message is too large.');
}

$data = $_POST;
$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));

// FormData is used by the website, but JSON is also accepted for testing.
if (str_contains($contentType, 'application/json')) {
    $rawBody = file_get_contents('php://input');
    $decoded = json_decode($rawBody ?: '', true);

    if (!is_array($decoded)) {
        respond(400, false, 'The request body is not valid JSON.');
    }

    $data = $decoded;
}

$name = cleanSingleLine(submittedString($data, 'name'));
$email = strtolower(cleanSingleLine(submittedString($data, 'email')));
$subject = cleanSingleLine(submittedString($data, 'subject'));
$message = trim(submittedString($data, 'message'));
$honeypot = submittedString($data, 'website');
$formVersion = cleanSingleLine(submittedString($data, 'form_version'));

// Bots commonly fill hidden fields. Pretend the submission worked without saving it.
if ($honeypot !== '') {
    respond(200, true, 'Thank you. Your message was sent successfully.');
}

if (textLength($name) < 2 || textLength($name) > 80) {
    respond(422, false, 'Please enter a name between 2 and 80 characters.');
}

if (textLength($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    respond(422, false, 'Please enter a valid email address.');
}

if (textLength($subject) > 120) {
    respond(422, false, 'The subject cannot be longer than 120 characters.');
}

if (textLength($message) < 10 || textLength($message) > 2000) {
    respond(422, false, 'Please enter a message between 10 and 2000 characters.');
}

if (textLength($formVersion) > 30) {
    $formVersion = '';
}

if ($subject === '') {
    $subject = 'Portfolio enquiry';
}

$config = loadConfiguration();
$security = $config['security'];
$cooldownSeconds = max(0, (int) ($security['browser_cooldown_seconds'] ?? 12));
$maxPerHour = max(1, (int) ($security['max_submissions_per_hour'] ?? 5));
$ipHashKey = (string) ($security['ip_hash_key'] ?? '');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
        'cookie_secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'use_strict_mode' => true,
    ]);
}

$now = time();
$lastSubmission = (int) ($_SESSION['portfolio_last_submission'] ?? 0);

if ($cooldownSeconds > 0 && $lastSubmission > 0 && ($now - $lastSubmission) < $cooldownSeconds) {
    respond(429, false, 'Please wait a few seconds before sending another message.');
}

$visitorIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
$ipHash = ($visitorIp !== '' && $ipHashKey !== '')
    ? hash_hmac('sha256', $visitorIp, $ipHashKey)
    : null;

$userAgent = cleanSingleLine((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
if (textLength($userAgent) > 255) {
    $userAgent = function_exists('mb_substr')
        ? mb_substr($userAgent, 0, 255, 'UTF-8')
        : substr($userAgent, 0, 255);
}

try {
    $pdo = connectDatabase($config['database']);
    ensureMessageTable($pdo);

    if ($ipHash !== null) {
        $rateStatement = $pdo->prepare(
            'SELECT COUNT(*) FROM portfolio_messages
             WHERE ip_hash = :ip_hash
               AND submitted_at >= (UTC_TIMESTAMP() - INTERVAL 1 HOUR)'
        );
        $rateStatement->execute(['ip_hash' => $ipHash]);

        if ((int) $rateStatement->fetchColumn() >= $maxPerHour) {
            respond(429, false, 'Too many messages were sent recently. Please try again later.');
        }
    }

    $insertStatement = $pdo->prepare(
        'INSERT INTO portfolio_messages
            (public_id, name, email, subject, message, submitted_at, ip_hash, user_agent, form_version)
         VALUES
            (:public_id, :name, :email, :subject, :message, UTC_TIMESTAMP(), :ip_hash, :user_agent, :form_version)'
    );

    $insertStatement->execute([
        'public_id' => bin2hex(random_bytes(16)),
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'ip_hash' => $ipHash,
        'user_agent' => $userAgent !== '' ? $userAgent : null,
        'form_version' => $formVersion !== '' ? $formVersion : null,
    ]);

    $_SESSION['portfolio_last_submission'] = $now;
    respond(200, true, 'Thank you. Your message was sent successfully.');
} catch (PDOException $error) {
    error_log('Portfolio contact form database error: ' . $error->getMessage());
    respond(500, false, 'The message service is temporarily unavailable. Please try again later.');
} catch (Throwable $error) {
    error_log('Portfolio contact form error: ' . $error->getMessage());
    respond(500, false, 'The server could not process your message. Please try again later.');
}
