# Step 01
composer install

# Step 02
npm install

# Step 03 / Add new table or column
php artisan migrate

# Step 04 / Run Seeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=UserSeeder

php artisan jwt:secret

# Running project
php artisan serve
npm run dev

# If we got error "No application encryption key has been specified."
php artisan key:generate


# Delele Data All Table
php artisan migrate:refresh

# Delete Data One Table
php artisan migrate:refresh --path=""

# clear cache, route, config
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan route:cache
php artisan config:cache

# Run the queue worker:
php artisan queue:work


php artisan make:model YourModelName -mcr

## Railway deploy

Use a single Railway web service for the Laravel app and connect it to a managed database.

1. Create a new Railway project from this repository.
2. Add a database service and copy the generated connection string into the app environment.
3. Set these app variables in Railway:
	- `APP_NAME`
	- `APP_ENV=production`
	- `APP_DEBUG=false`
	- `APP_URL` to your Railway public URL
	- `APP_KEY`
	- Either `DB_URL` or the full set of `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`
	- `SESSION_DRIVER=database`
	- `CACHE_STORE=database`
	- `QUEUE_CONNECTION=database`
	- `JWT_SECRET`
	- Telegram and Bakong/KHQR secrets if you use those features
4. Railway will use [railway.toml](railway.toml) to install dependencies, build assets, run migrations, and start the app.
5. If you need background jobs, add a second Railway service with `php artisan queue:work --tries=1`.

Recommended production notes:

- Keep `APP_DEBUG=false`.
- Use persistent object storage for uploads if you need files to survive redeploys.
- Do not enable route caching unless you replace the closure routes in [routes/web.php](routes/web.php).
- If the app sends Telegram alerts or handles payment callbacks, make sure the Railway URL is reachable publicly and update the related webhook/callback settings.
