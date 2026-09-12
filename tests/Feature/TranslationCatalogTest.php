<?php

namespace Tests\Feature;

use Tests\TestCase;

class TranslationCatalogTest extends TestCase
{
    public function test_ui_catalogs_have_the_same_keys_in_both_locales(): void
    {
        $indonesian = require base_path('lang/id/ui.php');
        $english = require base_path('lang/en/ui.php');

        $indonesianKeys = array_keys($indonesian);
        $englishKeys = array_keys($english);
        sort($indonesianKeys);
        sort($englishKeys);

        $this->assertSame($indonesianKeys, $englishKeys);
    }

    public function test_ui_catalog_values_are_strings(): void
    {
        foreach (['id', 'en'] as $locale) {
            $catalog = require base_path("lang/{$locale}/ui.php");

            $this->assertNotEmpty($catalog);
            foreach ($catalog as $key => $value) {
                $this->assertIsString($value, "Translation value for [{$key}] must be a string.");
            }
        }
    }
}
