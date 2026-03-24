import { useState, useEffect, useCallback, useRef } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: "futures",
    title: "Futures Trading Basics",
    desc: "Contracts, margin, leverage, order types, and risk management",
    icon: "📊",
    color: "#378ADD",
    order: 1,
    quickRef: [
      { label: "Micro Gold (MGC)", value: "$10 per $1 move" },
      { label: "Standard Gold (GC)", value: "$100 per $1 move" },
      { label: "Micro Margin", value: "~$800–$1,200" },
      { label: "Leverage", value: "~50:1" },
      { label: "Max Risk/Trade", value: "2% of account" },
      { label: "Max Daily Loss", value: "5% of account" },
      { label: "Tick Size", value: "$0.10" },
      { label: "Best Hours", value: "8 AM – 3 PM ET" },
      { label: "Round-trip Cost", value: "~$3–8 per micro" },
      { label: "Tax Treatment", value: "60/40 rule (Section 1256)" },
    ],
    chapters: [
      { title: "What is a futures contract?", content: `A futures contract is an agreement to buy or sell something at a specific price on a specific date in the future. When you trade gold futures, you're not buying physical gold — you're trading a contract that tracks gold's price.\n\n**Key concept: You can profit whether price goes UP or DOWN.**\n• Going long (buying) = you profit if price rises\n• Going short (selling) = you profit if price falls\n\nThis is different from stocks where you typically only profit from price increases.` },
      { title: "Gold futures contracts", content: `Gold futures trade on the COMEX exchange. Two main sizes:\n\n**Standard Gold (GC):**\n• 100 troy ounces per contract\n• Each $1 move = $100 profit/loss\n• Margin: ~$8,000-$12,000\n\n**Micro Gold (MGC) — start here:**\n• 10 troy ounces (1/10th standard)\n• Each $1 move = $10 profit/loss\n• Margin: ~$800-$1,200\n\n**Example:** Buy 1 micro at $5,000, gold goes to $5,020.\nProfit = $20 × $10 = $200` },
      { title: "Understanding margin", content: `Margin is NOT the full cost — it's a good-faith deposit to hold a position. Think of it like a security deposit on an apartment.\n\n**Initial margin:** Amount needed to open a position (~$1,000 for 1 micro gold)\n\n**Maintenance margin:** Minimum your account must hold while position is open (~80-90% of initial)\n\n**Margin call:** If your account drops below maintenance margin, your broker demands more money immediately or closes your position — usually at the worst possible price.\n\n**Leverage:** 1 micro gold contract controls ~$50,000 of gold with ~$1,000 margin = 50:1 leverage. A 1% move in gold = ~50% move in your margin. This works both FOR and AGAINST you.` },
      { title: "How a trade works", content: `**Step 1:** Buy 1 micro gold at $5,000\n→ Broker reserves ~$1,000 margin\n\n**Step 2:** Gold moves to $5,015\n→ Unrealized profit: $15 × $10 = $150\n→ Shows in real time but not locked in\n\n**Step 3:** Close (sell) at $5,015\n→ Realized profit: $150\n→ Margin released back to account\n\n**If gold dropped to $4,985 instead:**\n→ Loss: $15 × $10 = $150\n→ If it keeps dropping and you don't close, losses keep growing\n→ If account drops below maintenance margin = margin call` },
      { title: "Order types", content: `**Market order:** Buy/sell immediately at current price. Fast fill but price may differ from what you see (slippage).\n\n**Limit order:** Buy/sell at a specific price or better. You control the price but might not get filled.\n\n**Stop order (stop loss):** Becomes a market order when a price is hit. Your safety net — limits losses automatically.\n\n**Stop limit order:** Becomes a limit order when triggered. Risk: in fast markets, price can blow past your limit and you don't get filled.\n\n**Bracket order (OCO):** Places profit target AND stop loss simultaneously. When one hits, the other cancels. Ideal for news trades.` },
      { title: "Trading hours & costs", content: `**Hours:** Sunday 6 PM to Friday 5 PM ET (nearly 24hrs)\nDaily break: 5-6 PM ET\n\n**Best hours for news trading:**\n• 8:30 AM ET — NFP, CPI, PPI releases\n• 9:30 AM-12 PM — highest liquidity\n• 2:00 PM ET — FOMC decisions\n• 2:30 PM ET — Fed press conferences\n\n**Costs per micro gold round-trip:**\n• Commission: $1-5\n• Exchange fees: included\n• Spread: $0.10-$0.30 (widens during news)\n• Total: ~$3-8 per trade in normal conditions` },
      { title: "Risk management & dangers", content: `**Hard rules:**\n• Max 2% account risk per trade\n• Max 5% daily loss limit\n• Paper trade minimum 3 months first\n• Never use all your margin capacity\n\n**The dangers:**\n• Leverage amplifies losses just as much as gains\n• Margin calls force-close at the worst price\n• Spreads widen during news = worse fills\n• 70-80% of retail futures traders lose money\n• Overtrading after losses is the #1 account killer\n\n**Position sizing formula:**\nMax contracts = (Account × 2%) ÷ (Stop distance × $ per point)` }
    ]
  },
  {
    id: "indicators",
    title: "Chart Setup & Indicators",
    desc: "VWAP, ATR, Bollinger Bands, volume, and correlations",
    icon: "📈",
    color: "#1D9E75",
    order: 2,
    quickRef: [
      { label: "VWAP Above", value: "Bullish intraday bias" },
      { label: "VWAP 3rd SD Band", value: "Extreme — expect snap-back" },
      { label: "Stop Loss Min", value: "1.5× ATR from entry" },
      { label: "Profit Target", value: "2–3× ATR" },
      { label: "BB Squeeze", value: "Big move loading (no direction)" },
      { label: "Band Walk", value: "Strong trend — don't fade it" },
      { label: "High Vol + Big Move", value: "Genuine — has follow-through" },
      { label: "Low Vol + Big Move", value: "Suspicious — may reverse" },
      { label: "1H Above Both EMAs", value: "Only take longs on 5-min" },
      { label: "DXY Up", value: "Gold tends to fall" },
    ],
    chapters: [
      { title: "Your workspace layout", content: `**Panel 1 (Main): GC1! 5-minute**\nYour trading timeframe. Where you watch news reactions unfold candle by candle. Contains VWAP, Bollinger Bands, ATR, Volume.\n\n**Panel 2 (Context): GC1! 1-hour**\nThe "zoom out" view. Check the bigger trend before any trade. Contains EMAs and Weekly VWAP.\n\n**Panel 3 (Correlations): DXY + US10Y**\nGold's two most important correlated instruments. They often react 2-5 seconds BEFORE gold during news events — giving you an early warning.` },
      { title: "VWAP — your intraday compass", content: `**What it is:** Average price weighted by volume. Resets each session. Shows "fair value" for the day.\n\n**How to read it:**\n• Price above VWAP = bullish intraday bias\n• Price below VWAP = bearish intraday bias\n• Price crossing VWAP = bias is shifting\n\n**The standard deviation bands:**\n• Band 1 (1 SD): Normal trading range\n• Band 2 (2 SD): Extended move — stretched\n• Band 3 (3 SD): Extreme — almost always snaps back\n\n**For news trading:** After a spike to 2nd/3rd SD band, expect a pullback toward VWAP. This "mean reversion" trade is one of the highest-probability setups.` },
      { title: "ATR — your volatility ruler", content: `**What it is:** Average range per candle over 14 periods. Displayed as a number below your chart.\n\n**Three critical uses:**\n\n**1. Setting stops:**\nMinimum stop = 1.5× ATR\nIf ATR = $5, stop at least $7.50 away\n\n**2. Setting targets:**\nRealistic target = 2-3× ATR\nIf ATR = $5, aim for $10-$15 profit\n\n**3. Position sizing:**\nMax contracts = Max risk ÷ (1.5 × ATR × $/point)\nExample: $400 risk ÷ ($7.50 × $10) = 5 micro contracts\n\n**Before vs. after news:** Compare ATR expansion. FOMC typically causes 3x+ expansion.` },
      { title: "Bollinger Bands — the squeeze detector", content: `**What they are:** Moving average with upper/lower bands at 2 standard deviations.\n\n**The squeeze:**\nBands getting narrow = volatility compressing = big move loading. Common in the hour before major news. Does NOT tell direction — only magnitude.\n\n**The band walk:**\nPrice touching the upper band candle after candle = very strong trend. Do NOT fade (trade against) a band walk.\n\n**The band rejection:**\nPrice touches outer band and snaps back inside = exhaustion. Aligns with VWAP mean-reversion signal.\n\n**Key rule:** Squeeze is not a trade signal. Wait for the news to reveal direction, then trade the expansion.` },
      { title: "Volume — the conviction meter", content: `**High volume + big move** = genuine move with follow-through. Institutions are participating.\n\n**Low volume + big move** = suspicious. Likely reverses when real volume returns.\n\n**Volume at news events:**\n• FOMC candle should be 5-10× normal volume\n• If volume spike is missing, market is confused\n\n**Volume Profile (VPVR):**\n• High Volume Nodes (thick areas) = support/resistance\n• Low Volume Nodes (thin gaps) = price moves quickly through\n• Point of Control (POC) = most-traded price, acts as magnet` },
      { title: "EMAs on the 1-hour chart", content: `**EMA 21 (blue):** Fast trend — reacts quickly\n**EMA 50 (orange):** Medium trend — smoother, bigger picture\n\n**How to read:**\n• Price above both = uptrend → only take longs on 5-min\n• Price below both = downtrend → only take shorts on 5-min\n• Price between = mixed → be cautious or skip\n• 21 crossing above 50 = bullish momentum shift\n• 21 crossing below 50 = bearish momentum shift\n\nThis single check prevents the biggest beginner mistake: fighting the larger trend.` },
      { title: "DXY & US10Y — your early warning system", content: `**DXY (Dollar Index):**\n• DXY up = dollar stronger = gold tends to fall\n• DXY down = dollar weaker = gold tends to rise\n• ~70-80% inverse correlation\n\n**US10Y (10-Year Treasury Yield):**\n• Yields up = gold tends to fall\n• Yields down = gold tends to rise\n• Directly tied to real interest rates — gold's #1 driver\n\n**The edge:** During news events, DXY and US10Y react 2-5 seconds before gold. If NFP drops and DXY spikes down, gold is about to spike up — even before it shows on the gold chart.\n\n**Divergence warning:** If gold rises AND DXY rises, something is off. Usually resolves with gold pulling back.` },
      { title: "Pre-event scan routine", content: `30 minutes before any high-impact event:\n\n**Step 1 — 1-hour chart:**\nWhat's the bigger trend? Above/below both EMAs? Key volume profile levels?\n\n**Step 2 — 5-minute chart:**\nWhere is price vs VWAP? BB squeezing? Current ATR value? Volume declining?\n\n**Step 3 — Correlation panel:**\nWhere are DXY and US10Y? Trending direction?\n\n**Step 4 — Calendar:**\nConsensus forecast? What would be a surprise?\n\n**Step 5 — Write your plan:**\nBullish scenario: entry, stop, target, size\nBearish scenario: entry, stop, target, size\nIn-line: do nothing\n\nYou now have a plan for every outcome BEFORE the data drops.` }
    ]
  },
  {
    id: "patterns",
    title: "Event Patterns & Strategy",
    desc: "FOMC, NFP, CPI reactions and trade planning",
    icon: "🎯",
    color: "#D4A853",
    order: 3,
    quickRef: [
      { label: "Surprise Principle", value: "Gap vs consensus moves gold" },
      { label: "FOMC Waves", value: "3 waves — don't chase Wave 1" },
      { label: ">85% Priced In", value: "Move comes from the details" },
      { label: "NFP Weak Miss", value: "Gold rallies harder than beats sell" },
      { label: "NFP Best Window", value: "First 60 minutes" },
      { label: "CPI Regime Check", value: "Inflation-hedge vs rate-cut mode" },
      { label: "Stagflation Signal", value: "GDP ↓ + Inflation ↑ = Gold ↑↑" },
      { label: "Geo vs Macro", value: "Macro wins most of the time" },
      { label: "Known Crisis", value: "Already priced in" },
      { label: "Disagreement Rule", value: "No clear edge → no trade" },
    ],
    chapters: [
      { title: "The surprise principle", content: `Gold does NOT move on the number itself. It moves on the GAP between the consensus forecast and the actual release.\n\nA 2.4% CPI print means nothing in isolation — it only matters vs. what the market expected.\n\n**The surprise hierarchy (by typical gold impact):**\n1. FOMC dot plot / SEP projections\n2. NFP headline miss\n3. Fed Chair press conference tone\n4. CPI core year-over-year surprise\n5. PCE core (Fed's preferred)\n6. FOMC statement language changes\n7. PPI surprise\n\nAlways know the consensus going into an event.` },
      { title: "FOMC patterns", content: `**Pattern 1: The 3-wave whipsaw**\n• Wave 1 (2:00 PM): Statement reaction — NEVER chase this\n• Wave 2 (2:30 PM): Press conference — often reverses Wave 1\n• Wave 3 (1-2 days): Real move as market digests\n\n**Pattern 2: Buy the rumor, sell the fact**\nIf >85% priced in + gold rallied into event = initial spike is a trap\n\n**Pattern 3: Stagflation = gold's best friend**\nGDP down + inflation up in projections = hard rally\n\n**Pattern 4: Hawkish hold beats geopolitics**\nRate path expectations overpower war headlines\n\n**FOMC rule:** The dot plot and SEP projections move gold more than the rate decision itself.` },
      { title: "NFP patterns", content: `**Released:** First Friday of each month, 8:30 AM ET\n\n**Pattern 1: Asymmetric reaction**\nWeak data moves gold MORE than strong data. Gold rallies harder on a jobs miss than it sells off on a jobs beat.\n\n**Pattern 2: The 1-hour window**\nStrongest inverse correlation at the 1-hour mark. Fades by hour 4. Your best window for NFP trades is the first 60 minutes.\n\n**Pattern 3: Revisions matter**\nA +150K headline with a -80K revision to last month is NOT a strong report. Always check both numbers.\n\n**Pattern 4: Big misses create multi-day trends**\nA miss of 50K+ below consensus often extends the move over multiple days.` },
      { title: "CPI patterns — the tricky one", content: `**The regime determines the reaction:**\n\n**Inflation-hedge mode** (gold rallying on inflation fears):\n• Hot CPI = gold UP\n• Cool CPI = gold DOWN\n\n**Rate-cut mode** (gold rallying on rate cut expectations):\n• Hot CPI = gold DOWN (fewer cuts)\n• Cool CPI = gold UP (more cuts)\n\n**How to determine the regime:** Look at what's been driving gold over the past month. Which narrative is dominant in headlines and analyst commentary?\n\n**Components matter:** Shelter/rent is the stickiest and most-watched component. A drop in shelter inflation signals a meaningful trend shift.\n\n**PCE > CPI for the Fed:** PCE released later in the month can override the CPI narrative.` },
      { title: "Macro vs. geopolitics", content: `**The rule: Macro wins most of the time.**\n\nWhen geopolitical risk and macro data conflict, the rate path outlook almost always dominates.\n\n**Evidence:** March 2026 — Iran war escalating, Strait of Hormuz closing. Gold DROPPED to $4,885 because the hawkish dot plot mattered more than the crisis.\n\n**Exception:** Surprise geopolitical shocks (unexpected events nobody saw coming) can override macro for 24-48 hours. Then the macro trend reasserts.\n\n**The key distinction:**\n• Known crisis = already priced in → macro wins\n• Surprise shock = not priced in → geopolitics wins for 1-2 days\n\nAlways ask: "Is this new information or already known?"` },
      { title: "The 'priced in' test", content: `Before every event, check: how much of the expected outcome is already reflected in the price?\n\n**Check CME FedWatch** for FOMC probability.\n\n**If >85% priced in:**\n• The headline result won't move markets much\n• The move comes from SURPRISES in the details\n• Dot plot shifts, dissenting votes, statement language, press conference tone\n\n**If <70% priced in:**\n• The headline result itself will drive a big move\n• The direction is more predictable (outcome matches expectation or doesn't)\n\n**Gold often moves more on surrounding context than on the headline decision.** The December 2025 FOMC cut was expected — the 9-3 dissent vote was not.` },
      { title: "Building your trade plan", content: `Before EVERY event, write down:\n\n**1. The setup:**\nWhat event? What time? What's the consensus?\n\n**2. The scenarios:**\nBullish trigger: "If NFP misses by 30K+..."\nBearish trigger: "If NFP beats by 30K+..."\nNeutral: "If in-line, do nothing"\n\n**3. The execution (for each scenario):**\n• Entry: specific price or condition\n• Stop: specific price (1.5× ATR minimum)\n• Target: specific price (2-3× ATR)\n• Position size: calculated from risk formula\n\n**4. The confirmation:**\nDoes DXY confirm? Does 1H trend align?\n\n**5. The rule:**\nExecute the plan. Don't improvise in the chaos.\nIf you and your partner disagree on the setup → no trade.` }
    ]
  }
];

