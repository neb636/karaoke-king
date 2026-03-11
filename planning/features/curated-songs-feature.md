# Feature Request: Curated Song Library with Spotify Playback, Scoring & Coaching

## Summary

We are evolving our karaoke app from a freeform-only experience into a **guided, scoreable karaoke platform**. The app currently requires users to play a song in the background and sing over it, capturing the combined audio as a single input. While we will continue to support this freeform mode, the **new default experience** will be a curated library of 25 regionally-selected songs per market, played via the **Spotify API** using the user's own Spotify account.

This is a **free, non-commercial app** — the open-source-library equivalent for karaoke. We do not monetize and have no plans to. Users must sign in with their Spotify account (Premium required for full playback) to use Curated mode.

### Spotify Integration Philosophy

We use the Spotify API **strictly as intended — playback only, no audio stream analysis, no content extraction.** Spotify acts purely as a jukebox: we tell it which track to play, and it plays it. We never touch, intercept, process, or analyze Spotify's audio stream in any way. All vocal analysis is performed exclusively on the user's microphone input, compared against pre-built reference data we generate independently and store locally. This keeps us cleanly within Spotify's developer terms of service.

This curated approach unlocks two major capabilities that freeform cannot support:

1. **Vocal Scoring** — Because we know which song is playing, we can compare the user's live microphone input against a **pre-built reference pitch map** (generated offline, independently of Spotify) to score pitch accuracy, timing, and performance. We never analyze Spotify's audio output — only the user's mic.
2. **Contextual Coaching Prompts** — Because we know the structure of each song ahead of time (intro, verse, chorus, bridge, instrumental break, outro), we can inject companion cues like "Get ready...", "Sing louder!", "Hold that note!", or "Instrumental — take a breath" at exactly the right moments during vocal and non-vocal sections. These cues are timed against our own pre-built song structure map, not derived from Spotify's stream.

> **Note:** Synchronized lyrics display is **out of scope for v1**. Lyrics licensing is a separate and complex rights issue that we will revisit in a future release. For now, users are expected to know the words or reference lyrics on their own.

---

## Architecture Overview

### Spotify Authentication & Playback

