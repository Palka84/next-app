# 🌟 Analizator Opinii Google Maps

Aplikacja webowa do analizy negatywnych opinii (1-2 gwiazdki) z Google Maps.

## ✨ Funkcje

- **Analiza opinii**: Automatyczne rozpoznawanie opinii 1-2 gwiazdki
- **Analiza czasowa**: Podział opinii na okresy (ostatnie 7 dni, 30 dni, 3 miesiące, 6 miesięcy, rok)
- **Analiza polubień**: Statystyki dotyczące liczby polubień każdej opinii
- **Intuicyjny interfejs**: Nowoczesny, responsywny design

## 🚀 Jak użyć

1. Otwórz plik `index.html` w przeglądarce
2. Wklej opinie z Google Maps do pola tekstowego
3. Kliknij "Analizuj Opinie" lub użyj Ctrl+Enter
4. Zobacz szczegółowe statystyki

## 📝 Obsługiwane formaty

### Gwiazdki
- Symbole: ⭐, ★
- Tekst: "1 gwiazdka", "2 gwiazdki", "1/5", "2/5"

### Daty
- Relatywne: "2 tygodnie temu", "1 miesiąc temu", "3 miesiące temu"
- Bezwzględne: "2024-01-15", "15.01.2024"
- Specjalne: "dziś", "wczoraj"

### Polubienia
- Emoji: 👍 5
- Tekst: "5 polubień", "Pomocne: 5"

## 📊 Przykład danych wejściowych

```
Jan Kowalski
⭐ (1 gwiazdka)
2 tygodnie temu
Bardzo słaba obsługa. Czekałem godzinę na zamówienie.
👍 5

Anna Nowak
⭐⭐ (2 gwiazdki)  
1 miesiąc temu
Jedzenie w porządku, ale długie oczekiwanie i brudne stoliki.
👍 12

Piotr Wiśniewski
⭐
3 miesiące temu
Nie polecam. Zimne jedzenie i nieprzyjemna obsługa.
👍 8
```

## 🔧 Struktura plików

```
├── index.html      # Główny interfejs aplikacji
├── analyzer.js     # Logika analizowania opinii
└── README.md       # Ta instrukcja
```

## 💡 Wskazówki

- **Kopiowanie opinii**: Najlepiej kopiować opinie bezpośrednio z Google Maps
- **Format danych**: Aplikacja automatycznie rozpoznaje różne formaty dat i gwiazdek
- **Wydajność**: Może analizować setki opinii jednocześnie
- **Responsywność**: Działa na telefonach, tabletach i komputerach

## 🎯 Wyniki analizy

Aplikacja pokazuje:

### Statystyki główne
- Łączna liczba negatywnych opinii
- Podział na opinie 1 i 2 gwiazdki
- Łączna liczba polubień

### Analiza czasowa
- Opinie z ostatnich 7 dni
- Opinie z ostatnich 30 dni
- Opinie z ostatnich 3 miesięcy
- Opinie z ostatnich 6 miesięcy
- Opinie z ostatniego roku
- Starsze opinie

### Analiza polubień
- Średnia liczba polubień
- Liczba opinii z polubieniami vs bez
- Najbardziej polubiona opinia
- Rozkład polubień (0, 1-5, 6-15, 16+)

## 🌐 Kompatybilność

- Wszystkie nowoczesne przeglądarki
- Nie wymaga połączenia z internetem
- Działa lokalnie bez serwera