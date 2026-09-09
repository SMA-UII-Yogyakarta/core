<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class ErrorSimulatorController extends Controller
{
    private const SUPPORTED_CODES = [401, 402, 403, 404, 419, 429, 500, 503];

    public function index()
    {
        return view('dev.errors', [
            'codes' => self::SUPPORTED_CODES,
        ]);
    }

    public function __invoke(int $code)
    {
        abort(in_array($code, self::SUPPORTED_CODES, true) ? $code : 404);
    }
}