<?php

declare(strict_types=1);

/**
 * PRIVATE DEPLOYMENT CONFIGURATION
 *
 * Replace the four database values with the details shown in your hosting
 * control panel. This file is excluded by .gitignore so your password is not
 * uploaded to GitHub.
 */
return [
    'database' => [
        // InfinityFree example: sql123.infinityfree.com (do not use localhost).
        'host' => 'sqlXXX.infinityfree.com',
        'port' => 3306,
        'name' => 'if0_XXXXXXXX_portfolio',
        'username' => 'if0_XXXXXXXX',
        'password' => 'YOUR_HOSTING_ACCOUNT_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    'security' => [
        // Used only to hash visitor IP addresses for anti-spam rate limiting.
        'ip_hash_key' => 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET',
        'max_submissions_per_hour' => 5,
        'browser_cooldown_seconds' => 12,
    ],
];
