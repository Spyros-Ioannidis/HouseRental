<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Services\Admin\AdminDashboardMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request, AdminDashboardMetricsService $metrics)
    {
        return Inertia::render('Admin/Other/Dashboard', [
            'stats' => $metrics->forUser($request->user()),
        ]);
    }
}
