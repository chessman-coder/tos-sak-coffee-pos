<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::call(function (\App\Services\TelegramService $telegramService) {
    $telegramService->sendDailySaleReport();
})
->name('telegram:send-daily-report')
->cron(config('services.telegram.daily_report_schedule', '59 23 * * *'))
->timezone('Asia/Phnom_Penh');
