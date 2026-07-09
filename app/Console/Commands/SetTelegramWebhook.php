<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SetTelegramWebhook extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:set-webhook {url} {bot=payment}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set the Telegram Bot Webhook URL dynamically';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $url = $this->argument('url');
        $bot = $this->argument('bot');

        if (!in_array($bot, ['payment', 'receiver', 'report', 'low_stock'])) {
            $this->error("Invalid bot type '{$bot}'. Must be either 'payment', 'receiver', 'report', 'low_stock'.");
            return 1;
        }

        $configKey = "services.telegram.{$bot}_bot_token";
        if ($bot === 'receiver') {
            $configKey = 'services.telegram.receiver_order_bot_token';
        } elseif ($bot === 'report') {
            $configKey = 'services.telegram.sale_report_bot_token';
        } elseif ($bot === 'payment') {
            $configKey = 'services.telegram.payment_bot_token';
        } elseif ($bot === 'low_stock') {
            $configKey = 'services.telegram.low_stock_bot_token';
        }

        $token = config($configKey);

        if (empty($token)) {
            $this->error("Telegram Bot Token for '{$bot}' is not configured in services config or env.");
            return 1;
        }

        // Auto-append the route path to the url with the bot query param
        $webhookUrl = rtrim($url, '/') . "/api/telegram/webhook?bot={$bot}";

        $this->info("Setting Telegram Webhook for '{$bot}' bot to: {$webhookUrl}");

        try {
            $response = Http::post("https://api.telegram.org/bot{$token}/setWebhook", [
                'url' => $webhookUrl
            ]);

            if ($response->successful() && $response->json('ok')) {
                $this->info("Telegram Webhook registered successfully!");
                $this->line("Details: " . $response->json('description'));
                return 0;
            }

            $this->error("Failed to register webhook: " . $response->body());
            return 1;
        } catch (\Exception $e) {
            $this->error("Error sending API request: " . $e->getMessage());
            return 1;
        }
    }
}
