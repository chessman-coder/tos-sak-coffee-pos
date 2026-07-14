<?php

namespace App\Http\Controllers;

use App\Services\AppSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(AppSettingsService $settingsService): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => array_merge($settingsService->all(), [
                'logo_url' => $settingsService->logoUrl(),
            ]),
        ]);
    }

    public function update(Request $request, AppSettingsService $settingsService): RedirectResponse
    {
        $scheduleInput = (string) $request->input('telegram_daily_report_schedule', '');

        if (preg_match('/^\d{1,2}:\d{2}$/', $scheduleInput) === 1) {
            [$hour, $minute] = array_map('intval', explode(':', $scheduleInput));
            $scheduleInput = sprintf('%02d %02d * * *', $minute, $hour);
            $request->merge(['telegram_daily_report_schedule' => $scheduleInput]);
        }

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:120'],
            'exchange_rate' => ['required', 'numeric', 'min:1'],
            'telegram_daily_report_schedule' => ['required', 'string', 'max:100', 'regex:/^[\d\*\-,\/\?\s]+$/'],
            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
        ]);

        $settingsService->update($validated, $request->file('logo'));

        return back()->with('success', 'Settings updated successfully.');
    }
}