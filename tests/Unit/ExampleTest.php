<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_string_helper_trims_whitespace(): void
    {
        $this->assertSame('hello world', trim('  hello world  '));
    }
}
