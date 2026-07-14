<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AppSettingsService
{
    private string $settingsPath;

    public function __construct()
    {
        $this->settingsPath = storage_path('app/app_settings.json');
    }

    public function defaults(): array
    {
        return [
            'store_name' => 'TOS SAK',
            'exchange_rate' => 4000,
            'telegram_daily_report_schedule' => config('services.telegram.daily_report_schedule', '59 23 * * *'),
            'logo_path' => 'images/logo.svg',
        ];
    }

    public function all(): array
    {
        return array_merge($this->defaults(), $this->read());
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $settings = $this->all();

        return $settings[$key] ?? $default;
    }

    public function logoUrl(): string
    {
        $logoPath = (string) $this->get('logo_path', 'images/logo.svg');

        if ($logoPath === '') {
            return asset('images/logo.svg');
        }

        if (preg_match('/^https?:\/\//i', $logoPath) === 1) {
            return $logoPath;
        }

        if (Storage::disk('public')->exists($logoPath)) {
            return Storage::disk('public')->url($logoPath);
        }

        return asset(ltrim($logoPath, '/'));
    }

    public function update(array $input, ?UploadedFile $logo = null): array
    {
        $settings = $this->all();

        $settings['store_name'] = trim((string) ($input['store_name'] ?? $settings['store_name']));
        $settings['exchange_rate'] = (float) ($input['exchange_rate'] ?? $settings['exchange_rate']);
        $settings['telegram_daily_report_schedule'] = trim((string) ($input['telegram_daily_report_schedule'] ?? $settings['telegram_daily_report_schedule']));

        if ($logo) {
            $this->deleteLogo($settings['logo_path'] ?? null);
            $settings['logo_path'] = $logo->store('settings', 'public');
        }

        $this->write($settings);

        return $settings;
    }

    private function read(): array
    {
        if (!file_exists($this->settingsPath)) {
            return [];
        }

        $decoded = json_decode((string) file_get_contents($this->settingsPath), true);

        return is_array($decoded) ? $decoded : [];
    }

    private function write(array $settings): void
    {
        $directory = dirname($this->settingsPath);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        file_put_contents($this->settingsPath, json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    private function deleteLogo(?string $logoPath): void
    {
        if (!$logoPath || preg_match('/^https?:\/\//i', $logoPath) === 1) {
            return;
        }

        if (Storage::disk('public')->exists($logoPath)) {
            Storage::disk('public')->delete($logoPath);
        }
    }
}