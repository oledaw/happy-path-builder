# Happy Path Builder

Narzędzie dla Project Managerów do definiowania i dokumentowania **Happy Path** — optymalnej ścieżki przepływu procesu, w której wszystko przebiega zgodnie z planem, bez błędów i wyjątków.

---

## Czym jest Happy Path?

**Happy Path** (ang. *szczęśliwa ścieżka*) to sekwencja kroków opisująca idealny przebieg procesu — od momentu jego uruchomienia do osiągnięcia wszystkich oczekiwanych rezultatów, przy założeniu, że każdy uczestnik wykonuje swoje zadania poprawnie i w odpowiedniej kolejności.

Happy Path nie opisuje wyjątków, błędów ani alternatywnych ścieżek. Jego celem jest stworzenie wspólnego rozumienia **co powinno się wydarzyć** — zanim zespół zacznie pracować nad tym, co może pójść nie tak.

### Dlaczego Happy Path jest ważny?

- Daje zespołowi **wspólny punkt odniesienia** — każdy wie, jak wygląda sukces
- Stanowi **podstawę do definiowania kryteriów akceptacji** (AC) i przypadków testowych
- Pozwala **wychwycić luki** w procesie zanim zaczną się prace implementacyjne
- Ułatwia **onboarding** nowych członków zespołu
- Służy jako **dokumentacja procesu** zrozumiała dla interesariuszy spoza IT

---

## Kluczowe pojęcia

### Proces

Nazwany, ograniczony zestaw działań prowadzących do konkretnego celu. Każdy proces ma:

- **Cel** — co chcemy osiągnąć
- **Warunek wejścia** — co uruchamia proces (trigger)
- **Sekwencję kroków** — uporządkowane działania
- **Oczekiwane rezultaty** — mierzalne efekty zakończenia procesu

### Aktor

Uczestnik procesu — osoba, rola lub system, który wykonuje konkretne działania. Aktor jest zawsze przypisany do kroku i odpowiada za jego realizację.

Przykłady aktorów: `Klient`, `Sprzedawca`, `Manager`, `System`, `Bramka płatnicza`, `Dział prawny`.

> Jeden krok = jeden aktor. Jeśli krok wymaga działania wielu aktorów jednocześnie, rozbij go na osobne kroki.

### Krok

Pojedyncza, atomowa akcja wykonywana przez jednego aktora. Krok opisuje **co robi aktor** — nie jak to robi technicznie.

Każdy krok zawiera:

| Pole | Opis |
|------|------|
| **Aktor** | Kto wykonuje akcję |
| **Akcja** | Co konkretnie robi (zdanie czynnościowe: „Składa zamówienie", „Zatwierdza fakturę") |
| **Opis** | Szczegóły, kontekst, ograniczenia biznesowe |
| **Rezultaty** | Jakie efekty są oczekiwane po wykonaniu kroku |
| **Status** | Stan realizacji: `do zrobienia` / `w toku` / `gotowe` |

### Rezultat

Mierzalny efekt, który powinien zaistnieć w procesie. Rezultat odpowiada na pytanie: **skąd wiemy, że krok lub proces zakończył się sukcesem?**

Typy rezultatów:

| Typ | Definicja | Przykład |
|-----|-----------|---------|
| **OUTPUT** | Fizyczny lub cyfrowy artefakt, który powstaje | Faktura PDF, spakowana paczka, raport |
| **STAN** | Zmiana statusu obiektu w systemie | Zamówienie → `potwierdzone`, Użytkownik → `zweryfikowany` |
| **AKCJA** | Potwierdzenie wykonania czynności | Dokument podpisany, formularz wypełniony |
| **NOTIF** | Komunikat wysłany do uczestnika procesu | Email z potwierdzeniem, SMS z kodem, powiadomienie push |

> Rezultat powinien być weryfikowalny — ktoś musi być w stanie sprawdzić, czy rzeczywiście nastąpił.

---

## Jak zbudować Happy Path — krok po kroku

### 1. Zdefiniuj kontekst procesu

Zanim zaczniesz dodawać kroki, odpowiedz na trzy pytania:

- **Jaki jest cel procesu?** — Co chcemy osiągnąć dla klienta / firmy / systemu?
- **Co uruchamia proces?** — Jaki event lub akcja jest punktem startowym?
- **Gdzie kończy się proces?** — Jaki stan oznacza jego zakończenie?

Wypełnij pola *Nazwa procesu*, *Cel procesu* i *Warunki wejścia* w panelu bocznym.

### 2. Zidentyfikuj aktorów

Wypisz wszystkich uczestników procesu — zarówno ludzi, jak i systemy. Przypisz każdemu aktorowi unikalny kolor, który będzie widoczny na diagramie swim lane.

**Wskazówki:**
- Używaj nazw ról, nie imion (`Kierownik działu`, nie `Anna Kowalska`)
- Systemy traktuj jako aktorów (`System ERP`, `Bramka SMS`, `API płatności`)
- Staraj się mieć 2–6 aktorów — zbyt duża liczba utrudnia czytelność

### 3. Zdefiniuj oczekiwane rezultaty

