<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 *
 * Router script for PHP's built-in web server.
 * Allows proper URL routing (equivalent to .htaccess for Apache).
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// Serve static files directly if they exist
if ($uri !== '/' && file_exists(__DIR__ . '/' . $uri)) {
    return false;
}

// Route everything else through Laravel's front controller
require_once __DIR__ . '/index.php';
