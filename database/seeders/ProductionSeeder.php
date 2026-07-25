<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\ContactMessage;
use App\Models\Feature;
use App\Models\House;
use App\Models\HouseComment;
use App\Models\HouseRental;
use App\Models\User;
use App\Services\House\Images\ImageCompressionService;
use App\Services\User\UserManagementService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use FilesystemIterator;
use RuntimeException;
use SplFileInfo;

class ProductionSeeder extends Seeder
{
    private const DEMO_ADMIN_EMAIL = 'admin@example.com';

    private const DEMO_AGENT_EMAIL = 'agent@example.com';

    private const HOUSE_CREATED_AT = '2025-03-01 00:00:00';

    private const RENTAL_STARTS_ON = '2025-04-01';

    private const RENTAL_ENDS_ON = '2026-04-20';

    public function run(ImageCompressionService $images, UserManagementService $users): void
    {
        $this->call([
            CitySeeder::class,
            FeatureSeeder::class,
        ]);

        $this->seedUsers($users);
        $owners = $this->owners();

        foreach ($this->listings() as $index => $listing) {
            $city = City::where('name', $listing['city'])->firstOrFail();
            $featureIds = Feature::whereIn('name', $listing['features'])->pluck('id');
            $owner = $index < 2
                ? $owners['demo_admin']
                : ($index < 4 ? $owners['demo_agent'] : $owners['random']->random());

            $house = House::firstOrCreate(
                [
                    'title_en' => $listing['title_en'],
                ],
                [
                    'user_id' => $owner->id,
                    'title' => $listing['title_en'],
                    'title_en' => $listing['title_en'],
                    'title_el' => $listing['title_el'],
                    'description' => $listing['description_en'],
                    'description_en' => $listing['description_en'],
                    'description_el' => $listing['description_el'],
                    'address' => $listing['address'],
                    'city' => $city->name,
                    'city_id' => $city->id,
                    'status' => House::STATUS_ACTIVE,
                    'latitude' => $listing['latitude'],
                    'longitude' => $listing['longitude'],
                    'year_built' => $listing['year_built'],

                    'area' => $listing['area'],
                    'price' => $listing['price'],
                    'floor' => $listing['floor'],
                    'bathroom' => $listing['bathroom'],
                    'living_room' => $listing['living_room'],
                    'bedroom' => $listing['bedroom'],
                ],
            );

            if ($house->wasRecentlyCreated) {
                $house->features()->sync($featureIds);
            }

            $this->setHouseCreatedAt($house);

            foreach ($this->houseImageFilenames($index) as $order => $filename) {
                if (! $house->images()->where('order', $order)->exists()) {
                    $this->seedImage($house, $index, $filename, $order, $images);
                }
            }
        }

        $this->seedContacts();
        $this->seedHouseComments();
    }

    private function setHouseCreatedAt(House $house): void
    {
        $house->forceFill(['created_at' => self::HOUSE_CREATED_AT]);
        $house->timestamps = false;
        $house->saveQuietly();
        $house->timestamps = true;
    }

    private function seedUsers(UserManagementService $users): void
    {
        foreach ($this->users() as $seedUser) {
            $user = User::firstOrCreate(
                ['email' => $seedUser['email']],
                [
                    'first_name' => $seedUser['first_name'],
                    'last_name' => $seedUser['last_name'],
                    'password' => Hash::make($seedUser['password']),
                    'role' => $seedUser['role'],
                    'contact_phone' => $seedUser['contact_phone'],
                    'contact_email' => $seedUser['contact_email'],
                    'email_verified_at' => now(),
                ],
            );

            if (! filled($user->profile_picture)) {
                $this->seedProfilePicture($user, $seedUser['profile'], $users);
            }
        }
    }

    private function seedContacts(): void
    {
        foreach ($this->contacts() as $contact) {
            $house = isset($contact['house_title_en'])
                ? House::where('title_en', $contact['house_title_en'])->firstOrFail()
                : null;

            ContactMessage::firstOrCreate(
                [
                    'name' => $contact['name'],
                    'email' => $contact['email'],
                    'subject' => $contact['subject'],
                    'message' => $contact['message'],
                    'source' => $contact['source'],
                    'house_id' => $house?->id,
                ],
                [
                    'user_id' => null,
                    'agent_id' => $house?->user_id,
                    'phone' => null,
                    'read_at' => null,
                ],
            );
        }
    }

