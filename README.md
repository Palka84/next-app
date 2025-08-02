# 🗺️ Analizator Opinii Google Maps

Aplikacja do analizy opinii o niskich ocenach (1-2 gwiazdki) z Google Maps. Pozwala wkleić opinie i automatycznie przeanalizować je pod kątem czasu publikacji, liczby polubień i innych statystyk.

## ✨ Funkcje

- 📊 **Analiza opinii 1-2 gwiazdki** - automatyczne filtrowanie opinii o niskich ocenach
- 📅 **Analiza czasowa** - pokazuje ile opinii pochodzi z ostatnich 3-6 miesięcy
- 👍 **Statystyki polubień** - zlicza lajki dla każdej opinii
- 📈 **Wizualizacje** - wykresy i diagramy pokazujące rozkład danych
- 💾 **Export do CSV** - możliwość pobrania wyników analizy
- 🇵🇱 **Polski interfejs** - obsługa polskich nazw miesięcy i formatów dat

## 🚀 Uruchomienie

### Wymagania
- Python 3.8+
- pip

### Instalacja

1. **Sklonuj lub pobierz projekt:**
```bash
git clone <url> # lub pobierz pliki
cd google-maps-analyzer
```

2. **Stwórz środowisko wirtualne:**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# lub
venv\Scripts\activate  # Windows
```

3. **Zainstaluj zależności:**
```bash
pip install -r requirements.txt
```

4. **Uruchom aplikację:**
```bash
streamlit run app.py
```

5. **Otwórz w przeglądarce:**
```
http://localhost:8501
```

## 📋 Jak używać

### 1. Skopiuj opinie z Google Maps
Przejdź do Google Maps, znajdź miejsce z opinii i skopiuj opinie o niskich ocenach.

### 2. Wklej do aplikacji
Wklej skopiowany tekst w pole tekstowe w aplikacji.

### 3. Obsługiwane formaty
Aplikacja rozpoznaje różne formaty:

**Oceny:**
- `1 gwiazdka`, `2 gwiazdki`
- `1 star`, `2 stars`
- `1 ⭐`, `2 ⭐⭐`

**Daty:**
- `15 grudnia 2023`
- `2 miesiące temu`
- `3 tygodnie temu`
- `5 dni temu`
- `15-12-2023`
- `2023-12-15`

**Polubienia:**
- `5 polubień`
- `3 likes`
- `2 👍`
- `polubienia: 7`

### 4. Przykład formatu opinii
```
Jan Kowalski
1 gwiazdka
15 grudnia 2023
Bardzo słaba obsługa, jedzenie zimne...
3 polubienia

Anna Nowak
2 gwiazdki
2 miesiące temu
Czekałam godzinę na zamówienie
1 polubienie
```

## 📊 Co pokazuje analiza

### Główne statystyki
- **Liczba opinii 1-2 ⭐** - całkowita liczba negatywnych opinii
- **Ostatnie 3 miesiące** - ile opinii z ostatnich 3 miesięcy
- **Ostatnie 6 miesięcy** - ile opinii z ostatnich 6 miesięcy
- **Całkowite polubienia** - suma wszystkich lajków

### Szczegółowe analizy
- **Rozkład ocen** - wykres słupkowy 1 vs 2 gwiazdki
- **Analiza polubień** - statystyki i rozkład lajków
- **Analiza czasowa** - wykres liniowy pokazujący trendy w czasie
- **Szczegóły opinii** - tabela z wszystkimi opinii i możliwość eksportu

## 🛠️ Struktura projektu

```
├── app.py              # Główna aplikacja Streamlit
├── requirements.txt    # Zależności Python
└── README.md          # Ten plik
```

## 📦 Zależności

- **streamlit** - interfejs webowy
- **pandas** - analiza danych
- **plotly** - interaktywne wykresy
- **python-dateutil** - parsowanie dat

## 🔧 Rozwój

### Dodanie nowych formatów dat
Edytuj funkcję `parse_date()` w klasie `ReviewAnalyzer` w pliku `app.py`.

### Dodanie nowych języków
Dodaj tłumaczenia nazw miesięcy w słowniku `polish_months` i rozszerz wzorce regex.

### Dodanie nowych metryk
Rozszerz funkcję `analyze_reviews()` o dodatkowe statystyki.

## ⚠️ Uwagi

- Aplikacja działań lokalnie - dane nie są wysyłane do internetu
- Parser jest elastyczny ale może wymagać dostosowania do specyficznych formatów
- Dla lepszych wyników upewnij się, że opinie są w spójnym formacie

## 🐛 Problemy

Jeśli aplikacja nie rozpoznaje opinii:
1. Sprawdź format danych
2. Upewnij się, że każda opinia jest oddzielona pustą linią
3. Sprawdź czy daty i oceny są w obsługiwanym formacie

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT.