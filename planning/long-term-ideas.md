# Karaoke King — Long-Term Ideas & Creative Scratchpad

*This is a loose collection of possibilities. Some will get built, some won't. Treat it as a living document.*

---

## Spotify Integration

Connect multiple user Spotify accounts to make song selection feel personal and smart.

- Analyze listening history to suggest songs players actually know
- Create "common ground" playlists from overlapping tastes across all players
- Difficulty ratings derived from track audio features — vocal range, tempo, lyric complexity
- "Wildcard" mode where the algorithm picks a song neither player has heard much

**API notes:** Spotify Web API gives Currently Playing, Audio Features, and Audio Analysis (per-segment pitch data). The Web Playback SDK can run playback inside the browser but requires Spotify Premium for all users. Lyrics are NOT available via the public API — they're licensed for Spotify's own app only. Third-party options if needed: LRCLIB (free), Musixmatch (free tier).

---

## Game Modes

### Elimination Mode

All players start. Lowest scorer is eliminated each round. Tension builds as the field narrows.

- **Top 4**: Songs get harder — obscure deep cuts, faster tempo
- **Top 3**: "Heat Zone" — tighter scoring windows, faster feedback
- **Final 2**: Goes to The Duel

### Free-for-All (Party Mode)

Casual, no scoring pressure. Pass-the-mic style or simultaneous singing. Good for warm-up or when people just want to play without a leaderboard.

---

## The Duel (Final Showdown)

The climactic 1v1 battle. Reserved for the final two players in Elimination Mode, or as a standalone mode.

**Format:**
- Head-to-head battle over a ~2 minute Mashup Medley
- 5 songs intertwined, rapid genre and tempo switches
- Tests versatility — you can't just be good at one style

**Sudden Death Mechanics:**
- **Pitch Strike System** — 3 off-key strikes and you're out
- **Cut-off Rule** — Fall too far behind on accuracy and the song cuts to your opponent
- **Steal the Verse** — If one player fumbles a section, the other can "steal" it for bonus points

**Song Selection for The Duel:**
- Algorithm picks songs neither player has much in their Spotify history (no home-field advantage)
- Mixed genres to keep it unpredictable
- Audience/crowd vote on one "wildcard" song

---

## Advanced Scoring Ideas

### Pitch Accuracy (vs. Pitch Variety)

Currently the pitch score rewards hitting many different semitones. The more interesting measure is whether the singer hit the *right* notes at the right time. This requires knowing the song's expected melody — possible via Spotify Audio Analysis if playback is moved into the browser.

### Timing & Rhythm

Score how well the singer's phrasing aligns with the beat. Spotify Audio Analysis provides bar and beat timestamps.

### Lyric Accuracy

Optional — detect spoken/sung words and compare to known lyrics. Requires a speech-to-text pass, adds latency and complexity. Possibly a fun "bonus score" rather than a core component.

### Style Points / Crowd Vote

Let spectators rate each performance in real time via a secondary device. Blend crowd vote into the final score at a small weight (e.g. 10%).

---

## Clips & Highlights

Auto-capture best and worst moments during each round. Play them back as a highlights reel at the end of the session. The "worst" moments are often the most memorable.

Could also allow players to share specific moments as short video clips.

---

## Other Loose Ideas

- **Duet mode** — two players sing the same song simultaneously, scored together
- **Theme nights** — constrain song selection to a genre, decade, or artist
- **Audience reaction meter** — phone sensors or button mashing from spectators feeds into live scoring
- **Comeback mechanic** — player in last place gets a small boost to keep things competitive
