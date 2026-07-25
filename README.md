# Εγκατάσταση Εφαρμογής

## Προαπαιτούμενα

Πριν από τη λήψη και την εγκατάσταση της εφαρμογής, απαιτείται η εγκατάσταση των παρακάτω εργαλείων:

| Λογισμικό | Έκδοση / σύνδεσμος λήψης |
|---|---|
| **Git** | Απαιτείται για τη λήψη του έργου από το αποθετήριο. Λήψη από την [επίσημη ιστοσελίδα του Git](https://git-scm.com/downloads). |
| **PHP** | Έκδοση **8.2 ή νεότερη**. Λήψη από την [επίσημη ιστοσελίδα της PHP](https://www.php.net/downloads.php). |
| **Composer** | Λήψη από την [επίσημη ιστοσελίδα του Composer](https://getcomposer.org/download/). |
| **Node.js και NPM** | Λήψη της έκδοσης **LTS** από την [επίσημη ιστοσελίδα του Node.js](https://nodejs.org/). Το NPM εγκαθίσταται μαζί με το Node.js. |
| **MySQL** | Εκδοση 8.4.10 LTS. Λήψη του από την  [επίσημη ιστοσελιδα του MySQL](https://dev.mysql.com/downloads/mysql/). |
| **WampServer** *(προαιρετικά για Windows)* | Περιλαμβάνει Apache, PHP και MySQL/MariaDB. Λήψη από την [επίσημη ιστοσελίδα του WampServer](https://www.wampserver.com/). |

> Σε εγκατάσταση Windows με WampServer δεν είναι απαραίτητη η ξεχωριστή εγκατάσταση PHP, MySQL και Apache, εφόσον οι εκδόσεις που περιλαμβάνει είναι συμβατές με την εφαρμογή.

---

## Λήψη και εγκατάσταση της εφαρμογής

Ανοίξτε ένα terminal και εκτελέστε:

```bash
git clone https://github.com/Spyros-Ioannidis/HouseRental
cd HouseRental
```

Από τον φάκελο `HouseRental`, εγκαταστήστε τα backend και frontend dependencies:

```bash
composer install
npm install
```



Δημιουργήστε το αρχείο .env από το .env.example.

Η εντολή εξαρτάται από το terminal που χρησιμοποιείται.
Windows Command Prompt

```bash
copy .env.example .env
```

Windows PowerShell

```bash
Copy-Item .env.example .env
```

macOS, Linux ή Git Bash

```bash
cp .env.example .env
```


Στη συνέχεια, εκτελέστε:

```bash
php artisan key:generate
php artisan storage:link
```

Ο MySQL server πρέπει να εκτελείται πριν από την εκτέλεση της παρακάτω εντολής:

```bash
php artisan migrate:fresh --seed --seeder=ProductionSeeder
```

Δημιουργήστε τα αρχεία του frontend για παραγωγή:

```bash
npm run build
```

Για την εκκίνηση της εφαρμογής, εκτελέστε:

```bash
php artisan serve
```

Η εφαρμογή θα είναι διαθέσιμη στη διεύθυνση:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

### Επαναφορά βάσης δεδομένων

Για πλήρη επαναφορά της βάσης δεδομένων στην αρχική της κατάσταση, μπορεί να χρησιμοποιηθεί η εντολή:

```bash
php artisan migrate:fresh --seed --seeder=ProductionSeeder
```

> **Προσοχή:** Η εντολή `migrate:fresh` διαγράφει όλους τους υπάρχοντες πίνακες και τα δεδομένα της βάσης πριν εκτελέσει ξανά τα migrations και τα seeders.

---

## Ρύθμιση του Mailpit

Το Mailpit χρησιμοποιείται στο περιβάλλον ανάπτυξης για τη δοκιμή της αποστολής email.

Λειτουργεί ως τοπικός SMTP server και αποθηκεύει τα εξερχόμενα email, ώστε να μπορούν να προβληθούν μέσω web περιβάλλοντος χωρίς να αποστέλλονται σε πραγματικούς παραλήπτες.

Κατεβάστε και εγκαταστήστε το Mailpit ακολουθώντας τις οδηγίες που παρέχονται στην [επίσημη ιστοσελίδα εγκατάστασης του Mailpit](https://mailpit.axllent.org/docs/install/).

Μετά την εγκατάσταση, ανοίξτε ένα νέο terminal στον φάκελο που είναι εγκατεστημένο και εκτελέστε:

```bash
mailpit
```

Εάν η εφαρμογή είχε ήδη εκκινηθεί πριν από την αλλαγή του αρχείου `.env`, εκτελέστε:

```bash
php artisan config:clear
```

Το περιβάλλον διαχείρισης του Mailpit είναι διαθέσιμο στη διεύθυνση:

[http://127.0.0.1:8025](http://127.0.0.1:8025)

Όλα τα email που αποστέλλονται από την εφαρμογή κατά την τοπική ανάπτυξη θα εμφανίζονται σε αυτή τη διεύθυνση.

>  Το Mailpit πρέπει να εκτελείται σε ξεχωριστό terminal για όσο διάστημα λειτουργεί η εφαρμογή.
