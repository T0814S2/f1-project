# F1 Project

Projekt aplikacji do analizy historycznych danych Formuły 1.

## Opis
Aplikacja służy do wizualizacji wyników kierowców, zespołów oraz torów na podstawie danych F1. Projekt opiera się na własnej bazie danych MySQL.

## Status projektu
Projekt jest w fazie aktywnej rozbudowy. Obecnie pracuję nad optymalizacją struktury bazy danych oraz rozwojem funkcji analitycznych. W przyszłości planuję rozbudować projekt o szczegółowe profile dla każdego z kierowców, zespołów oraz torów w historii Formuły 1.

## Wymagania
- XAMPP (Apache + MySQL)
- PHP 8.0+
- Przeglądarka internetowa

## Instalacja
1. Sklonuj repozytorium: `git clone https://github.com/T0814S2/f1-project.git`
2. Uruchom XAMPP (Apache i MySQL).
3. Wejdź na `http://localhost/phpmyadmin/`.
4. Utwórz bazę danych o nazwie `f1_db`.
5. Wybierz bazę i kliknij zakładkę "Importuj".
6. Wskaż plik `database.sql` z folderu projektu i zaimportuj go.

## Struktura bazy danych
Projekt wykorzystuje relacyjne tabele:
- `drivers`: Dane kierowców.
- `teams`: Zespoły F1.
- `races`: Harmonogram wyścigów.
- `race_results`: Szczegółowe wyniki wyścigów.
- `driver_season_stats`: Statystyki sezonowe.

---
*Projekt stworzony w celach edukacyjnych i analitycznych.*