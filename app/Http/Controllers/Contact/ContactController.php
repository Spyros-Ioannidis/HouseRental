<?php

namespace App\Http\Controllers\Contact;

use App\Http\Controllers\Controller;

use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Services\Contact\ContactMessageService;
use App\Services\Settings\SiteSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function create(SiteSettingsService $settings)
    {
        return Inertia::render('Contact', [
            'contactSettings' => $settings->contactSettings(),
        ]);
    }

    public function store(StoreContactMessageRequest $request, ContactMessageService $contacts)
    {
        $contacts->store($request->validated(), $request->user());

        $flash = [
            'message' => __('ui.flash.message_sent'),
            'type' => 'success',
            'flash_id' => now()->getTimestampMs(),
        ];

        if ($request->expectsJson()) {
            return response()->json($flash);
        }

        Inertia::flash($flash);

        return back();
    }

    public function adminIndex(Request $request, ContactMessageService $contacts)
    {
        Gate::authorize('viewAny', ContactMessage::class);

        return Inertia::render('Admin/Other/Contacts', [
            'contacts' => $contacts->paginatedForAdmin($request),
            'filters' => $request->only(['search']),
        ]);
    }

    public function adminShow(Request $request, ContactMessage $contact, ContactMessageService $contacts)
    {
        Gate::authorize('view', $contact);

        $contact->load([
            'user:id,first_name,last_name,email',
            'agent:id,first_name,last_name,email,contact_phone,contact_email',
            'house:id,title,user_id,city,city_id,price,status',
            'house.cityRecord:id,name,name_en,name_el',
        ]);

        $contacts->markRead($contact);

        if ($contact->house) {
            $contact->house->setAttribute('city_label', $contact->house->cityRecord?->localizedName() ?: $contact->house->city);
            $contact->house->setAttribute('city', $contact->house->cityRecord?->name ?: $contact->house->city);
        }

        return Inertia::render('Admin/Other/Contact', [
            'contact' => $contact,
        ]);
    }

    public function destroy(Request $request, ContactMessage $contact)
    {
        Gate::authorize('delete', $contact);

        $contact->delete();

        Inertia::flash([
            'message' => __('ui.flash.contact_deleted'),
            'type' => 'success',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.contacts.index');
    }
}