const TESTS = {
futures: [
{q:"What does 'going long' on a gold futures contract mean?",o:["Buying the contract, betting price will rise","Holding the contract for a long time","Buying physical gold bars","Selling the contract, betting price will fall"],a:0,e:"Going long means buying with the expectation that price will increase."},
{q:"One micro gold contract (MGC): gold moves from $5,000 to $5,012. Profit on 1 contract?",o:["$12","$120","$1,200","$1.20"],a:1,e:"Each $1 move = $10 per micro contract. $12 × $10 = $120."},
{q:"What is margin in futures trading?",o:["The profit on a trade","A good-faith deposit to hold a position","The commission charged","The maximum you can lose"],a:1,e:"Margin is a security deposit — a fraction of the contract's value, returned when you close."},
{q:"$20K account, 1 micro contract, gold drops $50 against you. What happens?",o:["Nothing — margin covers it","You lose $500, account is now $19,500","Auto stopped out","Broker adds money for you"],a:1,e:"$50 × $10/point = $500 loss. Account drops to $19,500."},
{q:"What is a margin call?",o:["Broker congratulating you","Demand to deposit more funds or position gets closed","Alert that trade is profitable","Fee for holding overnight"],a:1,e:"Your account fell below maintenance margin. Add funds or get force-closed at a bad price."},
{q:"At 50:1 leverage, a 1% gold move equals what % move on your margin?",o:["1%","5%","25%","50%"],a:3,e:"50:1 leverage means 1% underlying move = ~50% move on margin. Powerful but dangerous."},
{q:"Stop order vs stop limit order?",o:["They're the same","Stop → market order; stop limit → limit order","Stop for buying; stop limit for selling","Stop limit is always better"],a:1,e:"Stop becomes market order (guaranteed fill, uncertain price). Stop limit becomes limit order (specific price, might not fill)."},
{q:"Why start with micro gold (MGC) instead of standard (GC)?",o:["Better prices","1/10th size = smaller losses while learning","Standard not available to retail","No difference"],a:1,e:"Micro is 1/10th size: $10/point vs $100/point. A $20 adverse move = $200 vs $2,000."},
{q:"What is a 'tick' in gold futures?",o:["A $1 move","Smallest price increment ($0.10)","Time between candles","The bid-ask spread"],a:1,e:"A tick is $0.10 — worth $10 on standard or $1 on micro contracts."},
{q:"Most important trading hours for your news-driven gold system?",o:["Sunday 6 PM - midnight","2-6 AM (London)","8 AM - 3 PM ET (US session)","All hours are equal"],a:2,e:"US session covers all major data releases: NFP/CPI at 8:30 AM, FOMC at 2:00 PM."},
{q:"What is slippage?",o:["Broker fee","Difference between expected and actual fill price","Internet disconnection","Order execution delay"],a:1,e:"Slippage is worst during fast news events when liquidity thins."},
{q:"A bracket order (OCO) does what?",o:["Places two separate trades","Places profit target AND stop loss — one cancels the other","Doubles position size","Holds overnight"],a:1,e:"OCO is ideal for event trades: set your exits and let them manage themselves."},
{q:"Approximate total cost of 1 micro gold round-trip trade?",o:["$0 — free","$3-8","$50-100","$500+"],a:1,e:"Commission + fees + spread = roughly $3-8 per round trip in normal conditions."},
{q:"Section 1256 tax treatment for futures gains:",o:["100% short-term rate","100% long-term rate","60% long-term / 40% short-term blend","No taxes"],a:2,e:"The 60/40 rule is favorable vs stock day trading (100% short-term)."},
{q:"What percentage of retail futures traders typically lose money?",o:["10-20%","30-40%","50-60%","70-80%"],a:3,e:"70-80% lose. Survivors have a system, risk management, and discipline."},
{q:"$20K account, 2% max risk per trade. Maximum loss on any single trade?",o:["$200","$400","$2,000","$4,000"],a:1,e:"2% × $20,000 = $400 maximum loss per trade."},
{q:"Why does the bid-ask spread widen before major news?",o:["Brokers want more money","Market makers pull liquidity to avoid being caught wrong","Technical glitch","It doesn't widen"],a:1,e:"Market makers widen spreads because the risk of a sudden adverse move is too high."},
{q:"3 micro contracts open, gold drops $25 against you. Your loss?",o:["$75","$250","$750","$7,500"],a:2,e:"3 × $25 × $10/point = $750. More contracts = amplified gains AND losses."},
{q:"Why paper trade 2-3 months before going live?",o:["Learn the buttons","Prove your system works without risking real money","Legally required","Guarantees live success"],a:1,e:"Paper trading proves edge before real money is at risk. Note: it doesn't simulate emotional pressure."},
{q:"If your account is $15,000, what's your 2% risk amount?",o:["$150","$300","$1,500","$3,000"],a:1,e:"2% × $15,000 = $300 maximum risk per trade."}
],
indicators: [
{q:"Gold is trading above VWAP on the 5-minute chart. This tells you:",o:["Gold is overpriced","Intraday bias is bullish","Immediately go long","VWAP needs resetting"],a:1,e:"Above VWAP = volume-weighted buyers are profitable today = bullish intraday bias."},
{q:"Gold spikes to the 3rd SD VWAP band during FOMC. Most likely next move?",o:["Keeps going — momentum","Pulls back toward VWAP (mean reversion)","Stays at that level all day","Indicator is wrong"],a:1,e:"3rd SD is extreme — statistically very likely to snap back toward VWAP."},
{q:"ATR reads $6 on 5-min chart. Minimum stop loss distance?",o:["$6 (1× ATR)","$9 (1.5× ATR)","$3 (0.5× ATR)","$12 (2× ATR)"],a:1,e:"1.5× ATR = $9. Anything tighter gets clipped by normal noise."},
{q:"ATR: $5 before FOMC, $18 after. What happened?",o:["Indicator broken","3.6× volatility expansion — strong reaction","Market is calm","Exit immediately"],a:1,e:"3.6× expansion is typical for FOMC. Adjust stops/targets to new volatility."},
{q:"Bollinger Band squeeze indicates:",o:["Gold about to crash","Big move loading — direction unknown","Bands are broken","Enter position now"],a:1,e:"Squeeze = compressed volatility about to release. Tells magnitude, NOT direction."},
{q:"Price 'walking' along upper Bollinger Band repeatedly. What do you do?",o:["Short it — at resistance","Don't fade it — trend is strong","Buy more","Switch indicators"],a:1,e:"Band walk = strong momentum. Fading it is a classic beginner mistake."},
{q:"Huge price spike on very LOW volume suggests:",o:["Strong move, will continue","Suspicious — liquidity gap, may reverse","Volume doesn't matter","Exchange problems"],a:1,e:"Big move + low volume lacks conviction. Often reverses when real volume returns."},
{q:"Point of Control (POC) in Volume Profile is:",o:["Price with most volume traded","Highest price of day","Opening price","VWAP level"],a:0,e:"POC = most-traded price level. Acts as a magnet — price gravitates toward it."},
{q:"1-hour chart: price below both 21 and 50 EMA. Your 5-min bias?",o:["Bullish — buy the dip","Bearish — only short setups","Neutral","Depends only on VWAP"],a:1,e:"Bearish 1H context = only take short setups on 5-min. Don't fight the bigger trend."},
{q:"DXY spikes UP after NFP. You expect gold to:",o:["Spike up too","Spike down — inverse correlation","Nothing","Can't say"],a:1,e:"Stronger dollar = gold more expensive for foreign buyers = gold falls."},
{q:"VWAP alert fires — gold crossed below VWAP on bar close. This means:",o:["Buy — it's cheap","Intraday bias shifted from bullish to bearish","You've been stopped out","Nothing meaningful"],a:1,e:"VWAP cross on a close (not just a wick) = genuine bias shift. Reassess positions."},
{q:"Correct pre-event scan order:",o:["5-min → calendar → enter","1H trend → 5-min indicators → correlations → calendar → write plan","Just check VWAP","Check Twitter → enter"],a:1,e:"Big picture first (1H), then details (5min), then confirmation (correlations), then plan."},
{q:"Weekly VWAP on the 1-hour chart shows:",o:["Replaces session VWAP","Broader fair value that institutions reference","Just decoration","Where to place stops"],a:1,e:"Institutional-referenced level. Spikes far from weekly VWAP tend to gravitationally pull back."},
{q:"High Volume Nodes on Volume Profile act as:",o:["Guaranteed reversal points","Support/resistance zones","Entry signals","Nothing useful"],a:1,e:"Many traders have positions at HVNs, so price stalls/bounces at these levels."},
{q:"BB Squeeze alert fires. First thing you do:",o:["Enter long","Enter short","Check calendar for upcoming high-impact event","Turn off alert"],a:2,e:"Squeeze means big move coming. Calendar tells you when and why."},
{q:"Gold rising but US10Y also rising. This divergence suggests:",o:["Everything fine","Yellow flag — usually resolves with gold pulling back","Yields don't affect gold","Buy more gold"],a:1,e:"Normally inverse. Both rising = anomaly that typically resolves by gold falling."},
{q:"Most important thing to determine before trading a CPI release:",o:["Consensus forecast","Internet speed","Current dominant macro regime","CNBC predictions"],a:2,e:"Same CPI data can be bullish or bearish depending on inflation-hedge vs rate-cut mode."},
{q:"ATR = $5, account $20K, 2% risk ($400). Max micro contracts?",o:["1","5","10","20"],a:1,e:"Stop = 1.5 × $5 = $7.50. Risk/contract = $75. $400 ÷ $75 = 5.3 → 5 contracts."},
{q:"FOMC candle has 8× normal volume. This means:",o:["Technical issues","Strong conviction — institutions heavily repositioning","Just algorithm noise","Volume irrelevant at FOMC"],a:1,e:"5-10× volume confirms institutional participation = more credible move."},
{q:"1H: above both EMAs (bullish). 5-min: VWAP cross below. What do you do?",o:["Go long — 1H wins","Go short — 5-min is current","Reduce size or wait — timeframes conflict","Trade gut feeling"],a:2,e:"Conflicting timeframes = caution. Reduce size, tighten stops, or wait for realignment."}
],
patterns: [
{q:"Gold rallied 4% into FOMC. Decision 95% priced in. Expect:",o:["Continued rally","Buy the rumor, sell the fact — spike may be a trap","Guaranteed crash","No movement"],a:1,e:"Sep 2025: gold spiked to $3,707 then reversed $73 in hours. Classic sell-the-fact."},
{q:"FOMC 2:00 PM: gold spikes $25 in 2 minutes. Should you chase?",o:["Yes — direction clear","No — Wave 1 often reverses at 2:30 PM press conference","Yes, small position","Only if volume confirms"],a:1,e:"Wave 1 is information, not a signal. Wait for Wave 2 (press conf) and Wave 3 (1-2 days)."},
{q:"NFP: 22K actual vs 75K expected. Gold should:",o:["Drop — fewer jobs = less activity","Rally — weak data boosts rate cut expectations","Stay flat","Can't predict"],a:1,e:"Massive miss weakens dollar + boosts rate cut bets = double tailwind for gold."},
{q:"Gold's inverse correlation with NFP surprise is strongest at:",o:["First 5 minutes","1-hour mark","4-hour mark","Next day"],a:1,e:"FXStreet research: strongest at 1 hour, weakens by 4 hours. First hour is your window."},
{q:"Strong NFP data. Expect big gold sell-off?",o:["Yes — strong always crushes gold","Not necessarily — gold reacts MORE to weak than strong data","Gold ignores NFP","Only if CPI also strong"],a:1,e:"Asymmetric reaction: weak moves gold more than strong. Don't assume strong = crash."},
{q:"Nov 2025: CPI cooler than expected. Gold dipped. Why did LOWER inflation hurt gold?",o:["CPI doesn't affect gold","Dominant regime was inflation-hedge — less inflation reduced gold's appeal","Random noise","Data was wrong"],a:1,e:"When gold is rallying as an inflation hedge, cooler inflation undercuts that thesis."},
{q:"How to determine if regime is 'inflation hedge' or 'rate cut'?",o:["Check CNBC","Look at which narrative has been driving gold over the past month","Always the same","Flip a coin"],a:1,e:"The dominant narrative in recent gold moves tells you the regime."},
{q:"Fed revises GDP DOWN and inflation UP. This is called:",o:["Deflation — gold drops","Stagflation — gold rallies hard","Goldilocks","Recession — gold drops"],a:1,e:"Stagflation = Fed is trapped. Can't cut (inflation) or hike (growth). Gold's best scenario."},
{q:"March 2026: Iran crisis escalating. Gold DROPPED to $4,885. Why?",o:["Gold ignores geopolitics","Crisis was priced in; hawkish dot plot was the new surprise","Iran bought gold","Crisis was fake"],a:1,e:"Known crisis = priced in. New information (dot plot) moved the market."},
{q:"When geopolitics and macro conflict, which wins for gold?",o:["Geopolitics always","Macro wins most of the time","They cancel out","Neither — random"],a:1,e:"Macro dominates. Geopolitical shocks override for 24-48 hours max, then macro reasserts."},
{q:"CME FedWatch shows 97% chance of rate hold. What does this mean for trading?",o:["Don't bother","The move comes from SURPRISES in details — dot plot, tone, projections","Go all in","Short gold"],a:1,e:"When >85% priced in, the headline is stale. Surprises in the fine print drive the move."},
{q:"Rate-cut regime. CPI comes in HOT. Your gold bias?",o:["Long — hot inflation helps gold","Short — hot CPI means fewer cuts, hurts gold","No trade","Long — more uncertainty"],a:1,e:"In rate-cut mode, hot CPI threatens the rate cut narrative. Fewer cuts = gold down."},
{q:"Missed the NFP move. Gold spiked $20 above VWAP. Best re-entry?",o:["Chase at current price","Wait for pullback toward VWAP — mean reversion","Give up","Short it"],a:1,e:"Gold frequently pulls back toward VWAP within 30-60 min after a news spike."},
{q:"Dec 2025 FOMC: 9-3 dissent vote. Why does this matter?",o:["Doesn't matter","High dissent = deep Fed division = more uncertainty and volatility","More dissenters = more cuts","Political theater"],a:1,e:"9-3 split (first since 2019) signals genuine uncertainty about the rate path ahead."},
{q:"Most important CPI component for predicting future inflation:",o:["Food prices","Energy","Shelter/rent costs","Used cars"],a:2,e:"Shelter is stickiest and largest. A shift in shelter inflation signals months of trend change."},
{q:"Plan says: 'If NFP misses by 30K+, go long 3 MGC.' It misses by 45K. DXY dropping. Do what?",o:["Execute the plan exactly","Wait and see","Double the size","Go short instead"],a:0,e:"Execute. The plan exists so you don't improvise in chaos. Conditions met = execute."},
{q:"PCE is released later than CPI. Why watch both?",o:["Same data","PCE can confirm or contradict CPI; Fed weights PCE more heavily","CPI is more important","PCE only for bonds"],a:1,e:"Fed officially targets PCE, not CPI. PCE released later can reset the CPI narrative."},
{q:"Paper trading: profitable 2 months, 42% win rate. Concerned?",o:["Yes — need above 50%","No — 42% is fine IF average win is 2×+ average loss","Yes — try different strategy","Win rate doesn't matter at all"],a:1,e:"42% wins at 2:1 R:R = profitable. Win rate alone is meaningless without R:R context."},
{q:"You and your partner disagree on a trade setup. Right approach?",o:["Screen-watcher decides","Don't trade — disagreement means no clear edge","Flip a coin","Half-size compromise"],a:1,e:"If two people studying the same data disagree, the signal isn't clear. Skip it."},
{q:"5 months in: 3 profitable, 2 losing paper months. Ready for live?",o:["Yes","Maybe — check if losses were controlled and overall is net positive","No — need 100% wins","Yes — 2 months is enough"],a:1,e:"Losing months are normal. Key: were losses controlled? Is the 5-month total positive?"}
]
};

