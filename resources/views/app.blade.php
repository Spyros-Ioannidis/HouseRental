<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="ltr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.ico?v=2">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2">
        {{-- <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"> --}}
        <link rel="manifest" href="/site.webmanifest">
        <meta name="theme-color" content="#4f46e5">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Laravel') }}">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="msapplication-TileColor" content="#4f46e5">
        <meta name="msapplication-TileImage" content="/mstile-150x150.png">
        <meta name="msapplication-config" content="/browserconfig.xml">
        <script>
            (() => {
                try {
                    const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                    document.documentElement.dataset.theme = theme;
                } catch (error) {
                    document.documentElement.dataset.theme = 'light';
                }
            })();
        </script>
        @auth
            @if(auth()->user()->hasRole('admin') || auth()->user()->hasRole('agent'))
                @routes('admin')
            @else
                @routes('public')
            @endif
        @else
            @routes('public')
        @endauth
        @viteReactRefresh
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <body class="bg-color-primary text-color-primary">
        @inertia
    </body>
</html>
