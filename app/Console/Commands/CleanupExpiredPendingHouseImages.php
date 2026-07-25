<?php

namespace App\Console\Commands;

use App\Services\House\Images\HouseImageManager;
use Illuminate\Console\Command;

class CleanupExpiredPendingHouseImages extends Command
{
    protected $signature = 'houses:cleanup-pending-images';

    protected $description = 'Delete expired house creation image drafts and their stored files.';

    public function handle(HouseImageManager $images): int
    {
        $images->cleanupExpiredDraftImages();

        $this->info('Expired pending house images cleaned up.');

        return self::SUCCESS;
    }
}
