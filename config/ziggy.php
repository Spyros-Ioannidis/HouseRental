<?php

$publicRoutes = [
    'home',
    'about',
    'contact',
    'contact.store',
    'privacy.policy',
    'terms.use',
    'cookies.policy',
    'accessibility.statement',

    'houses.index',
    'houses.show',
    'houses.comments.*',

    'seller.show',
    'seller.contact',

    'locale.switch',

    'login',
    'logout',
    'register',

    'password.*',
    'verification.*',

    'dashboard',
    'dashboard.*',
    'user.dashboard.*',

    'favorites.*',
];

return [
    'groups' => [
        'public' => $publicRoutes,

        'admin' => [
            ...$publicRoutes,
            'houses.images.*',
            'admin',
            'admin.*',
        ],
    ],
];