- Users must sign in with their Spotify account via OAuth 2.0 (Spotify's standard authorization flow)
- Curated mode requires Spotify Premium for on-demand track playback
- Free-tier Spotify users are informed of the requirement and directed to Freeform mode as an alternative
- The app uses the Spotify Web API / SDK to control playback (play, pause, seek) — we never stream, download, cache, or process the audio ourselves
- Each curated song is mapped to its Spotify track URI (e.g., `spotify:track:5ChkMS8OtDnJGX8PNjWn6Q`) so we can programmatically trigger playback of the exact correct version

### Dual Mode System

The app should support two modes, selectable by the user:

**Curated Mode (Default)**
- User selects from the 25-song regional library
- App triggers Spotify playback of the selected track via their API
- Coaching prompts appear contextually based on our pre-built song structure map
- User's microphone input is captured and scored against our pre-built reference pitch data
- No Spotify audio is analyzed, intercepted, or processed in any way

**Freeform Mode (Legacy)**
- User plays any song from an external source (Spotify, YouTube, phone speakers, etc.)
- App captures combined audio (backing + vocals) as a single input
- No coaching prompts, no scoring
- No Spotify integration required — works without a Spotify account
- Preserved for users who want to sing songs outside the curated library

### Per-Song Pre-Processing Requirements

For each curated song, the following data must be generated **independently and offline** (not derived from Spotify's stream) and stored as part of the app's bundled data:

- **Reference vocal pitch map** — Note-by-note pitch data (fundamental frequency over time) generated from an independent analysis of the song's vocal line. This is what the user's mic input is scored against.
- **Timing/rhythm map** — Beat grid, BPM, and rhythmic structure of the song
- **Vocal section boundaries** — Start/end timestamps for every vocal phrase, distinguishing verse, chorus, bridge, ad-libs, and harmony sections
- **Non-vocal section boundaries** — Intros, outros, instrumental breaks, and interludes
- **Coaching cue insertion points** — Pre-defined moments for contextual prompts (e.g., "Here comes the chorus!", "Belt it out!", "Instrumental break — rest up"), timed to our own structure map
- **Difficulty metadata** — Vocal range required (lowest/highest note), tempo, presence of runs/melisma, key changes, and an overall difficulty rating (Easy / Medium / Hard / Expert)
- **Spotify track URI** — The exact Spotify track ID for the canonical version of the song we've built our reference data against. If Spotify has multiple versions (remastered, live, deluxe), we pin to one specific version to ensure our timing data stays in sync with playback

> **Important:** All reference data is generated from our own offline analysis process. None of it is extracted from Spotify at runtime. Spotify is only used for playback.

---

## Regional Song Libraries

The app will launch with **7 regional libraries**, each containing **25 songs**. Songs are selected for maximum broad appeal across age groups, demographics, vocal skill levels, and cultural significance within each region. Some songs appear in multiple regions where they hold equal cultural relevance.

---

### Region 1: United States

The US library prioritizes universal singability, generational breadth (Boomers through Gen Z), racial and cultural diversity, energy range (ballads to bangers), and genre coverage (pop, rock, R&B, country, hip-hop).

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Don't Stop Believin' | Journey | 1981 | Rock |
| 2 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 3 | Sweet Caroline | Neil Diamond | 1969 | Pop |
| 4 | Livin' on a Prayer | Bon Jovi | 1986 | Rock |
| 5 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 6 | Ain't No Mountain High Enough | Marvin Gaye & Tammi Terrell | 1967 | Soul |
| 7 | Respect | Aretha Franklin | 1967 | Soul |
| 8 | September | Earth, Wind & Fire | 1978 | Funk / Disco |
| 9 | I Want It That Way | Backstreet Boys | 1999 | Pop |
| 10 | Since U Been Gone | Kelly Clarkson | 2004 | Pop Rock |
| 11 | Shallow | Lady Gaga & Bradley Cooper | 2018 | Pop / Country |
| 12 | Happy | Pharrell Williams | 2013 | Pop |
| 13 | Friends in Low Places | Garth Brooks | 1990 | Country |
| 14 | Jolene | Dolly Parton | 1973 | Country |
| 15 | Before He Cheats | Carrie Underwood | 2006 | Country |
| 16 | Mr. Brightside | The Killers | 2003 | Indie Rock |
| 17 | Take Me Home, Country Roads | John Denver | 1971 | Country / Folk |
| 18 | Piano Man | Billy Joel | 1973 | Pop Rock |
| 19 | Wonderwall | Oasis | 1995 | Britpop |
| 20 | Gold Digger | Kanye West ft. Jamie Foxx | 2005 | Hip-Hop |
| 21 | Old Town Road | Lil Nas X | 2019 | Hip-Hop / Country |
| 22 | Livin' La Vida Loca | Ricky Martin | 1999 | Latin Pop |
| 23 | Somewhere Over the Rainbow | Judy Garland / IZ | 1939 / 1993 | Ballad |
| 24 | Total Eclipse of the Heart | Bonnie Tyler | 1983 | Pop |
| 25 | Love Shack | The B-52's | 1989 | New Wave |

---

### Region 2: United Kingdom & Ireland

The UK/Ireland library reflects British pub karaoke culture, the Irish singalong tradition, and the outsized role of British pop and rock in global music. Robbie Williams, Oasis, and Adele are non-negotiable here.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Don't Stop Believin' | Journey | 1981 | Rock |
| 2 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 3 | Angels | Robbie Williams | 1997 | Pop |
| 4 | Mr. Brightside | The Killers | 2003 | Indie Rock |
| 5 | Dancing Queen | ABBA | 1976 | Disco / Pop |
| 6 | Don't Look Back in Anger | Oasis | 1996 | Britpop |
| 7 | Livin' on a Prayer | Bon Jovi | 1986 | Rock |
| 8 | Sweet Caroline | Neil Diamond | 1969 | Pop |
| 9 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 10 | Someone Like You | Adele | 2011 | Pop |
| 11 | Come On Eileen | Dexys Midnight Runners | 1982 | New Wave |
| 12 | Wonderwall | Oasis | 1995 | Britpop |
| 13 | Total Eclipse of the Heart | Bonnie Tyler | 1983 | Pop |
| 14 | 9 to 5 | Dolly Parton | 1980 | Country / Pop |
| 15 | Hey Jude | The Beatles | 1968 | Rock |
| 16 | Fairytale of New York | The Pogues | 1987 | Celtic Punk |
| 17 | I Want It That Way | Backstreet Boys | 1999 | Pop |
| 18 | Spice Up Your Life | Spice Girls | 1997 | Pop |
| 19 | You're the One That I Want | Grease Soundtrack | 1978 | Musical / Pop |
| 20 | Piano Man | Billy Joel | 1973 | Pop Rock |
| 21 | Proud Mary | Tina Turner | 1971 | Rock / Soul |
| 22 | I Gotta Feeling | Black Eyed Peas | 2009 | Pop |
| 23 | Ain't No Mountain High Enough | Marvin Gaye & Tammi Terrell | 1967 | Soul |
| 24 | It's Not Unusual | Tom Jones | 1965 | Pop |
| 25 | Love Shack | The B-52's | 1989 | New Wave |

---

### Region 3: Latin America & Caribbean

This library serves Spanish- and Portuguese-speaking markets across Mexico, Central America, South America, and the Caribbean. It balances reggaeton, salsa, cumbia, ranchera, rock en español, bossa nova, romantic ballads, and modern Latin pop.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Vivir Mi Vida | Marc Anthony | 2013 | Salsa |
| 2 | La Bamba | Ritchie Valens / Traditional | 1958 | Latin Rock |
| 3 | Cielito Lindo | Traditional Mexican | Traditional | Ranchera / Folk |
| 4 | Livin' La Vida Loca | Ricky Martin | 1999 | Latin Pop |
| 5 | Despacito | Luis Fonsi ft. Daddy Yankee | 2017 | Reggaeton / Pop |
| 6 | La Tortura | Shakira ft. Alejandro Sanz | 2005 | Latin Pop |
| 7 | Suavemente | Elvis Crespo | 1998 | Merengue |
| 8 | Bésame Mucho | Consuelo Velázquez | 1940 | Bolero |
| 9 | Gasolina | Daddy Yankee | 2004 | Reggaeton |
| 10 | Evidencias | Ana Gabriel | 1988 | Ballad |
| 11 | El Rey | José Alfredo Jiménez / Vicente Fernández | 1971 | Ranchera |
| 12 | Ai Se Eu Te Pego | Michel Teló | 2011 | Sertanejo / Pop |
| 13 | Ella Baila Sola | Eslabon Armado & Peso Pluma | 2023 | Regional Mexican |
| 14 | Waka Waka | Shakira | 2010 | Latin Pop / Afro |
| 15 | Macarena | Los del Río | 1993 | Dance / Latin Pop |
| 16 | Oye Como Va | Santana | 1970 | Latin Rock |
| 17 | Quisiera Ser | Alejandro Fernández | 1998 | Ranchera / Ballad |
| 18 | Conga | Gloria Estefan | 1985 | Latin Pop / Dance |
| 19 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 20 | Pedro Navaja | Rubén Blades | 1978 | Salsa |
| 21 | Amor Eterno | Rocío Dúrcal / Juan Gabriel | 1984 | Ballad |
| 22 | Chantaje | Shakira ft. Maluma | 2016 | Reggaeton / Pop |
| 23 | Garota de Ipanema | Tom Jobim & Vinicius de Moraes | 1962 | Bossa Nova |
| 24 | De Música Ligera | Soda Stereo | 1990 | Rock en Español |
| 25 | Mi Gente | J Balvin | 2017 | Reggaeton |

---

### Region 4: East & Southeast Asia

This is the most culturally diverse region, spanning Japanese karaoke box culture, Korean noraebang, Chinese/Taiwanese KTV, and the Philippines' intense karaoke devotion. K-pop provides modern connective tissue. Teresa Teng, Whitney Houston, and the Carpenters are pan-Asian karaoke constants. English-language songs are heavily represented because they serve as shared ground across language barriers.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | My Way | Frank Sinatra | 1969 | Pop / Standards |
| 2 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 3 | 月亮代表我的心 (The Moon Represents My Heart) | Teresa Teng | 1977 | Mandopop |
| 4 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 5 | First Love | Hikaru Utada | 1999 | J-Pop |
| 6 | Nobody | Wonder Girls | 2008 | K-Pop |
| 7 | Dynamite | BTS | 2020 | K-Pop |
| 8 | 小幸運 (A Little Happiness) | Hebe Tien | 2015 | Mandopop |
| 9 | Anak | Freddie Aguilar | 1977 | OPM / Folk |
| 10 | 上を向いて歩こう (Sukiyaki) | Kyu Sakamoto | 1961 | J-Pop |
| 11 | Love Yourself | Justin Bieber | 2015 | Pop |
| 12 | Love, ing | IU | 2019 | K-Pop |
| 13 | Can't Help Falling in Love | Elvis Presley | 1961 | Pop / Standards |
| 14 | 海阔天空 (Boundless Oceans, Vast Skies) | Beyond | 1993 | Cantopop / Rock |
| 15 | STAY | The Kid LAROI & Justin Bieber | 2021 | Pop |
| 16 | Yesterday Once More | Carpenters | 1973 | Pop |
| 17 | Killing Me Softly | Fugees / Roberta Flack | 1973 / 1996 | Soul / R&B |
| 18 | Eyes, Nose, Lips | Taeyang | 2014 | K-Pop / R&B |
| 19 | 甜蜜蜜 (Tián Mì Mì) | Teresa Teng | 1979 | Mandopop |
| 20 | Don't Stop Believin' | Journey | 1981 | Rock |
| 21 | Lemon | Kenshi Yonezu | 2018 | J-Pop |
| 22 | Narda | Kamikazee | 2005 | OPM / Rock |
| 23 | Through the Rain | Mariah Carey | 2002 | Pop / R&B |
| 24 | 春よ、来い (Haru yo, Koi) | Yumi Matsutoya | 1994 | J-Pop |
| 25 | Super Shy | NewJeans | 2023 | K-Pop |

---

### Region 5: Continental Europe

Continental Europe's language fragmentation is the core challenge. This library leans on global English-language hits known continent-wide, Eurovision culture as a unifying force, and the select French, Italian, German, and Romanian songs that crossed national borders.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 2 | Dancing Queen | ABBA | 1976 | Disco / Pop |
| 3 | Don't Stop Believin' | Journey | 1981 | Rock |
| 4 | Waterloo | ABBA | 1974 | Pop |
| 5 | 99 Luftballons | Nena | 1983 | Neue Deutsche Welle |
| 6 | Voyage, Voyage | Desireless | 1986 | Synth-Pop |
| 7 | Bella Ciao | Traditional Italian | Traditional | Folk / Protest |
| 8 | Dragostea Din Tei (Numa Numa) | O-Zone | 2003 | Eurodance |
| 9 | La Vie en Rose | Édith Piaf | 1947 | Chanson |
| 10 | Volare (Nel Blu Dipinto di Blu) | Domenico Modugno | 1958 | Italian Pop |
| 11 | Take On Me | a-ha | 1985 | Synth-Pop |
| 12 | Livin' on a Prayer | Bon Jovi | 1986 | Rock |
| 13 | Euphoria | Loreen | 2012 | Electropop |
| 14 | Heroes | David Bowie | 1977 | Art Rock |
| 15 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 16 | Ain't No Mountain High Enough | Marvin Gaye & Tammi Terrell | 1967 | Soul |
| 17 | My Heart Will Go On | Céline Dion | 1997 | Pop |
| 18 | Con Te Partirò (Time to Say Goodbye) | Andrea Bocelli | 1995 | Classical Crossover |
| 19 | Hips Don't Lie | Shakira | 2006 | Latin Pop |
| 20 | Sweet Dreams (Are Made of This) | Eurythmics | 1983 | Synth-Pop |
| 21 | The Final Countdown | Europe | 1986 | Rock |
| 22 | Freed from Desire | Gala | 1996 | Eurodance |
| 23 | I Gotta Feeling | Black Eyed Peas | 2009 | Pop |
| 24 | Tainted Love | Soft Cell | 1981 | Synth-Pop |
| 25 | Barbie Girl | Aqua | 1997 | Eurodance |

---

### Region 6: South Asia & Middle East

Bollywood is the dominant engine for the South Asian half of this region. Arabic pop anchors the Middle Eastern side. A.R. Rahman, Arijit Singh, and Amr Diab are the defining voices. English-language global hits serve as connective tissue, particularly in urban markets and diaspora communities.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Chaiyya Chaiyya | A.R. Rahman (from Dil Se) | 1998 | Bollywood |
| 2 | Tum Hi Ho | Arijit Singh (from Aashiqui 2) | 2013 | Bollywood |
| 3 | Kal Ho Naa Ho | Sonu Nigam (from Kal Ho Naa Ho) | 2003 | Bollywood |
| 4 | Didi | Khaled | 1992 | Raï |
| 5 | Kolaveri Di | Dhanush | 2011 | Tamil Pop |
| 6 | Mundian To Bach Ke | Panjabi MC | 1998 | Bhangra |
| 7 | Habibi Ya Nour El Ain | Amr Diab | 1996 | Arabic Pop |
| 8 | Rang De Basanti | A.R. Rahman (from Rang De Basanti) | 2006 | Bollywood |
| 9 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 10 | Kun Faya Kun | A.R. Rahman (from Rockstar) | 2011 | Sufi / Bollywood |
| 11 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 12 | Dil Dil Pakistan | Vital Signs | 1987 | Pakistani Pop |
| 13 | 3 Daqat | Abu ft. Yousra | 2016 | Arabic Pop |
| 14 | Kajra Re | Shankar-Ehsaan-Loy (from Bunty Aur Babli) | 2005 | Bollywood |
| 15 | Shape of You | Ed Sheeran | 2017 | Pop |
| 16 | Binte Dil | A.R. Rahman (from Padmaavat) | 2018 | Bollywood |
| 17 | Ahwak | Abdel Halim Hafez | 1957 | Arabic Classical Pop |
| 18 | London Thumakda | Labh Janjua (from Queen) | 2014 | Bollywood |
| 19 | Despacito | Luis Fonsi ft. Daddy Yankee | 2017 | Reggaeton / Pop |
| 20 | Channa Mereya | Arijit Singh (from Ae Dil Hai Mushkil) | 2016 | Bollywood |
| 21 | Ya Rayah | Rachid Taha / Dahmane El Harrachi | 1973 / 1997 | Chaabi / Raï |
| 22 | Gallan Goodiyaan | Shankar-Ehsaan-Loy (from Dil Dhadakne Do) | 2015 | Bollywood |
| 23 | Barakah | Maher Zain | 2016 | Islamic Pop |
| 24 | Tere Bina | A.R. Rahman (from Guru) | 2007 | Bollywood |
| 25 | My Way | Frank Sinatra | 1969 | Pop / Standards |

---

### Region 7: Sub-Saharan Africa

This library spans Afrobeats (Nigeria), Amapiano (South Africa), Bongo Flava (Tanzania), highlife, zouk, and gospel traditions. Nigeria and South Africa are the two cultural powerhouses. English and French as widely-spoken languages help bridge West, East, and Southern Africa. Global hits with African connections (Shakira's Waka Waka, Freddie Mercury's heritage) carry extra resonance.

| # | Song | Artist | Era | Genre |
|---|------|--------|-----|-------|
| 1 | Ye | Burna Boy | 2018 | Afrobeats |
| 2 | Pata Pata | Miriam Makeba | 1967 | South African Pop |
| 3 | Waka Waka | Shakira | 2010 | Latin Pop / Afro |
| 4 | Love Nwantiti | CKay | 2019 | Afrobeats |
| 5 | Bohemian Rhapsody | Queen | 1975 | Rock |
| 6 | Jerusalema | Master KG ft. Nomcebo | 2019 | Amapiano / Gospel |
| 7 | African Queen | 2Baba | 2004 | Afrobeats |
| 8 | Malaika | Traditional Swahili / Miriam Makeba | Traditional | East African Folk |
| 9 | Don't Stop Believin' | Journey | 1981 | Rock |
| 10 | Yé Ké Yé Ké | Mory Kanté | 1987 | Afro-Pop / Dance |
| 11 | Essence | Wizkid ft. Tems | 2020 | Afrobeats |
| 12 | I Will Always Love You | Whitney Houston | 1992 | R&B / Pop |
| 13 | Sweetest Taboo | Sade | 1985 | Smooth Jazz / Pop |
| 14 | Mile Kile Mwen | Kassav' | 1987 | Zouk |
| 15 | Sondela | Nomcebo Zikode | 2021 | Amapiano / Afro-Soul |
| 16 | Aiyola | Diamond Platnumz | 2018 | Bongo Flava |
| 17 | Already | Beyoncé ft. Shatta Wale | 2020 | Afrobeats / Pop |
| 18 | Aye | Davido | 2014 | Afrobeats |
| 19 | Indlela | Brenda Fassie | 2004 | South African Pop |
| 20 | My Way | Frank Sinatra | 1969 | Pop / Standards |
| 21 | On the Floor | InnossB | 2019 | Afro-Pop |
| 22 | Happy | Pharrell Williams | 2013 | Pop |
| 23 | Nguwe | Makhadzi | 2021 | Amapiano |
| 24 | Redemption Song | Bob Marley | 1980 | Reggae |
| 25 | Peru | Fireboy DML | 2021 | Afrobeats |

---

## Cross-Region Song Overlap

The following songs appear in multiple regional libraries and represent truly global karaoke constants. This is relevant for engineering because shared songs only need to be pre-processed once and can be referenced across regions.

| Song | Artist | Regions |
|------|--------|---------|
| Bohemian Rhapsody | Queen | US, UK, Latin America, East Asia, Europe, South Asia, Africa (7/7) |
| I Will Always Love You | Whitney Houston | US, UK, East Asia, Europe, South Asia, Africa (6/7) |
| Don't Stop Believin' | Journey | US, UK, East Asia, Europe, Africa (5/7) |
| Livin' on a Prayer | Bon Jovi | US, UK, Europe (3/7) |
| My Way | Frank Sinatra | East Asia, South Asia, Africa (3/7) |
| Ain't No Mountain High Enough | Marvin Gaye & Tammi Terrell | US, UK, Europe (3/7) |
| Love Shack | The B-52's | US, UK (2/7) |
| Happy | Pharrell Williams | US, Africa (2/7) |
| Waka Waka | Shakira | Latin America, Africa (2/7) |
| I Want It That Way | Backstreet Boys | US, UK (2/7) |
| Despacito | Luis Fonsi ft. Daddy Yankee | Latin America, South Asia (2/7) |
| Piano Man | Billy Joel | US, UK (2/7) |
| Dancing Queen | ABBA | UK, Europe (2/7) |
| I Gotta Feeling | Black Eyed Peas | UK, Europe (2/7) |
| Total Eclipse of the Heart | Bonnie Tyler | US, UK (2/7) |
| Wonderwall | Oasis | US, UK (2/7) |
| Livin' La Vida Loca | Ricky Martin | US, Latin America (2/7) |

**Total unique songs across all regions: 138**
**Total song slots: 175 (25 × 7 regions)**
**Shared slots (duplicates): 37**

---

## Implementation Notes

### Spotify Integration
- Use Spotify's OAuth 2.0 Authorization Code Flow for user sign-in
- Request only the minimum required scopes (e.g., `user-modify-playback-state`, `user-read-playback-state`, `streaming`)
- Gracefully handle cases where a track is unavailable in the user's market (Spotify's catalog varies by country) — show the user a message and skip that song in their library
- Handle Spotify Premium requirement clearly: detect account tier after auth, and if the user is on a free tier, explain the requirement and offer Freeform mode as the alternative
- Pin each curated song to a specific Spotify track URI. If a track is removed from Spotify's catalog, flag it in the app and remove it from the active library until a replacement is selected
- Respect Spotify's rate limits and branding guidelines (their developer TOS requires proper attribution and logo usage)

### Region Detection
- Default the user's region based on their device locale and app store region
- Allow manual region switching in settings so diaspora users can access their preferred library
- Consider showing a secondary "Global Hits" filtered view that surfaces the cross-region overlap songs
- Cross-reference region selection with Spotify catalog availability — some tracks may not be available in all Spotify markets even if they're in our curated list

### Scoring System Considerations
- All scoring is performed on the user's **microphone input only** — never on Spotify's audio output
- Each song will need a calibrated difficulty rating so users understand what they're signing up for
- Scoring should account for the song's difficulty — a 70% on "Bohemian Rhapsody" is more impressive than a 90% on "Sweet Caroline"
- Consider separate scoring dimensions: pitch accuracy, timing, note sustain, and overall feel
- Leaderboards should be per-song and per-region
- Account for potential latency between Spotify playback and our coaching/scoring timeline — may need a user-adjustable offset calibration on first use

### Coaching Prompts
- Coaching prompts should be non-intrusive — small visual cues, not modal overlays
- Examples of contextual cues: "🎤 Get ready...", "📢 Sing louder!", "🎵 Hold that note!", "😮‍💨 Instrumental — take a breath", "🔥 Here comes the chorus!"
- Allow users to toggle coaching on/off in settings
- Coaching text must be localized per region/language
- All coaching cue timing is based on our pre-built song structure map, not on any analysis of the Spotify stream

### Lyrics Display (Out of Scope — v2)
- Synchronized lyrics display is deferred to a future release due to separate licensing requirements
- Lyrics rights are held by music publishers (not record labels) and require independent licensing agreements
- For v1, users are expected to know the words or reference lyrics externally
- When revisited, explore partnerships with lyrics licensing providers (e.g., Musixmatch API) or investigate whether Spotify's own lyrics feature can be surfaced within their allowed SDK experience

### Freeform Mode Preservation
- Freeform mode should remain accessible but not be the default landing experience
- Consider a clear toggle or tab: "Curated" vs "Freeform"
- Freeform captures combined audio and does not attempt scoring or coaching
- Freeform does not require a Spotify account — it works independently

---

## Success Metrics

- **Adoption**: % of sessions using Curated mode vs Freeform within 30 days of launch
- **Spotify auth conversion**: % of users who successfully complete Spotify sign-in and have Premium
- **Engagement**: Average songs per session, session duration
- **Retention**: D7 and D30 retention by region
- **Scoring engagement**: % of users who view their score breakdown, % who retry a song to improve score
- **Regional coverage**: Ensure no region has significantly lower engagement, indicating poor song selection
- **Song utilization**: Track per-song play counts to identify underperformers for future library updates
- **Spotify catalog availability**: Monitor for tracks that become unavailable in specific markets and flag for replacement
