<?php

namespace App\Services\House\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Laravel\Facades\Image;
use Throwable;

class ImageCompressionService
{
    private const MAX_WIDTH = 2048;
    private const THUMBNAIL_MAX_WIDTH = 640;
    private const QUALITY = 82;
    private const THUMBNAIL_QUALITY = 78;
    private const EXTENSION = 'webp';
    private const MIME_TYPE = 'image/webp';

    public function store(UploadedFile $file, string $folder): array
    {
        try {
            $encoded = Image::decode($file)
                ->scaleDown(width: self::MAX_WIDTH)
                ->encodeUsingFileExtension(self::EXTENSION, quality: self::QUALITY);
            $encodedThumbnail = Image::decode($file)
                ->scaleDown(width: self::THUMBNAIL_MAX_WIDTH)
                ->encodeUsingFileExtension(self::EXTENSION, quality: self::THUMBNAIL_QUALITY);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded image could not be processed.',
            ]);
        }

        $filename = Str::uuid() . '.' . self::EXTENSION;
        $path = trim($folder, '/') . '/' . $filename;
        $thumbnailPath = $this->thumbnailFolder($folder) . '/' . $filename;

        if (! Storage::disk('public')->put($path, (string) $encoded)) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded image could not be stored.',
            ]);
        }

        if (! Storage::disk('public')->put($thumbnailPath, (string) $encodedThumbnail)) {
            Storage::disk('public')->delete($path);

            throw ValidationException::withMessages([
                'file' => 'The uploaded image thumbnail could not be stored.',
            ]);
        }

        return [
            'path' => $path,
            'size' => Storage::disk('public')->size($path),
            'mime_type' => self::MIME_TYPE,
            'thumbnail_path' => $thumbnailPath,
            'thumbnail_size' => Storage::disk('public')->size($thumbnailPath),
            'thumbnail_mime_type' => self::MIME_TYPE,
        ];
    }

    private function thumbnailFolder(string $folder): string
    {
        $folder = trim($folder, '/');

        if (str_ends_with($folder, '/images')) {
            return substr($folder, 0, -strlen('/images')) . '/thumbnails';
        }

        return $folder . '/thumbnails';
    }
}