const GLOSSARY = [
  { term: "Ask", def: "The lowest price someone is willing to accept (what you buy at)." },
  { term: "ATR", def: "Average True Range — measures how much gold typically moves per candle. Used for stops, targets, and position sizing." },
  { term: "Band Walk", def: "When price rides along the upper or lower Bollinger Band candle after candle, indicating a very strong trend." },
  { term: "Bid", def: "The highest price someone is willing to pay (what you sell at)." },
  { term: "Bollinger Bands", def: "A moving average with upper/lower bands at 2 standard deviations. Bands squeeze before big moves and expand during them." },
  { term: "Bracket Order (OCO)", def: "One-Cancels-Other — places profit target AND stop loss simultaneously. When one hits, the other cancels." },
  { term: "CPI", def: "Consumer Price Index — measures inflation. Released monthly around the 10th-14th at 8:30 AM ET." },
  { term: "Drawdown", def: "The decline from a peak in your account value to a low point." },
  { term: "DXY", def: "US Dollar Index — measures dollar strength against a basket of currencies. Generally moves inversely to gold." },
  { term: "EMA", def: "Exponential Moving Average — smoothed price average with more weight on recent prices." },
  { term: "Fill", def: "When your order is executed at a specific price." },
  { term: "Flat", def: "Having no open positions." },
  { term: "FOMC", def: "Federal Open Market Committee — sets US interest rates 8 times per year. Decisions at 2:00 PM ET, press conference at 2:30 PM." },
  { term: "GC", def: "Standard gold futures contract — 100 troy ounces, $100 per $1 move." },
  { term: "Going Long", def: "Buying a contract, betting the price will go up." },
  { term: "Going Short", def: "Selling a contract, betting the price will go down." },
  { term: "HVN", def: "High Volume Node — price level where lots of trading occurred. Acts as support/resistance." },
  { term: "Initial Margin", def: "The deposit required to open a futures position." },
  { term: "Leverage", def: "Using a fraction of the contract value (margin) to control the full position. Amplifies gains AND losses." },
  { term: "Limit Order", def: "An order to buy/sell at a specific price or better. Gives price control but may not fill." },
  { term: "Lot", def: "One contract." },
  { term: "LVN", def: "Low Volume Node — price level with little trading. Price moves quickly through these gaps." },
  { term: "Maintenance Margin", def: "Minimum account balance to hold an open position. Falling below triggers a margin call." },
  { term: "Margin Call", def: "Broker demands more funds or closes your position when account drops below maintenance margin." },
  { term: "Market Order", def: "Buy/sell immediately at the current price. Fast but price may differ from expected (slippage)." },
  { term: "Mean Reversion", def: "The tendency for price to return toward average (VWAP) after an extreme move." },
  { term: "MGC", def: "Micro gold futures contract — 10 troy ounces, $10 per $1 move. 1/10th the size of standard GC." },
  { term: "NFP", def: "Non-Farm Payrolls — monthly US jobs report. Released first Friday at 8:30 AM ET." },
  { term: "P&L", def: "Profit and Loss." },
  { term: "PCE", def: "Personal Consumption Expenditures — the Fed's preferred inflation gauge. Released later in the month." },
  { term: "POC", def: "Point of Control — the price with the most volume traded. Acts as a magnet for price." },
  { term: "Priced In", def: "When the market has already moved to reflect an expected outcome. Check CME FedWatch for probability." },
  { term: "R:R", def: "Risk-to-Reward ratio. 1:2 means risking $100 to make $200." },
  { term: "SEP", def: "Summary of Economic Projections — Fed's GDP, unemployment, and inflation forecasts released at FOMC meetings." },
  { term: "Slippage", def: "The difference between your expected price and actual fill price. Worst during fast news events." },
  { term: "Spread", def: "The gap between bid and ask prices — an implicit cost of trading. Widens during news." },
  { term: "Stagflation", def: "GDP growth falling while inflation rises. Fed is trapped — gold's best scenario." },
  { term: "Stop Order", def: "An order that becomes a market order when a price is hit. Your safety net for limiting losses." },
  { term: "Tick", def: "Smallest price increment — $0.10 for gold futures. Worth $10 (GC) or $1 (MGC)." },
  { term: "US10Y", def: "10-Year US Treasury Yield — directly tied to real interest rates, gold's primary long-term driver." },
  { term: "VWAP", def: "Volume Weighted Average Price — shows intraday 'fair value.' Resets each session." },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────

const fadeIn = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes goldGlow { 0%, 100% { box-shadow: 0 0 20px rgba(212,168,83,0.15); } 50% { box-shadow: 0 0 40px rgba(212,168,83,0.3); } }
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "gft_progress";
const NOTES_KEY = "gft_notes";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveProgressData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"); } catch { return {}; }
}
function saveNotesData(data) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(data)); } catch {}
}