    private function seedHouseComments(): void
    {
        foreach ($this->houseComments() as $comment) {
            $house = House::where('title_en', $comment['house_title_en'])->firstOrFail();
            $user = User::where('email', $comment['user_email'])->firstOrFail();

            $rental = HouseRental::firstOrCreate(
                [
                    'house_id' => $house->id,
                    'user_id' => $user->id,
                    'revoked_at' => null,
                ],
                [
                    'starts_on' => self::RENTAL_STARTS_ON,
                    'ends_on' => self::RENTAL_ENDS_ON,
                    'confirmed_at' => now(),
                    'confirmed_by_id' => $house->user_id,
                ],
            );

            $rental->update([
                'starts_on' => self::RENTAL_STARTS_ON,
                'ends_on' => self::RENTAL_ENDS_ON,
            ]);

            HouseComment::firstOrCreate(
                [
                    'house_id' => $house->id,
                    'user_id' => $user->id,
                    'content' => $comment['content'],
                ],
                [
                    'author_name' => $user->name,
                ],
            );
        }
    }

    /**
     * @return array<int, array{name: string, email: string, subject: string, message: string, source: string, house_title_en?: string}>
     */
    private function contacts(): array
    {
        return [
            [
                'name' => 'Emma Carter',
                'email' => 'emma.carter@example.com',
                'subject' => 'Question about available rentals',
                'message' => 'Hello, I am planning to move to Larisa next month. Could you let me know which rentals are currently available and how I can arrange a viewing?',
                'source' => 'general',
            ],
            [
                'name' => 'Daniel Brooks',
                'email' => 'daniel.brooks@example.com',
                'subject' => 'Assistance with finding a home',
                'message' => 'Hi, I am looking for a two-bedroom home for a small family. Please let me know if you can recommend suitable listings in Larisa or Volos.',
                'source' => 'general',
            ],
            [
                'name' => 'Olivia Bennett',
                'email' => 'olivia.bennett@example.com',
                'subject' => 'Website enquiry',
                'message' => 'Hello, I would like some help understanding the rental process and the documents required before submitting an application. Thank you.',
                'source' => 'general',
            ],
            [
                'name' => 'James Walker',
                'email' => 'james.walker@example.com',
                'subject' => 'Viewing request for furnished apartment',
                'message' => 'Hello, I am interested in this furnished ground-floor apartment. Is it still available, and could I arrange a viewing this week?',
                'source' => 'listing',
                'house_title_en' => 'Larisa Furnished Ground-Floor Apartment',
            ],
            [
                'name' => 'Sophie Turner',
                'email' => 'sophie.turner@example.com',
                'subject' => 'Question about studio utilities',
                'message' => 'Hi, I like this studio and would like to confirm which utilities are included in the monthly rent. Is a viewing available this weekend?',
                'source' => 'listing',
                'house_title_en' => 'Larisa Furnished Third-Floor Studio',
            ],
            [
                'name' => 'Liam Foster',
                'email' => 'liam.foster@example.com',
                'subject' => 'Enquiry about ground-floor home',
                'message' => 'Hello, this home looks suitable for my family. Could you please confirm the move-in date and whether pets can be discussed?',
                'source' => 'listing',
                'house_title_en' => 'Larisa Spacious Ground-Floor Home',
            ],
        ];
    }

    /**
     * @return array<int, array{user_email: string, house_title_en: string, content: string}>
     */
    private function houseComments(): array
    {
        return [
            [
                'user_email' => 'sofia.user@example.com',
                'house_title_en' => 'Larisa Furnished Ground-Floor Apartment',
                'content' => 'The apartment was clean, comfortable, and exactly as described. The furnished layout made moving in very easy.',
            ],
            [
                'user_email' => 'giorgos.user@example.com',
                'house_title_en' => 'Larisa Furnished Third-Floor Studio',
                'content' => 'A bright and practical studio in a convenient location. The included utilities were especially helpful for keeping monthly costs simple.',
            ],
            [
                'user_email' => 'anna.user@example.com',
                'house_title_en' => 'Larisa Spacious Ground-Floor Home',
                'content' => 'This home offered plenty of room for our family and a very practical layout. We appreciated the quiet street and the generous living space.',
            ],
        ];
    }

