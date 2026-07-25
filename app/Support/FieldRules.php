<?php

namespace App\Support;

final class FieldRules
{
    public static function email(): array
    {
        return ['string', 'email', 'max:255'];
    }

    public static function personName(): array
    {
        return ['string', 'max:120'];
    }

    public static function phone(int $max = 30): array
    {
        return ['string', "max:{$max}"];
    }

    public static function catalogName(): array
    {
        return ['string', 'min:2', 'max:80'];
    }

    public static function profilePicturePath(): array
    {
        return ['string', 'max:2048'];
    }

    public static function profilePictureImage(): array
    {
        return ['image', 'max:2048'];
    }

    public static function houseComment(): array
    {
        return ['string', 'min:1', 'max:4000'];
    }
}
