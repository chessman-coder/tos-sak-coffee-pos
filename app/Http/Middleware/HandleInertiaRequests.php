<?php

namespace App\Http\Middleware;

use App\Services\AppSettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settingsService = app(AppSettingsService::class);

        return array_merge(parent::share($request), [
            'settings' => array_merge($settingsService->all(), [
                'logo_url' => $settingsService->logoUrl(),
            ]),
            'auth' => [
                'user' => $request->user(),
                'can' => $request->user()?->loadMissing('roles.permissions')
                    ->roles->flatMap(function ($role) {
                        return $role->permissions;
                    })->mapWithKeys(function ($permission) {
                        return [$permission['name'] => auth()->user()->can($permission['name'])];
                    })->all(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'warning' => fn () => $request->session()->get('warning'),
                'failed' => fn () => $request->session()->get('failed') ?? $request->session()->get('error'),
            ],
        ]);
    }
}
