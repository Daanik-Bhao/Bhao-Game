import type { GameCard } from '../types/game'

export const LEVEL_SITUATION_CARDS: GameCard[] = [
  {
    id: "dc_s-001",
    name: "Pocket Money Dilemma",
    nameHi: "पॉकेट मनी दुविधा",
    type: 'decision',
    tier: 'common',
    flavor: "₹500 pocket money in hand. Vada pav or piggy bank? (Save first, spend what's left)",
    flavorHi: "हाथ में ₹500 जेब खर्च। वड़ा पाव या गुल्लक? (पहले बचत करें, जो बचा है उसे खर्च करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Drop it in the piggy bank first",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving before you spend is the oldest trick in the book. Whatever is left after saving is your real spending money.",
          shortDescription: "Save in piggy bank",
          shortDescriptionHi: "गुल्लक में सहेजें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put it aside to grow, not to sit idle",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Even small amounts grow when you start early. Time is a teenager's biggest money advantage.",
          shortDescription: "Invest for early growth",
          shortDescriptionHi: "शीघ्र विकास के लिए निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it all, gone by Sunday",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A vada pav now is fine, but spending everything leaves nothing for next week. Spend what's left after saving, not the other way round.",
          shortDescription: "Spend on vada pav",
          shortDescriptionHi: "वड़ा पाव पर खर्च करें"
    },
    ],
      shortName: "Pocket Money",
      shortNameHi: "पॉकेट मनी",
      shortFlavor: "Pocket money. (Save first)",
      shortFlavorHi: "पॉकेट मनी. (पहले सहेजें)"
},
  {
    id: "dc_s-002",
    name: "School Trip Trouble",
    nameHi: "स्कूल ट्रिप का चक्कर",
    type: 'decision',
    tier: 'common',
    flavor: "School trip costs ₹2,000 extra. You have only ₹800. What's the plan? (Planning beats panic)",
    flavorHi: "स्कूल ट्रिप में ₹2,000 अतिरिक्त खर्च है। आपके पास सिर्फ ₹800 हैं। क्या योजना है? (Planning beats panic)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save from weekly allowance, join the next trip",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving a little every week for a known expense is how big goals stop feeling scary. Next trip, the money will already be there.",
          shortDescription: "Save allowance for later",
          shortDescriptionHi: "बाद के लिए भत्ता बचाकर रखें"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Grow the trip fund over the next few months",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Start a goal fund early and let it build up. When you plan ahead, you pay from savings instead of begging or borrowing.",
          shortDescription: "Invest trip funds for growth",
          shortDescriptionHi: "विकास के लिए ट्रिप फंड निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Go anyway, parents bail you out",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Getting bailed out feels easy, but it builds the habit of spending money you don't have. That habit gets expensive with credit cards later.",
          shortDescription: "Rely on parents for trip",
          shortDescriptionHi: "यात्रा के लिए माता-पिता पर निर्भर रहें"
    },
    ],
      shortName: "School Trip",
      shortNameHi: "स्कूल की यात्रा",
      shortFlavor: "Trip planning. (Avoid panic)",
      shortFlavorHi: "यात्रा योजना. (घबराहट से बचें)"
},
  {
    id: "dc_s-003",
    name: "Birthday Bonanza",
    nameHi: "जन्मदिन का उपहार",
    type: 'decision',
    tier: 'common',
    flavor: "Relatives gifted ₹2,100 on your birthday. 'It's for your studies, dear.' (Gift money is seed money)",
    flavorHi: "रिश्तेदारों ने जन्मदिन पर ₹2,100 दिए। 'पढ़ाई के लिए है बेटा।' (Gift money is seed money)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Keep the gift money in the piggy bank",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Gift money is free seed money. Keeping it safe means you have something ready when a real need comes up.",
          shortDescription: "Save gift in piggy bank",
          shortDescriptionHi: "गुल्लक में उपहार सहेजें"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Open a minor FD with parents and earn interest",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A bank FD pays fixed interest and is very safe. Banks let parents open one in a minor's name, so your gift earns while you study.",
          shortDescription: "Open kids fixed deposit",
          shortDescriptionHi: "ओपन किड्स फिक्स्ड डिपॉजिट"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Blow it all on gaming credits",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Gaming credits are gone in a few hours and have zero resale value. Ask yourself: will I still value this next month?",
          shortDescription: "Buy new gaming credits",
          shortDescriptionHi: "नए गेमिंग क्रेडिट खरीदें"
    },
    ],
      shortName: "Birthday Gift",
      shortNameHi: "जन्मदिन का उपहार",
      shortFlavor: "Gift money. (Seed money)",
      shortFlavorHi: "उपहार राशि. (सीड मनी)"
},
  {
    id: "dc_s-004",
    name: "Canteen Temptation",
    nameHi: "कैंटीन प्रलोभन",
    type: 'decision',
    tier: 'common',
    flavor: "Daily canteen costs ₹60, Mom's tiffin is free. That's ₹1,200 a month. (Small daily habits = big yearly numbers)",
    flavorHi: "रोज़ कैंटीन में ₹60 लगते हैं, माँ का टिफिन मुफ़्त है। यानी महीने में ₹1,200। (छोटी दैनिक आदतें = बड़ी वार्षिक संख्याएँ)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Carry tiffin, save ₹1,200 a month",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "₹60 a day sounds tiny, but it is over ₹14,000 a year. Small daily leaks are where most money quietly disappears.",
          shortDescription: "Save money eating tiffin",
          shortDescriptionHi: "टिफ़िन खाने के पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Carry tiffin and invest the monthly savings",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Putting a small amount aside every month is exactly how a SIP works. Regular small amounts plus time beat one big amount later.",
          shortDescription: "Invest daily food savings",
          shortDescriptionHi: "दैनिक भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Canteen samosas every day, ₹14,000+ a year",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A treat once in a while is fine. Doing it daily turns a want into a fixed cost you stop even noticing.",
          shortDescription: "Spend on daily samosas",
          shortDescriptionHi: "रोजाना समोसे पर खर्च करें"
    },
    ],
      shortName: "Canteen Food",
      shortNameHi: "कैंटीन खाना",
      shortFlavor: "Canteen vs tiffin. (Habits)",
      shortFlavorHi: "कैंटीन बनाम टिफिन. (आदतें)"
},
  {
    id: "dc_s-005",
    name: "Second-Hand Cycle Deal",
    nameHi: "सेकेंड-हैंड साइकिल डील",
    type: 'decision',
    tier: 'common',
    flavor: "Classmate is selling his old cycle for ₹1,500. A new one costs ₹6,000. (Value > vanity)",
    flavorHi: "सहपाठी अपनी पुरानी साइकिल ₹1,500 में बेच रहा है। नई ₹6,000 की है। (मूल्य > घमंड)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Buy the used one, save ₹4,500",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "A used cycle takes you to the same tuition class. Paying for what you need, not what looks shiny, is real value.",
          shortDescription: "Buy used cycle and save",
          shortDescriptionHi: "पुरानी साइकिल खरीदें और बचत करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Buy used and put the difference to work",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "The ₹4,500 you didn't spend can keep growing for years. That's opportunity cost: every rupee spent is a rupee that can't grow.",
          shortDescription: "Invest cycle savings wisely",
          shortDescriptionHi: "चक्र बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy new on EMI that parents pay",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "An EMI for something that loses value fast is a bad-debt habit. New things lose their shine in weeks, but EMIs last months.",
          shortDescription: "Buy new cycle with EMI",
          shortDescriptionHi: "ईएमआई पर नई साइकिल खरीदें"
    },
    ],
      shortName: "Used Cycle",
      shortNameHi: "प्रयुक्त साइकिल",
      shortFlavor: "Used cycle deal. (Value)",
      shortFlavorHi: "प्रयुक्त साइकिल का सौदा। (कीमत)"
},
  {
    id: "dc_s-006",
    name: "Merit Scholarship",
    nameHi: "योग्यता छात्रवृत्ति",
    type: 'decision',
    tier: 'common',
    flavor: "School gave you a ₹5,000 merit scholarship. Everyone's asking what you'll do with it. (Reward learning with more learning)",
    flavorHi: "स्कूल ने ₹5,000 की मेरिट स्कॉलरशिप दी। सब पूछ रहे हैं क्या किया? (Reward learning with more learning)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Bank the scholarship money",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Banking it keeps the money safe for future fees or books. Safe is good, but money in a savings account grows slowly.",
          shortDescription: "Bank your scholarship money",
          shortDescriptionHi: "अपनी छात्रवृत्ति का पैसा बैंक में जमा करें"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Spend it on a course or books that build skills",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Spending on skills is an investment, not an expense. What you learn keeps paying you back for the rest of your life.",
          shortDescription: "Invest in educational courses",
          shortDescriptionHi: "शैक्षिक पाठ्यक्रमों में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy new shoes and throw a party",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Celebrating is fine, but spending the whole reward leaves nothing to show for it. Try a small treat and keep the rest.",
          shortDescription: "Buy shoes and celebrate",
          shortDescriptionHi: "जूते खरीदें और जश्न मनाएं"
    },
    ],
      shortName: "Scholarship",
      shortNameHi: "छात्रवृत्ति",
      shortFlavor: "Scholarship money. (Reward learning)",
      shortFlavorHi: "छात्रवृत्ति का पैसा. (सीखने का इनाम)"
},
  {
    id: "dc_s-007",
    name: "Group Food Pressure",
    nameHi: "समूह खाद्य दबाव",
    type: 'decision',
    tier: 'common',
    flavor: "Eating out with friends every weekend, ₹400 each time. FOMO is real. (Friendships don't depend on where you eat)",
    flavorHi: "हर सप्ताहांत दोस्तों के साथ बाहर खाना। FOMO वास्तविक है. (दोस्ती इस बात पर निर्भर नहीं करती कि आप कहां खाते हैं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip 3 weekends, save ₹1,200",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Real friends stay even when you skip a plan. Suggest a cheaper hangout like a park or a movie at home instead.",
          shortDescription: "Skip weekends to save",
          shortDescriptionHi: "बचत करने के लिए सप्ताहांत छोड़ें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Skip a few and invest the savings",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹1,200 a month saved and invested adds up surprisingly fast. Your future self gets a gift, not just your weekend.",
          shortDescription: "Invest weekend food savings",
          shortDescriptionHi: "सप्ताहांत भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Go every weekend, ₹1,600 a month gone",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "FOMO spending never ends because there is always another plan. Decide a monthly fun budget and stick to it.",
          shortDescription: "Spend on weekend eat-outs",
          shortDescriptionHi: "सप्ताहांत खाने-पीने पर खर्च करें"
    },
    ],
      shortName: "Eating Out",
      shortNameHi: "बाहर खाना",
      shortFlavor: "Eating out. (Ignore FOMO)",
      shortFlavorHi: "बाहर खाना. (FOMO पर ध्यान न दें)"
},
  {
    id: "dc_s-008",
    name: "Neighbour Uncle's Job",
    nameHi: "पड़ोसी अंकल की नौकरी",
    type: 'decision',
    tier: 'common',
    shortFlavorHi: "पहली कमाई. (इसका सम्मान करें)",
    shortFlavor: "First earning. (Respect it)",
    shortNameHi: "पहली कमाई",
    shortName: "First Earning",
    flavor: "Neighbour uncle pays ₹1,000 for data entry work. Easy money! (First earned rupee deserves respect)",
    flavorHi: "पड़ोसी अंकल डाटा एंट्री के काम के लिए ₹1,000 देते हैं। आसानी से कमाया पैसा! (पहला कमाया हुआ रुपया सम्मान का पात्र है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save half, spend half", shortDescriptionHi: "आधी कमाई बचाएं", shortDescription: "Save half your earnings",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving part of your first income starts a habit that will matter more than the amount. Pay yourself first, always."
      },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put your first earnings to work", shortDescriptionHi: "पहली कमाई निवेश करें", shortDescription: "Invest your first earnings",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Your first earned rupee invested early has the most years to compound. Starting matters more than the size of the start."
      },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it all the same day", shortDescriptionHi: "सब एक ही दिन खर्च करें", shortDescription: "Spend it all at once",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Money you worked hours for vanishes in minutes when you spend it all at once. Feel the effort before you spend."
      },
    ],
  },
  {
    id: "dc_s-009",
    name: "Lost ₹200",
    nameHi: "₹200 खो गए",
    type: 'decision',
    tier: 'common',
    flavor: "Oops, ₹200 slipped out of your pocket. What now? (Losing money teaches more than earning)",
    flavorHi: "भाई, ₹200 जेब से गिर गए। क्या करते? (Losing money teaches more than earning)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Make do with what's left this week",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Adjusting your spending after a loss is exactly what a budget is for. A small loss, handled calmly, stays small.",
          shortDescription: "Make do with less",
          shortDescriptionHi: "कम से काम चलाओ"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Keep a small buffer aside so this doesn't hurt next time",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A small buffer is a mini emergency fund. Adults keep about 6 months of expenses aside for the same reason.",
          shortDescription: "Invest remaining pocket money",
          shortDescriptionHi: "बची हुई पॉकेट मनी निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Borrow ₹200 more and spend that too",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Borrowing to cover a loss turns one problem into two. Now you are short and you owe someone.",
          shortDescription: "Borrow to spend more",
          shortDescriptionHi: "अधिक खर्च करने के लिए उधार लें"
    },
    ],
      shortName: "Lost Money",
      shortNameHi: "खोया हुआ पैसा",
      shortFlavor: "Lost money. (Learn loss)",
      shortFlavorHi: "पैसा खो गया. (नुकसान जानें)"
},
  {
    id: "dc_s-010",
    name: "Stationery Sale Trap",
    nameHi: "स्टेशनरी बिक्री जाल",
    type: 'decision',
    tier: 'common',
    flavor: "5 cheap pens for ₹50 vs 1 quality pen for ₹40. Dono alag-alag shops. (Cheap bulk often costs more)",
    flavorHi: "₹50 में 5 सस्ते पेन बनाम ₹40 में 1 अच्छा पेन। दोनों अलग-अलग दुकानें। (सस्ते थोक की कीमत अक्सर अधिक होती है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Buy 1 good pen that lasts",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Something that lasts longer is often cheaper in the end. Look at cost per use, not just the price tag.",
          shortDescription: "Buy one quality pen",
          shortDescriptionHi: "एक गुणवत्तापूर्ण पेन खरीदें"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Buy what you need and keep the extra aside",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Buying only what you need frees up money to grow. Bulk deals are only good if you actually use it all.",
          shortDescription: "Invest saved stationery money",
          shortDescriptionHi: "बचाए गए स्टेशनरी के पैसे निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy all 5, lose 3 in a week",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Cheap bulk feels like a deal, but 3 of those pens will be lost or dead in a week. A 'deal' on things you don't need is still a waste.",
          shortDescription: "Buy cheap bulk pens",
          shortDescriptionHi: "सस्ते थोक पेन खरीदें"
    },
    ],
      shortName: "Pen Sale",
      shortNameHi: "कलम बिक्री",
      shortFlavor: "Quality over bulk. (Cheap)",
      shortFlavorHi: "थोक से अधिक गुणवत्ता। (सस्ता)"
},
  {
    id: "dc_s-011",
    name: "Find Money on Road",
    nameHi: "सड़क पर पैसा खोजें",
    type: 'decision',
    tier: 'common',
    flavor: "You spot a ₹500 note on the footpath. No one's around. (Found money isn't free money)",
    flavorHi: "फुटपाथ पर ₹500 का नोट मिला। आसपास कोई नहीं है। (पाया गया पैसा मुफ़्त पैसा नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Hand it in, or keep it safe if no owner is found",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "First try to return it, someone may need it badly. Money that comes easy should still be treated with respect.",
          shortDescription: "Save found money securely",
          shortDescriptionHi: "पाए गए पैसे को सुरक्षित रूप से सहेजें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "If no owner turns up, put it to work",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Unexpected money is the easiest to save because you never planned to spend it. Treat windfalls as growth money.",
          shortDescription: "Invest found money for growth",
          shortDescriptionHi: "विकास के लिए पाया गया धन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it at the chaat stall right away",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Easy come, easy go is how windfalls vanish. Pause a day before spending surprise money.",
          shortDescription: "Spend at chaat stall",
          shortDescriptionHi: "चाट के ठेले पर खर्चा"
    },
    ],
      shortName: "Found Money",
      shortNameHi: "पैसा मिला",
      shortFlavor: "Found money. (Not free)",
      shortFlavorHi: "पैसा मिल गया. (मुक्त नहीं)"
},
  {
    id: "dc_s-012",
    name: "Friend Needs a Loan",
    nameHi: "दोस्त को उधार चाहिए",
    type: 'decision',
    tier: 'common',
    flavor: "Friend needs ₹1,000. You have ₹1,500. What do you say? (Generosity with boundaries)",
    flavorHi: "दोस्त को ₹1,000 की जरूरत है। आपके पास ₹1,500 हैं। क्या बोलोगे? (सीमाओं के साथ उदारता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Lend only what you can afford to lose",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Lend only what you could live without if it never comes back. That keeps both your wallet and the friendship safe.",
          shortDescription: "Lend some and keep some",
          shortDescriptionHi: "कुछ उधार दो और कुछ रखो"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Help a little, keep your savings growing",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Helping friends is good, but not at the cost of your own safety net. Set a clear return date for anything you lend.",
          shortDescription: "Invest kept money wisely",
          shortDescriptionHi: "रखे हुए धन का निवेश सोच-समझकर करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Lend everything and go broke",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Giving away all your money leaves you with nothing for your own emergencies. Boundaries are not selfishness.",
          shortDescription: "Lend all and go broke",
          shortDescriptionHi: "सब उधार दो और बर्बाद हो जाओ"
    },
    ],
      shortName: "Borrowing",
      shortNameHi: "उधार",
      shortFlavor: "Lend money? (Set boundaries)",
      shortFlavorHi: "पैसा उधार लें? (सीमाओं का निर्धारण)"
},
  {
    id: "dc_s-013",
    name: "Gaming Credit Offer",
    nameHi: "गेमिंग क्रेडिट ऑफर",
    type: 'decision',
    tier: 'common',
    flavor: "₹999 gaming credits on sale, 50% off today only! (Virtual spends are real losses)",
    flavorHi: "₹999 के गेमिंग क्रेडिट सेल पर, सिर्फ आज 50% छूट! (Virtual spends are real losses)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip it, virtual coins aren't worth real money",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "'Today only' is a pressure trick to stop you from thinking. If you didn't plan to buy it, a discount doesn't make it a need.",
          shortDescription: "Skip virtual game purchases",
          shortDescriptionHi: "वर्चुअल गेम खरीदारी छोड़ें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put that real money somewhere it can grow",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Real rupees can grow, game coins can't. The same amount saved today can be worth more in a few years.",
          shortDescription: "Invest real money instead",
          shortDescriptionHi: "इसके बजाय वास्तविक धन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy credits, gone in 2 hours of play",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Virtual items have no resale value and disappear fast. In-app purchases are designed to feel small so you buy again and again.",
          shortDescription: "Buy virtual gaming credits",
          shortDescriptionHi: "वर्चुअल गेमिंग क्रेडिट खरीदें"
    },
    ],
      shortName: "Game Credits",
      shortNameHi: "गेम क्रेडिट",
      shortFlavor: "Gaming credits. (Virtual loss)",
      shortFlavorHi: "गेमिंग क्रेडिट. (आभासी हानि)"
},
  {
    id: "dc_s-014",
    name: "Tiffin vs Canteen",
    nameHi: "टिफिन बनाम कैंटीन",
    type: 'decision',
    tier: 'common',
    flavor: "Mom packed your tiffin. Your friend says 'Come to the canteen!' (Mom's tiffin > peer pressure)",
    flavorHi: "माँ ने टिफिन दिया. यार बोल रहा है 'कैंटीन चल!' (मां का टिफिन > साथियों का दबाव)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Eat Mom's tiffin, save ₹50 a day",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "₹50 a day is ₹1,500 a month. Saying no to small peer pressure is practice for saying no to bigger money traps.",
          shortDescription: "Eat tiffin and save",
          shortDescriptionHi: "टिफ़िन खाओ और बचा लो"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Eat tiffin and invest what you save",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Small daily savings invested regularly become a real amount over time. That's the power of compounding.",
          shortDescription: "Invest canteen money saved",
          shortDescriptionHi: "कैंटीन के निवेश का पैसा बचाया"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Canteen daily, ₹1,500 a month for peer approval",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Spending to fit in costs money every single day. Good friends don't care whether you eat from a tiffin.",
          shortDescription: "Spend for peer approval",
          shortDescriptionHi: "सहकर्मी अनुमोदन के लिए खर्च करें"
    },
    ],
      shortName: "Lunch Choice",
      shortNameHi: "दोपहर के भोजन का विकल्प",
      shortFlavor: "Tiffin vs canteen. (Resist)",
      shortFlavorHi: "टिफिन बनाम कैंटीन. (प्रतिरोध करना)"
},
  {
    id: "dc_s-015",
    name: "Flea Market Find",
    nameHi: "गेराज बिक्री खोजें",
    type: 'decision',
    tier: 'common',
    flavor: "Your old comics can sell for ₹800 at the school flea market! (One person's old stuff is another's treasure)",
    flavorHi: "पुरानी कॉमिक्स स्कूल के फ्ली मार्केट में ₹800 में बिक सकती हैं! (किसी का पुराना सामान किसी और का खज़ाना है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Sell and put the money in savings",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Selling things you no longer use turns clutter into cash. Saving it means the old comics paid for something useful.",
          shortDescription: "Save comic sale money",
          shortDescriptionHi: "कॉमिक बिक्री के पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Sell and grow the money for a bigger goal",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Turning old stuff into money and then growing it is a smart cycle. Assets that sit unused earn nothing.",
          shortDescription: "Grow the sale money",
          shortDescriptionHi: "बिक्री का पैसा बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Sell and buy new comics immediately",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Swapping old stuff for new stuff right away keeps you at zero. Keep at least part of every sale.",
          shortDescription: "Buy new comics immediately",
          shortDescriptionHi: "तुरंत नई कॉमिक्स खरीदें"
    },
    ],
      shortName: "Old Toys",
      shortNameHi: "पुराने खिलौने",
      shortFlavor: "Sell old comics. (Gold)",
      shortFlavorHi: "पुरानी कॉमिक्स बेचें. (सोना)"
},
  {
    id: "dc_s-016",
    name: "Zomato Zombie",
    nameHi: "ज़ोमैटो ज़ोंबी",
    type: 'decision',
    tier: 'common',
    flavor: "Hostel mess or Zomato every day? ₹60 vs ₹250 per meal. (Convenience has a monthly price tag)",
    flavorHi: "हॉस्टल मेस या रोज़ ज़ोमैटो? ₹60 बनाम ₹250 प्रति भोजन। (सुविधा का मासिक मूल्य टैग है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Eat at the mess, save ₹5,000+ a month",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Delivery fees, packaging and surge pricing add up fast. Mess food most days keeps your monthly budget sane.",
          shortDescription: "Eat mess food and save",
          shortDescriptionHi: "मेस का खाना खाओ और बचाओ"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Eat at the mess and invest the difference",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "The money saved on daily delivery could be a monthly SIP. Convenience you skip today can be wealth you enjoy later.",
          shortDescription: "Invest food delivery savings",
          shortDescriptionHi: "भोजन वितरण बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Order online daily, ₹5,000+ extra a month",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Daily delivery quietly becomes your biggest expense. Keep ordering in as an occasional treat, not a routine.",
          shortDescription: "Spend extra on Zomato",
          shortDescriptionHi: "ज़ोमैटो पर अतिरिक्त खर्च करें"
    },
    ],
      shortName: "Food Delivery",
      shortNameHi: "भोजन वितरण",
      shortFlavor: "Mess vs Zomato. (Convenience)",
      shortFlavorHi: "मेस बनाम ज़ोमैटो। (सुविधा)"
},
  {
    id: "dc_s-017",
    name: "First Internship Pay",
    nameHi: "प्रथम इंटर्नशिप वेतन",
    type: 'decision',
    tier: 'common',
    flavor: "₹15,000 first earnings from your internship! Everyone says 'Give us a treat!' (First salary = first investment)",
    flavorHi: "इंटर्नशिप से ₹15,000 पहली कमाई! सब बोल रहे हैं 'ट्रीट दे!' (First salary = first investment)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Put it in your savings account",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving is safe, but a savings account earns only around 3% while inflation is about 5-6%. Idle cash slowly loses value.",
          shortDescription: "Save in savings account",
          shortDescriptionHi: "बचत खाते में बचत करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Start your first SIP with part of it",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A SIP at 20 has 40 years to compound. Starting with even ₹500 a month beats starting with ₹5,000 at 35.",
          shortDescription: "Start your first SIP",
          shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it all on the celebration treat",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A small treat is fair, you earned it. Spending the whole first paycheck sets a habit that's hard to break.",
          shortDescription: "Spend on celebration treat",
          shortDescriptionHi: "उत्सव दावत पर खर्च करें"
    },
    ],
      shortName: "First Job",
      shortNameHi: "पहला काम",
      shortFlavor: "First salary. (Invest first)",
      shortFlavorHi: "पहला वेतन. (पहले निवेश करें)"
},
  {
    id: "dc_s-018",
    name: "Semester Fee Panic",
    nameHi: "सेमेस्टर शुल्क को लेकर दहशत",
    type: 'decision',
    tier: 'common',
    flavor: "₹25,000 semester fees due in 2 months. No plan made. (Fee dates don't move. Your savings can.)",
    flavorHi: "2 महीने में ₹25,000 सेमेस्टर फीस। कोई योजना नहीं बनी। (फीस की तारीखें नहीं बदलतीं। आपकी बचत बढ़ सकती है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Set aside a fixed amount from every allowance",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Divide a known bill by the months left, and save that much every month. Known expenses should never be emergencies.",
          shortDescription: "Save from monthly allowance",
          shortDescriptionHi: "मासिक भत्ते से बचाएं"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Park the fee money safely until it's due",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Money needed in 2 months should stay in safe options like a savings account or short FD, not in risky stocks.",
          shortDescription: "Park fee money safely",
          shortDescriptionHi: "फीस का पैसा सुरक्षित रखें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Panic and call parents at the last minute",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Last-minute panic often ends in borrowing. A simple plan made early saves money and stress.",
          shortDescription: "Panic and call parents",
          shortDescriptionHi: "घबराएं और माता-पिता को बुलाएं"
    },
    ],
      shortName: "School Fees",
      shortNameHi: "स्कूल की फीस",
      shortFlavor: "School fees. (Plan savings)",
      shortFlavorHi: "स्कूल की फीस. (योजना बचत)"
},
  {
    id: "dc_s-019",
    name: "Used Textbook Deal",
    nameHi: "प्रयुक्त पाठ्यपुस्तक डील",
    type: 'decision',
    tier: 'common',
    flavor: "Used copy for ₹200 vs new copy for ₹700. Dono available. (Knowledge matters. Not the spine.)",
    flavorHi: "पुरानी किताब ₹200 बनाम नई किताब ₹700। दोनों उपलब्ध हैं। (ज्ञान मायने रखता है, कवर नहीं।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Buy used, save ₹500",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "The chapters are the same in a used book. Saving on things you'll use for just one semester is smart spending.",
          shortDescription: "Buy used books and save",
          shortDescriptionHi: "प्रयुक्त पुस्तकें खरीदें और बचत करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Buy used and invest the difference",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹500 saved on every book over 4 years of college is real money. Invested, it keeps growing after you graduate.",
          shortDescription: "Invest book savings smartly",
          shortDescriptionHi: "बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy the new book, open it 4 times",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Paying full price for something you barely use is the most common money leak. Ask how often you'll actually use it.",
          shortDescription: "Buy new expensive books",
          shortDescriptionHi: "नई महंगी किताबें खरीदें"
    },
    ],
      shortName: "Old Books",
      shortNameHi: "पुरानी किताबें",
      shortFlavor: "Used books. (Knowledge matters)",
      shortFlavorHi: "प्रयुक्त पुस्तकें. (ज्ञान मायने रखता है)"
},
  {
    id: "dc_s-020",
    name: "Crypto Bro Advice",
    nameHi: "क्रिप्टो भाई सलाह",
    type: 'decision',
    tier: 'common',
    flavor: "Friends say: 'Put in ₹5,000, it'll double in a week!' (FOMO is the most expensive emotion)",
    flavorHi: "दोस्तों ने कहा: '₹5,000 लगाओ, एक हफ्ते में डबल हो जाएगा!' (FOMO is the most expensive emotion)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Say no, research first",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "'Double in a week' is the number one sign of a scam or a bubble. Real investments grow over years, not days.",
          shortDescription: "Say no and research first",
          shortDescriptionHi: "ना कहें और पहले शोध करें"
    },
      {
        type: 'invest', asset: 'crypto',
        label: "Invest",
        description: "Only a small amount you can afford to lose",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "If you do try something risky, use only money you can fully lose without pain. Never use fee or emergency money.",
          shortDescription: "Invest only affordable losses",
          shortDescriptionHi: "किफायती घाटे पर ही निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Put it all in, lose it in the dip",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Jumping in because friends did is pure FOMO. Unregulated tips have no protection if prices crash.",
          shortDescription: "Lose money in crypto dip",
          shortDescriptionHi: "क्रिप्टो डिप में पैसा खोएं"
    },
    ],
      shortName: "Bad Advice",
      shortNameHi: "बुरी सलाह",
      shortFlavor: "Crypto tip. (Ignore FOMO)",
      shortFlavorHi: "क्रिप्टो टिप. (FOMO पर ध्यान न दें)"
},
  {
    id: "dc_s-021",
    name: "Skill Up or Chill",
    nameHi: "कौशल बढ़ाएं या शांत रहें",
    type: 'decision',
    tier: 'common',
    flavor: "Coding bootcamp costs ₹8,000. Or Netflix and sleep. (Skills compound like money)",
    flavorHi: "कोडिंग बूटकैंप ₹8,000 का है। या नेटफ्लिक्स और सोना। (कौशल पैसे की तरह बढ़ते हैं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save for 3 months, then pay in cash",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving up first means you learn without debt stress. Patience of 3 months costs nothing extra.",
          shortDescription: "Save up for bootcamp",
          shortDescriptionHi: "बूटकैंप के लिए बचत करें"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Invest in the skill, the ROI is a better job",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Skills are the highest-return investment at your age. Better skills mean a better salary for decades.",
          shortDescription: "Invest in coding skills",
          shortDescriptionHi: "कोडिंग कौशल में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Take a personal loan for the course",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Personal loans can charge 12-24% interest. Borrowing for a course you could save for in 3 months is costly.",
          shortDescription: "Take loan for bootcamp",
          shortDescriptionHi: "बूटकैंप के लिए लोन लें"
    },
    ],
      shortName: "Learn Skills",
      shortNameHi: "कौशल सीखें",
      shortFlavor: "Learn skills. (Skills compound)",
      shortFlavorHi: "कौशल सीखें. (कौशल यौगिक)"
},
  {
    id: "dc_s-022",
    name: "Freelance Windfall",
    nameHi: "फ्रीलांस विंडफॉल",
    type: 'decision',
    tier: 'common',
    flavor: "Client paid ₹3,000 for a logo design. You're the best! (Freelance income = freedom when saved)",
    flavorHi: "ग्राहक ने लोगो डिज़ाइन के लिए ₹3,000 चुकाए। तू ही तो सबसे अच्छा है! (स्वतंत्र आय = बचत होने पर स्वतंत्रता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Bank the freelance income",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Freelance income comes and goes, so a savings cushion is a must. Good months should fund the slow months.",
          shortDescription: "Save freelance logo income",
          shortDescriptionHi: "फ्रीलांस लोगो आय बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put half in a SIP, spend half",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Splitting income between growth and fun is a balanced habit. You enjoy today and still build for tomorrow.",
          shortDescription: "Invest freelance pay in SIP",
          shortDescriptionHi: "एसआईपी में फ्रीलांस वेतन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it all shopping for new clothes",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Spending every rupee of side income means the hustle never builds anything. Save a fixed share from every payment.",
          shortDescription: "Shop for new clothes",
          shortDescriptionHi: "नए कपड़ों की खरीदारी करें"
    },
    ],
      shortName: "Extra Work",
      shortNameHi: "अतिरिक्त कार्य",
      shortFlavor: "Freelance pay. (Save freedom)",
      shortFlavorHi: "फ्रीलांस वेतन. (स्वतंत्रता बचाओ)"
},
  {
    id: "dc_s-023",
    name: "Credit Card Trap (College)",
    nameHi: "क्रेडिट कार्ड ट्रैप (कॉलेज)",
    type: 'decision',
    tier: 'common',
    flavor: "A bank rep on campus: 'Take a free credit card, bro!' (Free credit card isn't free anything)",
    flavorHi: "परिसर में बैंक का प्रतिनिधि। 'फ्री क्रेडिट कार्ड लो भाई!' (मुफ़्त क्रेडिट कार्ड कुछ भी मुफ़्त नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Refuse. Debit card is enough.",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "A debit card spends only your own money. Get a credit card only when you have steady income to pay the full bill every month.",
          shortDescription: "Refuse free credit card",
          shortDescriptionHi: "मुफ़्त क्रेडिट कार्ड से इनकार करें"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Skip the card, build savings instead",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Building savings first means you never need to borrow for wants. Savings earn interest, card debt charges you interest.",
          shortDescription: "Invest instead of borrowing",
          shortDescriptionHi: "उधार लेने के बजाय निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Take it, max it out in month 1, interest piles up",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Paying only the minimum due leaves the rest at around 36-42% yearly interest. That is how small card bills turn into big debt.",
          shortDescription: "Spend and pay card interest",
          shortDescriptionHi: "खर्च करें और कार्ड ब्याज का भुगतान करें"
    },
    ],
      shortName: "Credit Card",
      shortNameHi: "क्रेडिट कार्ड",
      shortFlavor: "Credit card. (Nothing free)",
      shortFlavorHi: "क्रेडिट कार्ड. (कुछ भी मुफ़्त नहीं)"
},
  {
    id: "dc_s-024",
    name: "Group Project Bill",
    nameHi: "समूह परियोजना विधेयक",
    type: 'decision',
    tier: 'common',
    flavor: "Group project material costs ₹1,200. Who pays first? (Money agreements before work begins)",
    flavorHi: "ग्रुप प्रोजेक्ट का सामान ₹1,200 का है। कौन पे करेगा पहले? (Money agreements before work begins)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Split upfront - collect immediately",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Collecting the share upfront avoids awkward chasing later. Clear money talk keeps friendships clean.",
          shortDescription: "Split upfront and collect",
          shortDescriptionHi: "पहले से विभाजित करें और एकत्र करें"
    },
      {
        type: 'invest', asset: 'fd',
        label: "Invest",
        description: "Agree on a split, use UPI requests to collect",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Send a UPI 'request' so friends pay you in a tap. Remember, you only enter your PIN to pay, never to receive money.",
          shortDescription: "Split cost via UPI request",
          shortDescriptionHi: "UPI रिक्वेस्ट से खर्च बांटें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Pay all yourself, spend weeks chasing",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Paying for everyone and hoping to get it back usually means you don't. Agree on money before the work starts.",
          shortDescription: "Pay all and chase friends",
          shortDescriptionHi: "सभी का भुगतान करें और दोस्तों का पीछा करें"
    },
    ],
      shortName: "Project Bill",
      shortNameHi: "प्रोजेक्ट बिल",
      shortFlavor: "Project bill. (Agree upfront)",
      shortFlavorHi: "प्रोजेक्ट बिल. (पहले से सहमत)"
},
  {
    id: "dc_s-025",
    name: "Subscription Overload",
    nameHi: "सदस्यता अधिभार",
    type: 'decision',
    tier: 'common',
    flavor: "Three streaming apps = ₹800 a month. Do you even use them all? (Audit subscriptions every quarter)",
    flavorHi: "तीन स्ट्रीमिंग ऐप = ₹800 महीना। सब यूज़ होता है? (हर तिमाही सदस्यताओं की जाँच करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Keep 1, share 1, drop 1",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Subscriptions auto-renew quietly, so check your bank statement every few months. Cancel what you haven't used in 30 days.",
          shortDescription: "Audit and cancel subscriptions",
          shortDescriptionHi: "ऑडिट करें और सदस्यताएँ रद्द करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Cancel extras and invest the savings",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹500 a month saved from unused apps can be a small SIP. Same money, but now it works for you.",
          shortDescription: "Invest subscription savings wisely",
          shortDescriptionHi: "सदस्यता बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Keep paying for shows you half-watch",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Small auto-debits are easy to forget, which is exactly why companies love them. Unused subscriptions are money on autopilot, going out.",
          shortDescription: "Spend on unused subscriptions",
          shortDescriptionHi: "अप्रयुक्त सदस्यताओं पर खर्च करें"
    },
    ],
      shortName: "Many Apps",
      shortNameHi: "कई ऐप्स",
      shortFlavor: "App subscriptions. (Audit quarterly)",
      shortFlavorHi: "ऐप सदस्यताएँ। (त्रैमासिक ऑडिट)"
},
  {
    id: "dc_s-026",
    name: "Café Study Habit",
    nameHi: "कैफ़े अध्ययन की आदत",
    type: 'decision',
    tier: 'common',
    flavor: "Studying at a café feels cool. ₹250 per visit. (Ambience doesn't help you pass exams)",
    flavorHi: "कैफ़े पे स्टडी करना कूल लगता है। ₹250 प्रति विज़िट। (माहौल आपको परीक्षा पास करने में मदद नहीं करता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Study at home 4 days, café once a week",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "You don't have to quit what you enjoy, just cut how often. Once a week instead of daily saves thousands a month.",
          shortDescription: "Study at home and save",
          shortDescriptionHi: "घर पर पढ़ाई करें और बचत करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Study at home and invest the café money",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Turning a daily habit cost into a monthly investment is a quiet wealth builder. Your marks won't drop either.",
          shortDescription: "Invest cafe study savings",
          shortDescriptionHi: "कैफ़े अध्ययन बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Café every day, ₹5,000+ a month on ambience",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Paying for 'vibes' every day is lifestyle creep starting early. A library or home desk does the same job for free.",
          shortDescription: "Spend on cafe ambience",
          shortDescriptionHi: "कैफ़े के माहौल पर खर्च करें"
    },
    ],
      shortName: "Cafe Study",
      shortNameHi: "कैफ़े अध्ययन",
      shortFlavor: "Cafe study. (Ambience costs)",
      shortFlavorHi: "कैफ़े अध्ययन. (परिवेश लागत)"
},
  {
    id: "dc_s-027",
    name: "Placement Bonus",
    nameHi: "प्लेसमेंट बोनस",
    type: 'decision',
    tier: 'common',
    flavor: "Campus placement! ₹50,000 joining bonus in hand. (Joining bonus sets the tone for life)",
    flavorHi: "कैम्पस प्लेसमेंट! हाथ में ₹50,000 का जॉइनिंग बोनस। (ज्वाइनिंग बोनस जीवन के लिए दिशा निर्धारित करता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Use it to start your emergency fund",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "An emergency fund of about 6 months of expenses protects you from job loss or medical bills. A joining bonus is a perfect head start.",
          shortDescription: "Save for emergency fund",
          shortDescriptionHi: "आपातकालीन निधि के लिए बचत करें"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Start your first mutual fund investment",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Your first mutual fund at the start of your career has decades to compound. Diversified funds spread risk across many companies.",
          shortDescription: "Invest in first mutual fund",
          shortDescriptionHi: "सबसे पहले म्यूचुअल फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Blow it on phone accessories and gadgets",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Gadgets lose value the moment you buy them. Spending your first big money on them sets a costly pattern for every future bonus.",
          shortDescription: "Splurge on gadgets",
          shortDescriptionHi: "गैजेट्स पर उड़ाएं"
    },
    ],
      shortName: "Job Bonus",
      shortNameHi: "नौकरी बोनस",
      shortFlavor: "Joining bonus. (Set tone)",
      shortFlavorHi: "ज्वाइनिंग बोनस. (टोन सेट करें)"
},
  {
    id: "dc_s-028",
    name: "Peer Pressure Trip",
    nameHi: "सहकर्मी दबाव यात्रा",
    type: 'decision',
    tier: 'common',
    flavor: "Friends planned a Goa trip. Budget: ₹15,000 each. You haven't even thought about it yet. (FOMO trips hurt more than FOMO feelings)",
    flavorHi: "दोस्तों ने गोवा का प्लान बनाया। बजट: हर एक का ₹15,000। तुमने अभी तक सोचा भी नहीं। (FOMO वाली ट्रिप FOMO की भावना से ज़्यादा चोट देती है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip this one, plan next trip properly",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Skipping one trip is not missing out forever. Start a trip fund now and join the next one without debt.",
          shortDescription: "Skip Goa and plan properly",
          shortDescriptionHi: "गोवा छोड़ें और ठीक से योजना बनाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Skip it and invest the trip budget",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹15,000 invested at 20 can grow several times by your 40s. Trips will come again, those growth years won't.",
          shortDescription: "Invest Goa trip budget",
          shortDescriptionHi: "गोवा यात्रा बजट में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Go anyway, swipe the credit card",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Swiping a credit card for a trip you can't afford means paying for it for months. If you can't clear the full bill, you can't afford it.",
          shortDescription: "Swipe card for Goa trip",
          shortDescriptionHi: "गोवा यात्रा के लिए कार्ड स्वाइप करें"
    },
    ],
      shortName: "Friend Trip",
      shortNameHi: "मित्र यात्रा",
      shortFlavor: "Goa trip. (Avoid FOMO)",
      shortFlavorHi: "गोवा यात्रा. (FOMO से बचें)"
},
  {
    id: "dc_s-029",
    name: "Library vs Amazon",
    nameHi: "लाइब्रेरी बनाम अमेज़न",
    type: 'decision',
    tier: 'common',
    flavor: "Reference book: ₹1,200 online or free at the library. (The goal is knowledge, not ownership)",
    flavorHi: "संदर्भ पुस्तक: ऑनलाइन ₹1,200 या लाइब्रेरी में मुफ़्त। (लक्ष्य ज्ञान है, स्वामित्व नहीं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Borrow it from the library, save ₹1,200",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Free public resources like libraries are wildly underused. Borrow first, buy only if you will use it again and again.",
          shortDescription: "Borrow from library and save",
          shortDescriptionHi: "पुस्तकालय से उधार लें और बचत करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Borrow it and invest the money saved",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Every rupee you don't need to spend is a rupee that can grow. Free options are the easiest returns you'll ever get.",
          shortDescription: "Invest book purchase savings",
          shortDescriptionHi: "पुस्तक खरीद बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Order it online with same-day delivery",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "One-click buying and fast delivery are built to skip your thinking. Wait a day before any non-urgent purchase.",
          shortDescription: "Buy books with fast delivery",
          shortDescriptionHi: "तेजी से डिलीवरी वाली किताबें खरीदें"
    },
    ],
      shortName: "Buy Book",
      shortNameHi: "किताब खरीदें",
      shortFlavor: "Buy or borrow? (Knowledge)",
      shortFlavorHi: "खरीदें या उधार लें? (ज्ञान)"
},
  {
    id: "dc_s-030",
    name: "Won an Olympiad Prize",
    nameHi: "ओलंपियाड पुरस्कार जीता",
    type: 'decision',
    tier: 'common',
    flavor: "₹10,000 Olympiad prize money! Parents say 'Well done!' (Celebrate smart - the achievement is yours, not the spend)",
    flavorHi: "₹10,000 ओलंपियाड पुरस्कार राशि! माता-पिता बोल रहे हैं 'शाबाश बेटा'। (स्मार्ट जश्न मनाएं - उपलब्धि आपकी है, खर्च की नहीं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Put the prize money in savings",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Parking prize money in savings keeps it safe for the next big need. Just remember savings interest barely keeps up with 5-6% inflation.",
          shortDescription: "Save prize money securely",
          shortDescriptionHi: "पुरस्कार राशि सुरक्षित रूप से सहेजें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put the prize in an index fund",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "An index fund spreads your money across many big companies, so one bad stock can't sink you. Starting this young gives compounding decades to work.",
          shortDescription: "Invest prize in index fund",
          shortDescriptionHi: "पुरस्कार को इंडेक्स फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Throw a party for 40 friends",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A small treat is fine, but blowing the full prize on one party leaves nothing to show for your hard work. The win was yours - keep a part of it.",
          shortDescription: "Spend prize on big party",
          shortDescriptionHi: "बड़ी पार्टी पर पुरस्कार खर्च करें"
    },
    ],
      shortName: "Prize Money",
      shortNameHi: "ईनाम का पैसा",
      shortFlavor: "Prize money. (Celebrate smart)",
      shortFlavorHi: "ईनाम का पैसा। (स्मार्ट जश्न मनाएं)"
},
  {
    id: "dc_s-031",
    name: "Laptop Breakdown",
    nameHi: "लैपटॉप टूटना",
    type: 'decision',
    tier: 'common',
    flavor: "Your laptop has slowed down. ₹3,000 repair or ₹60,000 for a new one? (Repair before replace. Always.)",
    flavorHi: "लैपटॉप स्लो हो गया. ₹3,000 की मरम्मत या ₹60,000 का नया? (बदलने से पहले मरम्मत करें। हमेशा।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Repair first, save for new",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "A cheap repair often buys a year or two more of use. Meanwhile, a monthly saving goal means you pay cash for the next laptop instead of EMI.",
          shortDescription: "Repair first and save later",
          shortDescriptionHi: "पहले मरम्मत करें और बाद में बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Repair it and invest the difference",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Repairing instead of replacing frees up thousands. Putting that difference into a SIP turns a broken laptop into a growing fund.",
          shortDescription: "Invest repair savings smartly",
          shortDescriptionHi: "मरम्मत की बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy a new one on an EMI you can't afford",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "An EMI that strains your budget is bad debt - it buys a depreciating gadget with future income. Miss a payment and your CIBIL score takes the hit too.",
          shortDescription: "Take unaffordable laptop EMI",
          shortDescriptionHi: "अफोर्डेबल लैपटॉप ईएमआई लें"
    },
    ],
      shortName: "Broken Laptop",
      shortNameHi: "टूटा हुआ लैपटॉप",
      shortFlavor: "Broken laptop. (Repair first)",
      shortFlavorHi: "टूटा हुआ लैपटॉप. (पहले मरम्मत करें)"
},
  {
    id: "dc_s-032",
    name: "Part-Time Job Offer",
    nameHi: "अंशकालिक नौकरी की पेशकश",
    type: 'decision',
    tier: 'common',
    flavor: "₹8,000/month part-time job offer. It will eat into your time. (Earning is step 1. Saving is step 2.)",
    flavorHi: "₹8,000 महीने की पार्ट-टाइम नौकरी का ऑफर। टाइम तो लगेगा. (कमाई चरण 1 है। बचत चरण 2 है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save most of the monthly pay",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving a fixed part of every payout builds the habit before the income grows. This is how your first emergency fund gets built.",
          shortDescription: "Save part-time job earnings",
          shortDescriptionHi: "अंशकालिक नौकरी की कमाई बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Start a small SIP from the pay",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Even a ₹500-1,000 monthly SIP started in college gets many extra years of compounding. Time in the market matters more than the amount at the start.",
          shortDescription: "Start SIP with part-time pay",
          shortDescriptionHi: "अंशकालिक वेतन के साथ एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Upgrade your lifestyle right away",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "If every new rupee goes into upgrades, extra income never turns into wealth. That's lifestyle creep starting early.",
          shortDescription: "Inflate lifestyle with new income",
          shortDescriptionHi: "नई आय के साथ जीवनशैली को बढ़ावा दें"
    },
    ],
      shortName: "Part Job",
      shortNameHi: "भाग नौकरी",
      shortFlavor: "Part-time job. (Save earnings)",
      shortFlavorHi: "अंशकालिक नौकरी. (कमाई बचाएं)"
},
  {
    id: "dc_s-033",
    name: "Mess Fee Hike",
    nameHi: "मेस शुल्क में बढ़ोतरी",
    type: 'decision',
    tier: 'common',
    flavor: "Hostel mess raised fees by ₹1,500. Tighten the rest of your budget. (Budget is a living document - adjust it)",
    flavorHi: "हॉस्टल मेस ने फीस ₹1,500 बढ़ा दी। बाकी बजट टाइट करो. (बजट एक जीवित दस्तावेज़ है - इसे समायोजित करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Cut eating-out to cover the hike",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "When one cost goes up, trimming a 'want' like eating out keeps the budget balanced. That's what adjusting a budget really means.",
          shortDescription: "Cut eating out expenses",
          shortDescriptionHi: "बाहर खाने के खर्च में कटौती करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Trim the budget and invest what's left",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Rejigging your budget often uncovers small leftovers. Investing them regularly beats letting them disappear into random spends.",
          shortDescription: "Invest remaining food budget",
          shortDescriptionHi: "बचे हुए भोजन बजट का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Ask home for extra money",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Asking for more each time costs go up means you never learn to adjust. Prices will keep rising all your life - budgeting is the skill that handles it.",
          shortDescription: "Borrow extra from parents",
          shortDescriptionHi: "माता-पिता से अतिरिक्त उधार लें"
    },
    ],
      shortName: "Food Cost",
      shortNameHi: "भोजन की लागत",
      shortFlavor: "Mess fee hike. (Adjust)",
      shortFlavorHi: "मेस शुल्क में बढ़ोतरी. (समायोजित करना)"
},
  {
    id: "dc_s-034",
    name: "Latest Smartphone EMI",
    nameHi: "नवीनतम स्मार्टफोन ईएमआई",
    type: 'decision',
    tier: 'epic',
    flavor: "Everyone has the new phone. You can get it on EMI!",
    flavorHi: "हर किसी के पास नया फ़ोन है. आप इसे ईएमआई पर प्राप्त कर सकते हैं!",
    options: [
      {
        type: 'spend',
        label: "Take EMI",
        description: "Get the phone now, pay EMI for a year",
        effect: { type: 'wealth_pct', value: -27, target: 'self' },
        mentorInsight: "'No-cost' EMIs often hide processing fees or a lost discount, and you're paying for a gadget that loses value every month. Phone EMIs are classic bad debt."
      },
      {
        type: 'save',
        label: "Decline",
        description: "Use old phone",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        mentorInsight: "Your old phone still works, so skipping the EMI keeps your monthly cash free. Save up and buy the next one outright - often cheaper during sales too."
      },
    ],
      shortName: "New Phone",
      shortNameHi: "नया फ़ोन",
      shortFlavor: "New phone EMI. (Avoid)",
      shortFlavorHi: "नये फ़ोन की ईएमआई. (टालना)"
},
  {
    id: "dc_s-035",
    name: "Gym Annual Subscription",
    nameHi: "जिम वार्षिक सदस्यता",
    type: 'decision',
    tier: 'rare',
    flavor: "Huge discount on annual gym membership if you pay via credit card EMI.",
    flavorHi: "यदि आप क्रेडिट कार्ड ईएमआई के माध्यम से भुगतान करते हैं तो वार्षिक जिम सदस्यता पर भारी छूट।",
    options: [
      {
        type: 'invest', asset: 'index',
        label: "Skip & SIP",
        description: "Skip the annual EMI plan, pay monthly once the habit sticks, and SIP the difference in an index fund",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -11, target: 'self' },
        mentorInsight: "A 'discount' paid through credit card EMI usually hides interest or processing fees, and most annual gym plans go unused. Pay monthly until the habit is real, and let the money you didn't lock up compound in an index fund."
      },
      {
        type: 'save',
        label: "Decline",
        description: "Workout at home",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Home workouts cost almost nothing and prove whether the habit sticks. Pay for a gym later, monthly, once you're sure you'll use it."
      },
    ],
      shortName: "Gym Pass",
      shortNameHi: "जिम पास",
      shortFlavor: "Gym EMI. (Avoid debt)",
      shortFlavorHi: "जिम ईएमआई. (कर्ज से बचें)"
},
  {
    id: "dc_s-036",
    name: "First Salary!",
    nameHi: "पहली सैलरी!",
    type: 'decision',
    tier: 'common',
    flavor: "₹35,000 first salary! HR says 'Treat us!' (50-30-20 rule starts from salary #1)",
    flavorHi: "₹35,000 की पहली सैलरी! HR कह रहा है - 'ट्रीट दो!' (50-30-20 नियम पहली सैलरी से शुरू होता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Start your emergency fund",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "An emergency fund of about 6 months' expenses means a job loss or hospital bill won't push you into debt. Salary #1 is the best day to start it.",
          shortDescription: "Start your emergency fund",
          shortDescriptionHi: "अपना आपातकालीन कोष शुरू करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Start your first SIP",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Using 50-30-20, around 20% of salary goes to saving and investing. A SIP set up on payday makes that automatic before you can spend it.",
          shortDescription: "Start your first SIP",
          shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Blow it all in one weekend",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A small treat for family and friends is lovely, but blowing the whole salary sets the pattern for every month after. Habits from salary #1 tend to stick.",
          shortDescription: "Blow salary in one weekend",
          shortDescriptionHi: "एक वीकेंड में उड़ा दो सैलरी"
    },
    ],
      shortName: "First Salary",
      shortNameHi: "पहला वेतन",
      shortFlavor: "First salary. (Use 50-30-20)",
      shortFlavorHi: "पहला वेतन. (50-30-20 का प्रयोग करें)"
},
  {
    id: "dc_s-037",
    name: "PF Opt In or Out",
    nameHi: "पीएफ ऑप्ट इन या आउट",
    type: 'decision',
    tier: 'common',
    flavor: "HR hands you a form: opt in or out of PF? 'You'll get more cash in hand, bro.' (PF is your future self's thank you note)",
    flavorHi: "HR ने फ़ॉर्म दिया - PF में ऑप्ट इन या आउट? 'कैश में ज़्यादा मिलेगा भाई।' (PF आपके भविष्य की ओर से शुक्रिया है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Opt in always - forced saving",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "PF is forced saving - the money is cut before it hits your account, and your employer adds a matching contribution. That match is free money you lose by opting out.",
          shortDescription: "Opt in for forced savings",
          shortDescriptionHi: "जबरन बचत का विकल्प चुनें"
    },
      {
        type: 'invest', asset: 'debt',
        label: "Invest",
        description: "It's investing in 60-year-you",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "EPF earns a government-declared rate, usually above FD rates, and compounds for decades. It quietly builds a big retirement base.",
          shortDescription: "Invest in your future self",
          shortDescriptionHi: "अपने भविष्य में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Opt out and take more cash in hand",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A bit more cash today means losing the employer's share and years of compounding. Where allowed, opting out mostly makes your 60-year-old self poorer.",
          shortDescription: "Opt out and spend cash",
          shortDescriptionHi: "बाहर निकलें और नकद खर्च करें"
    },
    ],
      shortName: "Savings Plan",
      shortNameHi: "बचत योजना",
      shortFlavor: "PF opt-in. (Future thanks)",
      shortFlavorHi: "पीएफ ऑप्ट-इन। (भविष्य धन्यवाद)"
},
  {
    id: "dc_s-038",
    name: "Phone Snatch",
    nameHi: "फ़ोन छीनना",
    type: 'decision',
    tier: 'common',
    flavor: "Someone snatched your phone! Replacement: ₹20,000. (Gadget insurance costs a few hundred a month. Think.)",
    flavorHi: "फ़ोन चुरा लिया किसी ने! नया फ़ोन: ₹20,000. (गैजेट बीमा कुछ सौ रुपये महीने का होता है। सोचिए।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Use an old phone for now and save",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Using a backup phone buys time to save up instead of borrowing. Also block your SIM and UPI apps right away - stolen phones are used for fraud.",
          shortDescription: "Repair old phone and save",
          shortDescriptionHi: "पुराने फोन की मरम्मत करें और बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Buy a budget phone, invest the rest",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A mid-range phone does 95% of what a flagship does. Investing the difference grows; the flagship's value only falls.",
          shortDescription: "Invest gadget insurance savings",
          shortDescriptionHi: "गैजेट बीमा बचत निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy a flagship on impulse",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Panic buying after a loss usually means overspending. Expensive phones lose value fast, so it's money that doesn't come back.",
          shortDescription: "Buy flagship phone on impulse",
          shortDescriptionHi: "आवेग पर फ्लैगशिप फोन खरीदें"
    },
    ],
      shortName: "Stolen Phone",
      shortNameHi: "चोरी हुआ फ़ोन",
      shortFlavor: "Stolen phone. (Insure gadgets)",
      shortFlavorHi: "चोरी हुआ फ़ोन. (गैजेट्स का बीमा करें)"
},
  {
    id: "dc_s-039",
    name: "Salary Hike Time",
    nameHi: "वेतन वृद्धि का समय",
    type: 'decision',
    tier: 'common',
    flavor: "Your boss hints that appraisals are coming up. (Not negotiating is expensive)",
    flavorHi: "बॉस ने इशारा दिया - अप्रेज़ल आने वाला है। (मोलभाव न करना महँगा पड़ता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Research market rate first",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Knowing the market rate for your role gives you facts, not feelings, in the appraisal talk. Preparation alone often gets you a better number.",
          shortDescription: "Research market rate first",
          shortDescriptionHi: "पहले बाजार दर पर शोध करें"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Negotiate! Salary is your biggest asset",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Every future hike is a percentage of your current salary, so a better number now compounds through your whole career. Negotiating politely is normal, not rude.",
          shortDescription: "Negotiate salary for better investment",
          shortDescriptionHi: "बेहतर निवेश के लिए वेतन पर बातचीत करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Accept without asking and lose out every year",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Not asking can cost you lakhs over a career, because each raise builds on the last. The worst answer to a polite ask is just 'no'.",
          shortDescription: "Accept hike without negotiating",
          shortDescriptionHi: "बिना बातचीत के बढ़ोतरी स्वीकार करें"
    },
    ],
      shortName: "Pay Raise",
      shortNameHi: "वेतन बढ़ाने",
      shortFlavor: "Appraisal time. (Always negotiate)",
      shortFlavorHi: "मूल्यांकन का समय. (हमेशा बातचीत करें)"
},
  {
    id: "dc_s-040",
    name: "Lifestyle Creep",
    nameHi: "जीवनशैली रेंगना",
    type: 'decision',
    tier: 'common',
    flavor: "Your salary went up, so you upgraded everything - rent, phone, food. (When income rises, savings rate should too)",
    flavorHi: "सैलरी बढ़ी तो सब कुछ अपग्रेड कर लिया - किराया, फ़ोन, खाना। (आय बढ़े तो बचत दर भी बढ़नी चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Increase savings %, not just spends",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "If your savings rate rises with salary, your future grows as fast as your income. Keeping lifestyle a step behind income is the real secret.",
          shortDescription: "Increase your savings rate",
          shortDescriptionHi: "अपनी बचत दर बढ़ाएँ"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Save 50% of hike",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Sending half of every hike to a SIP step-up means you still enjoy a better life while wealth grows faster. You never miss money you didn't get used to.",
          shortDescription: "Invest half of your hike",
          shortDescriptionHi: "अपनी बढ़ोतरी का आधा हिस्सा निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Upgrade rent, phone and food with the whole hike",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle creep is sneaky - bigger rent and EMIs become fixed costs that are hard to cut later. Many high earners have zero savings because of it.",
          shortDescription: "Inflate lifestyle with salary hike",
          shortDescriptionHi: "वेतन वृद्धि के साथ जीवनशैली को बेहतर बनाएं"
    },
    ],
      shortName: "Spending More",
      shortNameHi: "अधिक खर्च करना",
      shortFlavor: "Lifestyle creep. (Save raise)",
      shortFlavorHi: "जीवनशैली रेंगना. (उठाएँ सहेजें)"
},
  {
    id: "dc_s-041",
    name: "Year-End Bonus",
    nameHi: "साल के अंत का बोनस",
    type: 'decision',
    tier: 'common',
    flavor: "₹50,000 performance bonus! A friend says 'Let's go to Manali!' (Bonus should work harder than you do)",
    flavorHi: "₹50,000 का परफ़ॉर्मेंस बोनस! दोस्त कह रहा है मनाली चलते हैं। (बोनस को आपसे ज़्यादा मेहनत करनी चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Put the bonus in your emergency fund",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "A bonus is the easiest way to fill your emergency fund fast, since it's not part of your monthly budget. Aim for about 6 months of expenses.",
          shortDescription: "Save bonus for emergency fund",
          shortDescriptionHi: "आपातकालीन निधि के लिए बोनस बचाएं"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Invest the bonus in a mutual fund",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A lump sum invested early gets years of compounding. If markets feel high, you can spread it over a few months instead.",
          shortDescription: "Invest bonus in mutual fund",
          shortDescriptionHi: "म्यूचुअल फंड में बोनस निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it all on the Manali trip",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A trip can be worth it, but spending the entire bonus means it did one weekend's work. Try splitting it: some fun, most for goals.",
          shortDescription: "Spend bonus on Manali trip",
          shortDescriptionHi: "मनाली यात्रा पर बोनस खर्च करें"
    },
    ],
      shortName: "Year Bonus",
      shortNameHi: "वर्ष बोनस",
      shortFlavor: "Year-end bonus. (Work hard)",
      shortFlavorHi: "साल के अंत का बोनस. (कड़ी मेहनत करो)"
},
  {
    id: "dc_s-042",
    name: "Dinner with Seniors",
    nameHi: "वरिष्ठ नागरिकों के साथ रात्रि भोज",
    type: 'decision',
    tier: 'common',
    flavor: "Team dinner at a fancy place. Bill: ₹12,000. You suggested splitting. (Be politely firm about money boundaries)",
    flavorHi: "एक शानदार जगह पर टीम का रात्रि भोज। बिल: ₹12,000. आपने बंटवारे का सुझाव दिया. (पैसे की सीमाओं के बारे में विनम्रतापूर्वक दृढ़ रहें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Split equally and stick to your budget",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Being politely clear about money early saves you from being the one who always pays. Good colleagues respect a fair split.",
          shortDescription: "Split equally and stick budget",
          shortDescriptionHi: "समान रूप से विभाजित करें और बजट चिपकाएँ"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Skip the extras and invest the savings",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Ordering sensibly and investing what you didn't spend is a quiet win. Small, regular amounts add up through SIP compounding.",
          shortDescription: "Invest saved dinner budget",
          shortDescriptionHi: "रात के खाने के बजट में बचत करके निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Pay the bill because 'you're the junior'",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Paying to fit in becomes an expected habit. Social pressure is one of the biggest reasons young earners overspend.",
          shortDescription: "Pay bill for senior colleagues",
          shortDescriptionHi: "वरिष्ठ सहकर्मियों के बिल का भुगतान करें"
    },
    ],
      shortName: "Fancy Dinner",
      shortNameHi: "फैंसी डिनर",
      shortFlavor: "Fancy dinner. (Set boundaries)",
      shortFlavorHi: "फैंसी डिनर। (सीमाओं का निर्धारण)"
},
  {
    id: "dc_s-043",
    name: "Work From Home Savings",
    nameHi: "घर से काम की बचत",
    type: 'decision',
    tier: 'common',
    flavor: "WFH saves ₹4,000 a month on commute & food. (Savings windfalls should be redirected, not spent)",
    flavorHi: "WFH से आवागमन और भोजन पर ₹4,000 महीना बचता है। (बचत के अप्रत्याशित लाभ को पुनर्निर्देशित किया जाना चाहिए, खर्च नहीं किया जाना चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save most of it, enjoy a little",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Money you don't spend only becomes savings if you move it somewhere on purpose. Otherwise it quietly leaks into other spends.",
          shortDescription: "Save commute and food money",
          shortDescriptionHi: "आवागमन और भोजन के पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Step up SIP",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Adding the commute savings to your SIP is painless - you were already living without that money. That's the easiest step-up you'll ever do.",
          shortDescription: "Step up your monthly SIP",
          shortDescriptionHi: "अपना मासिक एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it on a new gaming chair",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "One purchase is fine, but if every saving gets spent, WFH never makes you richer. Decide where freed-up money goes before it's gone.",
          shortDescription: "Buy new gaming chair",
          shortDescriptionHi: "नई गेमिंग कुर्सी खरीदें"
    },
    ],
      shortName: "Home Savings",
      shortNameHi: "घर की बचत",
      shortFlavor: "WFH savings. (Redirect windfalls)",
      shortFlavorHi: "डब्ल्यूएफएच बचत. (अप्रत्याशित पुनर्निर्देशन)"
},
  {
    id: "dc_s-044",
    name: "EMI Bombarded",
    nameHi: "ईएमआई बमबारी",
    type: 'decision',
    tier: 'common',
    flavor: "Phone EMI + bike EMI + credit card. 40% of salary gone. (EMIs don't feel heavy till they crush you)",
    flavorHi: "फ़ोन ईएमआई + बाइक ईएमआई + क्रेडिट कार्ड। 40% सैलरी चली गई. (ईएमआई तब तक भारी नहीं लगती जब तक वे आपको कुचल न दें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "No new EMIs until existing ones end",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Experts suggest keeping total EMIs under about 30-40% of take-home pay. Taking no new loans until old ones close is how you get back below that line.",
          shortDescription: "Avoid taking new EMI loans",
          shortDescriptionHi: "नई ईएमआई लोन लेने से बचें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Invest while still paying EMIs",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "If the credit card balance charges 36-42% a year, paying it off gives a better 'return' than almost any investment. Clear high-interest debt first, then invest.",
          shortDescription: "Invest instead of paying EMI",
          shortDescriptionHi: "ईएमआई चुकाने के बजाय निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Add a laptop EMI. Why not.",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Each extra EMI shrinks your cushion for emergencies. One missed payment can hurt your CIBIL score for years.",
          shortDescription: "Add a new laptop EMI",
          shortDescriptionHi: "नए लैपटॉप की ईएमआई जोड़ें"
    },
    ],
      shortName: "Too Many Loans",
      shortNameHi: "बहुत अधिक ऋण",
      shortFlavor: "Too many EMIs. (Crush)",
      shortFlavorHi: "बहुत अधिक ईएमआई. (कुचलना)"
},
  {
    id: "dc_s-045",
    name: "Job Switch Mania",
    nameHi: "जॉब स्विच उन्माद",
    type: 'decision',
    tier: 'common',
    flavor: "30% hike at the new company. There's a joining bonus too. (Hikes should boost savings more than lifestyle)",
    flavorHi: "नई कंपनी में 30% हाइक। जॉइनिंग बोनस भी है. (हाइक से जीवनशैली से ज्यादा बचत को बढ़ावा मिलना चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save the extra from the hike",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Your old salary already covered your life, so the hike can go mostly to savings. That's how you jump ahead without feeling any pinch.",
          shortDescription: "Save money from salary hike",
          shortDescriptionHi: "वेतन वृद्धि से पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Step up your SIP with the hike",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Raising your SIP every time your salary rises is one of the most powerful wealth habits. Compounding on a bigger monthly amount grows much faster.",
          shortDescription: "Step up SIP with hike",
          shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Upgrade your lifestyle right away",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Joining bonuses often have clawback clauses if you leave early - don't spend it all yet. And upgrades made today become monthly costs tomorrow.",
          shortDescription: "Upgrade lifestyle with new hike",
          shortDescriptionHi: "नई बढ़ोतरी के साथ जीवनशैली को उन्नत करें"
    },
    ],
      shortName: "New Job",
      shortNameHi: "नयी नौकरी",
      shortFlavor: "Job switch. (Boost savings)",
      shortFlavorHi: "नौकरी बदलना. (बचत बढ़ाएँ)"
},
  {
    id: "dc_s-046",
    name: "Office Lunch Trap",
    nameHi: "ऑफिस लंच ट्रैप",
    type: 'decision',
    tier: 'common',
    flavor: "₹250 office lunch order, every day. That's ₹5,000+ a month! (Convenience spending is the sneakiest)",
    flavorHi: "रोज़ ₹250 का ऑफिस लंच ऑर्डर। महीने में ₹5,000 से ज़्यादा! (सुविधा व्यय सबसे गुप्त है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Bring tiffin 3 days a week",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Cutting just 3 orders a week saves a couple of thousand a month. Small daily costs are where budgets leak the most.",
          shortDescription: "Bring tiffin to save money",
          shortDescriptionHi: "पैसे बचाने के लिए टिफ़िन लाएँ"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Pack lunch and invest the difference",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹3,000 a month in a SIP over 10 years can grow far beyond what you put in, thanks to compounding. Your lunch box becomes a wealth machine.",
          shortDescription: "Invest office lunch savings",
          shortDescriptionHi: "कार्यालय दोपहर के भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Keep ordering every day",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "₹250 a day doesn't feel like much, but it's ₹60,000+ a year. Delivery fees and app markups make convenience surprisingly expensive.",
          shortDescription: "Spend on daily office lunch",
          shortDescriptionHi: "दैनिक कार्यालय के दोपहर के भोजन पर खर्च करें"
    },
    ],
      shortName: "Office Lunch",
      shortNameHi: "कार्यालय का दोपहर का भोजन",
      shortFlavor: "Office lunch. (Convenience costs)",
      shortFlavorHi: "कार्यालय का दोपहर का भोजन. (सुविधा लागत)"
},
  {
    id: "dc_s-047",
    name: "Side Hustle Win",
    nameHi: "साइड हसल जीत",
    type: 'decision',
    tier: 'common',
    flavor: "Content writing side hustle earned ₹12,000 this month! (Side income = fast-forward button on wealth)",
    flavorHi: "कंटेंट राइटिंग साइड हसल ने इस महीने ₹12,000 कमाए! (अतिरिक्त आय = धन पर तेजी से आगे बढ़ने वाला बटन)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save the side income",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Side income isn't needed for bills, so saving it all builds a cushion fast. Keep some aside for tax too - freelance income must be declared in your ITR.",
          shortDescription: "Save content writing earnings",
          shortDescriptionHi: "सामग्री लेखन आय बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Put the side income into a SIP",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing side income speeds up your goals without touching your salary budget. Two income streams also make you safer if one stops.",
          shortDescription: "Invest side hustle in SIP",
          shortDescriptionHi: "एसआईपी में निवेश पक्ष की हलचल"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend it on an unplanned trip",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Side income often gets spent because it feels like 'bonus money'. Treat it like real income and give it a job.",
          shortDescription: "Spend on unplanned vacation",
          shortDescriptionHi: "अनियोजित छुट्टियों पर खर्च करें"
    },
    ],
      shortName: "Side Job",
      shortNameHi: "साइट जॉब",
      shortFlavor: "Side hustle. (Fast-forward wealth)",
      shortFlavorHi: "पार्श्व ऊधम. (तेजी से आगे बढ़ने वाली संपत्ति)"
},
  {
    id: "dc_s-048",
    name: "MBA Decision",
    nameHi: "एमबीए निर्णय",
    type: 'decision',
    tier: 'common',
    flavor: "₹20 lakh MBA loan. Worth it or not? (Education loans need a repayment plan, not just hope)",
    flavorHi: "₹20 लाख का एमबीए ऋण. क्या यह इसके लायक है या नहीं? (शिक्षा ऋण के लिए पुनर्भुगतान योजना की आवश्यकता है, न कि केवल आशा की)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Research ROI first. Placement record dekhna.",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Check the college's real placement salaries, not just the top package. Compare likely salary with the EMI you'll pay after graduation.",
          shortDescription: "Research ROI and placement first",
          shortDescriptionHi: "पहले आरओआई और प्लेसमेंट पर शोध करें"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Go only if placement data is strong",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "An education loan can be good debt if it clearly raises your earnings. Interest paid on it can also be deducted under Section 80E.",
          shortDescription: "Invest only if placement strong",
          shortDescriptionHi: "प्लेसमेंट मजबूत हो तो ही निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Take a huge loan with no repayment plan",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A big loan with no plan can mean years of EMIs eating your salary. Interest also keeps adding up during the course, so the amount owed grows.",
          shortDescription: "Take unplanned huge education loan",
          shortDescriptionHi: "अनियोजित भारी शिक्षा ऋण लें"
    },
    ],
      shortName: "College Loan",
      shortNameHi: "कॉलेज ऋण",
      shortFlavor: "MBA loan. (Plan repayment)",
      shortFlavorHi: "एमबीए ऋण. (योजना पुनर्भुगतान)"
},
  {
    id: "dc_s-049",
    name: "Telegram Stock Tip",
    nameHi: "टेलीग्राम स्टॉक टिप",
    type: 'decision',
    tier: 'common',
    flavor: "'Bro, I've got a tip. It'll triple in 1 month!' (Free tips are the most expensive advice)",
    flavorHi: "'यार, एक टिप है। 1 महीने में 3 गुना हो जाएगा!' (मुफ़्त टिप सबसे महँगी सलाह होती है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Ignore. Report the channel.",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Promises of '3x in a month' are a classic scam sign. SEBI-registered advisers never give guaranteed-return tips on Telegram or WhatsApp.",
          shortDescription: "Ignore tip and report channel",
          shortDescriptionHi: "टिप और रिपोर्ट चैनल पर ध्यान न दें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Stick to index funds",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Index funds give you the market's growth without needing secret tips. Boring and diversified usually beats exciting and risky.",
          shortDescription: "Stick to safe index funds",
          shortDescriptionHi: "सुरक्षित इंडेक्स फंड पर टिके रहें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy the 'tip' in a pump-and-dump",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "In pump-and-dump schemes, operators buy cheap, hype it, then sell to people like you. Latecomers are left holding the loss.",
          shortDescription: "Invest in pump-and-dump scheme",
          shortDescriptionHi: "पंप-एंड-डंप योजना में निवेश करें"
    },
    ],
      shortName: "Stock Tip",
      shortNameHi: "स्टॉक टिप",
      shortFlavor: "Stock tip. (Tips expensive)",
      shortFlavorHi: "स्टॉक टिप. (टिप्स महंगी)"
},
  {
    id: "dc_s-050",
    name: "Gym vs YouTube",
    nameHi: "जिम बनाम यूट्यूब",
    type: 'decision',
    tier: 'common',
    flavor: "Gym: ₹2,000/month. YouTube: Free. Fitness goals same. (Pay for habits only after proving them free)",
    flavorHi: "जिम: ₹2,000/महीना. यूट्यूब: निःशुल्क. फिटनेस लक्ष्य समान. (आदतों को मुफ़्त साबित करने के बाद ही उनका भुगतान करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "YouTube for 3 months. Gym if consistent.",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Testing a habit for free first means you only pay once you know you'll stick to it. It's the smartest way to avoid wasted memberships.",
          shortDescription: "Try free YouTube workouts first",
          shortDescriptionHi: "पहले निःशुल्क YouTube वर्कआउट आज़माएँ"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Work out free and invest the gym fee",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "₹2,000 a month redirected to a SIP builds both health and wealth. Fitness doesn't need an expensive membership to work.",
          shortDescription: "Invest saved gym membership fees",
          shortDescriptionHi: "जिम सदस्यता शुल्क बचाकर निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Pay monthly, go 4 times, quit",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Gyms count on members who pay and stop coming. An unused membership is just a subscription leak.",
          shortDescription: "Pay gym and quit early",
          shortDescriptionHi: "जिम का भुगतान करें और जल्दी छोड़ दें"
    },
    ],
      shortName: "Home Workout",
      shortNameHi: "घरेलू कसरत",
      shortFlavor: "Gym vs YouTube. (Prove)",
      shortFlavorHi: "जिम बनाम यूट्यूब. (सिद्ध करना)"
},
  {
    id: "dc_s-051",
    name: "Tax Refund Surprise",
    nameHi: "टैक्स रिफंड आश्चर्य",
    type: 'decision',
    tier: 'common',
    flavor: "₹15,000 income tax refund arrived. 'I never planned for this!' (Unexpected income = unexpected future security)",
    flavorHi: "₹15,000 इनकम टैक्स रिफंड आ गया. 'इसका तो प्लान ही नहीं था!' (अप्रत्याशित आय = अप्रत्याशित भविष्य की सुरक्षा)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Add the refund to your emergency fund",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "A refund is your own money coming back, so using it to fill your emergency fund feels painless. Unplanned money is perfect for unplanned emergencies.",
          shortDescription: "Save refund to emergency fund",
          shortDescriptionHi: "आपातकालीन निधि में धनवापसी बचाएं"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Invest the refund in ELSS",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "ELSS funds count under Section 80C (old tax regime, up to ₹1.5 lakh) and have just a 3-year lock-in. Saving tax and growing money at once.",
          shortDescription: "Invest tax refund in ELSS",
          shortDescriptionHi: "टैक्स रिफंड को ईएलएसएस में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend the refund on a weekend trip",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A refund often means too much tax was cut from your salary all year. Spending it on impulse wastes a nice chance to get ahead.",
          shortDescription: "Spend refund on weekend trip",
          shortDescriptionHi: "सप्ताहांत यात्रा पर रिफंड खर्च करें"
    },
    ],
      shortName: "Tax Refund",
      shortNameHi: "कर वापसी",
      shortFlavor: "Tax refund. (Secure future)",
      shortFlavorHi: "कर वापसी। (सुरक्षित भविष्य)"
},
  {
    id: "dc_s-052",
    name: "FOMO Investment",
    nameHi: "FOMO निवेश",
    type: 'decision',
    tier: 'common',
    flavor: "Everyone says you should invest in that startup. Unverified. (FOMO is not a financial strategy)",
    flavorHi: "सब बोल रहे हैं हमें स्टार्टअप में निवेश करो। असत्यापित. (FOMO कोई वित्तीय रणनीति नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Wait. Research first.",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "If you can't verify who runs it and how it makes money, don't put money in. Waiting costs nothing; a scam costs everything.",
          shortDescription: "Wait and research startup first",
          shortDescriptionHi: "प्रतीक्षा करें और पहले स्टार्टअप पर शोध करें"
    },
      {
        type: 'invest', asset: 'smallcap',
        label: "Invest",
        description: "Invest only what you can afford to lose",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Startups are very risky - most fail. If you try one, keep it to a small slice of your money so a total loss doesn't hurt your goals.",
          shortDescription: "Invest maximum affordable loss amount",
          shortDescriptionHi: "अधिकतम किफायती हानि राशि का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Put money into the unverified startup",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Fake 'startup investments' and Ponzi schemes spread through friends and WhatsApp groups. 'Everyone is investing' is not due diligence.",
          shortDescription: "Invest in unverified startup FOMO",
          shortDescriptionHi: "असत्यापित स्टार्टअप FOMO में निवेश करें"
    },
    ],
      shortName: "Rush Invest",
      shortNameHi: "शीघ्र निवेश करें",
      shortFlavor: "FOMO investment. (Not strategy)",
      shortFlavorHi: "FOMO निवेश। (रणनीति नहीं)"
},
  {
    id: "dc_s-053",
    name: "Rent Negotiation",
    nameHi: "किराये पर बातचीत",
    type: 'decision',
    tier: 'common',
    flavor: "Landlord wants ₹3,000 more. Compare other options. (Everything in India is negotiable)",
    flavorHi: "मकान मालिक ₹3,000 अतिरिक्त मांग रहा है। तुलना करो. (भारत में हर चीज़ पर मोलभाव हो सकता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Negotiate down or shift and save yearly",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Checking nearby rents gives you leverage - landlords often prefer a good tenant over a vacant flat. Saving ₹2,000 a month is ₹24,000 a year.",
          shortDescription: "Negotiate rent or shift house",
          shortDescriptionHi: "किराए पर बातचीत करें या घर शिफ्ट करें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Negotiate and invest the rent saved",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Rent is usually your biggest expense, so even a small cut has a big impact. Invest the savings and they keep growing.",
          shortDescription: "Invest saved rent money",
          shortDescriptionHi: "बचाए हुए किराये के पैसे निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Accept silently and pay more every year",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Accepting without asking makes the next hike easier too. A polite, data-backed ask costs nothing.",
          shortDescription: "Accept rent hike silently",
          shortDescriptionHi: "किराये में बढ़ोतरी को चुपचाप स्वीकार करें"
    },
    ],
      shortName: "House Rent",
      shortNameHi: "मकान किराया",
      shortFlavor: "Rent hike. (Always negotiate)",
      shortFlavorHi: "किराये में बढ़ोतरी. (हमेशा बातचीत करें)"
},
  {
    id: "dc_s-054",
    name: "Referral Bonus",
    nameHi: "रेफरल बोनस",
    type: 'decision',
    tier: 'common',
    flavor: "Company referral bonus: ₹25,000 credited! (Bonus ≠ spend. Bonus = advance your goals.)",
    flavorHi: "कंपनी रेफरल बोनस: ₹25,000 मिले! (बोनस ≠ खर्च करें। बोनस = अपने लक्ष्यों को आगे बढ़ाएं।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Park the bonus in a liquid fund",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "A liquid fund usually earns a bit more than a savings account and can be withdrawn in a day or so. Good for building your emergency fund.",
          shortDescription: "Save bonus in liquid fund",
          shortDescriptionHi: "लिक्विड फंड में बोनस बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Top up your SIP with the bonus",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "One-time extra money in your long-term investments gives your goals a jump. Bonuses taken this way add up over a career.",
          shortDescription: "Top up SIP with bonus",
          shortDescriptionHi: "बोनस के साथ एसआईपी टॉप अप करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy new headphones and a watch",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Gadgets bought with bonuses lose value quickly. The bonus is also taxed with salary, so the real amount is smaller than it looks.",
          shortDescription: "Buy new headphone and watch",
          shortDescriptionHi: "नया हेडफोन और घड़ी खरीदें"
    },
    ],
      shortName: "Friend Bonus",
      shortNameHi: "मित्र बोनस",
      shortFlavor: "Referral bonus. (Advance goals)",
      shortFlavorHi: "रेफरल बोनस. (अग्रिम लक्ष्य)"
},
  {
    id: "dc_s-055",
    name: "Forgotten Subscriptions",
    nameHi: "भूली हुई सदस्यताएँ",
    type: 'decision',
    tier: 'common',
    flavor: "4 apps auto-renewing. Total: ₹1,500 a month. When did you even subscribe? (Audit your apps every 3 months)",
    flavorHi: "4 ऐप्स अपने आप रिन्यू हो रहे हैं। कुल: ₹1,500 महीना. कब सब्सक्राइब किया? (हर 3 महीने में अपने ऐप्स का ऑडिट करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Cancel 2 now and save",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Check UPI AutoPay mandates and card subscriptions every few months. Cancelling what you don't use is free money.",
          shortDescription: "Cancel unused subscriptions and save",
          shortDescriptionHi: "अप्रयुक्त सदस्यताएँ रद्द करें और सहेजें"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Cancel them and invest the savings",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "₹1,500 a month freed from unused apps can fund a small SIP. Same money, but now it grows instead of vanishing.",
          shortDescription: "Invest cancelled subscription savings",
          shortDescriptionHi: "रद्द की गई सदस्यता बचत को निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Forget them and lose money all year",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Companies make auto-renewal easy so you forget. Forgotten subscriptions can quietly eat ₹18,000 a year.",
          shortDescription: "Forget subscriptions and lose money",
          shortDescriptionHi: "सदस्यताएँ भूल जाइए और पैसे खो दीजिए"
    },
    ],
      shortName: "Forgotten Apps",
      shortNameHi: "भूले हुए ऐप्स",
      shortFlavor: "Forgotten apps. (Audit quarterly)",
      shortFlavorHi: "भूले हुए ऐप्स. (त्रैमासिक ऑडिट)"
},
  {
    id: "dc_s-056",
    name: "Health Insurance Confusion",
    nameHi: "स्वास्थ्य बीमा भ्रम",
    type: 'decision',
    tier: 'common',
    flavor: "Office plan only, or add a personal plan too? (One surgery will make you wish you had more cover)",
    flavorHi: "केवल ऑफिस प्लान, या पर्सनल प्लान भी जोड़ें? (एक सर्जरी से आप चाहेंगे कि आपके पास और अधिक कवर हो)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Keep office cover and add a personal plan",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Office health cover ends when you leave or lose the job. A personal plan bought young is cheaper and keeps you covered between jobs.",
          shortDescription: "Top up personal health insurance",
          shortDescriptionHi: "व्यक्तिगत स्वास्थ्य बीमा टॉप अप करें"
    },
      {
        type: 'invest', asset: 'debt',
        label: "Invest",
        description: "Buy solid personal health cover",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "One hospital stay can cost lakhs. Health insurance premiums also get a tax deduction under Section 80D.",
          shortDescription: "Invest in your personal health",
          shortDescriptionHi: "अपने व्यक्तिगत स्वास्थ्य में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Only office plan. Hope nothing happens.",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Many office plans cover only ₹3-5 lakh, which one surgery can exceed. Buying later, after a health issue, gets harder and costlier.",
          shortDescription: "Rely only on office plan",
          shortDescriptionHi: "केवल ऑफिस प्लान पर ही भरोसा करें"
    },
    ],
      shortName: "Health Plan",
      shortNameHi: "स्वास्थ्य योजना",
      shortFlavor: "Health insurance. (More cover)",
      shortFlavorHi: "स्वास्थ्य बीमा. (अधिक कवर)"
},
  {
    id: "dc_s-057",
    name: "Invest or Travel?",
    nameHi: "निवेश करें या यात्रा करें?",
    type: 'decision',
    tier: 'common',
    flavor: "₹2 lakh saved. Europe trip or mutual fund? (Travel is beautiful. Compound interest is more beautiful.)",
    flavorHi: "₹2 लाख बचाए. यूरोप यात्रा या म्यूचुअल फंड? (यात्रा सुंदर है। चक्रवृद्धि ब्याज अधिक सुंदर है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Travel local and invest most of it",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "A local trip gives you the break for a fraction of the cost. You get the memories and keep most of your savings growing.",
          shortDescription: "Travel local and save money",
          shortDescriptionHi: "स्थानीय यात्रा करें और पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'equity',
        label: "Invest",
        description: "Put the savings in an equity fund",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Equity funds can swing in the short term but have historically beaten inflation over long periods. Money invested in your 20s has the most time to compound.",
          shortDescription: "Invest savings in equity fund",
          shortDescriptionHi: "बचत को इक्विटी फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Book the Europe trip on a whim",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Travel is worth saving for - planned. Spending all your savings on a whim leaves you with no cushion if an emergency hits.",
          shortDescription: "Travel to Europe on whim",
          shortDescriptionHi: "मनमर्जी से यूरोप की यात्रा करें"
    },
    ],
      shortName: "Save or Travel",
      shortNameHi: "सहेजें या यात्रा करें",
      shortFlavor: "Invest or travel? (Compound)",
      shortFlavorHi: "निवेश करें या यात्रा करें? (मिश्रण)"
},
  {
    id: "dc_s-058",
    name: "Upskilling Payoff",
    nameHi: "अपस्किलिंग अदायगी",
    type: 'decision',
    tier: 'common',
    flavor: "A ₹20,000 course led to a 25% salary hike! (Skills don't just pay - they compound)",
    flavorHi: "₹20,000 के कोर्स से 25% वेतन वृद्धि हुई! (कौशल केवल लाभ नहीं देता - वे जुड़ते हैं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save the extra every month",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Your skills raised your income - keeping your expenses the same turns that raise into real savings.",
          shortDescription: "Save more money monthly",
          shortDescriptionHi: "मासिक रूप से अधिक पैसे बचाएं"
    },
      {
        type: 'invest', asset: 'index',
        label: "Invest",
        description: "Step up your SIP with the hike",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing in skills and then investing the payoff is double compounding. Keep learning and keep stepping up your SIP.",
          shortDescription: "Step up SIP with hike",
          shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spend the whole hike on lifestyle",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "If the hike vanishes into upgrades, your effort pays only for more stuff. Lifestyle creep turns a raise into nothing.",
          shortDescription: "Spend salary hike on lifestyle",
          shortDescriptionHi: "वेतन वृद्धि को जीवनशैली पर खर्च करें"
    },
    ],
      shortName: "Skill Bonus",
      shortNameHi: "कौशल बोनस",
      shortFlavor: "Upskilling payoff. (Skills compound)",
      shortFlavorHi: "अपस्किलिंग अदायगी। (कौशल यौगिक)"
},
  {
    id: "dc_s-059",
    name: "Dream Home: Home Loan",
    nameHi: "घर का सपना: होम लोन",
    type: 'decision',
    tier: 'common',
    flavor: "The bank will fund 80% of a flat's price. The dream 3BHK needs a huge EMI; a smaller 2BHK fits your budget. (Buy the home your salary can carry)",
    flavorHi: "बैंक फ्लैट की कीमत का 80% लोन देगा। सपनों के 3BHK की EMI बहुत बड़ी है; छोटा 2BHK आपके बजट में है। (वही घर लें जिसका बोझ आपकी सैलरी उठा सके)",
    options: [
      {
        type: 'save',
        label: "Rent & Save",
        description: "Keep renting and grow the down payment", shortDescriptionHi: "किराये पर रहें, डाउन पेमेंट बचाएँ", shortDescription: "Rent longer, save down payment",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Renting while your down payment grows isn't wasted money. It keeps you flexible and avoids a loan you can't carry."
      },
      {
        type: 'invest', asset: 'realestate',
        label: "Smaller Home",
        description: "Buy the 2BHK with a solid down payment", shortDescriptionHi: "किफायती 2BHK खरीदें", shortDescription: "Buy affordable 2BHK",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A home with EMI under about 30-35% of take-home pay builds an asset without choking your other goals."
      },
      {
        type: 'spend',
        label: "Dream 3BHK",
        description: "Max out the loan for the big flat", shortDescriptionHi: "सपनों के 3BHK के लिए खिंचें", shortDescription: "Stretch for dream 3BHK",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A max-stretch loan can mean 20 years of EMIs eating half your salary, leaving nothing for emergencies or retirement."
      },
    ],
      shortName: "Home Loan",
      shortNameHi: "होम लोन",
      shortFlavor: "Rent or buy? (Affordable EMI)",
      shortFlavorHi: "किराया या खरीद? (सस्ती EMI)"
},
  {
    id: "dc_s-060",
    name: "Prepay EMI or SIP?",
    nameHi: "EMI प्रीपे या SIP?",
    type: 'decision',
    tier: 'epic',
    flavor: "Your annual bonus is in. Prepay part of the home loan, start an equity SIP, or finally buy that new car? (Know the maths before you choose)",
    flavorHi: "सालाना बोनस आ गया। होम लोन का कुछ हिस्सा चुकाएँ, इक्विटी SIP शुरू करें, या आखिरकार नई कार खरीदें? (चुनने से पहले हिसाब समझें)",
    options: [
      {
        type: 'save',
        label: "Prepay Loan",
        description: "Part-prepay the home loan principal", shortDescriptionHi: "होम लोन का प्रीपेमेंट करें", shortDescription: "Prepay home loan",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Prepaying a ~9% home loan is a guaranteed, risk-free 'return' equal to that interest rate, and it cuts years off your tenure."
      },
      {
        type: 'invest', asset: 'equity',
        label: "Start SIP",
        description: "Keep the EMI and invest the bonus in an equity SIP", shortDescriptionHi: "बोनस SIP में निवेश करें", shortDescription: "Invest bonus via SIP",
        effect: { type: 'wealth_pct', value: 25, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Over 10+ years, diversified equity has historically beaten home loan rates, but it isn't guaranteed. Many people split the bonus between both."
      },
      {
        type: 'spend',
        label: "New Car",
        description: "Use the bonus as down payment on a new car", shortDescriptionHi: "नई कार खरीदें", shortDescription: "Buy a new car",
        effect: { type: 'wealth_pct', value: -28, target: 'self' },
        mentorInsight: "A car loses value from day one and adds a new EMI, while your home loan interest keeps ticking."
      },
    ],
      shortName: "Prepay or SIP",
      shortNameHi: "प्रीपे या SIP",
      shortFlavor: "Bonus choice. (Do the maths)",
      shortFlavorHi: "बोनस का फैसला। (हिसाब लगाएँ)"
},
  {
    id: "dc_s-061",
    name: "Term Plan or ULIP?",
    nameHi: "टर्म प्लान या ULIP?",
    type: 'decision',
    tier: 'common',
    flavor: "Baby on the way! An agent pitches a 'guaranteed return' insurance plan. A friend says just buy pure term cover. (Insurance protects, investments grow — keep them separate)",
    flavorHi: "बच्चा आने वाला है! एक एजेंट 'गारंटीड रिटर्न' वाला बीमा प्लान बेच रहा है। दोस्त कहता है बस टर्म कवर लो। (बीमा सुरक्षा देता है, निवेश बढ़ाता है — दोनों अलग रखें)",
    options: [
      {
        type: 'save',
        label: "Term Only",
        description: "Buy a pure term plan, keep the rest in savings", shortDescriptionHi: "शुद्ध टर्म कवर लें", shortDescription: "Buy pure term cover",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "A term plan of 10-15x your annual income gives your family real protection at a fraction of the cost of traditional plans."
      },
      {
        type: 'invest', asset: 'index',
        label: "Term + Invest",
        description: "Buy term cover and invest the premium you saved", shortDescriptionHi: "टर्म लें, बाकी निवेश करें", shortDescription: "Buy term, invest the rest",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "'Buy term, invest the rest' gives your family big cover and lets the leftover money grow in low-cost investments."
      },
      {
        type: 'spend',
        label: "Agent's Plan",
        description: "Sign up for the ULIP/endowment 'combo' plan", shortDescriptionHi: "ULIP/एंडोमेंट कॉम्बो लें", shortDescription: "Buy ULIP/endowment combo",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Combo plans often give low cover and, after charges, modest returns. Mixing insurance and investment usually does both badly."
      },
    ],
      shortName: "Term Insurance",
      shortNameHi: "टर्म बीमा",
      shortFlavor: "Life cover. (Term > ULIP)",
      shortFlavorHi: "जीवन बीमा। (टर्म > ULIP)"
},
  {
    id: "dc_s-062",
    name: "Family Floater Health Plan",
    nameHi: "फैमिली फ्लोटर हेल्थ प्लान",
    type: 'decision',
    tier: 'common',
    flavor: "Your office cover is ₹3 lakh and ends if you switch jobs. Spouse and kid have no cover of their own. (One hospital bill can undo years of saving)",
    flavorHi: "ऑफिस का कवर ₹3 लाख का है और नौकरी बदलते ही खत्म हो जाएगा। पति/पत्नी और बच्चे का अपना कोई कवर नहीं है। (एक अस्पताल का बिल सालों की बचत मिटा सकता है)",
    options: [
      {
        type: 'save',
        label: "Self Cover",
        description: "Buy a basic personal policy for yourself", shortDescriptionHi: "अपने लिए बेसिक कवर", shortDescription: "Basic cover for yourself",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Your own policy stays with you even if you change jobs, unlike office cover. A good first step."
      },
      {
        type: 'invest', asset: 'debt',
        label: "Floater+Top-up",
        description: "Buy a family floater plus a super top-up", shortDescriptionHi: "फैमिली फ्लोटर + टॉप-अप", shortDescription: "Family floater + top-up",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A family floater shares one sum insured across the family, and a super top-up adds big cover cheaply. Buying young means lower premiums and waiting periods end sooner."
      },
      {
        type: 'spend',
        label: "Skip It",
        description: "Rely on office cover and spend the premium", shortDescriptionHi: "छोड़ें, ऑफिस कवर पर निर्भर रहें", shortDescription: "Skip it, rely on office cover",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Office cover is often too small for a family and vanishes with the job. Without insurance, a hospital stay can turn into debt."
      },
    ],
      shortName: "Health Cover",
      shortNameHi: "स्वास्थ्य कवर",
      shortFlavor: "Family health plan. (Buy early)",
      shortFlavorHi: "परिवार का हेल्थ प्लान। (जल्दी लें)"
},
  {
    id: "dc_s-063",
    name: "Emergency Fund: Start Now",
    nameHi: "इमरजेंसी फंड: अभी से",
    type: 'decision',
    tier: 'rare',
    flavor: "Layoff rumours at office. You have barely one month's expenses in the bank. (Six months of expenses = sleep well at night)",
    flavorHi: "ऑफिस में छंटनी की अफवाहें। बैंक में मुश्किल से एक महीने का खर्च है। (छह महीने का खर्च = चैन की नींद)",
    options: [
      {
        type: 'save',
        label: "Save 10%",
        description: "Put 10% of salary aside until you hit 6 months", shortDescriptionHi: "आपातकाल के लिए 10% बचाएँ", shortDescription: "Save 10% for emergencies",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "About 6 months of expenses set aside means a job loss or hospital bill won't force you to sell investments or borrow."
      },
      {
        type: 'invest', asset: 'debt',
        label: "Fund + SIP",
        description: "Park the fund in a liquid fund or sweep-in FD, then SIP the extra", shortDescriptionHi: "लिक्विड फंड, फिर SIP", shortDescription: "Liquid fund, then SIP",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "A liquid fund or sweep-in FD usually earns more than a savings account and stays accessible. Once the fund is full, invest the extra."
      },
      {
        type: 'spend',
        label: "Card Is Backup",
        description: "Skip it. Your credit card is the emergency fund", shortDescriptionHi: "क्रेडिट कार्ड को बैकअप मानें", shortDescription: "Use credit card as backup",
        effect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "A credit card 'emergency fund' charges around 36-42% a year in interest, exactly when you can least afford it."
      },
    ],
      shortName: "Emergency Fund",
      shortNameHi: "इमरजेंसी फंड",
      shortFlavor: "Build a buffer. (6 months)",
      shortFlavorHi: "बफर बनाएँ। (6 महीने)"
},
  {
    id: "dc_s-064",
    name: "Child's Education Fund",
    nameHi: "बच्चे की पढ़ाई फंड",
    type: 'decision',
    tier: 'common',
    flavor: "Your child just started school. College is 15 years away and fees keep doubling. (Start early, let time do the heavy lifting)",
    flavorHi: "बच्चे ने अभी स्कूल शुरू किया है। कॉलेज 15 साल दूर है और फीस बढ़ती ही जा रही है। (जल्दी शुरू करें, बाकी काम समय करेगा)",
    options: [
      {
        type: 'save',
        label: "Safe Savings",
        description: "Start a PPF or RD in the child's name", shortDescriptionHi: "बच्चे के लिए PPF/RD खोलें", shortDescription: "Open PPF/RD for child",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Any dedicated savings for your child beats starting late, and safe options like PPF protect the money you put in."
      },
      {
        type: 'invest', asset: 'equity',
        label: "Start SIP Now",
        description: "Start an equity SIP for the 15-year goal", shortDescriptionHi: "शिक्षा SIP शुरू करें", shortDescription: "Start education SIP",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Education costs in India rise roughly 10% a year. A SIP started now has 15 years to compound and beat that inflation."
      },
      {
        type: 'spend',
        label: "Big Party Now",
        description: "Wait on it and throw a grand birthday party", shortDescriptionHi: "भव्य पार्टी पर खर्च करें", shortDescription: "Spend on grand party",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Every year you delay, the monthly amount needed for the same college fund goes up sharply."
      },
    ],
      shortName: "Education Fund",
      shortNameHi: "शिक्षा फंड",
      shortFlavor: "Child's future. (Start early)",
      shortFlavorHi: "बच्चे का भविष्य। (जल्दी शुरू करें)"
},
  {
    id: "dc_s-065",
    name: "NPS, PPF or Nothing?",
    nameHi: "NPS, PPF या कुछ नहीं?",
    type: 'decision',
    tier: 'epic',
    flavor: "HR asks for your tax declarations. Should you put money in NPS, PPF, or skip retirement saving this year? (Retirement is the one goal no one gives you a loan for)",
    flavorHi: "HR टैक्स डिक्लेरेशन माँग रहा है। NPS में पैसा डालें, PPF में, या इस साल रिटायरमेंट बचत छोड़ दें? (रिटायरमेंट के लिए कोई लोन नहीं देता)",
    options: [
      {
        type: 'save',
        label: "PPF",
        description: "Invest in PPF for safe, tax-free returns", shortDescriptionHi: "PPF में निवेश करें", shortDescription: "Invest in PPF",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "PPF gives government-backed, tax-free returns under Section 80C. Safe and steady, but the 15-year lock-in needs planning."
      },
      {
        type: 'invest', asset: 'debt',
        label: "NPS",
        description: "Contribute to NPS with an equity allocation", shortDescriptionHi: "NPS में योगदान करें", shortDescription: "Contribute to NPS",
        effect: { type: 'wealth_pct', value: 33, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -23, target: 'self' },
        mentorInsight: "NPS gives an extra deduction of up to ₹50,000 under 80CCD(1B) in the old tax regime, on top of 80C. Most of it stays locked till 60."
      },
      {
        type: 'spend',
        label: "Skip It",
        description: "Skip it and buy new gadgets instead", shortDescriptionHi: "छोड़ें और गैजेट खरीदें", shortDescription: "Skip and buy gadgets",
        effect: { type: 'wealth_pct', value: -21, target: 'self' },
        mentorInsight: "Retirement feels far at 30, but every year you skip is compounding you never get back."
      },
    ],
      shortName: "NPS vs PPF",
      shortNameHi: "NPS बनाम PPF",
      shortFlavor: "Retirement saving. (Start now)",
      shortFlavorHi: "रिटायरमेंट बचत। (अभी शुरू करें)"
},
  {
    id: "dc_s-066",
    name: "ESOP Jackpot",
    nameHi: "ESOP का जैकपॉट",
    type: 'decision',
    tier: 'rare',
    flavor: "Your company ESOPs have vested and the share price has tripled. Your salary and now most of your wealth depend on one company. (Don't keep all your eggs in your employer's basket)",
    flavorHi: "आपकी कंपनी के ESOP वेस्ट हो गए हैं और शेयर का भाव तीन गुना है। आपकी सैलरी और अब ज़्यादातर दौलत एक ही कंपनी पर टिकी है। (सारे अंडे एक टोकरी में न रखें)",
    options: [
      {
        type: 'save',
        label: "Lock Gains",
        description: "Sell some shares and park the money safely", shortDescriptionHi: "कुछ बेचें, सुरक्षित रखें", shortDescription: "Sell some, park safely",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "Booking part of your ESOP gains cuts concentration risk. Remember ESOPs are taxed when exercised and again when sold."
      },
      {
        type: 'invest', asset: 'index',
        label: "Sell & Spread",
        description: "Sell in phases and diversify across funds", shortDescriptionHi: "चरणों में बेचें, विविधता लाएँ", shortDescription: "Sell in phases, diversify",
        effect: { type: 'wealth_pct', value: 20, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Selling in phases and spreading the money keeps some upside without betting both your job and your wealth on one company."
      },
      {
        type: 'spend',
        label: "Hold It All",
        description: "Hold everything and wait for it to 10x", shortDescriptionHi: "सब कुछ रखे रहें", shortDescription: "Hold everything",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "If your income and wealth both depend on one company, a single bad year can hit both at once."
      },
    ],
      shortName: "ESOPs",
      shortNameHi: "ESOP",
      shortFlavor: "Stock options. (Diversify)",
      shortFlavorHi: "स्टॉक ऑप्शन। (विविधता लाएँ)"
},
  {
    id: "dc_s-067",
    name: "Weekend Consulting Gig",
    nameHi: "वीकेंड कंसल्टिंग गिग",
    type: 'decision',
    tier: 'common',
    flavor: "A former client wants you for weekend consulting. Good money, but less family time. (Extra income is only useful if it becomes extra wealth)",
    flavorHi: "एक पुराना क्लाइंट वीकेंड कंसल्टिंग के लिए बुला रहा है। अच्छा पैसा, पर परिवार के लिए कम समय। (अतिरिक्त आय तभी काम की है जब वो दौलत बने)",
    options: [
      {
        type: 'save',
        label: "Stay Focused",
        description: "Decline and focus on your main job", shortDescriptionHi: "मना करें, नौकरी पर ध्यान दें", shortDescription: "Decline, focus on job",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Protecting your main income and family time is valid. Just keep upgrading your skills so the salary keeps growing."
      },
      {
        type: 'invest', asset: 'index',
        label: "Take & Invest",
        description: "Take the gig and invest every rupee it pays", shortDescriptionHi: "गिग लें, कमाई निवेश करें", shortDescription: "Take gig, invest earnings",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "A second income stream adds safety. Investing all of it speeds up your goals without changing your lifestyle."
      },
      {
        type: 'spend',
        label: "Take & Upgrade",
        description: "Take the gig and upgrade your lifestyle with it", shortDescriptionHi: "गिग लें, कमाई खर्च करें", shortDescription: "Take gig, spend earnings",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "If side income just funds a bigger lifestyle, you add work without adding wealth. And remember, it's taxable too."
      },
    ],
      shortName: "Side Income",
      shortNameHi: "साइड इनकम",
      shortFlavor: "Side gig. (Invest the extra)",
      shortFlavorHi: "साइड गिग। (अतिरिक्त निवेश करें)"
},
  {
    id: "dc_s-068",
    name: "Market Crash: Hold or Run?",
    nameHi: "मार्केट क्रैश: रुको या भागो?",
    type: 'decision',
    tier: 'common',
    flavor: "Markets fall 25% in two months. Your portfolio is deep red and WhatsApp groups are screaming 'sell everything!' (Time in the market beats timing the market)",
    flavorHi: "दो महीने में बाज़ार 25% गिर गया। आपका पोर्टफोलियो लाल है और WhatsApp ग्रुप चिल्ला रहे हैं 'सब बेच दो!' (बाज़ार में टिके रहना, टाइमिंग से बेहतर है)",
    options: [
      {
        type: 'save',
        label: "Hold Steady",
        description: "Stay invested and keep SIPs running", shortDescriptionHi: "रुकें और SIP जारी रखें", shortDescription: "Hold and continue SIPs",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Indian markets have crashed many times and recovered over time. Staying invested avoids locking in the loss."
      },
      {
        type: 'invest', asset: 'index',
        label: "Buy the Dip",
        description: "Continue SIPs and add extra from spare cash", shortDescriptionHi: "गिरावट में और निवेश करें", shortDescription: "Add more during the dip",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "SIPs in a crash buy more units at lower prices. Add extra only from money you won't need for 5+ years."
      },
      {
        type: 'spend',
        label: "Panic Sell",
        description: "Sell everything before it falls further", shortDescriptionHi: "घबराकर सब बेच दें", shortDescription: "Sell everything in panic",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Panic selling turns a temporary paper loss into a permanent real one, and you often miss the recovery."
      },
    ],
      shortName: "Market Crash",
      shortNameHi: "मार्केट क्रैश",
      shortFlavor: "Crash panic. (Stay invested)",
      shortFlavorHi: "क्रैश की घबराहट। (निवेशित रहें)"
},
  {
    id: "dc_s-069",
    name: "Family Inheritance",
    nameHi: "विरासत: इनहेरिटेंस",
    type: 'decision',
    tier: 'rare',
    flavor: "A grandparent leaves you a sizeable sum. You still have a car loan and a thin emergency fund. (A windfall is a chance to fix the foundation)",
    flavorHi: "दादा-दादी आपके लिए अच्छी-खासी रकम छोड़ गए हैं। कार लोन अभी बाकी है और इमरजेंसी फंड कमज़ोर है। (अचानक मिला पैसा नींव मज़बूत करने का मौका है)",
    options: [
      {
        type: 'save',
        label: "Clear Debts",
        description: "Pay off the car loan and top up the emergency fund", shortDescriptionHi: "लोन चुकाएँ, फंड भरें", shortDescription: "Clear loans, top up fund",
        effect: { type: 'wealth_pct', value: 7, target: 'self' },
        mentorInsight: "Clearing loans is a guaranteed win, and a full emergency fund makes the family shock-proof."
      },
      {
        type: 'invest', asset: 'index',
        label: "Clear & Invest",
        description: "Clear costly debt, then invest the rest for goals", shortDescriptionHi: "कर्ज़ चुकाएँ, बाकी निवेश करें", shortDescription: "Clear debt, invest rest",
        effect: { type: 'wealth_pct', value: 16, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Once costly debt is gone, investing the rest across goals (even spread over a few months) lets it work for decades."
      },
      {
        type: 'spend',
        label: "Splurge",
        description: "Upgrade the car and throw a big celebration", shortDescriptionHi: "कार अपग्रेड करें, जश्न मनाएँ", shortDescription: "Upgrade car and celebrate",
        effect: { type: 'wealth_pct', value: -11, target: 'self' },
        mentorInsight: "A windfall spent on lifestyle feels great for a month, then it's gone and the old loans are still there."
      },
    ],
      shortName: "Inheritance",
      shortNameHi: "विरासत",
      shortFlavor: "Windfall. (Fix basics first)",
      shortFlavorHi: "अचानक धन। (पहले बुनियाद)"
},
  {
    id: "dc_s-070",
    name: "Joint Home Loan",
    nameHi: "जॉइंट होम लोन",
    type: 'decision',
    tier: 'epic',
    flavor: "You and your spouse both earn. Apply together as co-owners, or should one of you take the full loan alone? (Share the load, share the benefits)",
    flavorHi: "आप और आपके जीवनसाथी दोनों कमाते हैं। सह-मालिक बनकर साथ में लोन लें, या कोई एक अकेले पूरा लोन ले? (बोझ बाँटें, फायदे भी बाँटें)",
    options: [
      {
        type: 'save',
        label: "Rent Longer",
        description: "Rent longer while both of you save a bigger down payment", shortDescriptionHi: "किराया दें, साथ में बचाएँ", shortDescription: "Rent and save together",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "A bigger down payment means a smaller loan and less interest over 20 years."
      },
      {
        type: 'invest', asset: 'realestate',
        label: "Joint Loan",
        description: "Apply jointly as co-owners and co-borrowers", shortDescriptionHi: "जॉइंट लोन लें", shortDescription: "Take a joint loan",
        effect: { type: 'wealth_pct', value: 32, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Co-owner borrowers can each claim home loan interest and principal deductions in the old tax regime, and the EMI is shared. Get term cover for both."
      },
      {
        type: 'spend',
        label: "Solo Stretch",
        description: "One spouse takes the maximum loan alone", shortDescriptionHi: "अकेले अधिकतम लोन लें", shortDescription: "Take max loan solo",
        effect: { type: 'wealth_pct', value: -26, target: 'self' },
        mentorInsight: "A huge EMI on one income is fragile. One job loss and the whole family is under stress."
      },
    ],
      shortName: "Joint Loan",
      shortNameHi: "जॉइंट लोन",
      shortFlavor: "Home loan together. (Share load)",
      shortFlavorHi: "साथ में होम लोन। (बोझ बाँटें)"
},
  {
    id: "dc_s-071",
    name: "Doing the FIRE Math",
    nameHi: "FIRE का हिसाब",
    type: 'decision',
    tier: 'common',
    flavor: "A colleague says she'll retire at 45. You've never calculated how much you'd need to stop working. (Know your number)",
    flavorHi: "एक सहकर्मी कहती है कि वह 45 में रिटायर होगी। आपने कभी हिसाब नहीं लगाया कि काम छोड़ने के लिए कितना चाहिए। (अपना नंबर जानें)",
    options: [
      {
        type: 'save',
        label: "Save More",
        description: "Raise your savings rate by 5% this year", shortDescriptionHi: "बचत दर 5% बढ़ाएँ", shortDescription: "Raise savings rate 5%",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Even a small rise in your savings rate each year pulls your financial freedom date closer."
      },
      {
        type: 'invest', asset: 'index',
        label: "Know Number",
        description: "Calculate your FIRE corpus and set SIPs to match", shortDescriptionHi: "कॉर्पस निकालें, SIP सेट करें", shortDescription: "Calculate corpus, set SIPs",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "A common rule of thumb is 25-30x your yearly expenses to retire early in India. Knowing the number lets you plan SIPs backwards."
      },
      {
        type: 'spend',
        label: "Quit Now",
        description: "Quit early anyway and figure it out later", shortDescriptionHi: "छोड़ दें, बाद में सोचें", shortDescription: "Quit and figure it out later",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Retiring before the corpus is ready means withdrawing too fast. With medical inflation, money can run out in your 60s."
      },
    ],
      shortName: "Early Retirement",
      shortNameHi: "जल्दी रिटायरमेंट",
      shortFlavor: "FIRE maths. (Know your number)",
      shortFlavorHi: "FIRE का गणित। (अपना नंबर जानें)"
},
  {
    id: "dc_s-072",
    name: "Gold: Jewellery or Paper Gold?",
    nameHi: "सोना: गहने या पेपर गोल्ड?",
    type: 'decision',
    tier: 'rare',
    flavor: "Dhanteras is here and the family wants you to buy gold. Jewellery, paper gold, or a planned mix? (Gold is a hedge, not a growth engine)",
    flavorHi: "धनतेरस आ गया और परिवार चाहता है कि आप सोना खरीदें। गहने, पेपर गोल्ड, या सोचा-समझा मिश्रण? (सोना सुरक्षा कवच है, ग्रोथ इंजन नहीं)",
    options: [
      {
        type: 'save',
        label: "Paper Gold",
        description: "Buy a small amount of gold through a gold ETF or fund", shortDescriptionHi: "थोड़ा पेपर गोल्ड लें", shortDescription: "Buy a little paper gold",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "Gold often holds up when markets fall or the rupee weakens. Paper gold avoids locker, purity and making-charge worries."
      },
      {
        type: 'invest', asset: 'gold',
        label: "Planned Mix",
        description: "Keep gold at 5-10% and the rest in diversified investments", shortDescriptionHi: "सोना 5-10% तक रखें", shortDescription: "Keep gold at 5-10%",
        effect: { type: 'wealth_pct', value: 15, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -14, target: 'self' },
        mentorInsight: "A planned mix, mostly growth assets with a small gold slice, usually gives a smoother ride than going all-in on one asset."
      },
      {
        type: 'spend',
        label: "Jewellery",
        description: "Buy heavy jewellery as an 'investment'", shortDescriptionHi: "भारी गहने खरीदें", shortDescription: "Buy heavy jewellery",
        effect: { type: 'wealth_pct', value: -14, target: 'self' },
        mentorInsight: "Making charges and GST are rarely recovered when you sell jewellery, so it's a weak investment even if gold prices rise."
      },
    ],
      shortName: "Gold",
      shortNameHi: "सोना",
      shortFlavor: "Gold choice. (5-10% max)",
      shortFlavorHi: "सोने का फैसला। (अधिकतम 5-10%)"
},
  {
    id: "dc_s-073",
    name: "Smart 80C Tax Saving",
    nameHi: "80C का जुगाड़",
    type: 'decision',
    tier: 'common',
    flavor: "It's January and HR wants tax-saving proofs. You haven't planned anything yet. (Plan tax saving in April, not March)",
    flavorHi: "जनवरी है और HR टैक्स बचत के सबूत माँग रहा है। आपने अभी तक कुछ प्लान नहीं किया। (टैक्स प्लानिंग अप्रैल में करें, मार्च में नहीं)",
    options: [
      {
        type: 'save',
        label: "Check Existing",
        description: "Count EPF, PPF, term premium and kids' fees first", shortDescriptionHi: "मौजूदा 80C निवेश गिनें", shortDescription: "Count existing 80C items",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "EPF, PPF, term premium and kids' tuition fees may already fill much of the ₹1.5 lakh 80C limit in the old regime. Check before buying anything new."
      },
      {
        type: 'invest', asset: 'equity',
        label: "ELSS SIP",
        description: "Fill the gap with a monthly ELSS SIP", shortDescriptionHi: "ELSS SIP शुरू करें", shortDescription: "Start an ELSS SIP",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "ELSS gives the 80C benefit with the shortest lock-in (3 years) plus equity growth. Also compare old vs new tax regime first."
      },
      {
        type: 'spend',
        label: "Panic Buy",
        description: "Buy whatever policy the agent sells in March", shortDescriptionHi: "जल्दी में एजेंट की पॉलिसी लें", shortDescription: "Buy agent's policy in rush",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Last-minute tax saving often locks you into a poor policy for years just to save tax once."
      },
    ],
      shortName: "Tax Planning",
      shortNameHi: "टैक्स प्लानिंग",
      shortFlavor: "Section 80C. (Plan early)",
      shortFlavorHi: "धारा 80C। (जल्दी प्लान करें)"
},
  {
    id: "dc_s-074",
    name: "Quit Your Job for Business?",
    nameHi: "नौकरी छोड़कर बिज़नेस?",
    type: 'decision',
    tier: 'common',
    flavor: "You have a business idea and friends love it. But there's a home loan EMI and a school-going kid. (Test the idea before you bet the family on it)",
    flavorHi: "आपके पास बिज़नेस आइडिया है और दोस्तों को पसंद है। लेकिन होम लोन की EMI है और बच्चा स्कूल जाता है। (परिवार को दाँव पर लगाने से पहले आइडिया परखें)",
    options: [
      {
        type: 'save',
        label: "Stay Employed",
        description: "Keep the job and keep saving", shortDescriptionHi: "नौकरी रखें, बचत जारी रखें", shortDescription: "Keep job, keep saving",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "A steady salary while you have EMIs and kids is real security. Keep learning so your options stay open."
      },
      {
        type: 'invest', asset: 'equity',
        label: "Test on Side",
        description: "Build it on weekends and save 12 months' runway first", shortDescriptionHi: "आइडिया परखें, रनवे बनाएँ", shortDescription: "Test idea, build runway",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Validate with paying customers and save 12+ months of family expenses before you quit. That turns a gamble into a plan."
      },
      {
        type: 'spend',
        label: "Quit on Loans",
        description: "Quit tomorrow and fund it with personal loans", shortDescriptionHi: "छोड़ें और उधार लें", shortDescription: "Quit and borrow to fund",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Funding a startup with personal loans and credit cards puts your home and family at risk. Most new businesses take years to profit."
      },
    ],
      shortName: "Business Idea",
      shortNameHi: "बिज़नेस आइडिया",
      shortFlavor: "Quit or not? (Test first)",
      shortFlavorHi: "छोड़ें या नहीं? (पहले परखें)"
},
  {
    id: "dc_s-075",
    name: "CIBIL Score Repair",
    nameHi: "CIBIL स्कोर रिपेयर",
    type: 'decision',
    tier: 'epic',
    flavor: "Your home loan rate came in higher because of an old unpaid credit card due. Your score is 640. (Your credit score is your financial reputation)",
    flavorHi: "पुराने क्रेडिट कार्ड बकाया की वजह से होम लोन की दर ज़्यादा मिली। आपका स्कोर 640 है। (क्रेडिट स्कोर आपकी वित्तीय साख है)",
    options: [
      {
        type: 'save',
        label: "Pay Old Dues",
        description: "Pay the old dues in full", shortDescriptionHi: "पुराना बकाया पूरा चुकाएँ", shortDescription: "Clear old dues fully",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Paying old dues in full, rather than 'settling' for less, stops the penalties and starts rebuilding your score."
      },
      {
        type: 'invest', asset: 'debt',
        label: "Fix+Refinance",
        description: "Clear dues, set auto-pay, then refinance at a lower rate", shortDescriptionHi: "स्कोर सुधारें, लोन रीफाइनेंस करें", shortDescription: "Fix score, refinance loan",
        effect: { type: 'wealth_pct', value: 29, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -22, target: 'self' },
        mentorInsight: "A score above about 750 can get you a lower home loan rate. Even 0.5% less on a big loan can save lakhs over the tenure."
      },
      {
        type: 'spend',
        label: "Ignore It",
        description: "Ignore it and apply for another credit card", shortDescriptionHi: "अनदेखा करें, नया कार्ड लें", shortDescription: "Ignore and get new card",
        effect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Ignored dues keep growing with interest and penalties, and a poor score means rejections or costlier loans for years."
      },
    ],
      shortName: "Credit Score",
      shortNameHi: "क्रेडिट स्कोर",
      shortFlavor: "Fix your score. (Pay in full)",
      shortFlavorHi: "स्कोर सुधारें। (पूरा चुकाएँ)"
},
  {
    id: "dc_s-076",
    name: "Portfolio Rebalancing",
    nameHi: "पोर्टफोलियो रीबैलेंसिंग",
    type: 'decision',
    tier: 'common',
    flavor: "After a great year, equity is now 85% of your portfolio instead of your planned 70%. (Rebalancing makes you sell high and buy low)",
    flavorHi: "शानदार साल के बाद, इक्विटी अब आपके पोर्टफोलियो का 70% की जगह 85% है। (रीबैलेंसिंग आपको ऊँचे में बेचना, नीचे में खरीदना सिखाती है)",
    options: [
      {
        type: 'save',
        label: "Book Profit",
        description: "Move some gains into safer debt options", shortDescriptionHi: "मुनाफा डेट में डालें", shortDescription: "Shift gains to debt",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Taking some gains off the table after a big rally protects what you earned. Just keep capital gains tax in mind."
      },
      {
        type: 'invest', asset: 'index',
        label: "Rebalance",
        description: "Rebalance back to your 70:30 plan and keep SIPs going", shortDescriptionHi: "70:30 योजना पर लौटें", shortDescription: "Rebalance to 70:30 plan",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Rebalancing once a year back to your target mix automatically makes you sell high and buy low."
      },
      {
        type: 'spend',
        label: "Chase Trend",
        description: "Move everything into last year's hottest sector", shortDescriptionHi: "पिछले साल के विजेता के पीछे भागें", shortDescription: "Chase last year's winner",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Piling into last year's hottest sector usually means buying near the top. Past returns don't promise future ones."
      },
    ],
      shortName: "Rebalance",
      shortNameHi: "रीबैलेंस",
      shortFlavor: "Rebalance. (Stick to plan)",
      shortFlavorHi: "रीबैलेंस करें। (योजना पर टिकें)"
},
  {
    id: "dc_s-077",
    name: "Got a Hike! Upgrade Lifestyle?",
    nameHi: "हाइक मिला! लाइफस्टाइल अप?",
    type: 'decision',
    tier: 'common',
    flavor: "A 20% salary hike! Colleagues are upgrading to bigger flats and new cars. (Grow your savings faster than your lifestyle)",
    flavorHi: "20% सैलरी हाइक! साथी बड़े फ्लैट और नई कारों में अपग्रेड कर रहे हैं। (लाइफस्टाइल से तेज़ अपनी बचत बढ़ाएँ)",
    options: [
      {
        type: 'save',
        label: "Keep Lifestyle",
        description: "Keep spending the same and save the hike", shortDescriptionHi: "पूरा हाइक बचाएँ", shortDescription: "Save the whole hike",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Keeping your lifestyle flat after a raise is the easiest way to grow savings without feeling any pinch."
      },
      {
        type: 'invest', asset: 'index',
        label: "Step-Up SIP",
        description: "Increase your SIP by the same 20%", shortDescriptionHi: "SIP 20% बढ़ाएँ", shortDescription: "Step up SIP by 20%",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Raising your SIP every time your salary rises (a step-up SIP) can build a much bigger corpus than a fixed SIP over 20 years."
      },
      {
        type: 'spend',
        label: "Upgrade All",
        description: "Move to a bigger flat and take a new car loan", shortDescriptionHi: "बड़ा फ्लैट और नई कार", shortDescription: "Bigger flat and new car",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "This is lifestyle creep. New EMIs lock in higher spending and the hike vanishes within months."
      },
    ],
      shortName: "Salary Hike",
      shortNameHi: "सैलरी हाइक",
      shortFlavor: "Raise received. (Avoid creep)",
      shortFlavorHi: "हाइक मिला। (क्रीप से बचें)"
},
  {
    id: "dc_s-078",
    name: "Retirement Corpus Check",
    nameHi: "रिटायरमेंट कॉर्पस चेक",
    type: 'decision',
    tier: 'rare',
    flavor: "A retirement calculator says you'll need several crores at 60. You're 32 and think 'I'm still young'. (The earlier you start, the less you need to invest)",
    flavorHi: "रिटायरमेंट कैलकुलेटर कहता है 60 तक कई करोड़ चाहिए। आप 32 के हैं और सोचते हैं 'अभी तो जवानी है'। (जितनी जल्दी शुरू करेंगे, उतना कम लगाना पड़ेगा)",
    options: [
      {
        type: 'save',
        label: "Boost PF",
        description: "Add Voluntary PF (VPF) to your EPF", shortDescriptionHi: "EPF में VPF जोड़ें", shortDescription: "Add VPF to EPF",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "VPF earns the same rate as EPF and is very safe. Interest on yearly employee contributions above ₹2.5 lakh is taxable."
      },
      {
        type: 'invest', asset: 'index',
        label: "Retirement SIP",
        description: "Calculate your corpus and start a dedicated SIP", shortDescriptionHi: "रिटायरमेंट SIP शुरू करें", shortDescription: "Start retirement SIP",
        effect: { type: 'wealth_pct', value: 19, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "At 6% inflation, ₹50,000 of monthly expenses today becomes about ₹2.9 lakh a month in 30 years. A long-term equity SIP helps close that gap."
      },
      {
        type: 'spend',
        label: "Later Dekhenge",
        description: "It's too early. Spend now and plan at 40", shortDescriptionHi: "40 तक टालें", shortDescription: "Delay planning till 40",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Starting at 30 instead of 40 can cut the monthly investment needed for the same corpus to a third or less, thanks to compounding."
      },
    ],
      shortName: "Retirement Plan",
      shortNameHi: "रिटायरमेंट योजना",
      shortFlavor: "Corpus check. (Start now)",
      shortFlavorHi: "कॉर्पस जाँच। (अभी शुरू करें)"
},
  {
    id: "dc_s-079",
    name: "Supporting Your Parents",
    nameHi: "माँ-पापा का सहारा",
    type: 'decision',
    tier: 'common',
    flavor: "Your parents' savings are running low and their medical costs are rising. You want to help without derailing your own future. (Support parents and your own retirement together)",
    flavorHi: "माता-पिता की बचत कम हो रही है और इलाज का खर्च बढ़ रहा है। आप मदद करना चाहते हैं, पर अपना भविष्य भी नहीं बिगाड़ना। (माता-पिता और अपना रिटायरमेंट, दोनों साथ संभालें)",
    options: [
      {
        type: 'save',
        label: "Monthly Help",
        description: "Send a fixed monthly amount from your budget", shortDescriptionHi: "हर महीने तय रकम भेजें", shortDescription: "Send fixed monthly support",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "A fixed monthly amount, planned in your budget, helps parents steadily without wrecking your own goals."
      },
      {
        type: 'invest', asset: 'index',
        label: "Cover + SIP",
        description: "Buy their health insurance and keep your own SIP running", shortDescriptionHi: "माता-पिता का बीमा, SIP जारी", shortDescription: "Insure parents, keep SIP",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Health insurance for senior parents gives an extra 80D deduction (up to ₹50,000, old regime). Keeping your SIP running means your kids won't have to support you later."
      },
      {
        type: 'spend',
        label: "Stop All SIPs",
        description: "Stop all your investments to cover everything", shortDescriptionHi: "अपना निवेश बंद करें", shortDescription: "Stop your own investing",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Supporting parents is dharma, but stopping your own retirement saving passes the same burden to your children. Find a balance."
      },
    ],
      shortName: "Parents' Support",
      shortNameHi: "माता-पिता का सहारा",
      shortFlavor: "Help parents. (Balance both)",
      shortFlavorHi: "माता-पिता की मदद। (संतुलन रखें)"
},
  {
    id: "dc_s-080",
    name: "Second Flat: Investment?",
    nameHi: "दूसरा फ्लैट: निवेश?",
    type: 'decision',
    tier: 'epic',
    flavor: "A builder offers a 'pre-launch deal' on a second flat. Relatives say property never loses value. (An asset you can't sell quickly isn't always a good investment)",
    flavorHi: "बिल्डर दूसरे फ्लैट पर 'प्री-लॉन्च डील' दे रहा है। रिश्तेदार कहते हैं प्रॉपर्टी कभी नहीं गिरती। (जो संपत्ति जल्दी न बिके, वो हमेशा अच्छा निवेश नहीं)",
    options: [
      {
        type: 'save',
        label: "Stay Liquid",
        description: "Skip it and keep spare money in safe, liquid options", shortDescriptionHi: "छोड़ें, पैसा लिक्विड रखें", shortDescription: "Skip and stay liquid",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "One home to live in is enough for most families. Liquid money helps with kids' and parents' needs."
      },
      {
        type: 'invest', asset: 'index',
        label: "SIP Instead",
        description: "Invest the down payment amount through diversified SIPs", shortDescriptionHi: "इसके बदले SIP करें", shortDescription: "Use SIPs instead",
        effect: { type: 'wealth_pct', value: 26, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -23, target: 'self' },
        mentorInsight: "SIPs can start small, can be sold in parts when needed, and spread risk across many companies, unlike a single flat."
      },
      {
        type: 'spend',
        label: "Buy 2nd Flat",
        description: "Take a second home loan for the flat", shortDescriptionHi: "लोन पर दूसरा फ्लैट लें", shortDescription: "Buy 2nd flat on loan",
        effect: { type: 'wealth_pct', value: -28, target: 'self' },
        mentorInsight: "Residential rent in India often yields just 2-3% a year. A second EMI plus slow resale can trap your money."
      },
    ],
      shortName: "Second Property",
      shortNameHi: "दूसरी प्रॉपर्टी",
      shortFlavor: "Real estate. (Check yield)",
      shortFlavorHi: "रियल एस्टेट। (किराया-रिटर्न जाँचें)"
},
  {
    id: "dc_s-081",
    name: "Will & Nominee Update",
    nameHi: "वसीयत और नॉमिनी अपडेट",
    type: 'decision',
    tier: 'rare',
    flavor: "A colleague's family is stuck in court for two years after a sudden death. Your own nominations are outdated and there's no will. (Your family shouldn't have to search for your money)",
    flavorHi: "एक सहकर्मी की अचानक मौत के बाद उसका परिवार दो साल से कोर्ट के चक्कर काट रहा है। आपके नॉमिनी पुराने हैं और कोई वसीयत नहीं है। (परिवार को आपका पैसा ढूँढना न पड़े)",
    options: [
      {
        type: 'save',
        label: "Nominees Only",
        description: "Update nominees on bank, EPF, demat and insurance", shortDescriptionHi: "सभी नॉमिनी अपडेट करें", shortDescription: "Update all nominees",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        mentorInsight: "Correct nominees on bank accounts, EPF, demat and insurance make claims much smoother for your family."
      },
      {
        type: 'invest', asset: 'fd',
        label: "Will+Nominees",
        description: "Write a will, update nominees and list all accounts", shortDescriptionHi: "वसीयत लिखें, नॉमिनी अपडेट करें", shortDescription: "Write will, update nominees",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "A nominee may only be a custodian; a will decides who actually inherits. Together, plus a list of accounts, they save your family years of paperwork."
      },
      {
        type: 'spend',
        label: "Later",
        description: "I'm young. I'll do it later", shortDescriptionHi: "टाल दें", shortDescription: "Postpone it",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Without a will or nominees, your family may need succession certificates and court visits to access money when they need it most."
      },
    ],
      shortName: "Will & Nominee",
      shortNameHi: "वसीयत और नॉमिनी",
      shortFlavor: "Estate planning. (Do it now)",
      shortFlavorHi: "संपत्ति योजना। (अभी करें)"
},
  {
    id: "dc_s-082",
    name: "Angel Investing Offer",
    nameHi: "एंजेल इन्वेस्टिंग ऑफर",
    type: 'decision',
    tier: 'common',
    flavor: "A college friend's startup is raising money and wants ₹5 lakh from you. 'Next unicorn, bro!' (Only bet what you can afford to lose)",
    flavorHi: "कॉलेज के दोस्त का स्टार्टअप पैसा जुटा रहा है और आपसे ₹5 लाख चाहता है। 'अगला यूनिकॉर्न, भाई!' (उतना ही दाँव लगाएँ जितना खो सकें)",
    options: [
      {
        type: 'save',
        label: "Decline",
        description: "Say no and keep your money in your core plan", shortDescriptionHi: "मना करें, योजना पर टिकें", shortDescription: "Decline and stick to plan",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saying no to a single risky bet is fine. Your family's core goals come first."
      },
      {
        type: 'invest', asset: 'smallcap',
        label: "Small Stake",
        description: "Invest a small amount you can afford to lose", shortDescriptionHi: "बस थोड़ी रकम लगाएँ", shortDescription: "Invest only a small amount",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "If you back startups, keep it a small slice (say under 5% of your wealth). Most fail; the rare winners make up for it."
      },
      {
        type: 'spend',
        label: "Go All In",
        description: "Put a big chunk of your savings into it", shortDescriptionHi: "बचत का बड़ा हिस्सा लगाएँ", shortDescription: "Put in big savings chunk",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Putting a big chunk of savings into one startup can wipe out years of progress if it fails, and most do."
      },
    ],
      shortName: "Angel Invest",
      shortNameHi: "एंजेल निवेश",
      shortFlavor: "Startup bet. (Keep it small)",
      shortFlavorHi: "स्टार्टअप दाँव। (छोटा रखें)"
},
  {
    id: "dc_s-083",
    name: "Child Falls Sick",
    nameHi: "बच्चे की तबीयत",
    type: 'decision',
    tier: 'common',
    flavor: "Your child needs a sudden hospital stay. The bill estimate is large. How do you pay? (This is exactly why you built protection)",
    flavorHi: "बच्चे को अचानक अस्पताल में भर्ती करना पड़ा। बिल का अनुमान बड़ा है। भुगतान कैसे करेंगे? (इसीलिए तो सुरक्षा बनाई थी)",
    options: [
      {
        type: 'save',
        label: "Emergency Fund",
        description: "Pay from the emergency fund", shortDescriptionHi: "इमरजेंसी फंड का उपयोग करें", shortDescription: "Use the emergency fund",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "This is what the emergency fund is for: paying without stress or debt. Refill it once things settle."
      },
      {
        type: 'invest', asset: 'debt',
        label: "Use Insurance",
        description: "Use cashless insurance; emergency fund covers the rest", shortDescriptionHi: "पहले बीमा क्लेम करें", shortDescription: "Claim insurance first",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Cashless insurance covers most of the bill, the emergency fund handles the rest, and your long-term investments keep compounding."
      },
      {
        type: 'spend',
        label: "Swipe & Borrow",
        description: "Swipe the credit card and take a personal loan", shortDescriptionHi: "क्रेडिट कार्ड और लोन लें", shortDescription: "Use credit card and loan",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Paying a hospital bill with a credit card or personal loan adds steep interest to an already stressful time."
      },
    ],
      shortName: "Child's Health",
      shortNameHi: "बच्चे का स्वास्थ्य",
      shortFlavor: "Medical emergency. (Use protection)",
      shortFlavorHi: "मेडिकल इमरजेंसी। (सुरक्षा का उपयोग)"
},
];
