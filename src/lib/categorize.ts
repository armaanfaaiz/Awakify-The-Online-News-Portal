const taxonomy: Record<string, string[]> = {
  politics: [
    "election","policy","government","president","prime minister","minister","parliament","senate","congress","bill","law","court","supreme court","diplomatic","geopolitics","sanction","coalition","cabinet"
  ],
  world: [
    "global","international","uk","india","china","russia","europe","middle east","africa","asia","war","conflict","border","refugee"
  ],
  technology: [
    "tech","software","hardware","chip","semiconductor","cloud","saas","open source","framework","gadget","smartphone","apple","google","microsoft","meta","amazon"
  ],
  ai: [
    "ai","artificial intelligence","machine learning","ml","deep learning","llm","chatbot","neural","gen ai","generative","openai","gemini","gpt","model"
  ],
  startups: [
    "startup","funding","seed","series a","series b","vc","accelerator","incubator","founder","launch","pitch"
  ],
  business: [
    "market","stock","company","industry","revenue","earnings","profit","merger","acquisition","m&a","ipo","dividend","forecast","layoff","hiring"
  ],
  finance: [
    "bank","interest rate","inflation","federal reserve","rbi","ecb","bond","treasury","currency","forex","credit","debt","loan"
  ],
  markets: [
    "stocks","nasdaq","dow","s&p","sensex","nifty","indices","commodities","gold","oil","brent","wti","crypto"
  ],
  crypto: [
    "bitcoin","ethereum","crypto","blockchain","defi","nft","token","web3","exchange","binance","coinbase"
  ],
  sports: [
    "match","tournament","league","final","world cup","goal","nba","nfl","ipl","cricket","football","soccer","tennis","olympics","medal"
  ],
  science: [
    "research","study","peer-reviewed","quantum","physics","chemistry","biology","genome","climate study","lab","experiment"
  ],
  space: [
    "space","nasa","esa","isro","spacex","rocket","launch","satellite","asteroid","moon","mars","orbit"
  ],
  health: [
    "health","covid","vaccine","hospital","doctor","therapy","mental health","diet","fitness","medical","drug","who"
  ],
  entertainment: [
    "movie","film","tv","series","music","album","concert","celebrity","box office","netflix","bollywood","hollywood"
  ],
  gaming: [
    "game","gaming","esports","playstation","xbox","nintendo","steam","tournament","fps","rpg"
  ],
  education: [
    "university","college","school","curriculum","exam","scholarship","admission","student","teacher"
  ],
  environment: [
    "environment","pollution","wildlife","forest","biodiversity","sustainability","emissions","carbon"
  ],
  climate: [
    "climate","global warming","greenhouse","heatwave","flood","drought","hurricane","cyclone","cop28","cop29"
  ],
  travel: [
    "travel","tourism","flight","airport","visa","hotel","destination","trip"
  ],
  automotive: [
    "car","automotive","ev","electric vehicle","battery","charging","tesla","hybrid","autonomous","self-driving"
  ],
  energy: [
    "energy","renewable","solar","wind","hydrogen","nuclear","grid","power plant","oil","gas"
  ],
  cybersecurity: [
    "cyber","security","breach","hack","ransomware","malware","phishing","zero-day","vulnerability","data leak"
  ],
};

export function categorize(text: string, max: number = 3): string[] {
  const t = (text || "").toLowerCase();
  const scores: Record<string, number> = {};
  for (const [cat, kws] of Object.entries(taxonomy)) {
    let count = 0;
    for (const kw of kws) {
      if (t.includes(kw)) count++;
    }
    if (count > 0) scores[cat] = count;
  }
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
    .slice(0, max);
  return ranked.length ? ranked : ["general"];
}
