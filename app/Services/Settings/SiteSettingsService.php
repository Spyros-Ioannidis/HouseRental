<?php

namespace App\Services\Settings;

use App\Models\SiteSetting;

class SiteSettingsService
{
    private const DEFAULT_CONTACT_SETTINGS = [
        'email' => 'hello@example.com',
        'phone' => '+30 210 000 0000',
        'office' => 'Athens, Greece',
    ];

    private const CONTACT_KEYS = [
        'email' => 'contact_email',
        'phone' => 'contact_phone',
        'office' => 'contact_office',
    ];

    public function contactSettings(): array
    {
        $settings = SiteSetting::query()
            ->whereIn('key', array_values(self::CONTACT_KEYS))
            ->pluck('value', 'key');

        return [
            'email' => $settings->get('contact_email') ?: self::DEFAULT_CONTACT_SETTINGS['email'],
            'phone' => $settings->get('contact_phone') ?: self::DEFAULT_CONTACT_SETTINGS['phone'],
            'office' => $settings->get('contact_office') ?: self::DEFAULT_CONTACT_SETTINGS['office'],
        ];
    }

    public function updateContactSettings(array $attributes): void
    {
        foreach (self::CONTACT_KEYS as $field => $key) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => trim($attributes[$field])]
            );
        }
    }
}