    /**
     * @return array{demo_admin: User, demo_agent: User, random: Collection<int, User>}
     */
    private function owners(): array
    {
        $demoAdmin = User::where('email', self::DEMO_ADMIN_EMAIL)->firstOrFail();
        $demoAgent = User::where('email', self::DEMO_AGENT_EMAIL)->firstOrFail();

        $randomOwners = User::query()
            ->whereIn('role', ['admin', 'agent'])
            ->whereNotIn('email', [self::DEMO_ADMIN_EMAIL, self::DEMO_AGENT_EMAIL])
            ->get();

        if ($randomOwners->isEmpty()) {
            throw new RuntimeException('Production seeding requires at least one non-demo admin or agent.');
        }

        return [
            'demo_admin' => $demoAdmin,
            'demo_agent' => $demoAgent,
            'random' => $randomOwners,
        ];
    }

    /**
     * @return array<int, array{first_name: string, last_name: string, email: string, password: string, role: string, contact_phone: string, contact_email: string, profile: string}>
     */
    private function users(): array
    {
        return [
            ['first_name' => 'Demo', 'last_name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'Admin#123', 'role' => 'admin', 'contact_phone' => '+30 210 000 0001', 'contact_email' => 'admin@example.com', 'profile' => 'profile-01.png'],
            ['first_name' => 'Demo', 'last_name' => 'Agent', 'email' => 'agent@example.com', 'password' => 'Agent#123', 'role' => 'agent', 'contact_phone' => '+30 210 000 0002', 'contact_email' => 'agent@example.com', 'profile' => 'profile-02.png'],
            ['first_name' => 'Demo', 'last_name' => 'User', 'email' => 'user@example.com', 'password' => 'User#123', 'role' => 'user', 'contact_phone' => '+30 210 000 0003', 'contact_email' => 'user@example.com', 'profile' => 'profile-03.png'],
            ['first_name' => 'Alexandra', 'last_name' => 'Admin', 'email' => 'alexandra.admin@example.com', 'password' => 'Admin#234', 'role' => 'admin', 'contact_phone' => '+30 210 000 0004', 'contact_email' => 'alexandra.admin@example.com', 'profile' => 'profile-04.png'],
            ['first_name' => 'Maria', 'last_name' => 'Papadaki', 'email' => 'maria.agent@example.com', 'password' => 'Agent#234', 'role' => 'agent', 'contact_phone' => '+30 210 000 0005', 'contact_email' => 'maria.agent@example.com', 'profile' => 'profile-05.png'],
            ['first_name' => 'Nikos', 'last_name' => 'Georgiou', 'email' => 'nikos.agent@example.com', 'password' => 'Agent#345', 'role' => 'agent', 'contact_phone' => '+30 210 000 0006', 'contact_email' => 'nikos.agent@example.com', 'profile' => 'profile-06.png'],
            ['first_name' => 'Eleni', 'last_name' => 'Kosta', 'email' => 'eleni.agent@example.com', 'password' => 'Agent#456', 'role' => 'agent', 'contact_phone' => '+30 210 000 0007', 'contact_email' => 'eleni.agent@example.com', 'profile' => 'profile-07.png'],
            ['first_name' => 'Sofia', 'last_name' => 'Dimitriou', 'email' => 'sofia.user@example.com', 'password' => 'User#234', 'role' => 'user', 'contact_phone' => '+30 210 000 0008', 'contact_email' => 'sofia.user@example.com', 'profile' => 'profile-08.png'],
            ['first_name' => 'Giorgos', 'last_name' => 'Pappas', 'email' => 'giorgos.user@example.com', 'password' => 'User#345', 'role' => 'user', 'contact_phone' => '+30 210 000 0009', 'contact_email' => 'giorgos.user@example.com', 'profile' => 'profile-09.png'],
            ['first_name' => 'Anna', 'last_name' => 'Theodorou', 'email' => 'anna.user@example.com', 'password' => 'User#456', 'role' => 'user', 'contact_phone' => '+30 210 000 0010', 'contact_email' => 'anna.user@example.com', 'profile' => 'profile-10.png'],
            ['first_name' => 'Dimitris', 'last_name' => 'Nikolaou', 'email' => 'dimitris.user@example.com', 'password' => 'User#567', 'role' => 'user', 'contact_phone' => '+30 210 000 0011', 'contact_email' => 'dimitris.user@example.com', 'profile' => 'profile-11.png'],
            ['first_name' => 'Katerina', 'last_name' => 'Vasiliou', 'email' => 'katerina.user@example.com', 'password' => 'User#678', 'role' => 'user', 'contact_phone' => '+30 210 000 0012', 'contact_email' => 'katerina.user@example.com', 'profile' => 'profile-12.png'],
            ['first_name' => 'Petros', 'last_name' => 'Ioannou', 'email' => 'petros.user@example.com', 'password' => 'User#789', 'role' => 'user', 'contact_phone' => '+30 210 000 0013', 'contact_email' => 'petros.user@example.com', 'profile' => 'profile-13.png'],
            ['first_name' => 'Irene', 'last_name' => 'Markou', 'email' => 'irene.user@example.com', 'password' => 'User#890', 'role' => 'user', 'contact_phone' => '+30 210 000 0014', 'contact_email' => 'irene.user@example.com', 'profile' => 'profile-14.png'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function listings(): array
    {
        return [
            [
                'title_en' => 'Larisa Furnished Ground-Floor Apartment',
                'title_el' => 'Επιπλωμένο Ισόγειο Διαμέρισμα στη Λάρισα',
                'description_en' => 'Bright furnished ground-floor apartment with one bedroom, air conditioning, and individual heating. The monthly rent includes utility and shared-expense costs stated by the source listing.',
                'description_el' => 'Φωτεινό επιπλωμένο ισόγειο διαμέρισμα με ένα υπνοδωμάτιο, κλιματισμό και ατομική θέρμανση. Το μηνιαίο μίσθωμα περιλαμβάνει τις παροχές και τα κοινόχρηστα που αναφέρονται στην πηγή.',
                'address' => '12 Garden Street, Larisa',
                'city' => 'Larisa',
                'latitude' => '39.6411000',
                'longitude' => '22.4168000',
                'year_built' => 1985,
                'area' => 45,
                'price' => 850,
                'floor' => 0,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 1,
                'features' => ['Furnished', 'Air Conditioning', 'Heating'],
            ],
            [
                'title_en' => 'Larisa Furnished Third-Floor Studio',
                'title_el' => 'Επιπλωμένο Στούντιο στον Τρίτο Όροφο στη Λάρισα',
                'description_en' => 'Compact furnished third-floor studio with air conditioning and individual heating. Water, internet, and shared expenses are included according to the source listing.',
                'description_el' => 'Συμπαγές επιπλωμένο στούντιο στον τρίτο όροφο με κλιματισμό και ατομική θέρμανση. Το νερό, το διαδίκτυο και τα κοινόχρηστα περιλαμβάνονται σύμφωνα με την πηγή.',
                'address' => '28 Central Square, Larisa',
                'city' => 'Larisa',
                'latitude' => '39.6394000',
                'longitude' => '22.4197000',
                'year_built' => 1980,
                'area' => 35,
                'price' => 460,
                'floor' => 3,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 1,
                'features' => ['Furnished', 'Air Conditioning', 'Heating'],
            ],
            [
                'title_en' => 'Larisa Spacious Ground-Floor Home',
                'title_el' => 'Ευρύχωρη Ισόγεια Κατοικία στη Λάρισα',
                'description_en' => 'Spacious ground-floor home with two living rooms, air conditioning, individual oil heating, and a security door. Its practical layout suits a household needing generous shared space.',
                'description_el' => 'Ευρύχωρη ισόγεια κατοικία με δύο καθιστικά, κλιματισμό, ατομική θέρμανση πετρελαίου και πόρτα ασφαλείας. Η πρακτική διαρρύθμιση εξυπηρετεί ένα νοικοκυριό που χρειάζεται άνετους κοινόχρηστους χώρους.',
                'address' => '6 Pine Avenue, Larisa',
                'city' => 'Larisa',
                'latitude' => '39.6329000',
                'longitude' => '22.4105000',
                'year_built' => 1995,
                'area' => 90,
                'price' => 450,
                'floor' => 0,
                'bathroom' => 1,
                'living_room' => 2,
                'bedroom' => 2,
                'features' => ['Air Conditioning', 'Heating', 'Security door'],
            ],
            [
                'title_en' => 'Volos Bright First-Floor Family Home',
                'title_el' => 'Φωτεινή Οικογενειακή Κατοικία Πρώτου Ορόφου στον Βόλο',
                'description_en' => 'Bright and airy first-floor family home with autonomous oil heating and storage space. It provides a large layout with a main bathroom and an additional WC.',
                'description_el' => 'Φωτεινή και διαμπερής οικογενειακή κατοικία πρώτου ορόφου με αυτόνομη θέρμανση πετρελαίου και αποθηκευτικό χώρο. Προσφέρει μεγάλη διαρρύθμιση με κύριο μπάνιο και επιπλέον WC.',
                'address' => '18 Argonauts Avenue, Volos',
                'city' => 'Volos',
                'latitude' => '39.3618000',
                'longitude' => '22.9441000',
                'year_built' => 1990,
                'area' => 150,
                'price' => 600,
                'floor' => 1,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 3,
                'features' => ['Heating', 'Storage room'],
            ],
            [
                'title_en' => 'Volos Fifth-Floor Apartment',
                'title_el' => 'Διαμέρισμα Πέμπτου Ορόφου στον Βόλο',
                'description_en' => 'Bright fifth-floor apartment with elevator access, air conditioning, autonomous oil heating, and a security door. It offers a practical one-bedroom layout for everyday living.',
                'description_el' => 'Φωτεινό διαμέρισμα πέμπτου ορόφου με ασανσέρ, κλιματισμό, αυτόνομη θέρμανση πετρελαίου και πόρτα ασφαλείας. Προσφέρει πρακτική διαρρύθμιση ενός υπνοδωματίου για καθημερινή διαβίωση.',
                'address' => '9 Pelion View Road, Volos',
                'city' => 'Volos',
                'latitude' => '39.3693000',
                'longitude' => '22.9335000',
                'year_built' => 1995,
                'area' => 60,
                'price' => 500,
                'floor' => 5,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 1,
                'features' => ['Elevator', 'Air Conditioning', 'Heating', 'Security door'],
            ],
            [
                'title_en' => 'Volos Renovated Second-Floor Residence',
                'title_el' => 'Ανακαινισμένη Κατοικία Δεύτερου Ορόφου στον Βόλο',
                'description_en' => 'Generous second-floor residence, renovated in 2022, with individual oil heating and a security door. The layout includes a main bathroom and two additional WCs.',
                'description_el' => 'Άνετη κατοικία δεύτερου ορόφου, ανακαινισμένη το 2022, με ατομική θέρμανση πετρελαίου και πόρτα ασφαλείας. Η διαρρύθμιση περιλαμβάνει κύριο μπάνιο και δύο επιπλέον WC.',
                'address' => '44 Dimitriados Street, Volos',
                'city' => 'Volos',
                'latitude' => '39.3586000',
                'longitude' => '22.9502000',
                'year_built' => 1990,
                'area' => 130,
                'price' => 700,
                'floor' => 2,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 3,
                'features' => ['Heating', 'Security door'],
            ],
            [
                'title_en' => 'Trikala Spacious Ground-Floor Home',
                'title_el' => 'Ευρύχωρη Ισόγεια Κατοικία στα Τρίκαλα',
                'description_en' => 'Bright and airy ground-floor home with useful storage space and a comfortable two-bedroom layout. It is suited to tenants looking for generous indoor space on one level.',
                'description_el' => 'Φωτεινή και διαμπερής ισόγεια κατοικία με χρήσιμο αποθηκευτικό χώρο και άνετη διαρρύθμιση δύο υπνοδωματίων. Είναι κατάλληλη για ενοικιαστές που αναζητούν άνετους εσωτερικούς χώρους σε ένα επίπεδο.',
                'address' => '15 Riverwalk Street, Trikala',
                'city' => 'Trikala',
                'latitude' => '39.5559000',
                'longitude' => '21.7659000',
                'year_built' => 1995,
                'area' => 95,
                'price' => 400,
                'floor' => 0,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 2,
                'features' => ['Storage room'],
            ],
            [
                'title_en' => 'Trikala Furnished Fourth-Floor Apartment',
                'title_el' => 'Επιπλωμένο Διαμέρισμα Τέταρτου Ορόφου στα Τρίκαλα',
                'description_en' => 'Furnished fourth-floor apartment with elevator access, air conditioning, balcony, and double-glazed aluminium frames. The bright layout is estimated to provide two bedrooms.',
                'description_el' => 'Επιπλωμένο διαμέρισμα τέταρτου ορόφου με ασανσέρ, κλιματισμό, μπαλκόνι και κουφώματα αλουμινίου με διπλά τζάμια. Η φωτεινή διαρρύθμιση εκτιμάται ότι διαθέτει δύο υπνοδωμάτια.',
                'address' => '31 Innovation Lane, Trikala',
                'city' => 'Trikala',
                'latitude' => '39.5517000',
                'longitude' => '21.7704000',
                'year_built' => 1977,
                'area' => 87,
                'price' => 500,
                'floor' => 4,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 2,
                'features' => ['Elevator', 'Furnished', 'Air Conditioning', 'Balcony'],
            ],
            [
                'title_en' => 'Trikala Furnished Third-Floor Apartment',
                'title_el' => 'Επιπλωμένο Διαμέρισμα Τρίτου Ορόφου στα Τρίκαλα',
                'description_en' => 'Furnished third-floor apartment with elevator access, air conditioning, balcony, and double-glazed aluminium frames. The source notes record a 2022 renovation and short-term availability.',
                'description_el' => 'Επιπλωμένο διαμέρισμα τρίτου ορόφου με ασανσέρ, κλιματισμό, μπαλκόνι και κουφώματα αλουμινίου με διπλά τζάμια. Η πηγή αναφέρει ανακαίνιση το 2022 και δυνατότητα βραχυχρόνιας μίσθωσης.',
                'address' => '7 Oak Garden, Trikala',
                'city' => 'Trikala',
                'latitude' => '39.5602000',
                'longitude' => '21.7598000',
                'year_built' => 1985,
                'area' => 59,
                'price' => 480,
                'floor' => 3,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 1,
                'features' => ['Elevator', 'Furnished', 'Air Conditioning', 'Balcony'],
            ],
            [
                'title_en' => 'Trikala Furnished Fifth-Floor Apartment',
                'title_el' => 'Επιπλωμένο Διαμέρισμα Πέμπτου Ορόφου στα Τρίκαλα',
                'description_en' => 'Furnished fifth-floor apartment with elevator access, a balcony, fireplace, and eastern orientation. It has a compact one-bedroom layout and is also suitable for holiday use.',
                'description_el' => 'Επιπλωμένο διαμέρισμα πέμπτου ορόφου με ασανσέρ, μπαλκόνι, τζάκι και ανατολικό προσανατολισμό. Έχει συμπαγή διαρρύθμιση ενός υπνοδωματίου και είναι επίσης κατάλληλο για χρήση ως εξοχική κατοικία.',
                'address' => '52 Asclepius Street, Trikala',
                'city' => 'Trikala',
                'latitude' => '39.5544000',
                'longitude' => '21.7682000',
                'year_built' => 1990,
                'area' => 58,
                'price' => 460,
                'floor' => 5,
                'bathroom' => 1,
                'living_room' => 1,
                'bedroom' => 1,
                'features' => ['Elevator', 'Furnished', 'Balcony'],
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function houseImageFilenames(int $listingIndex): array
    {
        $directory = $this->houseImageDirectory($listingIndex);

        if (! is_dir($directory)) {
            throw new RuntimeException("Production seed image directory [{$directory}] does not exist.");
        }

        $filenames = collect(new FilesystemIterator($directory, FilesystemIterator::SKIP_DOTS))
            ->filter(
                fn (SplFileInfo $file) => $file->isFile()
                    && in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp'], true),
            )
            ->map(fn (SplFileInfo $file) => $file->getFilename())
            ->sort(fn (string $left, string $right) => strnatcasecmp($left, $right))
            ->values()
            ->all();

        if ($filenames === []) {
            throw new RuntimeException("Production seed image directory [{$directory}] has no supported image files.");
        }

        return $filenames;
    }

    private function houseImageDirectory(int $listingIndex): string
    {
        return database_path('seeders/assets/houses/'.($listingIndex + 1));
    }

    private function seedProfilePicture(User $user, string $filename, UserManagementService $users): void
    {
        $asset = database_path("seeders/assets/profiles/{$filename}");

        if (! is_file($asset)) {
            throw new RuntimeException("Production seed profile image [{$asset}] does not exist.");
        }

        $users->updateProfilePicture(
            $user,
            new UploadedFile($asset, $filename, 'image/png', null, true),
        );
    }

    private function seedImage(House $house, int $listingIndex, string $filename, int $order, ImageCompressionService $images): void
    {
        $asset = $this->houseImageDirectory($listingIndex).DIRECTORY_SEPARATOR.$filename;

        if (! is_file($asset)) {
            throw new RuntimeException("Production seed image [{$asset}] does not exist.");
        }

        $storedImage = $images->store(
            new UploadedFile($asset, $filename, mime_content_type($asset) ?: null, null, true),
            "houses/{$house->id}/images",
        );

        $house->images()->create([
            ...$storedImage,
            'original_name' => $filename,
            'order' => $order,
        ]);
    }
}
