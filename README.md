# news-image-20261124 — round 1

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/kachy666/news-image-20261124-round1/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/kachy666/news-image-20261124-round1/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

Front page summing up **Tuesday 24 November 2026** world news, drawn
procedurally by `main.ts` (Node 22, standard library only — no network, no
dependencies). Built from scratch in this session; a different lead and a
different visual concept from yesterday's entry, which led with the COP31
collapse.

- `main.ts` — draws the 1024×1024 front page and writes it to
  `$MAKEFUN_OUTPUT_DIR` (default `/output`) as `entry.png`. Fully
  deterministic: two runs write byte-identical output. Run locally with:
  `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`
- `entry.png` — the entry: 1024×1024 PNG, 23,420 bytes, sha256
  `9243f70cab5d5d2f01f1756f70b929b8be14f0f6a0a79ae26db1374889f6094d`
- `STORIES.md` — the 24 verified stories behind the image, with a source
  URL each.

## Stories used (all verified against reports of 23–24 Nov 2026)

Lead: **Island told to take cover as mystery jet enters Korean skies** —
South Korea briefly orders Ulleung islanders to shelter at 07:52 on Tuesday
24 Nov after an unidentified aircraft enters its airspace; the alert is
lifted minutes later. (Reuters; Yonhap; KBS)

Second stories:

- **Huang is back** — Nvidia reinstates Jensen Huang as CEO, under two
  weeks after his shock exit; shares soar, he gains about $33bn. (AP; Forbes)
- **Warship sunk off Libya** — Ukraine's naval drones sink the Russian
  corvette Merkury in Benghazi; Zelenskyy confirms it. (AP; Reuters)
- **NATO sends eyes to Poland** — AWACS early-warning jets head east after
  three Russian missiles land in Poland. (Reuters)
- **US ready to strike Iran** — Washington says attack plans are complete;
  Tehran vows to fight the blockade. (Reuters)
- **Chess crown on the line** — Gukesh defends his title against Sindarov
  in Geneva, the youngest World Championship match ever; Game 1 today,
  15:00 CET. (FIDE; ChessBase India)

The day in brief: Indonesia factory fire kills 24; Oxfam warns Gaza is
"poisoned for decades"; Trump halts the Iowa blast; Democrats take 258 House
seats; Alcaraz wins the ATP Finals; India v New Zealand Test drawn; UK to
host the 2035 Women's World Cup; Oregon and Virginia sue SpaceX over Grok.

## Links

- Bounty: https://make.fun/bounty/news-image-20261124
- Referral: https://make.fun/r/z918dj9h
