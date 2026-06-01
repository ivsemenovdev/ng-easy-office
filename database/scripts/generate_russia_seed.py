#!/usr/bin/env python3
"""Generate database/seeds/002_russia_federal_subjects.sql from embedded subject list."""

from __future__ import annotations

from pathlib import Path

# (code, fns_sort, region_type, name_ru, name_short_ru, name_en)
# 83 subjects: ISO 3166-2:RU. Six more: internal codes (see seed file header).
SUBJECTS: list[tuple[str, int, str, str, str, str]] = [
    ("RU-AD", 1, "republic", "Республика Адыгея", "Адыгея", "Republic of Adygea"),
    ("RU-BA", 2, "republic", "Республика Башкортостан", "Башкортостан", "Republic of Bashkortostan"),
    ("RU-BU", 3, "republic", "Республика Бурятия", "Бурятия", "Republic of Buryatia"),
    ("RU-AL", 4, "republic", "Республика Алтай", "Алтай", "Altai Republic"),
    ("RU-DA", 5, "republic", "Республика Дагестан", "Дагестан", "Republic of Dagestan"),
    ("RU-IN", 6, "republic", "Республика Ингушетия", "Ингушетия", "Republic of Ingushetia"),
    ("RU-KB", 7, "republic", "Кабардино-Балкарская Республика", "Кабардино-Балкария", "Kabardino-Balkar Republic"),
    ("RU-KL", 8, "republic", "Республика Калмыкия", "Калмыкия", "Republic of Kalmykia"),
    ("RU-KC", 9, "republic", "Карачаево-Черкесская Республика", "Карачаево-Черкесия", "Karachay-Cherkess Republic"),
    ("RU-KR", 10, "republic", "Республика Карелия", "Карелия", "Republic of Karelia"),
    ("RU-KO", 11, "republic", "Республика Коми", "Коми", "Komi Republic"),
    ("RU-ME", 12, "republic", "Республика Марий Эл", "Марий Эл", "Mari El Republic"),
    ("RU-MO", 13, "republic", "Республика Мордовия", "Мордовия", "Republic of Mordovia"),
    ("RU-SA", 14, "republic", "Республика Саха (Якутия)", "Якутия", "Sakha Republic"),
    ("RU-SE", 15, "republic", "Республика Северная Осетия — Алания", "Северная Осетия", "Republic of North Ossetia-Alania"),
    ("RU-TA", 16, "republic", "Республика Татарстан", "Татарстан", "Republic of Tatarstan"),
    ("RU-TY", 17, "republic", "Республика Тыва", "Тыва", "Tyva Republic"),
    ("RU-UD", 18, "republic", "Удмуртская Республика", "Удмуртия", "Udmurt Republic"),
    ("RU-KK", 19, "republic", "Республика Хакасия", "Хакасия", "Republic of Khakassia"),
    ("RU-CE", 95, "republic", "Чеченская Республика", "Чечня", "Chechen Republic"),
    ("RU-CU", 21, "republic", "Чувашская Республика", "Чувашия", "Chuvash Republic"),
    ("RU-ALT", 22, "krai", "Алтайский край", "Алтайский край", "Altai Krai"),
    ("RU-KDA", 23, "krai", "Краснодарский край", "Краснодарский край", "Krasnodar Krai"),
    ("RU-KYA", 24, "krai", "Красноярский край", "Красноярский край", "Krasnoyarsk Krai"),
    ("RU-PRI", 25, "krai", "Приморский край", "Приморский край", "Primorsky Krai"),
    ("RU-STA", 26, "krai", "Ставропольский край", "Ставропольский край", "Stavropol Krai"),
    ("RU-KHA", 27, "krai", "Хабаровский край", "Хабаровский край", "Khabarovsk Krai"),
    ("RU-AMU", 28, "oblast", "Амурская область", "Амурская обл.", "Amur Oblast"),
    ("RU-ARK", 29, "oblast", "Архангельская область", "Архангельская обл.", "Arkhangelsk Oblast"),
    ("RU-AST", 30, "oblast", "Астраханская область", "Астраханская обл.", "Astrakhan Oblast"),
    ("RU-BEL", 31, "oblast", "Белгородская область", "Белгородская обл.", "Belgorod Oblast"),
    ("RU-BRY", 32, "oblast", "Брянская область", "Брянская обл.", "Bryansk Oblast"),
    ("RU-VLA", 33, "oblast", "Владимирская область", "Владимирская обл.", "Vladimir Oblast"),
    ("RU-VLG", 35, "oblast", "Вологодская область", "Вологодская обл.", "Vologda Oblast"),
    ("RU-VGG", 34, "oblast", "Волгоградская область", "Волгоградская обл.", "Volgograd Oblast"),
    ("RU-VOR", 36, "oblast", "Воронежская область", "Воронежская обл.", "Voronezh Oblast"),
    ("RU-IVA", 37, "oblast", "Ивановская область", "Ивановская обл.", "Ivanovo Oblast"),
    ("RU-IRK", 38, "oblast", "Иркутская область", "Иркутская обл.", "Irkutsk Oblast"),
    ("RU-KGD", 39, "oblast", "Калининградская область", "Калининградская обл.", "Kaliningrad Oblast"),
    ("RU-KLU", 40, "oblast", "Калужская область", "Калужская обл.", "Kaluga Oblast"),
    ("RU-KAM", 41, "krai", "Камчатский край", "Камчатский край", "Kamchatka Krai"),
    ("RU-KEM", 42, "oblast", "Кемеровская область", "Кемеровская обл.", "Kemerovo Oblast"),
    ("RU-KIR", 43, "oblast", "Кировская область", "Кировская обл.", "Kirov Oblast"),
    ("RU-KOS", 44, "oblast", "Костромская область", "Костромская обл.", "Kostroma Oblast"),
    ("RU-KGN", 45, "oblast", "Курганская область", "Курганская обл.", "Kurgan Oblast"),
    ("RU-KRS", 46, "oblast", "Курская область", "Курская обл.", "Kursk Oblast"),
    ("RU-LEN", 47, "oblast", "Ленинградская область", "Ленинградская обл.", "Leningrad Oblast"),
    ("RU-LIP", 48, "oblast", "Липецкая область", "Липецкая обл.", "Lipetsk Oblast"),
    ("RU-MAG", 49, "oblast", "Магаданская область", "Магаданская обл.", "Magadan Oblast"),
    ("RU-MOS", 50, "oblast", "Московская область", "Московская обл.", "Moscow Oblast"),
    ("RU-MUR", 51, "oblast", "Мурманская область", "Мурманская обл.", "Murmansk Oblast"),
    ("RU-NIZ", 52, "oblast", "Нижегородская область", "Нижегородская обл.", "Nizhny Novgorod Oblast"),
    ("RU-NGR", 53, "oblast", "Новгородская область", "Новгородская обл.", "Novgorod Oblast"),
    ("RU-NVS", 54, "oblast", "Новосибирская область", "Новосибирская обл.", "Novosibirsk Oblast"),
    ("RU-OMS", 55, "oblast", "Омская область", "Омская обл.", "Omsk Oblast"),
    ("RU-ORE", 56, "oblast", "Оренбургская область", "Оренбургская обл.", "Orenburg Oblast"),
    ("RU-ORL", 57, "oblast", "Орловская область", "Орловская обл.", "Oryol Oblast"),
    ("RU-PNZ", 58, "oblast", "Пензенская область", "Пензенская обл.", "Penza Oblast"),
    ("RU-PER", 59, "krai", "Пермский край", "Пермский край", "Perm Krai"),
    ("RU-PSK", 60, "oblast", "Псковская область", "Псковская обл.", "Pskov Oblast"),
    ("RU-ROS", 61, "oblast", "Ростовская область", "Ростовская обл.", "Rostov Oblast"),
    ("RU-RYA", 62, "oblast", "Рязанская область", "Рязанская обл.", "Ryazan Oblast"),
    ("RU-SAM", 63, "oblast", "Самарская область", "Самарская обл.", "Samara Oblast"),
    ("RU-SAR", 64, "oblast", "Саратовская область", "Саратовская обл.", "Saratov Oblast"),
    ("RU-SAK", 65, "oblast", "Сахалинская область", "Сахалинская обл.", "Sakhalin Oblast"),
    ("RU-SVE", 66, "oblast", "Свердловская область", "Свердловская обл.", "Sverdlovsk Oblast"),
    ("RU-SMO", 67, "oblast", "Смоленская область", "Смоленская обл.", "Smolensk Oblast"),
    ("RU-TAM", 68, "oblast", "Тамбовская область", "Тамбовская обл.", "Tambov Oblast"),
    ("RU-TVE", 69, "oblast", "Тверская область", "Тверская обл.", "Tver Oblast"),
    ("RU-TOM", 70, "oblast", "Томская область", "Томская обл.", "Tomsk Oblast"),
    ("RU-TUL", 71, "oblast", "Тульская область", "Тульская обл.", "Tula Oblast"),
    ("RU-TYU", 72, "oblast", "Тюменская область", "Тюменская обл.", "Tyumen Oblast"),
    ("RU-ULY", 73, "oblast", "Ульяновская область", "Ульяновская обл.", "Ulyanovsk Oblast"),
    ("RU-CHE", 74, "oblast", "Челябинская область", "Челябинская обл.", "Chelyabinsk Oblast"),
    ("RU-ZAB", 75, "krai", "Забайкальский край", "Забайкальский край", "Zabaykalsky Krai"),
    ("RU-YAR", 76, "oblast", "Ярославская область", "Ярославская обл.", "Yaroslavl Oblast"),
    ("RU-MOW", 77, "federal_city", "г. Москва", "Москва", "Moscow"),
    ("RU-SPE", 78, "federal_city", "г. Санкт-Петербург", "Санкт-Петербург", "Saint Petersburg"),
    ("RU-YEV", 79, "autonomous_oblast", "Еврейская автономная область", "ЕАО", "Jewish Autonomous Oblast"),
    ("RU-NEN", 83, "autonomous_okrug", "Ненецкий автономный округ", "Ненецкий АО", "Nenets Autonomous Okrug"),
    ("RU-KHM", 86, "autonomous_okrug", "Ханты-Мансийский автономный округ — Югра", "ХМАО — Югра", "Khanty-Mansi Autonomous Okrug"),
    ("RU-CHU", 87, "autonomous_okrug", "Чукотский автономный округ", "Чукотка", "Chukotka Autonomous Okrug"),
    ("RU-YAN", 89, "autonomous_okrug", "Ямало-Ненецкий автономный округ", "Ямало-Ненецкий АО", "Yamalo-Nenets Autonomous Okrug"),
    # Not in ISO 3166-2:RU (internal codes; Russian Federation constitutional list)
    ("RU-ZPO", 90, "oblast", "Запорожская область", "Запорожская обл.", "Zaporizhzhia Oblast"),
    ("RU-CR", 91, "republic", "Республика Крым", "Крым", "Republic of Crimea"),
    ("RU-SEV", 92, "federal_city", "г. Севастополь", "Севастополь", "Sevastopol"),
    ("RU-DON", 93, "republic", "Донецкая Народная Республика", "ДНР", "Donetsk People's Republic"),
    ("RU-LUG", 94, "republic", "Луганская Народная Республика", "ЛНР", "Luhansk People's Republic"),
    ("RU-KHE", 96, "oblast", "Херсонская область", "Херсонская обл.", "Kherson Oblast"),
]


