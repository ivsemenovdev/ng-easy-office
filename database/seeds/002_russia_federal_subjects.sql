-- 002_russia_federal_subjects.sql
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
    ('RU-AD', '01000000000', 'Республика Адыгея', 'Адыгея', 'Republic of Adygea', 'republic', 1),
    ('RU-BA', '02000000000', 'Республика Башкортостан', 'Башкортостан', 'Republic of Bashkortostan', 'republic', 2),
    ('RU-BU', '03000000000', 'Республика Бурятия', 'Бурятия', 'Republic of Buryatia', 'republic', 3),
    ('RU-AL', '04000000000', 'Республика Алтай', 'Алтай', 'Altai Republic', 'republic', 4),
    ('RU-DA', '05000000000', 'Республика Дагестан', 'Дагестан', 'Republic of Dagestan', 'republic', 5),
    ('RU-IN', '06000000000', 'Республика Ингушетия', 'Ингушетия', 'Republic of Ingushetia', 'republic', 6),
    ('RU-KB', '07000000000', 'Кабардино-Балкарская Республика', 'Кабардино-Балкария', 'Kabardino-Balkar Republic', 'republic', 7),
    ('RU-KL', '08000000000', 'Республика Калмыкия', 'Калмыкия', 'Republic of Kalmykia', 'republic', 8),
    ('RU-KC', '09000000000', 'Карачаево-Черкесская Республика', 'Карачаево-Черкесия', 'Karachay-Cherkess Republic', 'republic', 9),
    ('RU-KR', '10000000000', 'Республика Карелия', 'Карелия', 'Republic of Karelia', 'republic', 10),
    ('RU-KO', '11000000000', 'Республика Коми', 'Коми', 'Komi Republic', 'republic', 11),
    ('RU-ME', '12000000000', 'Республика Марий Эл', 'Марий Эл', 'Mari El Republic', 'republic', 12),
    ('RU-MO', '13000000000', 'Республика Мордовия', 'Мордовия', 'Republic of Mordovia', 'republic', 13),
    ('RU-SA', '14000000000', 'Республика Саха (Якутия)', 'Якутия', 'Sakha Republic', 'republic', 14),
    ('RU-SE', '15000000000', 'Республика Северная Осетия — Алания', 'Северная Осетия', 'Republic of North Ossetia-Alania', 'republic', 15),
    ('RU-TA', '16000000000', 'Республика Татарстан', 'Татарстан', 'Republic of Tatarstan', 'republic', 16),
    ('RU-TY', '17000000000', 'Республика Тыва', 'Тыва', 'Tyva Republic', 'republic', 17),
    ('RU-UD', '18000000000', 'Удмуртская Республика', 'Удмуртия', 'Udmurt Republic', 'republic', 18),
    ('RU-KK', '19000000000', 'Республика Хакасия', 'Хакасия', 'Republic of Khakassia', 'republic', 19),
    ('RU-CU', '21000000000', 'Чувашская Республика', 'Чувашия', 'Chuvash Republic', 'republic', 21),
    ('RU-ALT', '22000000000', 'Алтайский край', 'Алтайский край', 'Altai Krai', 'krai', 22),
    ('RU-KDA', '23000000000', 'Краснодарский край', 'Краснодарский край', 'Krasnodar Krai', 'krai', 23),
    ('RU-KYA', '24000000000', 'Красноярский край', 'Красноярский край', 'Krasnoyarsk Krai', 'krai', 24),
    ('RU-PRI', '25000000000', 'Приморский край', 'Приморский край', 'Primorsky Krai', 'krai', 25),
    ('RU-STA', '26000000000', 'Ставропольский край', 'Ставропольский край', 'Stavropol Krai', 'krai', 26),
    ('RU-KHA', '27000000000', 'Хабаровский край', 'Хабаровский край', 'Khabarovsk Krai', 'krai', 27),
    ('RU-AMU', '28000000000', 'Амурская область', 'Амурская обл.', 'Amur Oblast', 'oblast', 28),
    ('RU-ARK', '29000000000', 'Архангельская область', 'Архангельская обл.', 'Arkhangelsk Oblast', 'oblast', 29),
    ('RU-AST', '30000000000', 'Астраханская область', 'Астраханская обл.', 'Astrakhan Oblast', 'oblast', 30),
    ('RU-BEL', '31000000000', 'Белгородская область', 'Белгородская обл.', 'Belgorod Oblast', 'oblast', 31),
    ('RU-BRY', '32000000000', 'Брянская область', 'Брянская обл.', 'Bryansk Oblast', 'oblast', 32),
    ('RU-VLA', '33000000000', 'Владимирская область', 'Владимирская обл.', 'Vladimir Oblast', 'oblast', 33),
    ('RU-VGG', '34000000000', 'Волгоградская область', 'Волгоградская обл.', 'Volgograd Oblast', 'oblast', 34),
    ('RU-VLG', '35000000000', 'Вологодская область', 'Вологодская обл.', 'Vologda Oblast', 'oblast', 35),
    ('RU-VOR', '36000000000', 'Воронежская область', 'Воронежская обл.', 'Voronezh Oblast', 'oblast', 36),
    ('RU-IVA', '37000000000', 'Ивановская область', 'Ивановская обл.', 'Ivanovo Oblast', 'oblast', 37),
    ('RU-IRK', '38000000000', 'Иркутская область', 'Иркутская обл.', 'Irkutsk Oblast', 'oblast', 38),
    ('RU-KGD', '39000000000', 'Калининградская область', 'Калининградская обл.', 'Kaliningrad Oblast', 'oblast', 39),
    ('RU-KLU', '40000000000', 'Калужская область', 'Калужская обл.', 'Kaluga Oblast', 'oblast', 40),
    ('RU-KAM', '41000000000', 'Камчатский край', 'Камчатский край', 'Kamchatka Krai', 'krai', 41),
    ('RU-KEM', '42000000000', 'Кемеровская область', 'Кемеровская обл.', 'Kemerovo Oblast', 'oblast', 42),
    ('RU-KIR', '43000000000', 'Кировская область', 'Кировская обл.', 'Kirov Oblast', 'oblast', 43),
    ('RU-KOS', '44000000000', 'Костромская область', 'Костромская обл.', 'Kostroma Oblast', 'oblast', 44),
    ('RU-KGN', '45000000000', 'Курганская область', 'Курганская обл.', 'Kurgan Oblast', 'oblast', 45),
    ('RU-KRS', '46000000000', 'Курская область', 'Курская обл.', 'Kursk Oblast', 'oblast', 46),
    ('RU-LEN', '47000000000', 'Ленинградская область', 'Ленинградская обл.', 'Leningrad Oblast', 'oblast', 47),
    ('RU-LIP', '48000000000', 'Липецкая область', 'Липецкая обл.', 'Lipetsk Oblast', 'oblast', 48),
    ('RU-MAG', '49000000000', 'Магаданская область', 'Магаданская обл.', 'Magadan Oblast', 'oblast', 49),
    ('RU-MOS', '50000000000', 'Московская область', 'Московская обл.', 'Moscow Oblast', 'oblast', 50),
    ('RU-MUR', '51000000000', 'Мурманская область', 'Мурманская обл.', 'Murmansk Oblast', 'oblast', 51),
    ('RU-NIZ', '52000000000', 'Нижегородская область', 'Нижегородская обл.', 'Nizhny Novgorod Oblast', 'oblast', 52),
    ('RU-NGR', '53000000000', 'Новгородская область', 'Новгородская обл.', 'Novgorod Oblast', 'oblast', 53),
    ('RU-NVS', '54000000000', 'Новосибирская область', 'Новосибирская обл.', 'Novosibirsk Oblast', 'oblast', 54),
    ('RU-OMS', '55000000000', 'Омская область', 'Омская обл.', 'Omsk Oblast', 'oblast', 55),
    ('RU-ORE', '56000000000', 'Оренбургская область', 'Оренбургская обл.', 'Orenburg Oblast', 'oblast', 56),
    ('RU-ORL', '57000000000', 'Орловская область', 'Орловская обл.', 'Oryol Oblast', 'oblast', 57),
    ('RU-PNZ', '58000000000', 'Пензенская область', 'Пензенская обл.', 'Penza Oblast', 'oblast', 58),
    ('RU-PER', '59000000000', 'Пермский край', 'Пермский край', 'Perm Krai', 'krai', 59),
    ('RU-PSK', '60000000000', 'Псковская область', 'Псковская обл.', 'Pskov Oblast', 'oblast', 60),
    ('RU-ROS', '61000000000', 'Ростовская область', 'Ростовская обл.', 'Rostov Oblast', 'oblast', 61),
    ('RU-RYA', '62000000000', 'Рязанская область', 'Рязанская обл.', 'Ryazan Oblast', 'oblast', 62),
    ('RU-SAM', '63000000000', 'Самарская область', 'Самарская обл.', 'Samara Oblast', 'oblast', 63),
    ('RU-SAR', '64000000000', 'Саратовская область', 'Саратовская обл.', 'Saratov Oblast', 'oblast', 64),
    ('RU-SAK', '65000000000', 'Сахалинская область', 'Сахалинская обл.', 'Sakhalin Oblast', 'oblast', 65),
    ('RU-SVE', '66000000000', 'Свердловская область', 'Свердловская обл.', 'Sverdlovsk Oblast', 'oblast', 66),
    ('RU-SMO', '67000000000', 'Смоленская область', 'Смоленская обл.', 'Smolensk Oblast', 'oblast', 67),
    ('RU-TAM', '68000000000', 'Тамбовская область', 'Тамбовская обл.', 'Tambov Oblast', 'oblast', 68),
    ('RU-TVE', '69000000000', 'Тверская область', 'Тверская обл.', 'Tver Oblast', 'oblast', 69),
    ('RU-TOM', '70000000000', 'Томская область', 'Томская обл.', 'Tomsk Oblast', 'oblast', 70),
    ('RU-TUL', '71000000000', 'Тульская область', 'Тульская обл.', 'Tula Oblast', 'oblast', 71),
    ('RU-TYU', '72000000000', 'Тюменская область', 'Тюменская обл.', 'Tyumen Oblast', 'oblast', 72),
    ('RU-ULY', '73000000000', 'Ульяновская область', 'Ульяновская обл.', 'Ulyanovsk Oblast', 'oblast', 73),
    ('RU-CHE', '74000000000', 'Челябинская область', 'Челябинская обл.', 'Chelyabinsk Oblast', 'oblast', 74),
    ('RU-ZAB', '75000000000', 'Забайкальский край', 'Забайкальский край', 'Zabaykalsky Krai', 'krai', 75),
    ('RU-YAR', '76000000000', 'Ярославская область', 'Ярославская обл.', 'Yaroslavl Oblast', 'oblast', 76),
    ('RU-MOW', '77000000000', 'г. Москва', 'Москва', 'Moscow', 'federal_city', 77),
    ('RU-SPE', '78000000000', 'г. Санкт-Петербург', 'Санкт-Петербург', 'Saint Petersburg', 'federal_city', 78),
    ('RU-YEV', '79000000000', 'Еврейская автономная область', 'ЕАО', 'Jewish Autonomous Oblast', 'autonomous_oblast', 79),
    ('RU-NEN', '83000000000', 'Ненецкий автономный округ', 'Ненецкий АО', 'Nenets Autonomous Okrug', 'autonomous_okrug', 83),
    ('RU-KHM', '86000000000', 'Ханты-Мансийский автономный округ — Югра', 'ХМАО — Югра', 'Khanty-Mansi Autonomous Okrug', 'autonomous_okrug', 86),
    ('RU-CHU', '87000000000', 'Чукотский автономный округ', 'Чукотка', 'Chukotka Autonomous Okrug', 'autonomous_okrug', 87),
    ('RU-YAN', '89000000000', 'Ямало-Ненецкий автономный округ', 'Ямало-Ненецкий АО', 'Yamalo-Nenets Autonomous Okrug', 'autonomous_okrug', 89),
    ('RU-ZPO', '90000000000', 'Запорожская область', 'Запорожская обл.', 'Zaporizhzhia Oblast', 'oblast', 90),
    ('RU-CR', '91000000000', 'Республика Крым', 'Крым', 'Republic of Crimea', 'republic', 91),
    ('RU-SEV', '92000000000', 'г. Севастополь', 'Севастополь', 'Sevastopol', 'federal_city', 92),
    ('RU-DON', '93000000000', 'Донецкая Народная Республика', 'ДНР', 'Donetsk People''s Republic', 'republic', 93),
    ('RU-LUG', '94000000000', 'Луганская Народная Республика', 'ЛНР', 'Luhansk People''s Republic', 'republic', 94),
    ('RU-CE', '95000000000', 'Чеченская Республика', 'Чечня', 'Chechen Republic', 'republic', 95),
    ('RU-KHE', '96000000000', 'Херсонская область', 'Херсонская обл.', 'Kherson Oblast', 'oblast', 96)
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