function isCourseComplete(progress, courseId) {
  const course = COURSES.find(c => c.id === courseId);
  if (!course) return false;
  return course.chapters.every((_, i) => progress[`lesson_${courseId}_${i}`]);
}

function isTestUnlocked(progress, courseId) {
  return isCourseComplete(progress, courseId);
}

function getOverallProgress(progress) {
  let total = 0, done = 0;
  COURSES.forEach(c => {
    c.chapters.forEach((_, i) => { total++; if (progress[`lesson_${c.id}_${i}`]) done++; });
    total++; if (progress[`test_${c.id}`] >= 80) done++;
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const ProgressDots = ({ total, current, answers, correctAnswers }) => (
  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", margin: "12px 0" }}>
    {Array.from({ length: total }, (_, i) => {
      let bg = i === current ? "#58a6ff" : "#21262d";
      if (answers[i] !== undefined && answers[i] !== -1) {
        if (i < current || (i === current && answers[i] !== -1)) {
          bg = answers[i] === correctAnswers[i] ? "#3fb68b" : "#f85149";
        }
      }
      return <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: bg, transition: "all .2s" }} />;
    })}
  </div>
);

const CircleProgress = ({ pct, size = 56, stroke = 4, color = "#D4A853" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#21262d" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
};

const TabBar = ({ active, onNav, hasNewNotes }) => {
  const tabs = [
    { id: "home", label: "Learn", icon: "📚" },
    { id: "glossary", label: "Glossary", icon: "📖" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "#0d1117", borderTop: "1px solid #21262d",
      display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 8px)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNav(t.id)} style={{
          background: "none", border: "none", cursor: "pointer", padding: "6px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative",
        }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: active === t.id ? "#D4A853" : "#484f58", letterSpacing: 0.3 }}>{t.label}</span>
          {active === t.id && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, background: "#D4A853", borderRadius: 1 }} />}
        </button>
      ))}
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("welcome");
  const [courseId, setCourseId] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [testId, setTestId] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [progress, setProgress] = useState(loadProgress);
  const [notes, setNotes] = useState(loadNotes);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [quickRefCourse, setQuickRefCourse] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => { saveProgressData(progress); }, [progress]);
  useEffect(() => { saveNotesData(notes); }, [notes]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [view, chapterIdx, qIdx, activeTab]);

  const updateProgress = useCallback((key, value) => {
    setProgress(p => ({ ...p, [key]: value }));
  }, []);

  const navigate = (v, tab) => {
    setView(v);
    if (tab) setActiveTab(tab);
    setAnimKey(k => k + 1);
  };

  const startCourse = (id) => { setCourseId(id); setChapterIdx(0); navigate("course"); };
  const startTest = (id) => {
    if (!isTestUnlocked(progress, id)) return;
    setTestId(id);
    setQIdx(0);
    setAnswers(new Array(TESTS[id].length).fill(-1));
    setRevealed(new Array(TESTS[id].length).fill(false));
    navigate("test");
  };

  const selectAnswer = (i) => { if (revealed[qIdx]) return; setAnswers(a => { const n = [...a]; n[qIdx] = i; return n; }); };
  const checkAnswer = () => { if (answers[qIdx] === -1) return; setRevealed(r => { const n = [...r]; n[qIdx] = true; return n; }); };
  const nextQ = () => {
    if (qIdx < TESTS[testId].length - 1) { setQIdx(qIdx + 1); }
    else {
      const correct = answers.filter((a, i) => a === TESTS[testId][i].a).length;
      const pct = Math.round(correct / TESTS[testId].length * 100);
      updateProgress(`test_${testId}`, pct);
      navigate("results");
    }
  };

  const markLessonComplete = (cId, idx) => { updateProgress(`lesson_${cId}_${idx}`, true); };

  const addNote = () => {
    if (!noteText.trim()) return;
    const id = Date.now().toString();
    const ctx = view === "course" ? `${COURSES.find(c=>c.id===courseId)?.title} → Lesson ${chapterIdx+1}` : "";
    setNotes(n => ({ ...n, [id]: { text: noteText.trim(), date: new Date().toLocaleDateString(), context: ctx } }));
    setNoteText("");
  };

  const deleteNote = (id) => { setNotes(n => { const next = {...n}; delete next[id]; return next; }); };
  const updateNote = (id, text) => { setNotes(n => ({ ...n, [id]: { ...n[id], text } })); setEditingNoteId(null); };

  const shareApp = () => {
    const text = "Check out Gold Edge Academy — a free course that teaches you how to trade gold futures using FOMC, NFP, and CPI event patterns. Really well done.";
    if (navigator.share) {
      navigator.share({ title: "Gold Edge Academy", text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`).then(() => alert("Link copied to clipboard!"));
    }
  };

  const formatContent = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} style={{ fontWeight: 600, color: "#e6edf3", margin: "16px 0 6px", fontSize: 15 }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("**")) {
        const parts = line.split("**");
        return <p key={i} style={{ margin: "5px 0", lineHeight: 1.7, fontSize: 14.5, color: "#c9d1d9" }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#e6edf3" }}>{p}</strong> : p)}
        </p>;
      }
      if (line.startsWith("•")) {
        return <p key={i} style={{ margin: "4px 0 4px 16px", fontSize: 14.5, color: "#c9d1d9", lineHeight: 1.6 }}>{line}</p>;
      }
      if (line.startsWith("→")) {
        return <p key={i} style={{ margin: "3px 0 3px 16px", fontSize: 14, color: "#8b949e", lineHeight: 1.5, fontStyle: "italic" }}>{line}</p>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 10 }} />;
      return <p key={i} style={{ margin: "4px 0", fontSize: 14.5, color: "#c9d1d9", lineHeight: 1.7 }}>{line}</p>;
    });
  };

  const overallPct = getOverallProgress(progress);
  const completedCourses = COURSES.filter(c => isCourseComplete(progress, c.id)).length;
  const passedTests = COURSES.filter(c => (progress[`test_${c.id}`] || 0) >= 80).length;

  const showTabs = view !== "welcome" && view !== "test" && view !== "results";

  // ─── WELCOME SCREEN ────────────────────────────────────────────────────────

  if (view === "welcome") {
    return (
      <div ref={scrollRef} style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'DM Sans', sans-serif", overflow: "auto" }}>
        <style>{fadeIn}</style>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          {/* Hero */}
          <div style={{ paddingTop: 60, animation: "fadeIn 0.6s ease both" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: "0 auto 20px",
              background: "linear-gradient(135deg, #D4A853 0%, #b8912e 100%)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
              boxShadow: "0 8px 32px rgba(212,168,83,0.3)",
              animation: "goldGlow 3s ease-in-out infinite",
            }}>⚡</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.2 }}>
              Gold Edge<br />Academy
            </h1>
            <p style={{ fontSize: 14, color: "#8b949e", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
              Learn to trade gold futures using news-driven event strategies. From zero to your first paper trade.
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "32px 0",
            animation: "fadeIn 0.6s ease 0.15s both"
          }}>
            {[
              { n: "22", l: "Lessons" },
              { n: "60", l: "Questions" },
              { n: "3", l: "Courses" },
            ].map((s,i) => (
              <div key={i} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "14px 8px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#D4A853" }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* What you'll learn */}
          <div style={{ animation: "fadeIn 0.6s ease 0.3s both", textAlign: "left" }}>
            <p style={{ fontSize: 12, color: "#D4A853", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>What you'll learn</p>
            {[
              { icon: "📊", text: "Futures contracts, margin, leverage, and order types" },
              { icon: "📈", text: "Chart setup with VWAP, ATR, Bollinger Bands, and volume" },
              { icon: "🎯", text: "FOMC, NFP, and CPI reaction patterns" },
              { icon: "📋", text: "How to build and execute a trade plan" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12,
                animation: `fadeIn 0.4s ease ${0.4 + i * 0.08}s both`
              }}>
                <span style={{ fontSize: 18, marginTop: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ animation: "fadeIn 0.6s ease 0.5s both", margin: "32px 0 20px" }}>
            <button onClick={() => navigate("home", "home")} style={{
              width: "100%", padding: "16px 24px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #D4A853 0%, #c49a3a 100%)", color: "#0d1117",
              fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3,
              boxShadow: "0 4px 20px rgba(212,168,83,0.3)",
            }}>
              Start Learning
            </button>
            <p style={{ fontSize: 12, color: "#484f58", marginTop: 12 }}>100% free — no account needed</p>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "14px 16px",
            textAlign: "left", marginBottom: 40, animation: "fadeIn 0.6s ease 0.6s both"
          }}>
            <p style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: "#f0883e" }}>Disclaimer:</strong> This course is for educational purposes only. Trading futures involves substantial risk of loss. 70-80% of retail traders lose money. Never trade with money you can't afford to lose. Start with paper trading.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LAYOUT WRAPPER ──────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{fadeIn}</style>
      <div ref={scrollRef} style={{ maxWidth: 680, margin: "0 auto", padding: `16px 16px ${showTabs ? "80px" : "20px"}`, minHeight: "100vh" }}>

      {/* ─── HOME ─────────────────────────────────────────────────────────── */}
      {(view === "home" && activeTab === "home") && (
        <div key={animKey} style={{ animation: "fadeIn 0.35s ease both" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>Gold Edge Academy</h1>
              <p style={{ fontSize: 12, color: "#8b949e", margin: "2px 0 0" }}>Your edge in trading gold — goldedge.co</p>
            </div>
            <button onClick={shareApp} style={{
              background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "8px 12px",
              color: "#8b949e", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 14 }}>↗</span> Share
            </button>
          </div>

          {/* Overall Progress */}
          {overallPct > 0 && (
            <div style={{
              background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "16px 18px",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <CircleProgress pct={overallPct} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#D4A853" }}>
                  {overallPct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>Your Progress</div>
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 3 }}>
                  {completedCourses}/3 courses · {passedTests}/3 tests passed
                </div>
              </div>
            </div>
          )}

          {/* Courses */}
          <p style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, fontWeight: 600 }}>Courses</p>
          {COURSES.map((c, ci) => {
            const lessonsComplete = c.chapters.filter((_, i) => progress[`lesson_${c.id}_${i}`]).length;
            const pct = Math.round((lessonsComplete / c.chapters.length) * 100);
            const done = isCourseComplete(progress, c.id);
            return (
              <div key={c.id} onClick={() => startCourse(c.id)} style={{
                background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "16px 16px",
                marginBottom: 8, cursor: "pointer", transition: "border-color .15s, transform .1s",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-1px)"; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>{c.title}</span>
                      {done && <span style={{ fontSize: 11, color: "#3fb68b" }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#8b949e", whiteSpace: "nowrap" }}>{c.chapters.length} lessons</div>
                </div>
                {lessonsComplete > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 3, background: "#21262d", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>{lessonsComplete}/{c.chapters.length} complete</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Reference Cards */}
          <p style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1.2, margin: "20px 0 10px", fontWeight: 600 }}>Quick Reference</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {COURSES.map(c => (
              <div key={c.id} onClick={() => { setQuickRefCourse(c.id); navigate("quickref"); }}
                style={{
                  background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "12px 10px",
                  cursor: "pointer", textAlign: "center", transition: "border-color .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div style={{ fontSize: 11, color: "#c9d1d9", marginTop: 4, fontWeight: 500, lineHeight: 1.3 }}>
                  {c.title.split(" ").slice(0,2).join(" ")}
                </div>
              </div>
            ))}
          </div>

          {/* Tests */}
          <p style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1.2, margin: "4px 0 10px", fontWeight: 600 }}>Knowledge Tests</p>
          {COURSES.map(c => {
            const score = progress[`test_${c.id}`];
            const unlocked = isTestUnlocked(progress, c.id);
            return (
              <div key={c.id} onClick={() => startTest(c.id)} style={{
                background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "14px 16px",
                marginBottom: 8, cursor: unlocked ? "pointer" : "default", display: "flex", alignItems: "center", gap: 12,
                opacity: unlocked ? 1 : 0.5, transition: "border-color .15s",
              }} onMouseEnter={e => { if(unlocked) e.currentTarget.style.borderColor = c.color; }}
                 onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}>
                <span style={{ fontSize: 20 }}>{unlocked ? "📝" : "🔒"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{c.title} Test</div>
                  <div style={{ fontSize: 12, color: "#8b949e" }}>
                    {unlocked ? "20 questions — pass score: 80%" : "Complete all lessons to unlock"}
                  </div>
                </div>
                {score !== undefined && (
                  <div style={{
                    fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                    background: score >= 80 ? "#0d2921" : "#2a1111",
                    color: score >= 80 ? "#3fb68b" : "#f85149"
                  }}>{score}%</div>
                )}
              </div>
            );
          })}

          <p style={{ textAlign: "center", fontSize: 11, color: "#484f58", margin: "24px 0 0" }}>Gold Edge Academy — goldedge.co</p>
        </div>
      )}

      {/* ─── GLOSSARY ─────────────────────────────────────────────────────── */}
      {(view === "home" && activeTab === "glossary") && (
        <div key={`glossary-${animKey}`} style={{ animation: "fadeIn 0.3s ease both" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Glossary</h2>
          <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 14 }}>Quick-look reference for key trading terms</p>
          <input
            type="text" placeholder="Search terms..." value={glossarySearch}
            onChange={e => setGlossarySearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #30363d",
              background: "#161b22", color: "#e6edf3", fontSize: 14, marginBottom: 14,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {GLOSSARY.filter(g => {
              const s = glossarySearch.toLowerCase();
              return !s || g.term.toLowerCase().includes(s) || g.def.toLowerCase().includes(s);
            }).map(g => (
              <div key={g.term} style={{
                background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#D4A853", marginBottom: 3 }}>{g.term}</div>
                <div style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.5 }}>{g.def}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── NOTES ────────────────────────────────────────────────────────── */}
      {(view === "home" && activeTab === "notes") && (
        <div key={`notes-${animKey}`} style={{ animation: "fadeIn 0.3s ease both" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>My Notes</h2>
          <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 14 }}>Capture key insights as you learn</p>

          {/* Add note */}
          <div style={{ marginBottom: 16 }}>
            <textarea
              placeholder="Write a note about something you learned..."
              value={noteText} onChange={e => setNoteText(e.target.value)}
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #30363d",
                background: "#161b22", color: "#e6edf3", fontSize: 14, resize: "vertical",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6,
              }}
            />
            <button onClick={addNote} disabled={!noteText.trim()} style={{
              marginTop: 8, padding: "10px 20px", borderRadius: 8, border: "none",
              background: noteText.trim() ? "#D4A853" : "#21262d",
              color: noteText.trim() ? "#0d1117" : "#484f58",
              fontSize: 14, fontWeight: 600, cursor: noteText.trim() ? "pointer" : "default",
            }}>Save Note</button>
          </div>

          {/* Notes list */}
          {Object.keys(notes).length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#484f58" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <p style={{ fontSize: 14 }}>No notes yet. Add one as you go through lessons!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(notes).sort(([a],[b]) => Number(b) - Number(a)).map(([id, note]) => (
                <div key={id} style={{
                  background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "14px 16px",
                }}>
                  {editingNoteId === id ? (
                    <div>
                      <textarea
                        defaultValue={note.text}
                        id={`edit-${id}`}
                        rows={3}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #30363d",
                          background: "#0d1117", color: "#e6edf3", fontSize: 14, resize: "vertical",
                          outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                        }}
                      />
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button onClick={() => updateNote(id, document.getElementById(`edit-${id}`).value)}
                          style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#D4A853", color: "#0d1117", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingNoteId(null)}
                          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #30363d", background: "none", color: "#8b949e", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.6, margin: "0 0 6px", whiteSpace: "pre-wrap" }}>{note.text}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          {note.context && <span style={{ fontSize: 11, color: "#D4A853", marginRight: 8 }}>{note.context}</span>}
                          <span style={{ fontSize: 11, color: "#484f58" }}>{note.date}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setEditingNoteId(id)} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 12, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => deleteNote(id)} style={{ background: "none", border: "none", color: "#f85149", fontSize: 12, cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ABOUT ────────────────────────────────────────────────────────── */}
      {(view === "home" && activeTab === "about") && (
        <div key={`about-${animKey}`} style={{ animation: "fadeIn 0.3s ease both" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: "0 auto 14px",
              background: "linear-gradient(135deg, #D4A853, #b8912e)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>⚡</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Gold Edge Academy</h2>
            <p style={{ fontSize: 13, color: "#8b949e" }}>News-Driven Gold Trading Education — goldedge.co</p>
          </div>

          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "18px 18px", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#D4A853", marginTop: 0, marginBottom: 8 }}>What is this?</h3>
            <p style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.7, margin: 0 }}>
              A structured course teaching you how to trade gold futures (GC/MGC) using economic events like FOMC decisions, Non-Farm Payrolls, and CPI releases. Built from real market observations and pattern analysis.
            </p>
          </div>

          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "18px 18px", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#D4A853", marginTop: 0, marginBottom: 8 }}>Who is this for?</h3>
            <p style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.7, margin: 0 }}>
              Beginners who want to understand futures trading from scratch, and intermediate traders looking to add a systematic, news-driven strategy for gold. No prior futures experience needed.
            </p>
          </div>

          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "18px 18px", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#D4A853", marginTop: 0, marginBottom: 8 }}>Course Structure</h3>
            <p style={{ fontSize: 14, color: "#c9d1d9", lineHeight: 1.7, margin: 0 }}>
              3 courses with 22 lessons total, plus 60 test questions to validate your understanding. Start with Futures Basics, progress through Chart Setup, and finish with Event Patterns & Strategy. Complete all lessons to unlock each test. 80% required to pass.
            </p>
          </div>

          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "18px 18px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f0883e", marginTop: 0, marginBottom: 8 }}>Risk Disclaimer</h3>
            <p style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.7, margin: 0 }}>
              This is educational content only. Trading futures involves substantial risk of loss and is not suitable for all investors. 70-80% of retail futures traders lose money. Paper trade for at least 2-3 months before considering live trading. Never trade with money you cannot afford to lose.
            </p>
          </div>

          <button onClick={shareApp} style={{
            width: "100%", padding: "14px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #D4A853, #c49a3a)", color: "#0d1117",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Share with a Friend ↗
          </button>
        </div>
      )}

      {/* ─── QUICK REFERENCE ──────────────────────────────────────────────── */}
      {view === "quickref" && (() => {
        const c = COURSES.find(x => x.id === quickRefCourse);
        if (!c) return null;
        return (
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            <button onClick={() => navigate("home", "home")} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Back</button>
            <div style={{
              background: "#161b22", border: `1px solid ${c.color}33`, borderRadius: 14, padding: "20px 18px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${c.color}, ${c.color}66)`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e6edf3" }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "#8b949e" }}>Quick Reference Card</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {c.quickRef.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                    padding: "10px 12px", background: "#0d1117", borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "#8b949e", fontWeight: 500, minWidth: 0 }}>{item.label}</span>
                    <span style={{ fontSize: 13, color: "#e6edf3", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── COURSE / LESSONS ─────────────────────────────────────────────── */}
      {view === "course" && (() => {
        const course = COURSES.find(c => c.id === courseId);
        const chapter = course.chapters[chapterIdx];
        const isComplete = progress[`lesson_${courseId}_${chapterIdx}`];
        return (
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => navigate("home", "home")} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 14 }}>← Back</button>
              <span style={{ color: "#30363d" }}>|</span>
              <span style={{ fontSize: 13, color: course.color, fontWeight: 600 }}>{course.title}</span>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {course.chapters.map((_, i) => (
                <div key={i} onClick={() => setChapterIdx(i)} style={{
                  flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
                  background: progress[`lesson_${courseId}_${i}`] ? course.color : i === chapterIdx ? "#58a6ff" : "#21262d",
                  transition: "background .2s"
                }} />
              ))}
            </div>

            <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 4 }}>Lesson {chapterIdx + 1} of {course.chapters.length}</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", marginBottom: 16 }}>{chapter.title}</h2>

            <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "20px 20px" }}>
              {formatContent(chapter.content)}
            </div>

            {/* Note input for this lesson */}
            <div style={{ marginTop: 14, background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "#D4A853", fontWeight: 600, marginBottom: 6 }}>📝 Add a note for this lesson</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="What's your key takeaway?"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { addNote(); } }}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #30363d",
                    background: "#0d1117", color: "#e6edf3", fontSize: 13, outline: "none",
                  }}
                />
                <button onClick={addNote} disabled={!noteText.trim()} style={{
                  padding: "8px 14px", borderRadius: 6, border: "none",
                  background: noteText.trim() ? "#D4A853" : "#21262d",
                  color: noteText.trim() ? "#0d1117" : "#484f58",
                  fontSize: 13, fontWeight: 600, cursor: noteText.trim() ? "pointer" : "default",
                }}>Add</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <button onClick={() => setChapterIdx(Math.max(0, chapterIdx - 1))} disabled={chapterIdx === 0}
                style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #30363d", background: "#21262d", color: chapterIdx === 0 ? "#484f58" : "#c9d1d9", cursor: chapterIdx === 0 ? "default" : "pointer", fontSize: 14 }}>
                ← Prev
              </button>

              {!isComplete && (
                <button onClick={() => markLessonComplete(courseId, chapterIdx)} style={{
                  padding: "10px 16px", borderRadius: 8, border: "1px solid #3fb68b44",
                  background: "#0d2921", color: "#3fb68b", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  ✓ Mark Complete
                </button>
              )}
              {isComplete && <span style={{ fontSize: 12, color: "#3fb68b", fontWeight: 600 }}>✓ Completed</span>}

              {chapterIdx < course.chapters.length - 1 ? (
                <button onClick={() => { markLessonComplete(courseId, chapterIdx); setChapterIdx(chapterIdx + 1); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: course.color, color: "#0d1117", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  Next →
                </button>
              ) : (
                <button onClick={() => { markLessonComplete(courseId, chapterIdx); if(isTestUnlocked(progress, courseId)) startTest(courseId); else navigate("home","home"); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#D4A853", color: "#0d1117", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  {isTestUnlocked({...progress, [`lesson_${courseId}_${chapterIdx}`]: true}, courseId) ? "Take Test →" : "Done ✓"}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── TEST ─────────────────────────────────────────────────────────── */}
      {view === "test" && (() => {
        const qs = TESTS[testId];
        const q = qs[qIdx];
        const isRevealed = revealed[qIdx];
        return (
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => navigate("home", "home")} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 14 }}>← Quit</button>
              <span style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#8b949e" }}>Question {qIdx + 1} of {qs.length}</span>
            </div>

            <ProgressDots total={qs.length} current={qIdx} answers={answers} correctAnswers={qs.map(q => q.a)} />

            <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, padding: "22px", marginBottom: 12 }}>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#e6edf3", lineHeight: 1.5, marginBottom: 18 }}>{q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.o.map((opt, i) => {
                  let bg = "#0d1117", border = "#30363d", color = "#c9d1d9";
                  if (isRevealed) {
                    if (i === q.a) { bg = "#0d2921"; border = "#3fb68b"; color = "#7ee2b8"; }
                    else if (i === answers[qIdx]) { bg = "#2a1111"; border = "#f85149"; color = "#ffa198"; }
                  } else if (answers[qIdx] === i) { bg = "#111d2e"; border = "#58a6ff"; color = "#e6edf3"; }
                  return (
                    <div key={i} onClick={() => selectAnswer(i)} style={{
                      background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "12px 16px",
                      cursor: isRevealed ? "default" : "pointer", fontSize: 14, color, transition: "all .15s", lineHeight: 1.4
                    }}>{opt}</div>
                  );
                })}
              </div>
              {isRevealed && (
                <div style={{ marginTop: 14, padding: "14px 16px", background: "#0d1117", borderLeft: "3px solid #D4A853", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#8b949e", lineHeight: 1.6 }}>
                  {q.e}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {!isRevealed ? (
                <button onClick={checkAnswer} disabled={answers[qIdx] === -1}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: answers[qIdx] === -1 ? "#21262d" : "#D4A853", color: answers[qIdx] === -1 ? "#484f58" : "#0d1117", cursor: answers[qIdx] === -1 ? "default" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  Check Answer
                </button>
              ) : (
                <button onClick={nextQ}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#D4A853", color: "#0d1117", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  {qIdx < qs.length - 1 ? "Next →" : "See Results"}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── RESULTS ──────────────────────────────────────────────────────── */}
      {view === "results" && (() => {
        const qs = TESTS[testId];
        const correct = answers.filter((a, i) => a === qs[i].a).length;
        const pct = Math.round(correct / qs.length * 100);
        const passed = pct >= 80;
        const course = COURSES.find(c => c.id === testId);
        return (
          <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease both" }}>
            <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>{course.title} Test</div>
            <div style={{ fontSize: 72, fontWeight: 700, color: passed ? "#3fb68b" : "#f85149", margin: "8px 0" }}>{pct}%</div>
            <div style={{ fontSize: 16, color: "#c9d1d9", marginBottom: 4 }}>{correct} of {qs.length} correct</div>
            <div style={{ fontSize: 14, color: "#8b949e", marginBottom: 24, maxWidth: 440, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              {passed
                ? "Great work! You understand this material well enough to move forward."
                : "Not quite there yet — review the explanations below and retake when ready."}
            </div>

            <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, textAlign: "left", maxHeight: 400, overflowY: "auto", marginBottom: 16 }}>
              {qs.map((q, i) => {
                const right = answers[i] === q.a;
                return (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < qs.length - 1 ? "1px solid #21262d" : "none" }}>
                    <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 4 }}>Q{i + 1}: {q.q}</div>
                    <div style={{ fontSize: 13, color: right ? "#3fb68b" : "#f85149", fontWeight: 500 }}>
                      {right ? "✓ Correct" : `✗ Your answer: ${q.o[answers[i]]}`}
                    </div>
                    {!right && <div style={{ fontSize: 12, color: "#3fb68b", marginTop: 2 }}>Correct: {q.o[q.a]}</div>}
                    {!right && <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4, lineHeight: 1.4 }}>{q.e}</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => startTest(testId)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #30363d", background: "#21262d", color: "#c9d1d9", cursor: "pointer", fontSize: 14 }}>Retake</button>
              <button onClick={() => navigate("home", "home")} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#D4A853", color: "#0d1117", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>All Courses</button>
            </div>
          </div>
        );
      })()}

      </div>

      {/* Tab bar */}
      {showTabs && <TabBar active={activeTab} onNav={(tab) => { setActiveTab(tab); setView("home"); setAnimKey(k => k+1); }} />}
    </div>
  );
}