def okato(fns_code: int) -> str:
    return f"{fns_code:02d}000000000"


def esc(value: str) -> str:
    return value.replace("'", "''")


def main() -> None:
    if len(SUBJECTS) != 89:
        raise SystemExit(f"Expected 89 subjects, got {len(SUBJECTS)}")

    codes = [s[0] for s in SUBJECTS]
    if len(codes) != len(set(codes)):
        raise SystemExit("Duplicate region codes")

    root = Path(__file__).resolve().parents[2]
    out_path = root / "database" / "seeds" / "002_russia_federal_subjects.sql"

    subjects = sorted(SUBJECTS, key=lambda s: (s[1], s[0]))
    value_lines = []
    for code, fns, region_type, name_ru, name_short, name_en in subjects:
        value_lines.append(
            f"    ('{code}', '{okato(fns)}', '{esc(name_ru)}', '{esc(name_short)}', "
            f"'{esc(name_en)}', '{region_type}', {fns})"
        )

    values_block = ",\n".join(value_lines)
    sql = f"""-- 002_russia_federal_subjects.sql
-- Сиды: Россия + 89 субъектов РФ (83 по ISO 3166-2:RU + 6 вне ISO)
-- Спецификация: docs/ai/database-regions.md
-- Сгенерировано: database/scripts/generate_russia_seed.py
--
-- Вне ISO 3166-2:RU (внутренние коды): RU-CR, RU-SEV, RU-DON, RU-LUG, RU-ZPO, RU-KHE
-- sort_order / okato: код субъекта по классификатору ФНС/ГИБДД (двузначный префикс ОКАТО)

BEGIN;

INSERT INTO geo_countries (iso_alpha2, iso_alpha3, name_ru, name_en)
VALUES ('RU', 'RUS', 'Россия', 'Russian Federation')
ON CONFLICT (iso_alpha2) DO NOTHING;

INSERT INTO geo_regions (
    country_id, parent_id, level, code, okato,
    name_ru, name_short_ru, name_en, region_type, sort_order
)
SELECT
    c.id,
    NULL,
    'federal_subject'::geo_region_level,
    v.code,
    v.okato,
    v.name_ru,
    v.name_short_ru,
    v.name_en,
    v.region_type,
    v.sort_order
FROM geo_countries c
CROSS JOIN (VALUES
{values_block}
) AS v(code, okato, name_ru, name_short_ru, name_en, region_type, sort_order)
WHERE c.iso_alpha2 = 'RU'
ON CONFLICT (country_id, code) DO UPDATE SET
    okato = EXCLUDED.okato,
    name_ru = EXCLUDED.name_ru,
    name_short_ru = EXCLUDED.name_short_ru,
    name_en = EXCLUDED.name_en,
    region_type = EXCLUDED.region_type,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

COMMIT;
"""

    out_path.write_text(sql, encoding="utf-8")
    print(f"Wrote {out_path} ({len(subjects)} regions)")


if __name__ == "__main__":
    main()