Przed opisaniem kroków warto wiedzieć, **do czego dążymy**. Dodaj wszystkie rezultaty, które powinny zaistnieć w wyniku procesu. Każdy rezultat powinien być:

- **Konkretny** — „Email z numerem zamówienia wysłany do klienta", nie „Klient poinformowany"
- **Weryfikowalny** — da się sprawdzić, czy nastąpił
- **Przypisany do odpowiedniego typu** (OUTPUT / STAN / AKCJA / NOTIF)

### 4. Buduj sekwencję kroków

Dodawaj kroki w kolejności ich naturalnego występowania. Dla każdego kroku:

1. Wybierz aktora z listy (kliknij badge z nazwą aktora)
2. Wpisz akcję w formie zdania czynnościowego (kto + co robi)
3. Dodaj opis z kontekstem biznesowym i ewentualnymi warunkami
4. Powiąż krok z rezultatami, które powinny po nim nastąpić

**Użyj drag & drop** lub przycisków ↑ ↓ do zmiany kolejności kroków.

### 5. Zweryfikuj kompletność

Po zbudowaniu sekwencji przejdź do widoku **Swim Lane** i sprawdź:

- Czy każdy aktor ma przypisane właściwe kroki?
- Czy nie ma luk — momentów, w których nikt nic nie robi, a proces powinien trwać?
- Czy każdy rezultat jest powiązany z co najmniej jednym krokiem?
- Czy wskaźnik *Kompletność* w pasku statystyk wynosi 100%?

### 6. Eksportuj i udostępnij

Narzędzie oferuje dwa formaty eksportu:

- **Markdown** (zakładka *Eksport*) — gotowy do wklejenia w Confluence, Notion, GitHub Wiki
- **JSON** (przycisk *↓ JSON*) — do importu w innej sesji lub udostępnienia zespołowi

---

## Widoki

### Sekwencja (domyślny)

Chronologiczna lista kroków z numeracją, połączona strzałkami. Pokazuje pełen kontekst każdego kroku: aktora, opis, powiązane rezultaty i status.

### Swim Lane

Macierz aktorów i kroków — każda kolumna to jeden aktor, każdy wiersz to jeden krok. Pozwala szybko zobaczyć, kto jest odpowiedzialny za co i czy obciążenie aktorów jest równomierne.

### Eksport

Podgląd dokumentacji procesu w formacie Markdown. Zawiera metadane projektu, pełną sekwencję kroków z opisami i zbiorczą listę wszystkich rezultatów.

---

## Zarządzanie projektami

Narzędzie obsługuje wiele procesów jednocześnie. Każdy projekt jest automatycznie zapisywany w przeglądarce (localStorage) po każdej zmianie.

| Funkcja | Opis |
|---------|------|
| **Autosave** | Zapis następuje automatycznie 1.2s po ostatniej zmianie |
| **Projekty ▾** | Lista wszystkich zapisanych procesów z datą edycji |
| **Nowy projekt** | Tworzy pusty projekt, poprzedni jest zachowany |
| **↓ JSON** | Eksport projektu do pliku `.json` |
| **↑ Import** | Wczytanie projektu z pliku `.json` |

> Dane przechowywane są lokalnie w przeglądarce. Aby przenieść projekt na inną maszynę lub udostępnić go współpracownikowi, użyj eksportu do JSON.

---

## Dobre praktyki

**Pisz akcje z perspektywy aktora.** Zamiast „Weryfikacja danych klienta" napisz „System weryfikuje dane klienta". Podmiot zawsze jest jawny.

**Jeden krok = jedna decyzja lub jedna akcja.** Jeśli krok zawiera słowo „i" lub „oraz", rozważ jego podział.

**Happy Path nie zawiera warunków.** Słowa „jeśli", „w przypadku gdy", „o ile" sugerują, że opisujesz alternatywną ścieżkę lub wyjątek — to materiał na osobny dokument.

**Rezultaty są zobowiązaniem.** Jeśli rezultat jest powiązany z krokiem, zespół powinien być w stanie napisać test sprawdzający, czy rezultat nastąpił.

**Zacznij od końca.** Czasem łatwiej jest zdefiniować najpierw wszystkie oczekiwane rezultaty, a potem cofnąć się i zapytać: „Co musi się wydarzyć, żeby ten rezultat zaistniał?"

---

## Format pliku JSON

```json
{
  "version": "1.0",
  "exportedAt": "2026-05-08T12:00:00.000Z",
  "meta": {
    "name": "Nazwa procesu",
    "goal": "Cel procesu",
    "trigger": "Warunek wejścia"
  },
  "actors": [
    { "id": "a1", "name": "Klient", "color": "#f25e8a" }
  ],
  "results": [
    { "id": "r1", "name": "Zamówienie złożone", "desc": "Opis kryterium", "type": "state" }
  ],
  "steps": [
    {
      "id": "s1",
      "actor": "a1",
      "action": "Składa zamówienie",
      "desc": "Szczegóły kroku",
      "results": ["r1"],
      "status": "done"
    }
  ]
}
```

Typy rezultatów w JSON: `output` | `state` | `action` | `notification`

Statusy kroków w JSON: `todo` | `in-progress` | `done`

---

*Happy Path Builder · narzędzie PM · v1.0*
