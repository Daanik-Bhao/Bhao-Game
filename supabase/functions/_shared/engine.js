// GENERATED FILE - do not edit. Source: src/lib/multiplayerAuthority.ts
// Rebuild with: node scripts/build-functions.mjs (npm run build:functions)

// src/data/levelCards.ts
var LEVEL_SITUATION_CARDS = [
  {
    id: "dc_s-001",
    name: "Pocket Money Dilemma",
    nameHi: "पॉकेट मनी दुविधा",
    type: "decision",
    tier: "common",
    flavor: "₹500 pocket money in hand. Vada pav or piggy bank? (Save first, spend what's left)",
    flavorHi: "हाथ में ₹500 जेब खर्च। वड़ा पाव या गुल्लक? (पहले बचत करें, जो बचा है उसे खर्च करें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Drop it in the piggy bank first",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Saving before you spend is the oldest trick in the book. Whatever is left after saving is your real spending money.",
        shortDescription: "Save in piggy bank",
        shortDescriptionHi: "गुल्लक में सहेजें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put it aside to grow, not to sit idle",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Even small amounts grow when you start early. Time is a teenager's biggest money advantage.",
        shortDescription: "Invest for early growth",
        shortDescriptionHi: "शीघ्र विकास के लिए निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it all, gone by Sunday",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A vada pav now is fine, but spending everything leaves nothing for next week. Spend what's left after saving, not the other way round.",
        shortDescription: "Spend on vada pav",
        shortDescriptionHi: "वड़ा पाव पर खर्च करें"
      }
    ],
    shortName: "Pocket Money",
    shortNameHi: "पॉकेट मनी",
    shortFlavor: "Pocket money. (Save first)",
    shortFlavorHi: "पॉकेट मनी. (पहले सहेजें)"
  },
  {
    id: "dc_s-002",
    name: "School Trip ka Chakkar",
    nameHi: "स्कूल ट्रिप का चक्कर",
    type: "decision",
    tier: "common",
    flavor: "School trip costs ₹2,000 extra. You have only ₹800. Kya plan hai? (Planning beats panic)",
    flavorHi: "स्कूल ट्रिप में ₹2,000 अतिरिक्त खर्च है। आपके पास सिर्फ ₹800 हैं। क्या योजना है? (Planning beats panic)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save from weekly allowance, join the next trip",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Saving a little every week for a known expense is how big goals stop feeling scary. Next trip, the money will already be there.",
        shortDescription: "Save allowance for later",
        shortDescriptionHi: "बाद के लिए भत्ता बचाकर रखें"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Grow the trip fund over the next few months",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Start a goal fund early and let it build up. When you plan ahead, you pay from savings instead of begging or borrowing.",
        shortDescription: "Invest trip funds for growth",
        shortDescriptionHi: "विकास के लिए ट्रिप फंड निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Go anyway, parents bail you out",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Getting bailed out feels easy, but it builds the habit of spending money you don't have. That habit gets expensive with credit cards later.",
        shortDescription: "Rely on parents for trip",
        shortDescriptionHi: "यात्रा के लिए माता-पिता पर निर्भर रहें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Relatives gifted ₹2,100 on your birthday. 'Padhai ke liye hai beta.' (Gift money is seed money)",
    flavorHi: "रिश्तेदारों ने जन्मदिन पर ₹2,100 दिए। 'पढ़ाई के लिए है बेटा।' (Gift money is seed money)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Keep the gift money in the piggy bank",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Gift money is free seed money. Keeping it safe means you have something ready when a real need comes up.",
        shortDescription: "Save gift in piggy bank",
        shortDescriptionHi: "गुल्लक में उपहार सहेजें"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Open a minor FD with parents and earn interest",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A bank FD pays fixed interest and is very safe. Banks let parents open one in a minor's name, so your gift earns while you study.",
        shortDescription: "Open kids fixed deposit",
        shortDescriptionHi: "ओपन किड्स फिक्स्ड डिपॉजिट"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Blow it all on gaming credits",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Gaming credits are gone in a few hours and have zero resale value. Ask yourself: will I still value this next month?",
        shortDescription: "Buy new gaming credits",
        shortDescriptionHi: "नए गेमिंग क्रेडिट खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Daily canteen costs ₹60, Maa's tiffin is free. That's ₹1,200 a month. (Small daily habits = big yearly numbers)",
    flavorHi: "रोज़ कैंटीन में ₹60 लगते हैं, माँ का टिफिन मुफ़्त है। यानी महीने में ₹1,200। (छोटी दैनिक आदतें = बड़ी वार्षिक संख्याएँ)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Carry tiffin, save ₹1,200 a month",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "₹60 a day sounds tiny, but it is over ₹14,000 a year. Small daily leaks are where most money quietly disappears.",
        shortDescription: "Save money eating tiffin",
        shortDescriptionHi: "टिफ़िन खाने के पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Carry tiffin and invest the monthly savings",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Putting a small amount aside every month is exactly how a SIP works. Regular small amounts plus time beat one big amount later.",
        shortDescription: "Invest daily food savings",
        shortDescriptionHi: "दैनिक भोजन की बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Canteen samosas every day, ₹14,000+ a year",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A treat once in a while is fine. Doing it daily turns a want into a fixed cost you stop even noticing.",
        shortDescription: "Spend on daily samosas",
        shortDescriptionHi: "रोजाना समोसे पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Classmate is selling his old cycle for ₹1,500. A new one costs ₹6,000. (Value > vanity)",
    flavorHi: "सहपाठी अपनी पुरानी साइकिल ₹1,500 में बेच रहा है। नई ₹6,000 की है। (मूल्य > घमंड)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Buy the used one, save ₹4,500",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "A used cycle takes you to the same tuition class. Paying for what you need, not what looks shiny, is real value.",
        shortDescription: "Buy used cycle and save",
        shortDescriptionHi: "पुरानी साइकिल खरीदें और बचत करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Buy used and put the difference to work",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "The ₹4,500 you didn't spend can keep growing for years. That's opportunity cost: every rupee spent is a rupee that can't grow.",
        shortDescription: "Invest cycle savings wisely",
        shortDescriptionHi: "चक्र बचत को समझदारी से निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy new on EMI that parents pay",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "An EMI for something that loses value fast is a bad-debt habit. New things lose their shine in weeks, but EMIs last months.",
        shortDescription: "Buy new cycle with EMI",
        shortDescriptionHi: "ईएमआई पर नई साइकिल खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "School gave you a ₹5,000 merit scholarship. Sab pooch rahe hain kya kiya? (Reward learning with more learning)",
    flavorHi: "स्कूल ने ₹5,000 की मेरिट स्कॉलरशिप दी। सब पूछ रहे हैं क्या किया? (Reward learning with more learning)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Bank the scholarship money",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Banking it keeps the money safe for future fees or books. Safe is good, but money in a savings account grows slowly.",
        shortDescription: "Bank your scholarship money",
        shortDescriptionHi: "अपनी छात्रवृत्ति का पैसा बैंक में जमा करें"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Spend it on a course or books that build skills",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Spending on skills is an investment, not an expense. What you learn keeps paying you back for the rest of your life.",
        shortDescription: "Invest in educational courses",
        shortDescriptionHi: "शैक्षिक पाठ्यक्रमों में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy new shoes and throw a party",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Celebrating is fine, but spending the whole reward leaves nothing to show for it. Try a small treat and keep the rest.",
        shortDescription: "Buy shoes and celebrate",
        shortDescriptionHi: "जूते खरीदें और जश्न मनाएं"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Eating out with friends every weekend, ₹400 each time. FOMO is real. (Friendships don't depend on where you eat)",
    flavorHi: "हर सप्ताहांत दोस्तों के साथ बाहर खाना। FOMO वास्तविक है. (दोस्ती इस बात पर निर्भर नहीं करती कि आप कहां खाते हैं)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Skip 3 weekends, save ₹1,200",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Real friends stay even when you skip a plan. Suggest a cheaper hangout like a park or ghar pe movie instead.",
        shortDescription: "Skip weekends to save",
        shortDescriptionHi: "बचत करने के लिए सप्ताहांत छोड़ें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Skip a few and invest the savings",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹1,200 a month saved and invested adds up surprisingly fast. Your future self gets a gift, not just your weekend.",
        shortDescription: "Invest weekend food savings",
        shortDescriptionHi: "सप्ताहांत भोजन की बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Go every weekend, ₹1,600 a month gone",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "FOMO spending never ends because there is always another plan. Decide a monthly fun budget and stick to it.",
        shortDescription: "Spend on weekend eat-outs",
        shortDescriptionHi: "सप्ताहांत खाने-पीने पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    shortFlavorHi: "पहली कमाई. (इसका सम्मान करें)",
    shortFlavor: "First earning. (Respect it)",
    shortNameHi: "पहली कमाई",
    shortName: "First Earning",
    flavor: "Neighbour uncle pays ₹1,000 for data entry work. Easy money! (First earned rupee deserves respect)",
    flavorHi: "पड़ोसी अंकल डाटा एंट्री के काम के लिए ₹1,000 देते हैं। आसानी से कमाया पैसा! (पहला कमाया हुआ रुपया सम्मान का पात्र है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save half, spend half",
        shortDescriptionHi: "आधी कमाई बचाएं",
        shortDescription: "Save half your earnings",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Saving part of your first income starts a habit that will matter more than the amount. Pay yourself first, always."
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put your first earnings to work",
        shortDescriptionHi: "पहली कमाई निवेश करें",
        shortDescription: "Invest your first earnings",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Your first earned rupee invested early has the most years to compound. Starting matters more than the size of the start."
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it all the same day",
        shortDescriptionHi: "सब एक ही दिन खर्च करें",
        shortDescription: "Spend it all at once",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Money you worked hours for vanishes in minutes when you spend it all at once. Feel the effort before you spend."
      }
    ]
  },
  {
    id: "dc_s-009",
    name: "Lost ₹200",
    nameHi: "₹200 खो गए",
    type: "decision",
    tier: "common",
    flavor: "Bhai, ₹200 gir gaye pocket se. Kya karte? (Losing money teaches more than earning)",
    flavorHi: "भाई, ₹200 जेब से गिर गए। क्या करते? (Losing money teaches more than earning)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Make do with what's left this week",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Adjusting your spending after a loss is exactly what a budget is for. A small loss, handled calmly, stays small.",
        shortDescription: "Make do with less",
        shortDescriptionHi: "कम से काम चलाओ"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Keep a small buffer aside so this doesn't hurt next time",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A small buffer is a mini emergency fund. Adults keep about 6 months of expenses aside for the same reason.",
        shortDescription: "Invest remaining pocket money",
        shortDescriptionHi: "बची हुई पॉकेट मनी निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Borrow ₹200 more and spend that too",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Borrowing to cover a loss turns one problem into two. Now you are short and you owe someone.",
        shortDescription: "Borrow to spend more",
        shortDescriptionHi: "अधिक खर्च करने के लिए उधार लें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "5 cheap pens for ₹50 vs 1 quality pen for ₹40. Dono alag-alag shops. (Cheap bulk often costs more)",
    flavorHi: "₹50 में 5 सस्ते पेन बनाम ₹40 में 1 अच्छा पेन। दोनों अलग-अलग दुकानें। (सस्ते थोक की कीमत अक्सर अधिक होती है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Buy 1 good pen that lasts",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Something that lasts longer is often cheaper in the end. Look at cost per use, not just the price tag.",
        shortDescription: "Buy one quality pen",
        shortDescriptionHi: "एक गुणवत्तापूर्ण पेन खरीदें"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Buy what you need and keep the extra aside",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Buying only what you need frees up money to grow. Bulk deals are only good if you actually use it all.",
        shortDescription: "Invest saved stationery money",
        shortDescriptionHi: "बचाए गए स्टेशनरी के पैसे निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy all 5, lose 3 in a week",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Cheap bulk feels like a deal, but 3 of those pens will be lost or dead in a week. A 'deal' on things you don't need is still a waste.",
        shortDescription: "Buy cheap bulk pens",
        shortDescriptionHi: "सस्ते थोक पेन खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹500 note mil gaya footpath pe. No one's around. (Found money isn't free money)",
    flavorHi: "फुटपाथ पर ₹500 का नोट मिला। आसपास कोई नहीं है। (पाया गया पैसा मुफ़्त पैसा नहीं है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Hand it in, or keep it safe if no owner is found",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "First try to return it, someone may need it badly. Money that comes easy should still be treated with respect.",
        shortDescription: "Save found money securely",
        shortDescriptionHi: "पाए गए पैसे को सुरक्षित रूप से सहेजें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "If no owner turns up, put it to work",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Unexpected money is the easiest to save because you never planned to spend it. Treat windfalls as growth money.",
        shortDescription: "Invest found money for growth",
        shortDescriptionHi: "विकास के लिए पाया गया धन निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it at the chaat stall right away",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Easy come, easy go is how windfalls vanish. Pause a day before spending surprise money.",
        shortDescription: "Spend at chaat stall",
        shortDescriptionHi: "चाट के ठेले पर खर्चा"
      }
    ],
    shortName: "Found Money",
    shortNameHi: "पैसा मिला",
    shortFlavor: "Found money. (Not free)",
    shortFlavorHi: "पैसा मिल गया. (मुक्त नहीं)"
  },
  {
    id: "dc_s-012",
    name: "Borrow Karna Padega",
    nameHi: "Borrow Karna Padega",
    type: "decision",
    tier: "common",
    flavor: "Friend needs ₹1,000. You have ₹1,500. Kya bologe? (Generosity with boundaries)",
    flavorHi: "दोस्त को ₹1,000 की जरूरत है। आपके पास ₹1,500 हैं। क्या बोलोगे? (सीमाओं के साथ उदारता)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Lend only what you can afford to lose",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Lend only what you could live without if it never comes back. That keeps both your wallet and the friendship safe.",
        shortDescription: "Lend some and keep some",
        shortDescriptionHi: "कुछ उधार दो और कुछ रखो"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Help a little, keep your savings growing",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Helping friends is good, but not at the cost of your own safety net. Set a clear return date for anything you lend.",
        shortDescription: "Invest kept money wisely",
        shortDescriptionHi: "रखे हुए धन का निवेश सोच-समझकर करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Lend everything and go broke",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Giving away all your money leaves you with nothing for your own emergencies. Boundaries are not selfishness.",
        shortDescription: "Lend all and go broke",
        shortDescriptionHi: "सब उधार दो और बर्बाद हो जाओ"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹999 gaming credits on sale, 50% off today only! (Virtual spends are real losses)",
    flavorHi: "₹999 के गेमिंग क्रेडिट सेल पर, सिर्फ आज 50% छूट! (Virtual spends are real losses)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Skip it, virtual coins aren't worth real money",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "'Today only' is a pressure trick to stop you from thinking. If you didn't plan to buy it, a discount doesn't make it a need.",
        shortDescription: "Skip virtual game purchases",
        shortDescriptionHi: "वर्चुअल गेम खरीदारी छोड़ें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put that real money somewhere it can grow",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Real rupees can grow, game coins can't. The same amount saved today can be worth more in a few years.",
        shortDescription: "Invest real money instead",
        shortDescriptionHi: "इसके बजाय वास्तविक धन निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy credits, gone in 2 hours of play",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Virtual items have no resale value and disappear fast. In-app purchases are designed to feel small so you buy again and again.",
        shortDescription: "Buy virtual gaming credits",
        shortDescriptionHi: "वर्चुअल गेमिंग क्रेडिट खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Maa ne tiffin diya. Yaar bol raha hai 'canteen chal!' (Maa ka tiffin > peer pressure)",
    flavorHi: "माँ ने टिफिन दिया. यार बोल रहा है 'कैंटीन चल!' (मां का टिफिन > साथियों का दबाव)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Eat Maa's tiffin, save ₹50 a day",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "₹50 a day is ₹1,500 a month. Saying no to small peer pressure is practice for saying no to bigger money traps.",
        shortDescription: "Eat tiffin and save",
        shortDescriptionHi: "टिफ़िन खाओ और बचा लो"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Eat tiffin and invest what you save",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Small daily savings invested regularly become a real amount over time. That's the power of compounding.",
        shortDescription: "Invest canteen money saved",
        shortDescriptionHi: "कैंटीन के निवेश का पैसा बचाया"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Canteen daily, ₹1,500 a month for peer approval",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Spending to fit in costs money every single day. Good friends don't care whether you eat from a tiffin.",
        shortDescription: "Spend for peer approval",
        shortDescriptionHi: "सहकर्मी अनुमोदन के लिए खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Your old comics can sell for ₹800 at the school flea market! (One person's old stuff is another's treasure)",
    flavorHi: "पुरानी कॉमिक्स स्कूल के फ्ली मार्केट में ₹800 में बिक सकती हैं! (किसी का पुराना सामान किसी और का खज़ाना है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Sell and put the money in savings",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Selling things you no longer use turns clutter into cash. Saving it means the old comics paid for something useful.",
        shortDescription: "Save comic sale money",
        shortDescriptionHi: "कॉमिक बिक्री के पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Sell and grow the money for a bigger goal",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Turning old stuff into money and then growing it is a smart cycle. Assets that sit unused earn nothing.",
        shortDescription: "Grow the sale money",
        shortDescriptionHi: "बिक्री का पैसा बढ़ाएं"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Sell and buy new comics immediately",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Swapping old stuff for new stuff right away keeps you at zero. Keep at least part of every sale.",
        shortDescription: "Buy new comics immediately",
        shortDescriptionHi: "तुरंत नई कॉमिक्स खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Hostel mess ya Zomato roz? ₹60 vs ₹250 per meal. (Convenience has a monthly price tag)",
    flavorHi: "हॉस्टल मेस या रोज़ ज़ोमैटो? ₹60 बनाम ₹250 प्रति भोजन। (सुविधा का मासिक मूल्य टैग है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Eat at the mess, save ₹5,000+ a month",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Delivery fees, packaging and surge pricing add up fast. Mess food most days keeps your monthly budget sane.",
        shortDescription: "Eat mess food and save",
        shortDescriptionHi: "मेस का खाना खाओ और बचाओ"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Eat at the mess and invest the difference",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "The money saved on daily delivery could be a monthly SIP. Convenience you skip today can be wealth you enjoy later.",
        shortDescription: "Invest food delivery savings",
        shortDescriptionHi: "भोजन वितरण बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Order online daily, ₹5,000+ extra a month",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Daily delivery quietly becomes your biggest expense. Keep ordering in as an occasional treat, not a routine.",
        shortDescription: "Spend extra on Zomato",
        shortDescriptionHi: "ज़ोमैटो पर अतिरिक्त खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹15,000 pehli kamai from your internship! Sab bol rahe hain 'treat de!' (First salary = first investment)",
    flavorHi: "इंटर्नशिप से ₹15,000 पहली कमाई! सब बोल रहे हैं 'ट्रीट दे!' (First salary = first investment)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Put it in your savings account",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Saving is safe, but a savings account earns only around 3% while inflation is about 5-6%. Idle cash slowly loses value.",
        shortDescription: "Save in savings account",
        shortDescriptionHi: "बचत खाते में बचत करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Start your first SIP with part of it",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A SIP at 20 has 40 years to compound. Starting with even ₹500 a month beats starting with ₹5,000 at 35.",
        shortDescription: "Start your first SIP",
        shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it all on the celebration treat",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A small treat is fair, you earned it. Spending the whole first paycheck sets a habit that's hard to break.",
        shortDescription: "Spend on celebration treat",
        shortDescriptionHi: "उत्सव दावत पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹25,000 semester fees due in 2 months. No plan made. (Fee dates don't move. Your savings can.)",
    flavorHi: "2 महीने में ₹25,000 सेमेस्टर फीस। कोई योजना नहीं बनी। (फीस की तारीखें नहीं बदलतीं। आपकी बचत बढ़ सकती है।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Set aside a fixed amount from every allowance",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Divide a known bill by the months left, and save that much every month. Known expenses should never be emergencies.",
        shortDescription: "Save from monthly allowance",
        shortDescriptionHi: "मासिक भत्ते से बचाएं"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Park the fee money safely until it's due",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Money needed in 2 months should stay in safe options like a savings account or short FD, not in risky stocks.",
        shortDescription: "Park fee money safely",
        shortDescriptionHi: "फीस का पैसा सुरक्षित रखें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Panic and call parents at the last minute",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Last-minute panic often ends in borrowing. A simple plan made early saves money and stress.",
        shortDescription: "Panic and call parents",
        shortDescriptionHi: "घबराएं और माता-पिता को बुलाएं"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Used copy for ₹200 vs new copy for ₹700. Dono available. (Knowledge matters. Not the spine.)",
    flavorHi: "पुरानी किताब ₹200 बनाम नई किताब ₹700। दोनों उपलब्ध हैं। (ज्ञान मायने रखता है, कवर नहीं।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Buy used, save ₹500",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "The chapters are the same in a used book. Saving on things you'll use for just one semester is smart spending.",
        shortDescription: "Buy used books and save",
        shortDescriptionHi: "प्रयुक्त पुस्तकें खरीदें और बचत करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Buy used and invest the difference",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹500 saved on every book over 4 years of college is real money. Invested, it keeps growing after you graduate.",
        shortDescription: "Invest book savings smartly",
        shortDescriptionHi: "बचत को समझदारी से निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy the new book, open it 4 times",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Paying full price for something you barely use is the most common money leak. Ask how often you'll actually use it.",
        shortDescription: "Buy new expensive books",
        shortDescriptionHi: "नई महंगी किताबें खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Dosto ne kaha: '₹5,000 lagao, ek hafte mein double ho jaayega!' (FOMO is the most expensive emotion)",
    flavorHi: "दोस्तों ने कहा: '₹5,000 लगाओ, एक हफ्ते में डबल हो जाएगा!' (FOMO is the most expensive emotion)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Say no, research first",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "'Double in a week' is the number one sign of a scam or a bubble. Real investments grow over years, not days.",
        shortDescription: "Say no and research first",
        shortDescriptionHi: "ना कहें और पहले शोध करें"
      },
      {
        type: "invest",
        asset: "crypto",
        label: "Invest",
        description: "Only a small amount you can afford to lose",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "If you do try something risky, use only money you can fully lose without pain. Never use fee or emergency money.",
        shortDescription: "Invest only affordable losses",
        shortDescriptionHi: "किफायती घाटे पर ही निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Put it all in, lose it in the dip",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Jumping in because friends did is pure FOMO. Unregulated tips have no protection if prices crash.",
        shortDescription: "Lose money in crypto dip",
        shortDescriptionHi: "क्रिप्टो डिप में पैसा खोएं"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Coding bootcamp costs ₹8,000. Ya Netflix aur sona. (Skills compound like money)",
    flavorHi: "कोडिंग बूटकैंप ₹8,000 का है। या नेटफ्लिक्स और सोना। (कौशल पैसे की तरह बढ़ते हैं)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save for 3 months, then pay in cash",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Saving up first means you learn without debt stress. Patience of 3 months costs nothing extra.",
        shortDescription: "Save up for bootcamp",
        shortDescriptionHi: "बूटकैंप के लिए बचत करें"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Invest in the skill, the ROI is a better job",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Skills are the highest-return investment at your age. Better skills mean a better salary for decades.",
        shortDescription: "Invest in coding skills",
        shortDescriptionHi: "कोडिंग कौशल में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Take a personal loan for the course",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Personal loans can charge 12-24% interest. Borrowing for a course you could save for in 3 months is costly.",
        shortDescription: "Take loan for bootcamp",
        shortDescriptionHi: "बूटकैंप के लिए लोन लें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Client paid ₹3,000 for a logo design. Tu hi toh best hai! (Freelance income = freedom when saved)",
    flavorHi: "ग्राहक ने लोगो डिज़ाइन के लिए ₹3,000 चुकाए। तू ही तो सबसे अच्छा है! (स्वतंत्र आय = बचत होने पर स्वतंत्रता)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Bank the freelance income",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Freelance income comes and goes, so a savings cushion is a must. Good months should fund the slow months.",
        shortDescription: "Save freelance logo income",
        shortDescriptionHi: "फ्रीलांस लोगो आय बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put half in a SIP, spend half",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Splitting income between growth and fun is a balanced habit. You enjoy today and still build for tomorrow.",
        shortDescription: "Invest freelance pay in SIP",
        shortDescriptionHi: "एसआईपी में फ्रीलांस वेतन निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it all shopping for new clothes",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Spending every rupee of side income means the hustle never builds anything. Save a fixed share from every payment.",
        shortDescription: "Shop for new clothes",
        shortDescriptionHi: "नए कपड़ों की खरीदारी करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Bank ka representative on campus. 'Free credit card lo bhai!' (Free credit card isn't free anything)",
    flavorHi: "परिसर में बैंक का प्रतिनिधि। 'फ्री क्रेडिट कार्ड लो भाई!' (मुफ़्त क्रेडिट कार्ड कुछ भी मुफ़्त नहीं है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Refuse. Debit card is enough.",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "A debit card spends only your own money. Get a credit card only when you have steady income to pay the full bill every month.",
        shortDescription: "Refuse free credit card",
        shortDescriptionHi: "मुफ़्त क्रेडिट कार्ड से इनकार करें"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Skip the card, build savings instead",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Building savings first means you never need to borrow for wants. Savings earn interest, card debt charges you interest.",
        shortDescription: "Invest instead of borrowing",
        shortDescriptionHi: "उधार लेने के बजाय निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Take it, max it out in month 1, interest piles up",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Paying only the minimum due leaves the rest at around 36-42% yearly interest. That is how small card bills turn into big debt.",
        shortDescription: "Spend and pay card interest",
        shortDescriptionHi: "खर्च करें और कार्ड ब्याज का भुगतान करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Group project material costs ₹1,200. Kaun pay karega pehle? (Money agreements before work begins)",
    flavorHi: "ग्रुप प्रोजेक्ट का सामान ₹1,200 का है। कौन पे करेगा पहले? (Money agreements before work begins)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Split upfront - collect immediately",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Collecting the share upfront avoids awkward chasing later. Clear money talk keeps friendships clean.",
        shortDescription: "Split upfront and collect",
        shortDescriptionHi: "पहले से विभाजित करें और एकत्र करें"
      },
      {
        type: "invest",
        asset: "fd",
        label: "Invest",
        description: "Agree on a split, use UPI requests to collect",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Send a UPI 'request' so friends pay you in a tap. Remember, you only enter your PIN to pay, never to receive money.",
        shortDescription: "Split cost via UPI request",
        shortDescriptionHi: "UPI रिक्वेस्ट से खर्च बांटें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Pay all yourself, spend weeks chasing",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Paying for everyone and hoping to get it back usually means you don't. Agree on money before the work starts.",
        shortDescription: "Pay all and chase friends",
        shortDescriptionHi: "सभी का भुगतान करें और दोस्तों का पीछा करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Three streaming apps = ₹800 a month. Sab use hota hai? (Audit subscriptions every quarter)",
    flavorHi: "तीन स्ट्रीमिंग ऐप = ₹800 महीना। सब यूज़ होता है? (हर तिमाही सदस्यताओं की जाँच करें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Keep 1, share 1, drop 1",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Subscriptions auto-renew quietly, so check your bank statement every few months. Cancel what you haven't used in 30 days.",
        shortDescription: "Audit and cancel subscriptions",
        shortDescriptionHi: "ऑडिट करें और सदस्यताएँ रद्द करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Cancel extras and invest the savings",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹500 a month saved from unused apps can be a small SIP. Same money, but now it works for you.",
        shortDescription: "Invest subscription savings wisely",
        shortDescriptionHi: "सदस्यता बचत को समझदारी से निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Keep paying for shows you half-watch",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Small auto-debits are easy to forget, which is exactly why companies love them. Unused subscriptions are money on autopilot, going out.",
        shortDescription: "Spend on unused subscriptions",
        shortDescriptionHi: "अप्रयुक्त सदस्यताओं पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Café pe study karna cool lagta hai. ₹250 per visit. (Ambience doesn't help you pass exams)",
    flavorHi: "कैफ़े पे स्टडी करना कूल लगता है। ₹250 प्रति विज़िट। (माहौल आपको परीक्षा पास करने में मदद नहीं करता)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Study at home 4 days, café once a week",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "You don't have to quit what you enjoy, just cut how often. Once a week instead of daily saves thousands a month.",
        shortDescription: "Study at home and save",
        shortDescriptionHi: "घर पर पढ़ाई करें और बचत करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Study at home and invest the café money",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Turning a daily habit cost into a monthly investment is a quiet wealth builder. Your marks won't drop either.",
        shortDescription: "Invest cafe study savings",
        shortDescriptionHi: "कैफ़े अध्ययन बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Café every day, ₹5,000+ a month on ambience",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Paying for 'vibes' every day is lifestyle creep starting early. A library or home desk does the same job for free.",
        shortDescription: "Spend on cafe ambience",
        shortDescriptionHi: "कैफ़े के माहौल पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Campus placement! ₹50,000 joining bonus in hand. (Joining bonus sets the tone for life)",
    flavorHi: "कैम्पस प्लेसमेंट! हाथ में ₹50,000 का जॉइनिंग बोनस। (ज्वाइनिंग बोनस जीवन के लिए दिशा निर्धारित करता है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Use it to start your emergency fund",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "An emergency fund of about 6 months of expenses protects you from job loss or medical bills. A joining bonus is a perfect head start.",
        shortDescription: "Save for emergency fund",
        shortDescriptionHi: "आपातकालीन निधि के लिए बचत करें"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Start your first mutual fund investment",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Your first mutual fund at the start of your career has decades to compound. Diversified funds spread risk across many companies.",
        shortDescription: "Invest in first mutual fund",
        shortDescriptionHi: "सबसे पहले म्यूचुअल फंड में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Blow it on phone accessories and gadgets",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Gadgets lose value the moment you buy them. Spending your first big money on them sets a costly pattern for every future bonus.",
        shortDescription: "Splurge on gadgets",
        shortDescriptionHi: "गैजेट्स पर उड़ाएं"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Friends ne Goa plan kiya. Budget: ₹15,000 each. Tune abhi tak socha bhi nahi. (FOMO trips hurt more than FOMO feelings)",
    flavorHi: "Friends ne Goa plan kiya. Budget: ₹15,000 each. Tune abhi tak socha bhi nahi. (FOMO trips hurt more than FOMO feelings)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Skip this one, plan next trip properly",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Skipping one trip is not missing out forever. Start a trip fund now and join the next one without debt.",
        shortDescription: "Skip Goa and plan properly",
        shortDescriptionHi: "गोवा छोड़ें और ठीक से योजना बनाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Skip it and invest the trip budget",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹15,000 invested at 20 can grow several times by your 40s. Trips will come again, those growth years won't.",
        shortDescription: "Invest Goa trip budget",
        shortDescriptionHi: "गोवा यात्रा बजट में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Go anyway, swipe the credit card",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Swiping a credit card for a trip you can't afford means paying for it for months. If you can't clear the full bill, you can't afford it.",
        shortDescription: "Swipe card for Goa trip",
        shortDescriptionHi: "गोवा यात्रा के लिए कार्ड स्वाइप करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Reference book: ₹1,200 online or free at the library. (The goal is knowledge, not ownership)",
    flavorHi: "संदर्भ पुस्तक: ऑनलाइन ₹1,200 या लाइब्रेरी में मुफ़्त। (लक्ष्य ज्ञान है, स्वामित्व नहीं)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Borrow it from the library, save ₹1,200",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Free public resources like libraries are wildly underused. Borrow first, buy only if you will use it again and again.",
        shortDescription: "Borrow from library and save",
        shortDescriptionHi: "पुस्तकालय से उधार लें और बचत करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Borrow it and invest the money saved",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Every rupee you don't need to spend is a rupee that can grow. Free options are the easiest returns you'll ever get.",
        shortDescription: "Invest book purchase savings",
        shortDescriptionHi: "पुस्तक खरीद बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Order it online with same-day delivery",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "One-click buying and fast delivery are built to skip your thinking. Wait a day before any non-urgent purchase.",
        shortDescription: "Buy books with fast delivery",
        shortDescriptionHi: "तेजी से डिलीवरी वाली किताबें खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹10,000 Olympiad prize money! Parents bol rahe hain 'well done beta'. (Celebrate smart - the achievement is yours, not the spend)",
    flavorHi: "₹10,000 ओलंपियाड पुरस्कार राशि! माता-पिता बोल रहे हैं 'शाबाश बेटा'। (स्मार्ट जश्न मनाएं - उपलब्धि आपकी है, खर्च की नहीं)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Put the prize money in savings",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Parking prize money in savings keeps it safe for the next big need. Just remember savings interest barely keeps up with 5-6% inflation.",
        shortDescription: "Save prize money securely",
        shortDescriptionHi: "पुरस्कार राशि सुरक्षित रूप से सहेजें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put the prize in an index fund",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "An index fund spreads your money across many big companies, so one bad stock can't sink you. Starting this young gives compounding decades to work.",
        shortDescription: "Invest prize in index fund",
        shortDescriptionHi: "पुरस्कार को इंडेक्स फंड में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Throw a party for 40 friends",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A small treat is fine, but blowing the full prize on one party leaves nothing to show for your hard work. The win was yours - keep a part of it.",
        shortDescription: "Spend prize on big party",
        shortDescriptionHi: "बड़ी पार्टी पर पुरस्कार खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Laptop slow ho gaya. ₹3,000 repair ya ₹60,000 ka naya? (Repair before replace. Always.)",
    flavorHi: "लैपटॉप स्लो हो गया. ₹3,000 की मरम्मत या ₹60,000 का नया? (बदलने से पहले मरम्मत करें। हमेशा।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Repair first, save for new",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "A cheap repair often buys a year or two more of use. Meanwhile, a monthly saving goal means you pay cash for the next laptop instead of EMI.",
        shortDescription: "Repair first and save later",
        shortDescriptionHi: "पहले मरम्मत करें और बाद में बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Repair it and invest the difference",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Repairing instead of replacing frees up thousands. Putting that difference into a SIP turns a broken laptop into a growing fund.",
        shortDescription: "Invest repair savings smartly",
        shortDescriptionHi: "मरम्मत की बचत को समझदारी से निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy a new one on an EMI you can't afford",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "An EMI that strains your budget is bad debt - it buys a depreciating gadget with future income. Miss a payment and your CIBIL score takes the hit too.",
        shortDescription: "Take unaffordable laptop EMI",
        shortDescriptionHi: "अफोर्डेबल लैपटॉप ईएमआई लें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹8,000/month part-time job offer. Time toh lagega. (Earning is step 1. Saving is step 2.)",
    flavorHi: "₹8,000 महीने की पार्ट-टाइम नौकरी का ऑफर। टाइम तो लगेगा. (कमाई चरण 1 है। बचत चरण 2 है।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save most of the monthly pay",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Saving a fixed part of every payout builds the habit before the income grows. This is how your first emergency fund gets built.",
        shortDescription: "Save part-time job earnings",
        shortDescriptionHi: "अंशकालिक नौकरी की कमाई बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Start a small SIP from the pay",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Even a ₹500-1,000 monthly SIP started in college gets many extra years of compounding. Time in the market matters more than the amount at the start.",
        shortDescription: "Start SIP with part-time pay",
        shortDescriptionHi: "अंशकालिक वेतन के साथ एसआईपी शुरू करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Upgrade your lifestyle right away",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "If every new rupee goes into upgrades, extra income never turns into wealth. That's lifestyle creep starting early.",
        shortDescription: "Inflate lifestyle with new income",
        shortDescriptionHi: "नई आय के साथ जीवनशैली को बढ़ावा दें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Hostel mess ne fees ₹1,500 badha di. Baaki budget tighten karo. (Budget is a living document - adjust it)",
    flavorHi: "हॉस्टल मेस ने फीस ₹1,500 बढ़ा दी। बाकी बजट टाइट करो. (बजट एक जीवित दस्तावेज़ है - इसे समायोजित करें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Cut eating-out to cover the hike",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "When one cost goes up, trimming a 'want' like eating out keeps the budget balanced. That's what adjusting a budget really means.",
        shortDescription: "Cut eating out expenses",
        shortDescriptionHi: "बाहर खाने के खर्च में कटौती करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Trim the budget and invest what's left",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Rejigging your budget often uncovers small leftovers. Investing them regularly beats letting them disappear into random spends.",
        shortDescription: "Invest remaining food budget",
        shortDescriptionHi: "बचे हुए भोजन बजट का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Ask home for extra money",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Asking for more each time costs go up means you never learn to adjust. Prices will keep rising all your life - budgeting is the skill that handles it.",
        shortDescription: "Borrow extra from parents",
        shortDescriptionHi: "माता-पिता से अतिरिक्त उधार लें"
      }
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
    type: "decision",
    tier: "epic",
    flavor: "Everyone has the new phone. You can get it on EMI!",
    flavorHi: "हर किसी के पास नया फ़ोन है. आप इसे ईएमआई पर प्राप्त कर सकते हैं!",
    options: [
      {
        type: "spend",
        label: "Take EMI",
        description: "Get the phone now, pay EMI for a year",
        effect: { type: "wealth_pct", value: -27, target: "self" },
        mentorInsight: "'No-cost' EMIs often hide processing fees or a lost discount, and you're paying for a gadget that loses value every month. Phone EMIs are classic bad debt."
      },
      {
        type: "save",
        label: "Decline",
        description: "Use old phone",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        mentorInsight: "Your old phone still works, so skipping the EMI keeps your monthly cash free. Save up and buy the next one outright - often cheaper during sales too."
      }
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
    type: "decision",
    tier: "rare",
    flavor: "Huge discount on annual gym membership if you pay via credit card EMI.",
    flavorHi: "यदि आप क्रेडिट कार्ड ईएमआई के माध्यम से भुगतान करते हैं तो वार्षिक जिम सदस्यता पर भारी छूट।",
    options: [
      {
        type: "invest",
        asset: "index",
        label: "Skip & SIP",
        description: "Skip the annual EMI plan, pay monthly once the habit sticks, and SIP the difference in an index fund",
        effect: { type: "wealth_pct", value: 17, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -11, target: "self" },
        mentorInsight: "A 'discount' paid through credit card EMI usually hides interest or processing fees, and most annual gym plans go unused. Pay monthly until the habit is real, and let the money you didn't lock up compound in an index fund."
      },
      {
        type: "save",
        label: "Decline",
        description: "Workout at home",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Home workouts cost almost nothing and prove whether the habit sticks. Pay for a gym later, monthly, once you're sure you'll use it."
      }
    ],
    shortName: "Gym Pass",
    shortNameHi: "जिम पास",
    shortFlavor: "Gym EMI. (Avoid debt)",
    shortFlavorHi: "जिम ईएमआई. (कर्ज से बचें)"
  },
  {
    id: "dc_s-036",
    name: "Pehli Salary!",
    nameHi: "Pehli Salary!",
    type: "decision",
    tier: "common",
    flavor: "₹35,000 pehli salary! HR bol raha hai - 'Treat dena!' (50-30-20 rule starts from salary #1)",
    flavorHi: "₹35,000 pehli salary! HR bol raha hai - 'Treat dena!' (50-30-20 rule starts from salary #1)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Start your emergency fund",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "An emergency fund of about 6 months' expenses means a job loss or hospital bill won't push you into debt. Salary #1 is the best day to start it.",
        shortDescription: "Start your emergency fund",
        shortDescriptionHi: "अपना आपातकालीन कोष शुरू करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Start your first SIP",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Using 50-30-20, around 20% of salary goes to saving and investing. A SIP set up on payday makes that automatic before you can spend it.",
        shortDescription: "Start your first SIP",
        shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Blow it all in one weekend",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A small treat for family and friends is lovely, but blowing the whole salary sets the pattern for every month after. Habits from salary #1 tend to stick.",
        shortDescription: "Blow salary in one weekend",
        shortDescriptionHi: "एक वीकेंड में उड़ा दो सैलरी"
      }
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
    type: "decision",
    tier: "common",
    flavor: "HR ne form diya - PF opt in ya out? 'Cash mein zyada milega bhai.' (PF is your future self's thank you note)",
    flavorHi: "HR ne form diya - PF opt in ya out? 'Cash mein zyada milega bhai.' (PF is your future self's thank you note)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Opt in always - forced saving",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "PF is forced saving - the money is cut before it hits your account, and your employer adds a matching contribution. That match is free money you lose by opting out.",
        shortDescription: "Opt in for forced savings",
        shortDescriptionHi: "जबरन बचत का विकल्प चुनें"
      },
      {
        type: "invest",
        asset: "debt",
        label: "Invest",
        description: "It's investing in 60-year-you",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "EPF earns a government-declared rate, usually above FD rates, and compounds for decades. It quietly builds a big retirement base.",
        shortDescription: "Invest in your future self",
        shortDescriptionHi: "अपने भविष्य में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Opt out and take more cash in hand",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A bit more cash today means losing the employer's share and years of compounding. Where allowed, opting out mostly makes your 60-year-old self poorer.",
        shortDescription: "Opt out and spend cash",
        shortDescriptionHi: "बाहर निकलें और नकद खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Phone chura liya kisi ne! Replacement: ₹20,000. (Gadget insurance costs a few hundred a month. Think.)",
    flavorHi: "फ़ोन चुरा लिया किसी ने! नया फ़ोन: ₹20,000. (गैजेट बीमा कुछ सौ रुपये महीने का होता है। सोचिए।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Use an old phone for now and save",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Using a backup phone buys time to save up instead of borrowing. Also block your SIM and UPI apps right away - stolen phones are used for fraud.",
        shortDescription: "Repair old phone and save",
        shortDescriptionHi: "पुराने फोन की मरम्मत करें और बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Buy a budget phone, invest the rest",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A mid-range phone does 95% of what a flagship does. Investing the difference grows; the flagship's value only falls.",
        shortDescription: "Invest gadget insurance savings",
        shortDescriptionHi: "गैजेट बीमा बचत निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy a flagship on impulse",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Panic buying after a loss usually means overspending. Expensive phones lose value fast, so it's money that doesn't come back.",
        shortDescription: "Buy flagship phone on impulse",
        shortDescriptionHi: "आवेग पर फ्लैगशिप फोन खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Boss ne hint diya - appraisal aane wala hai. (Not negotiating is expensive)",
    flavorHi: "Boss ne hint diya - appraisal aane wala hai. (Not negotiating is expensive)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Research market rate first",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Knowing the market rate for your role gives you facts, not feelings, in the appraisal talk. Preparation alone often gets you a better number.",
        shortDescription: "Research market rate first",
        shortDescriptionHi: "पहले बाजार दर पर शोध करें"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Negotiate! Salary is your biggest asset",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Every future hike is a percentage of your current salary, so a better number now compounds through your whole career. Negotiating politely is normal, not rude.",
        shortDescription: "Negotiate salary for better investment",
        shortDescriptionHi: "बेहतर निवेश के लिए वेतन पर बातचीत करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Accept without asking and lose out every year",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Not asking can cost you lakhs over a career, because each raise builds on the last. The worst answer to a polite ask is just 'no'.",
        shortDescription: "Accept hike without negotiating",
        shortDescriptionHi: "बिना बातचीत के बढ़ोतरी स्वीकार करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Salary badi toh sab kuch upgrade kar liya - rent, phone, food. (When income rises, savings rate should too)",
    flavorHi: "Salary badi toh sab kuch upgrade kar liya - rent, phone, food. (When income rises, savings rate should too)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Increase savings %, not just spends",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "If your savings rate rises with salary, your future grows as fast as your income. Keeping lifestyle a step behind income is the real secret.",
        shortDescription: "Increase your savings rate",
        shortDescriptionHi: "अपनी बचत दर बढ़ाएँ"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Save 50% of hike",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Sending half of every hike to a SIP step-up means you still enjoy a better life while wealth grows faster. You never miss money you didn't get used to.",
        shortDescription: "Invest half of your hike",
        shortDescriptionHi: "अपनी बढ़ोतरी का आधा हिस्सा निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Upgrade rent, phone and food with the whole hike",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Lifestyle creep is sneaky - bigger rent and EMIs become fixed costs that are hard to cut later. Many high earners have zero savings because of it.",
        shortDescription: "Inflate lifestyle with salary hike",
        shortDescriptionHi: "वेतन वृद्धि के साथ जीवनशैली को बेहतर बनाएं"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹50,000 performance bonus! Dost bol raha hai Manali chalte hain. (Bonus should work harder than you do)",
    flavorHi: "₹50,000 performance bonus! Dost bol raha hai Manali chalte hain. (Bonus should work harder than you do)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Put the bonus in your emergency fund",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "A bonus is the easiest way to fill your emergency fund fast, since it's not part of your monthly budget. Aim for about 6 months of expenses.",
        shortDescription: "Save bonus for emergency fund",
        shortDescriptionHi: "आपातकालीन निधि के लिए बोनस बचाएं"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Invest the bonus in a mutual fund",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A lump sum invested early gets years of compounding. If markets feel high, you can spread it over a few months instead.",
        shortDescription: "Invest bonus in mutual fund",
        shortDescriptionHi: "म्यूचुअल फंड में बोनस निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it all on the Manali trip",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A trip can be worth it, but spending the entire bonus means it did one weekend's work. Try splitting it: some fun, most for goals.",
        shortDescription: "Spend bonus on Manali trip",
        shortDescriptionHi: "मनाली यात्रा पर बोनस खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Team dinner at a fancy place. Bill: ₹12,000. You suggested splitting. (Be politely firm about money boundaries)",
    flavorHi: "एक शानदार जगह पर टीम का रात्रि भोज। बिल: ₹12,000. आपने बंटवारे का सुझाव दिया. (पैसे की सीमाओं के बारे में विनम्रतापूर्वक दृढ़ रहें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Split equally and stick to your budget",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Being politely clear about money early saves you from being the one who always pays. Good colleagues respect a fair split.",
        shortDescription: "Split equally and stick budget",
        shortDescriptionHi: "समान रूप से विभाजित करें और बजट चिपकाएँ"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Skip the extras and invest the savings",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Ordering sensibly and investing what you didn't spend is a quiet win. Small, regular amounts add up through SIP compounding.",
        shortDescription: "Invest saved dinner budget",
        shortDescriptionHi: "रात के खाने के बजट में बचत करके निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Pay the bill because 'tu junior hai'",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Paying to fit in becomes an expected habit. Social pressure is one of the biggest reasons young earners overspend.",
        shortDescription: "Pay bill for senior colleagues",
        shortDescriptionHi: "वरिष्ठ सहकर्मियों के बिल का भुगतान करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "WFH bachata hai ₹4,000 a month on commute & food. (Savings windfalls should be redirected, not spent)",
    flavorHi: "WFH से आवागमन और भोजन पर ₹4,000 महीना बचता है। (बचत के अप्रत्याशित लाभ को पुनर्निर्देशित किया जाना चाहिए, खर्च नहीं किया जाना चाहिए)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save most of it, enjoy a little",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Money you don't spend only becomes savings if you move it somewhere on purpose. Otherwise it quietly leaks into other spends.",
        shortDescription: "Save commute and food money",
        shortDescriptionHi: "आवागमन और भोजन के पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Step up SIP",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Adding the commute savings to your SIP is painless - you were already living without that money. That's the easiest step-up you'll ever do.",
        shortDescription: "Step up your monthly SIP",
        shortDescriptionHi: "अपना मासिक एसआईपी बढ़ाएं"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it on a new gaming chair",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "One purchase is fine, but if every saving gets spent, WFH never makes you richer. Decide where freed-up money goes before it's gone.",
        shortDescription: "Buy new gaming chair",
        shortDescriptionHi: "नई गेमिंग कुर्सी खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Phone EMI + bike EMI + credit card. 40% of salary gone. (EMIs don't feel heavy till they crush you)",
    flavorHi: "फ़ोन ईएमआई + बाइक ईएमआई + क्रेडिट कार्ड। 40% सैलरी चली गई. (ईएमआई तब तक भारी नहीं लगती जब तक वे आपको कुचल न दें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "No new EMIs until existing ones end",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Experts suggest keeping total EMIs under about 30-40% of take-home pay. Taking no new loans until old ones close is how you get back below that line.",
        shortDescription: "Avoid taking new EMI loans",
        shortDescriptionHi: "नई ईएमआई लोन लेने से बचें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Invest while still paying EMIs",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "If the credit card balance charges 36-42% a year, paying it off gives a better 'return' than almost any investment. Clear high-interest debt first, then invest.",
        shortDescription: "Invest instead of paying EMI",
        shortDescriptionHi: "ईएमआई चुकाने के बजाय निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Add a laptop EMI. Why not.",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Each extra EMI shrinks your cushion for emergencies. One missed payment can hurt your CIBIL score for years.",
        shortDescription: "Add a new laptop EMI",
        shortDescriptionHi: "नए लैपटॉप की ईएमआई जोड़ें"
      }
    ],
    shortName: "Too Many Loans",
    shortNameHi: "बहुत अधिक ऋण",
    shortFlavor: "Too many EMIs. (Crush)",
    shortFlavorHi: "बहुत अधिक ईएमआई. (कुचलना)"
  },
  {
    id: "dc_s-045",
    name: "Job Switch ka Mania",
    nameHi: "जॉब स्विच उन्माद",
    type: "decision",
    tier: "common",
    flavor: "30% hike at the new company. Joining bonus bhi hai. (Hikes should boost savings more than lifestyle)",
    flavorHi: "नई कंपनी में 30% हाइक। जॉइनिंग बोनस भी है. (हाइक से जीवनशैली से ज्यादा बचत को बढ़ावा मिलना चाहिए)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save the extra from the hike",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Your old salary already covered your life, so the hike can go mostly to savings. That's how you jump ahead without feeling any pinch.",
        shortDescription: "Save money from salary hike",
        shortDescriptionHi: "वेतन वृद्धि से पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Step up your SIP with the hike",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Raising your SIP every time your salary rises is one of the most powerful wealth habits. Compounding on a bigger monthly amount grows much faster.",
        shortDescription: "Step up SIP with hike",
        shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Upgrade your lifestyle right away",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Joining bonuses often have clawback clauses if you leave early - don't spend it all yet. And upgrades made today become monthly costs tomorrow.",
        shortDescription: "Upgrade lifestyle with new hike",
        shortDescriptionHi: "नई बढ़ोतरी के साथ जीवनशैली को उन्नत करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹250 office lunch order, every day. Mahine mein ₹5,000+! (Convenience spending is the sneakiest)",
    flavorHi: "रोज़ ₹250 का ऑफिस लंच ऑर्डर। महीने में ₹5,000 से ज़्यादा! (सुविधा व्यय सबसे गुप्त है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Bring tiffin 3 days a week",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Cutting just 3 orders a week saves a couple of thousand a month. Small daily costs are where budgets leak the most.",
        shortDescription: "Bring tiffin to save money",
        shortDescriptionHi: "पैसे बचाने के लिए टिफ़िन लाएँ"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Pack lunch and invest the difference",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹3,000 a month in a SIP over 10 years can grow far beyond what you put in, thanks to compounding. Your lunch box becomes a wealth machine.",
        shortDescription: "Invest office lunch savings",
        shortDescriptionHi: "कार्यालय दोपहर के भोजन की बचत का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Keep ordering every day",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "₹250 a day doesn't feel like much, but it's ₹60,000+ a year. Delivery fees and app markups make convenience surprisingly expensive.",
        shortDescription: "Spend on daily office lunch",
        shortDescriptionHi: "दैनिक कार्यालय के दोपहर के भोजन पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Content writing side hustle earned ₹12,000 this month! (Side income = fast-forward button on wealth)",
    flavorHi: "कंटेंट राइटिंग साइड हसल ने इस महीने ₹12,000 कमाए! (अतिरिक्त आय = धन पर तेजी से आगे बढ़ने वाला बटन)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save the side income",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Side income isn't needed for bills, so saving it all builds a cushion fast. Keep some aside for tax too - freelance income must be declared in your ITR.",
        shortDescription: "Save content writing earnings",
        shortDescriptionHi: "सामग्री लेखन आय बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Put the side income into a SIP",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Investing side income speeds up your goals without touching your salary budget. Two income streams also make you safer if one stops.",
        shortDescription: "Invest side hustle in SIP",
        shortDescriptionHi: "एसआईपी में निवेश पक्ष की हलचल"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend it on an unplanned trip",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Side income often gets spent because it feels like 'bonus money'. Treat it like real income and give it a job.",
        shortDescription: "Spend on unplanned vacation",
        shortDescriptionHi: "अनियोजित छुट्टियों पर खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹20 lakh MBA loan. Worth it ya nahi? (Education loans need a repayment plan, not just hope)",
    flavorHi: "₹20 लाख का एमबीए ऋण. क्या यह इसके लायक है या नहीं? (शिक्षा ऋण के लिए पुनर्भुगतान योजना की आवश्यकता है, न कि केवल आशा की)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Research ROI first. Placement record dekhna.",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Check the college's real placement salaries, not just the top package. Compare likely salary with the EMI you'll pay after graduation.",
        shortDescription: "Research ROI and placement first",
        shortDescriptionHi: "पहले आरओआई और प्लेसमेंट पर शोध करें"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Go only if placement data is strong",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "An education loan can be good debt if it clearly raises your earnings. Interest paid on it can also be deducted under Section 80E.",
        shortDescription: "Invest only if placement strong",
        shortDescriptionHi: "प्लेसमेंट मजबूत हो तो ही निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Take a huge loan with no repayment plan",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A big loan with no plan can mean years of EMIs eating your salary. Interest also keeps adding up during the course, so the amount owed grows.",
        shortDescription: "Take unplanned huge education loan",
        shortDescriptionHi: "अनियोजित भारी शिक्षा ऋण लें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "'Yaar ek tip hai. 3x ho jaayega 1 mahine mein!' (Free tips are the most expensive advice)",
    flavorHi: "'Yaar ek tip hai. 3x ho jaayega 1 mahine mein!' (Free tips are the most expensive advice)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Ignore. Report the channel.",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Promises of '3x in a month' are a classic scam sign. SEBI-registered advisers never give guaranteed-return tips on Telegram or WhatsApp.",
        shortDescription: "Ignore tip and report channel",
        shortDescriptionHi: "टिप और रिपोर्ट चैनल पर ध्यान न दें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Stick to index funds",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Index funds give you the market's growth without needing secret tips. Boring and diversified usually beats exciting and risky.",
        shortDescription: "Stick to safe index funds",
        shortDescriptionHi: "सुरक्षित इंडेक्स फंड पर टिके रहें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy the 'tip' in a pump-and-dump",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "In pump-and-dump schemes, operators buy cheap, hype it, then sell to people like you. Latecomers are left holding the loss.",
        shortDescription: "Invest in pump-and-dump scheme",
        shortDescriptionHi: "पंप-एंड-डंप योजना में निवेश करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Gym: ₹2,000/month. YouTube: Free. Fitness goals same. (Pay for habits only after proving them free)",
    flavorHi: "जिम: ₹2,000/महीना. यूट्यूब: निःशुल्क. फिटनेस लक्ष्य समान. (आदतों को मुफ़्त साबित करने के बाद ही उनका भुगतान करें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "YouTube for 3 months. Gym if consistent.",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Testing a habit for free first means you only pay once you know you'll stick to it. It's the smartest way to avoid wasted memberships.",
        shortDescription: "Try free YouTube workouts first",
        shortDescriptionHi: "पहले निःशुल्क YouTube वर्कआउट आज़माएँ"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Work out free and invest the gym fee",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "₹2,000 a month redirected to a SIP builds both health and wealth. Fitness doesn't need an expensive membership to work.",
        shortDescription: "Invest saved gym membership fees",
        shortDescriptionHi: "जिम सदस्यता शुल्क बचाकर निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Pay monthly, go 4 times, quit",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Gyms count on members who pay and stop coming. An unused membership is just a subscription leak.",
        shortDescription: "Pay gym and quit early",
        shortDescriptionHi: "जिम का भुगतान करें और जल्दी छोड़ दें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹15,000 income tax refund arrived. 'Iska toh plan hi nahi tha!' (Unexpected income = unexpected future security)",
    flavorHi: "₹15,000 इनकम टैक्स रिफंड आ गया. 'इसका तो प्लान ही नहीं था!' (अप्रत्याशित आय = अप्रत्याशित भविष्य की सुरक्षा)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Add the refund to your emergency fund",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "A refund is your own money coming back, so using it to fill your emergency fund feels painless. Unplanned money is perfect for unplanned emergencies.",
        shortDescription: "Save refund to emergency fund",
        shortDescriptionHi: "आपातकालीन निधि में धनवापसी बचाएं"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Invest the refund in ELSS",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "ELSS funds count under Section 80C (old tax regime, up to ₹1.5 lakh) and have just a 3-year lock-in. Saving tax and growing money at once.",
        shortDescription: "Invest tax refund in ELSS",
        shortDescriptionHi: "टैक्स रिफंड को ईएलएसएस में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend the refund on a weekend trip",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A refund often means too much tax was cut from your salary all year. Spending it on impulse wastes a nice chance to get ahead.",
        shortDescription: "Spend refund on weekend trip",
        shortDescriptionHi: "सप्ताहांत यात्रा पर रिफंड खर्च करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Sab bol rahe hain us startup mein invest karo. Unverified. (FOMO is not a financial strategy)",
    flavorHi: "सब बोल रहे हैं हमें स्टार्टअप में निवेश करो। असत्यापित. (FOMO कोई वित्तीय रणनीति नहीं है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Wait. Research first.",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "If you can't verify who runs it and how it makes money, don't put money in. Waiting costs nothing; a scam costs everything.",
        shortDescription: "Wait and research startup first",
        shortDescriptionHi: "प्रतीक्षा करें और पहले स्टार्टअप पर शोध करें"
      },
      {
        type: "invest",
        asset: "smallcap",
        label: "Invest",
        description: "Invest only what you can afford to lose",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Startups are very risky - most fail. If you try one, keep it to a small slice of your money so a total loss doesn't hurt your goals.",
        shortDescription: "Invest maximum affordable loss amount",
        shortDescriptionHi: "अधिकतम किफायती हानि राशि का निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Put money into the unverified startup",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Fake 'startup investments' and Ponzi schemes spread through friends and WhatsApp groups. 'Everyone is investing' is not due diligence.",
        shortDescription: "Invest in unverified startup FOMO",
        shortDescriptionHi: "असत्यापित स्टार्टअप FOMO में निवेश करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Landlord ₹3,000 extra maang raha hai. Compare karo. (Everything in India is negotiable)",
    flavorHi: "मकान मालिक ₹3,000 अतिरिक्त मांग रहा है। तुलना करो. (भारत में हर चीज़ पर मोलभाव हो सकता है)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Negotiate down or shift and save yearly",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Checking nearby rents gives you leverage - landlords often prefer a good tenant over a vacant flat. Saving ₹2,000 a month is ₹24,000 a year.",
        shortDescription: "Negotiate rent or shift house",
        shortDescriptionHi: "किराए पर बातचीत करें या घर शिफ्ट करें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Negotiate and invest the rent saved",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Rent is usually your biggest expense, so even a small cut has a big impact. Invest the savings and they keep growing.",
        shortDescription: "Invest saved rent money",
        shortDescriptionHi: "बचाए हुए किराये के पैसे निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Accept silently and pay more every year",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Accepting without asking makes the next hike easier too. A polite, data-backed ask costs nothing.",
        shortDescription: "Accept rent hike silently",
        shortDescriptionHi: "किराये में बढ़ोतरी को चुपचाप स्वीकार करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Company referral bonus: ₹25,000 credited! (Bonus ≠ spend. Bonus = advance your goals.)",
    flavorHi: "कंपनी रेफरल बोनस: ₹25,000 मिले! (बोनस ≠ खर्च करें। बोनस = अपने लक्ष्यों को आगे बढ़ाएं।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Park the bonus in a liquid fund",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "A liquid fund usually earns a bit more than a savings account and can be withdrawn in a day or so. Good for building your emergency fund.",
        shortDescription: "Save bonus in liquid fund",
        shortDescriptionHi: "लिक्विड फंड में बोनस बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Top up your SIP with the bonus",
        effect: { type: "wealth_pct", value: 9, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "One-time extra money in your long-term investments gives your goals a jump. Bonuses taken this way add up over a career.",
        shortDescription: "Top up SIP with bonus",
        shortDescriptionHi: "बोनस के साथ एसआईपी टॉप अप करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Buy new headphones and a watch",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Gadgets bought with bonuses lose value quickly. The bonus is also taxed with salary, so the real amount is smaller than it looks.",
        shortDescription: "Buy new headphone and watch",
        shortDescriptionHi: "नया हेडफोन और घड़ी खरीदें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "4 apps auto-renewing. Total: ₹1,500 a month. Kab subscribe kiya? (Audit your apps every 3 months)",
    flavorHi: "4 ऐप्स अपने आप रिन्यू हो रहे हैं। कुल: ₹1,500 महीना. कब सब्सक्राइब किया? (हर 3 महीने में अपने ऐप्स का ऑडिट करें)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Cancel 2 now and save",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Check UPI AutoPay mandates and card subscriptions every few months. Cancelling what you don't use is free money.",
        shortDescription: "Cancel unused subscriptions and save",
        shortDescriptionHi: "अप्रयुक्त सदस्यताएँ रद्द करें और सहेजें"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Cancel them and invest the savings",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "₹1,500 a month freed from unused apps can fund a small SIP. Same money, but now it grows instead of vanishing.",
        shortDescription: "Invest cancelled subscription savings",
        shortDescriptionHi: "रद्द की गई सदस्यता बचत को निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Forget them and lose money all year",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Companies make auto-renewal easy so you forget. Forgotten subscriptions can quietly eat ₹18,000 a year.",
        shortDescription: "Forget subscriptions and lose money",
        shortDescriptionHi: "सदस्यताएँ भूल जाइए और पैसे खो दीजिए"
      }
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
    type: "decision",
    tier: "common",
    flavor: "Office plan only ya personal plan bhi add karein? (One surgery will make you wish you had more cover)",
    flavorHi: "केवल ऑफिस प्लान, या पर्सनल प्लान भी जोड़ें? (एक सर्जरी से आप चाहेंगे कि आपके पास और अधिक कवर हो)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Keep office cover and add a personal plan",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Office health cover ends when you leave or lose the job. A personal plan bought young is cheaper and keeps you covered between jobs.",
        shortDescription: "Top up personal health insurance",
        shortDescriptionHi: "व्यक्तिगत स्वास्थ्य बीमा टॉप अप करें"
      },
      {
        type: "invest",
        asset: "debt",
        label: "Invest",
        description: "Buy solid personal health cover",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "One hospital stay can cost lakhs. Health insurance premiums also get a tax deduction under Section 80D.",
        shortDescription: "Invest in your personal health",
        shortDescriptionHi: "अपने व्यक्तिगत स्वास्थ्य में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Only office plan. Hope nothing happens.",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Many office plans cover only ₹3-5 lakh, which one surgery can exceed. Buying later, after a health issue, gets harder and costlier.",
        shortDescription: "Rely only on office plan",
        shortDescriptionHi: "केवल ऑफिस प्लान पर ही भरोसा करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "₹2 lakh saved. Europe trip ya mutual fund? (Travel is beautiful. Compound interest is more beautiful.)",
    flavorHi: "₹2 लाख बचाए. यूरोप यात्रा या म्यूचुअल फंड? (यात्रा सुंदर है। चक्रवृद्धि ब्याज अधिक सुंदर है।)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Travel local and invest most of it",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "A local trip gives you the break for a fraction of the cost. You get the memories and keep most of your savings growing.",
        shortDescription: "Travel local and save money",
        shortDescriptionHi: "स्थानीय यात्रा करें और पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "equity",
        label: "Invest",
        description: "Put the savings in an equity fund",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Equity funds can swing in the short term but have historically beaten inflation over long periods. Money invested in your 20s has the most time to compound.",
        shortDescription: "Invest savings in equity fund",
        shortDescriptionHi: "बचत को इक्विटी फंड में निवेश करें"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Book the Europe trip on a whim",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Travel is worth saving for - planned. Spending all your savings on a whim leaves you with no cushion if an emergency hits.",
        shortDescription: "Travel to Europe on whim",
        shortDescriptionHi: "मनमर्जी से यूरोप की यात्रा करें"
      }
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
    type: "decision",
    tier: "common",
    flavor: "A ₹20,000 course led to a 25% salary hike! (Skills don't just pay - they compound)",
    flavorHi: "₹20,000 के कोर्स से 25% वेतन वृद्धि हुई! (कौशल केवल लाभ नहीं देता - वे जुड़ते हैं)",
    options: [
      {
        type: "save",
        label: "Save",
        description: "Save the extra every month",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Your skills raised your income - keeping your expenses the same turns that raise into real savings.",
        shortDescription: "Save more money monthly",
        shortDescriptionHi: "मासिक रूप से अधिक पैसे बचाएं"
      },
      {
        type: "invest",
        asset: "index",
        label: "Invest",
        description: "Step up your SIP with the hike",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Investing in skills and then investing the payoff is double compounding. Keep learning and keep stepping up your SIP.",
        shortDescription: "Step up SIP with hike",
        shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
      },
      {
        type: "spend",
        label: "Spend",
        description: "Spend the whole hike on lifestyle",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "If the hike vanishes into upgrades, your effort pays only for more stuff. Lifestyle creep turns a raise into nothing.",
        shortDescription: "Spend salary hike on lifestyle",
        shortDescriptionHi: "वेतन वृद्धि को जीवनशैली पर खर्च करें"
      }
    ],
    shortName: "Skill Bonus",
    shortNameHi: "कौशल बोनस",
    shortFlavor: "Upskilling payoff. (Skills compound)",
    shortFlavorHi: "अपस्किलिंग अदायगी। (कौशल यौगिक)"
  },
  {
    id: "dc_s-059",
    name: "Ghar Ka Sapna: Home Loan",
    nameHi: "घर का सपना: होम लोन",
    type: "decision",
    tier: "common",
    flavor: "The bank will fund 80% of a flat's price. The dream 3BHK needs a huge EMI; a smaller 2BHK fits your budget. (Buy the home your salary can carry)",
    flavorHi: "बैंक फ्लैट की कीमत का 80% लोन देगा। सपनों के 3BHK की EMI बहुत बड़ी है; छोटा 2BHK आपके बजट में है। (वही घर लें जिसका बोझ आपकी सैलरी उठा सके)",
    options: [
      {
        type: "save",
        label: "Rent & Save",
        description: "Keep renting and grow the down payment",
        shortDescriptionHi: "किराये पर रहें, डाउन पेमेंट बचाएँ",
        shortDescription: "Rent longer, save down payment",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Renting while your down payment grows isn't wasted money. It keeps you flexible and avoids a loan you can't carry."
      },
      {
        type: "invest",
        asset: "realestate",
        label: "Smaller Home",
        description: "Buy the 2BHK with a solid down payment",
        shortDescriptionHi: "किफायती 2BHK खरीदें",
        shortDescription: "Buy affordable 2BHK",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A home with EMI under about 30-35% of take-home pay builds an asset without choking your other goals."
      },
      {
        type: "spend",
        label: "Dream 3BHK",
        description: "Max out the loan for the big flat",
        shortDescriptionHi: "सपनों के 3BHK के लिए खिंचें",
        shortDescription: "Stretch for dream 3BHK",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A max-stretch loan can mean 20 years of EMIs eating half your salary, leaving nothing for emergencies or retirement."
      }
    ],
    shortName: "Home Loan",
    shortNameHi: "होम लोन",
    shortFlavor: "Rent or buy? (Affordable EMI)",
    shortFlavorHi: "किराया या खरीद? (सस्ती EMI)"
  },
  {
    id: "dc_s-060",
    name: "Prepay EMI ya SIP?",
    nameHi: "EMI प्रीपे या SIP?",
    type: "decision",
    tier: "epic",
    flavor: "Your annual bonus is in. Prepay part of the home loan, start an equity SIP, or finally buy that new car? (Know the maths before you choose)",
    flavorHi: "सालाना बोनस आ गया। होम लोन का कुछ हिस्सा चुकाएँ, इक्विटी SIP शुरू करें, या आखिरकार नई कार खरीदें? (चुनने से पहले हिसाब समझें)",
    options: [
      {
        type: "save",
        label: "Prepay Loan",
        description: "Part-prepay the home loan principal",
        shortDescriptionHi: "होम लोन का प्रीपेमेंट करें",
        shortDescription: "Prepay home loan",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Prepaying a ~9% home loan is a guaranteed, risk-free 'return' equal to that interest rate, and it cuts years off your tenure."
      },
      {
        type: "invest",
        asset: "equity",
        label: "Start SIP",
        description: "Keep the EMI and invest the bonus in an equity SIP",
        shortDescriptionHi: "बोनस SIP में निवेश करें",
        shortDescription: "Invest bonus via SIP",
        effect: { type: "wealth_pct", value: 25, target: "self" },
        investRisk: 40,
        failEffect: { type: "wealth_pct", value: -24, target: "self" },
        mentorInsight: "Over 10+ years, diversified equity has historically beaten home loan rates, but it isn't guaranteed. Many people split the bonus between both."
      },
      {
        type: "spend",
        label: "New Car",
        description: "Use the bonus as down payment on a new car",
        shortDescriptionHi: "नई कार खरीदें",
        shortDescription: "Buy a new car",
        effect: { type: "wealth_pct", value: -28, target: "self" },
        mentorInsight: "A car loses value from day one and adds a new EMI, while your home loan interest keeps ticking."
      }
    ],
    shortName: "Prepay or SIP",
    shortNameHi: "प्रीपे या SIP",
    shortFlavor: "Bonus choice. (Do the maths)",
    shortFlavorHi: "बोनस का फैसला। (हिसाब लगाएँ)"
  },
  {
    id: "dc_s-061",
    name: "Term Plan ya ULIP?",
    nameHi: "टर्म प्लान या ULIP?",
    type: "decision",
    tier: "common",
    flavor: "Baby on the way! An agent pitches a 'guaranteed return' insurance plan. A friend says just buy pure term cover. (Insurance protects, investments grow — keep them separate)",
    flavorHi: "बच्चा आने वाला है! एक एजेंट 'गारंटीड रिटर्न' वाला बीमा प्लान बेच रहा है। दोस्त कहता है बस टर्म कवर लो। (बीमा सुरक्षा देता है, निवेश बढ़ाता है — दोनों अलग रखें)",
    options: [
      {
        type: "save",
        label: "Term Only",
        description: "Buy a pure term plan, keep the rest in savings",
        shortDescriptionHi: "शुद्ध टर्म कवर लें",
        shortDescription: "Buy pure term cover",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "A term plan of 10-15x your annual income gives your family real protection at a fraction of the cost of traditional plans."
      },
      {
        type: "invest",
        asset: "index",
        label: "Term + Invest",
        description: "Buy term cover and invest the premium you saved",
        shortDescriptionHi: "टर्म लें, बाकी निवेश करें",
        shortDescription: "Buy term, invest the rest",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "'Buy term, invest the rest' gives your family big cover and lets the leftover money grow in low-cost investments."
      },
      {
        type: "spend",
        label: "Agent's Plan",
        description: "Sign up for the ULIP/endowment 'combo' plan",
        shortDescriptionHi: "ULIP/एंडोमेंट कॉम्बो लें",
        shortDescription: "Buy ULIP/endowment combo",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Combo plans often give low cover and, after charges, modest returns. Mixing insurance and investment usually does both badly."
      }
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
    type: "decision",
    tier: "common",
    flavor: "Your office cover is ₹3 lakh and ends if you switch jobs. Spouse and kid have no cover of their own. (One hospital bill can undo years of saving)",
    flavorHi: "ऑफिस का कवर ₹3 लाख का है और नौकरी बदलते ही खत्म हो जाएगा। पति/पत्नी और बच्चे का अपना कोई कवर नहीं है। (एक अस्पताल का बिल सालों की बचत मिटा सकता है)",
    options: [
      {
        type: "save",
        label: "Self Cover",
        description: "Buy a basic personal policy for yourself",
        shortDescriptionHi: "अपने लिए बेसिक कवर",
        shortDescription: "Basic cover for yourself",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Your own policy stays with you even if you change jobs, unlike office cover. A good first step."
      },
      {
        type: "invest",
        asset: "debt",
        label: "Floater+Top-up",
        description: "Buy a family floater plus a super top-up",
        shortDescriptionHi: "फैमिली फ्लोटर + टॉप-अप",
        shortDescription: "Family floater + top-up",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A family floater shares one sum insured across the family, and a super top-up adds big cover cheaply. Buying young means lower premiums and waiting periods end sooner."
      },
      {
        type: "spend",
        label: "Skip It",
        description: "Rely on office cover and spend the premium",
        shortDescriptionHi: "छोड़ें, ऑफिस कवर पर निर्भर रहें",
        shortDescription: "Skip it, rely on office cover",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Office cover is often too small for a family and vanishes with the job. Without insurance, a hospital stay can turn into debt."
      }
    ],
    shortName: "Health Cover",
    shortNameHi: "स्वास्थ्य कवर",
    shortFlavor: "Family health plan. (Buy early)",
    shortFlavorHi: "परिवार का हेल्थ प्लान। (जल्दी लें)"
  },
  {
    id: "dc_s-063",
    name: "Emergency Fund: Abhi Se",
    nameHi: "इमरजेंसी फंड: अभी से",
    type: "decision",
    tier: "rare",
    flavor: "Layoff rumours at office. You have barely one month's expenses in the bank. (Six months of expenses = sleep well at night)",
    flavorHi: "ऑफिस में छंटनी की अफवाहें। बैंक में मुश्किल से एक महीने का खर्च है। (छह महीने का खर्च = चैन की नींद)",
    options: [
      {
        type: "save",
        label: "Save 10%",
        description: "Put 10% of salary aside until you hit 6 months",
        shortDescriptionHi: "आपातकाल के लिए 10% बचाएँ",
        shortDescription: "Save 10% for emergencies",
        effect: { type: "wealth_pct", value: 6, target: "self" },
        mentorInsight: "About 6 months of expenses set aside means a job loss or hospital bill won't force you to sell investments or borrow."
      },
      {
        type: "invest",
        asset: "debt",
        label: "Fund + SIP",
        description: "Park the fund in a liquid fund or sweep-in FD, then SIP the extra",
        shortDescriptionHi: "लिक्विड फंड, फिर SIP",
        shortDescription: "Liquid fund, then SIP",
        effect: { type: "wealth_pct", value: 17, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -13, target: "self" },
        mentorInsight: "A liquid fund or sweep-in FD usually earns more than a savings account and stays accessible. Once the fund is full, invest the extra."
      },
      {
        type: "spend",
        label: "Card Is Backup",
        description: "Skip it. Your credit card is the emergency fund",
        shortDescriptionHi: "क्रेडिट कार्ड को बैकअप मानें",
        shortDescription: "Use credit card as backup",
        effect: { type: "wealth_pct", value: -13, target: "self" },
        mentorInsight: "A credit card 'emergency fund' charges around 36-42% a year in interest, exactly when you can least afford it."
      }
    ],
    shortName: "Emergency Fund",
    shortNameHi: "इमरजेंसी फंड",
    shortFlavor: "Build a buffer. (6 months)",
    shortFlavorHi: "बफर बनाएँ। (6 महीने)"
  },
  {
    id: "dc_s-064",
    name: "Bachche Ki Padhai Fund",
    nameHi: "बच्चे की पढ़ाई फंड",
    type: "decision",
    tier: "common",
    flavor: "Your child just started school. College is 15 years away and fees keep doubling. (Start early, let time do the heavy lifting)",
    flavorHi: "बच्चे ने अभी स्कूल शुरू किया है। कॉलेज 15 साल दूर है और फीस बढ़ती ही जा रही है। (जल्दी शुरू करें, बाकी काम समय करेगा)",
    options: [
      {
        type: "save",
        label: "Safe Savings",
        description: "Start a PPF or RD in the child's name",
        shortDescriptionHi: "बच्चे के लिए PPF/RD खोलें",
        shortDescription: "Open PPF/RD for child",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Any dedicated savings for your child beats starting late, and safe options like PPF protect the money you put in."
      },
      {
        type: "invest",
        asset: "equity",
        label: "Start SIP Now",
        description: "Start an equity SIP for the 15-year goal",
        shortDescriptionHi: "शिक्षा SIP शुरू करें",
        shortDescription: "Start education SIP",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Education costs in India rise roughly 10% a year. A SIP started now has 15 years to compound and beat that inflation."
      },
      {
        type: "spend",
        label: "Big Party Now",
        description: "Wait on it and throw a grand birthday party",
        shortDescriptionHi: "भव्य पार्टी पर खर्च करें",
        shortDescription: "Spend on grand party",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Every year you delay, the monthly amount needed for the same college fund goes up sharply."
      }
    ],
    shortName: "Education Fund",
    shortNameHi: "शिक्षा फंड",
    shortFlavor: "Child's future. (Start early)",
    shortFlavorHi: "बच्चे का भविष्य। (जल्दी शुरू करें)"
  },
  {
    id: "dc_s-065",
    name: "NPS, PPF ya Kuch Nahi?",
    nameHi: "NPS, PPF या कुछ नहीं?",
    type: "decision",
    tier: "epic",
    flavor: "HR asks for your tax declarations. Should you put money in NPS, PPF, or skip retirement saving this year? (Retirement is the one goal no one gives you a loan for)",
    flavorHi: "HR टैक्स डिक्लेरेशन माँग रहा है। NPS में पैसा डालें, PPF में, या इस साल रिटायरमेंट बचत छोड़ दें? (रिटायरमेंट के लिए कोई लोन नहीं देता)",
    options: [
      {
        type: "save",
        label: "PPF",
        description: "Invest in PPF for safe, tax-free returns",
        shortDescriptionHi: "PPF में निवेश करें",
        shortDescription: "Invest in PPF",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "PPF gives government-backed, tax-free returns under Section 80C. Safe and steady, but the 15-year lock-in needs planning."
      },
      {
        type: "invest",
        asset: "debt",
        label: "NPS",
        description: "Contribute to NPS with an equity allocation",
        shortDescriptionHi: "NPS में योगदान करें",
        shortDescription: "Contribute to NPS",
        effect: { type: "wealth_pct", value: 33, target: "self" },
        investRisk: 40,
        failEffect: { type: "wealth_pct", value: -23, target: "self" },
        mentorInsight: "NPS gives an extra deduction of up to ₹50,000 under 80CCD(1B) in the old tax regime, on top of 80C. Most of it stays locked till 60."
      },
      {
        type: "spend",
        label: "Skip It",
        description: "Skip it and buy new gadgets instead",
        shortDescriptionHi: "छोड़ें और गैजेट खरीदें",
        shortDescription: "Skip and buy gadgets",
        effect: { type: "wealth_pct", value: -21, target: "self" },
        mentorInsight: "Retirement feels far at 30, but every year you skip is compounding you never get back."
      }
    ],
    shortName: "NPS vs PPF",
    shortNameHi: "NPS बनाम PPF",
    shortFlavor: "Retirement saving. (Start now)",
    shortFlavorHi: "रिटायरमेंट बचत। (अभी शुरू करें)"
  },
  {
    id: "dc_s-066",
    name: "ESOP Ka Jackpot",
    nameHi: "ESOP का जैकपॉट",
    type: "decision",
    tier: "rare",
    flavor: "Your company ESOPs have vested and the share price has tripled. Your salary and now most of your wealth depend on one company. (Don't keep all your eggs in your employer's basket)",
    flavorHi: "आपकी कंपनी के ESOP वेस्ट हो गए हैं और शेयर का भाव तीन गुना है। आपकी सैलरी और अब ज़्यादातर दौलत एक ही कंपनी पर टिकी है। (सारे अंडे एक टोकरी में न रखें)",
    options: [
      {
        type: "save",
        label: "Lock Gains",
        description: "Sell some shares and park the money safely",
        shortDescriptionHi: "कुछ बेचें, सुरक्षित रखें",
        shortDescription: "Sell some, park safely",
        effect: { type: "wealth_pct", value: 6, target: "self" },
        mentorInsight: "Booking part of your ESOP gains cuts concentration risk. Remember ESOPs are taxed when exercised and again when sold."
      },
      {
        type: "invest",
        asset: "index",
        label: "Sell & Spread",
        description: "Sell in phases and diversify across funds",
        shortDescriptionHi: "चरणों में बेचें, विविधता लाएँ",
        shortDescription: "Sell in phases, diversify",
        effect: { type: "wealth_pct", value: 20, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "Selling in phases and spreading the money keeps some upside without betting both your job and your wealth on one company."
      },
      {
        type: "spend",
        label: "Hold It All",
        description: "Hold everything and wait for it to 10x",
        shortDescriptionHi: "सब कुछ रखे रहें",
        shortDescription: "Hold everything",
        effect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "If your income and wealth both depend on one company, a single bad year can hit both at once."
      }
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
    type: "decision",
    tier: "common",
    flavor: "A former client wants you for weekend consulting. Good money, but less family time. (Extra income is only useful if it becomes extra wealth)",
    flavorHi: "एक पुराना क्लाइंट वीकेंड कंसल्टिंग के लिए बुला रहा है। अच्छा पैसा, पर परिवार के लिए कम समय। (अतिरिक्त आय तभी काम की है जब वो दौलत बने)",
    options: [
      {
        type: "save",
        label: "Stay Focused",
        description: "Decline and focus on your main job",
        shortDescriptionHi: "मना करें, नौकरी पर ध्यान दें",
        shortDescription: "Decline, focus on job",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Protecting your main income and family time is valid. Just keep upgrading your skills so the salary keeps growing."
      },
      {
        type: "invest",
        asset: "index",
        label: "Take & Invest",
        description: "Take the gig and invest every rupee it pays",
        shortDescriptionHi: "गिग लें, कमाई निवेश करें",
        shortDescription: "Take gig, invest earnings",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "A second income stream adds safety. Investing all of it speeds up your goals without changing your lifestyle."
      },
      {
        type: "spend",
        label: "Take & Upgrade",
        description: "Take the gig and upgrade your lifestyle with it",
        shortDescriptionHi: "गिग लें, कमाई खर्च करें",
        shortDescription: "Take gig, spend earnings",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "If side income just funds a bigger lifestyle, you add work without adding wealth. And remember, it's taxable too."
      }
    ],
    shortName: "Side Income",
    shortNameHi: "साइड इनकम",
    shortFlavor: "Side gig. (Invest the extra)",
    shortFlavorHi: "साइड गिग। (अतिरिक्त निवेश करें)"
  },
  {
    id: "dc_s-068",
    name: "Market Crash: Ruko Ya Bhaago?",
    nameHi: "मार्केट क्रैश: रुको या भागो?",
    type: "decision",
    tier: "common",
    flavor: "Markets fall 25% in two months. Your portfolio is deep red and WhatsApp groups are screaming 'sell everything!' (Time in the market beats timing the market)",
    flavorHi: "दो महीने में बाज़ार 25% गिर गया। आपका पोर्टफोलियो लाल है और WhatsApp ग्रुप चिल्ला रहे हैं 'सब बेच दो!' (बाज़ार में टिके रहना, टाइमिंग से बेहतर है)",
    options: [
      {
        type: "save",
        label: "Hold Steady",
        description: "Stay invested and keep SIPs running",
        shortDescriptionHi: "रुकें और SIP जारी रखें",
        shortDescription: "Hold and continue SIPs",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "Indian markets have crashed many times and recovered over time. Staying invested avoids locking in the loss."
      },
      {
        type: "invest",
        asset: "index",
        label: "Buy the Dip",
        description: "Continue SIPs and add extra from spare cash",
        shortDescriptionHi: "गिरावट में और निवेश करें",
        shortDescription: "Add more during the dip",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "SIPs in a crash buy more units at lower prices. Add extra only from money you won't need for 5+ years."
      },
      {
        type: "spend",
        label: "Panic Sell",
        description: "Sell everything before it falls further",
        shortDescriptionHi: "घबराकर सब बेच दें",
        shortDescription: "Sell everything in panic",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Panic selling turns a temporary paper loss into a permanent real one, and you often miss the recovery."
      }
    ],
    shortName: "Market Crash",
    shortNameHi: "मार्केट क्रैश",
    shortFlavor: "Crash panic. (Stay invested)",
    shortFlavorHi: "क्रैश की घबराहट। (निवेशित रहें)"
  },
  {
    id: "dc_s-069",
    name: "Virasat: Inheritance",
    nameHi: "विरासत: इनहेरिटेंस",
    type: "decision",
    tier: "rare",
    flavor: "A grandparent leaves you a sizeable sum. You still have a car loan and a thin emergency fund. (A windfall is a chance to fix the foundation)",
    flavorHi: "दादा-दादी आपके लिए अच्छी-खासी रकम छोड़ गए हैं। कार लोन अभी बाकी है और इमरजेंसी फंड कमज़ोर है। (अचानक मिला पैसा नींव मज़बूत करने का मौका है)",
    options: [
      {
        type: "save",
        label: "Clear Debts",
        description: "Pay off the car loan and top up the emergency fund",
        shortDescriptionHi: "लोन चुकाएँ, फंड भरें",
        shortDescription: "Clear loans, top up fund",
        effect: { type: "wealth_pct", value: 7, target: "self" },
        mentorInsight: "Clearing loans is a guaranteed win, and a full emergency fund makes the family shock-proof."
      },
      {
        type: "invest",
        asset: "index",
        label: "Clear & Invest",
        description: "Clear costly debt, then invest the rest for goals",
        shortDescriptionHi: "कर्ज़ चुकाएँ, बाकी निवेश करें",
        shortDescription: "Clear debt, invest rest",
        effect: { type: "wealth_pct", value: 16, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "Once costly debt is gone, investing the rest across goals (even spread over a few months) lets it work for decades."
      },
      {
        type: "spend",
        label: "Splurge",
        description: "Upgrade the car and throw a big celebration",
        shortDescriptionHi: "कार अपग्रेड करें, जश्न मनाएँ",
        shortDescription: "Upgrade car and celebrate",
        effect: { type: "wealth_pct", value: -11, target: "self" },
        mentorInsight: "A windfall spent on lifestyle feels great for a month, then it's gone and the old loans are still there."
      }
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
    type: "decision",
    tier: "epic",
    flavor: "You and your spouse both earn. Apply together as co-owners, or should one of you take the full loan alone? (Share the load, share the benefits)",
    flavorHi: "आप और आपके जीवनसाथी दोनों कमाते हैं। सह-मालिक बनकर साथ में लोन लें, या कोई एक अकेले पूरा लोन ले? (बोझ बाँटें, फायदे भी बाँटें)",
    options: [
      {
        type: "save",
        label: "Rent Longer",
        description: "Rent longer while both of you save a bigger down payment",
        shortDescriptionHi: "किराया दें, साथ में बचाएँ",
        shortDescription: "Rent and save together",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "A bigger down payment means a smaller loan and less interest over 20 years."
      },
      {
        type: "invest",
        asset: "realestate",
        label: "Joint Loan",
        description: "Apply jointly as co-owners and co-borrowers",
        shortDescriptionHi: "जॉइंट लोन लें",
        shortDescription: "Take a joint loan",
        effect: { type: "wealth_pct", value: 32, target: "self" },
        investRisk: 40,
        failEffect: { type: "wealth_pct", value: -24, target: "self" },
        mentorInsight: "Co-owner borrowers can each claim home loan interest and principal deductions in the old tax regime, and the EMI is shared. Get term cover for both."
      },
      {
        type: "spend",
        label: "Solo Stretch",
        description: "One spouse takes the maximum loan alone",
        shortDescriptionHi: "अकेले अधिकतम लोन लें",
        shortDescription: "Take max loan solo",
        effect: { type: "wealth_pct", value: -26, target: "self" },
        mentorInsight: "A huge EMI on one income is fragile. One job loss and the whole family is under stress."
      }
    ],
    shortName: "Joint Loan",
    shortNameHi: "जॉइंट लोन",
    shortFlavor: "Home loan together. (Share load)",
    shortFlavorHi: "साथ में होम लोन। (बोझ बाँटें)"
  },
  {
    id: "dc_s-071",
    name: "FIRE Ka Hisaab",
    nameHi: "FIRE का हिसाब",
    type: "decision",
    tier: "common",
    flavor: "A colleague says she'll retire at 45. You've never calculated how much you'd need to stop working. (Know your number)",
    flavorHi: "एक सहकर्मी कहती है कि वह 45 में रिटायर होगी। आपने कभी हिसाब नहीं लगाया कि काम छोड़ने के लिए कितना चाहिए। (अपना नंबर जानें)",
    options: [
      {
        type: "save",
        label: "Save More",
        description: "Raise your savings rate by 5% this year",
        shortDescriptionHi: "बचत दर 5% बढ़ाएँ",
        shortDescription: "Raise savings rate 5%",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "Even a small rise in your savings rate each year pulls your financial freedom date closer."
      },
      {
        type: "invest",
        asset: "index",
        label: "Know Number",
        description: "Calculate your FIRE corpus and set SIPs to match",
        shortDescriptionHi: "कॉर्पस निकालें, SIP सेट करें",
        shortDescription: "Calculate corpus, set SIPs",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "A common rule of thumb is 25-30x your yearly expenses to retire early in India. Knowing the number lets you plan SIPs backwards."
      },
      {
        type: "spend",
        label: "Quit Now",
        description: "Quit early anyway and figure it out later",
        shortDescriptionHi: "छोड़ दें, बाद में सोचें",
        shortDescription: "Quit and figure it out later",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Retiring before the corpus is ready means withdrawing too fast. With medical inflation, money can run out in your 60s."
      }
    ],
    shortName: "Early Retirement",
    shortNameHi: "जल्दी रिटायरमेंट",
    shortFlavor: "FIRE maths. (Know your number)",
    shortFlavorHi: "FIRE का गणित। (अपना नंबर जानें)"
  },
  {
    id: "dc_s-072",
    name: "Sona: Gehne ya Paper Gold?",
    nameHi: "सोना: गहने या पेपर गोल्ड?",
    type: "decision",
    tier: "rare",
    flavor: "Dhanteras is here and the family wants you to buy gold. Jewellery, paper gold, or a planned mix? (Gold is a hedge, not a growth engine)",
    flavorHi: "धनतेरस आ गया और परिवार चाहता है कि आप सोना खरीदें। गहने, पेपर गोल्ड, या सोचा-समझा मिश्रण? (सोना सुरक्षा कवच है, ग्रोथ इंजन नहीं)",
    options: [
      {
        type: "save",
        label: "Paper Gold",
        description: "Buy a small amount of gold through a gold ETF or fund",
        shortDescriptionHi: "थोड़ा पेपर गोल्ड लें",
        shortDescription: "Buy a little paper gold",
        effect: { type: "wealth_pct", value: 6, target: "self" },
        mentorInsight: "Gold often holds up when markets fall or the rupee weakens. Paper gold avoids locker, purity and making-charge worries."
      },
      {
        type: "invest",
        asset: "gold",
        label: "Planned Mix",
        description: "Keep gold at 5-10% and the rest in diversified investments",
        shortDescriptionHi: "सोना 5-10% तक रखें",
        shortDescription: "Keep gold at 5-10%",
        effect: { type: "wealth_pct", value: 15, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -14, target: "self" },
        mentorInsight: "A planned mix, mostly growth assets with a small gold slice, usually gives a smoother ride than going all-in on one asset."
      },
      {
        type: "spend",
        label: "Jewellery",
        description: "Buy heavy jewellery as an 'investment'",
        shortDescriptionHi: "भारी गहने खरीदें",
        shortDescription: "Buy heavy jewellery",
        effect: { type: "wealth_pct", value: -14, target: "self" },
        mentorInsight: "Making charges and GST are rarely recovered when you sell jewellery, so it's a weak investment even if gold prices rise."
      }
    ],
    shortName: "Gold",
    shortNameHi: "सोना",
    shortFlavor: "Gold choice. (5-10% max)",
    shortFlavorHi: "सोने का फैसला। (अधिकतम 5-10%)"
  },
  {
    id: "dc_s-073",
    name: "80C Ka Jugaad",
    nameHi: "80C का जुगाड़",
    type: "decision",
    tier: "common",
    flavor: "It's January and HR wants tax-saving proofs. You haven't planned anything yet. (Plan tax saving in April, not March)",
    flavorHi: "जनवरी है और HR टैक्स बचत के सबूत माँग रहा है। आपने अभी तक कुछ प्लान नहीं किया। (टैक्स प्लानिंग अप्रैल में करें, मार्च में नहीं)",
    options: [
      {
        type: "save",
        label: "Check Existing",
        description: "Count EPF, PPF, term premium and kids' fees first",
        shortDescriptionHi: "मौजूदा 80C निवेश गिनें",
        shortDescription: "Count existing 80C items",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "EPF, PPF, term premium and kids' tuition fees may already fill much of the ₹1.5 lakh 80C limit in the old regime. Check before buying anything new."
      },
      {
        type: "invest",
        asset: "equity",
        label: "ELSS SIP",
        description: "Fill the gap with a monthly ELSS SIP",
        shortDescriptionHi: "ELSS SIP शुरू करें",
        shortDescription: "Start an ELSS SIP",
        effect: { type: "wealth_pct", value: 11, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "ELSS gives the 80C benefit with the shortest lock-in (3 years) plus equity growth. Also compare old vs new tax regime first."
      },
      {
        type: "spend",
        label: "Panic Buy",
        description: "Buy whatever policy the agent sells in March",
        shortDescriptionHi: "जल्दी में एजेंट की पॉलिसी लें",
        shortDescription: "Buy agent's policy in rush",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Last-minute tax saving often locks you into a poor policy for years just to save tax once."
      }
    ],
    shortName: "Tax Planning",
    shortNameHi: "टैक्स प्लानिंग",
    shortFlavor: "Section 80C. (Plan early)",
    shortFlavorHi: "धारा 80C। (जल्दी प्लान करें)"
  },
  {
    id: "dc_s-074",
    name: "Naukri Chhod Ke Business?",
    nameHi: "नौकरी छोड़कर बिज़नेस?",
    type: "decision",
    tier: "common",
    flavor: "You have a business idea and friends love it. But there's a home loan EMI and a school-going kid. (Test the idea before you bet the family on it)",
    flavorHi: "आपके पास बिज़नेस आइडिया है और दोस्तों को पसंद है। लेकिन होम लोन की EMI है और बच्चा स्कूल जाता है। (परिवार को दाँव पर लगाने से पहले आइडिया परखें)",
    options: [
      {
        type: "save",
        label: "Stay Employed",
        description: "Keep the job and keep saving",
        shortDescriptionHi: "नौकरी रखें, बचत जारी रखें",
        shortDescription: "Keep job, keep saving",
        effect: { type: "wealth_pct", value: 3, target: "self" },
        mentorInsight: "A steady salary while you have EMIs and kids is real security. Keep learning so your options stay open."
      },
      {
        type: "invest",
        asset: "equity",
        label: "Test on Side",
        description: "Build it on weekends and save 12 months' runway first",
        shortDescriptionHi: "आइडिया परखें, रनवे बनाएँ",
        shortDescription: "Test idea, build runway",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Validate with paying customers and save 12+ months of family expenses before you quit. That turns a gamble into a plan."
      },
      {
        type: "spend",
        label: "Quit on Loans",
        description: "Quit tomorrow and fund it with personal loans",
        shortDescriptionHi: "छोड़ें और उधार लें",
        shortDescription: "Quit and borrow to fund",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Funding a startup with personal loans and credit cards puts your home and family at risk. Most new businesses take years to profit."
      }
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
    type: "decision",
    tier: "epic",
    flavor: "Your home loan rate came in higher because of an old unpaid credit card due. Your score is 640. (Your credit score is your financial reputation)",
    flavorHi: "पुराने क्रेडिट कार्ड बकाया की वजह से होम लोन की दर ज़्यादा मिली। आपका स्कोर 640 है। (क्रेडिट स्कोर आपकी वित्तीय साख है)",
    options: [
      {
        type: "save",
        label: "Pay Old Dues",
        description: "Pay the old dues in full",
        shortDescriptionHi: "पुराना बकाया पूरा चुकाएँ",
        shortDescription: "Clear old dues fully",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Paying old dues in full, rather than 'settling' for less, stops the penalties and starts rebuilding your score."
      },
      {
        type: "invest",
        asset: "debt",
        label: "Fix+Refinance",
        description: "Clear dues, set auto-pay, then refinance at a lower rate",
        shortDescriptionHi: "स्कोर सुधारें, लोन रीफाइनेंस करें",
        shortDescription: "Fix score, refinance loan",
        effect: { type: "wealth_pct", value: 29, target: "self" },
        investRisk: 40,
        failEffect: { type: "wealth_pct", value: -22, target: "self" },
        mentorInsight: "A score above about 750 can get you a lower home loan rate. Even 0.5% less on a big loan can save lakhs over the tenure."
      },
      {
        type: "spend",
        label: "Ignore It",
        description: "Ignore it and apply for another credit card",
        shortDescriptionHi: "अनदेखा करें, नया कार्ड लें",
        shortDescription: "Ignore and get new card",
        effect: { type: "wealth_pct", value: -24, target: "self" },
        mentorInsight: "Ignored dues keep growing with interest and penalties, and a poor score means rejections or costlier loans for years."
      }
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
    type: "decision",
    tier: "common",
    flavor: "After a great year, equity is now 85% of your portfolio instead of your planned 70%. (Rebalancing makes you sell high and buy low)",
    flavorHi: "शानदार साल के बाद, इक्विटी अब आपके पोर्टफोलियो का 70% की जगह 85% है। (रीबैलेंसिंग आपको ऊँचे में बेचना, नीचे में खरीदना सिखाती है)",
    options: [
      {
        type: "save",
        label: "Book Profit",
        description: "Move some gains into safer debt options",
        shortDescriptionHi: "मुनाफा डेट में डालें",
        shortDescription: "Shift gains to debt",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Taking some gains off the table after a big rally protects what you earned. Just keep capital gains tax in mind."
      },
      {
        type: "invest",
        asset: "index",
        label: "Rebalance",
        description: "Rebalance back to your 70:30 plan and keep SIPs going",
        shortDescriptionHi: "70:30 योजना पर लौटें",
        shortDescription: "Rebalance to 70:30 plan",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Rebalancing once a year back to your target mix automatically makes you sell high and buy low."
      },
      {
        type: "spend",
        label: "Chase Trend",
        description: "Move everything into last year's hottest sector",
        shortDescriptionHi: "पिछले साल के विजेता के पीछे भागें",
        shortDescription: "Chase last year's winner",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Piling into last year's hottest sector usually means buying near the top. Past returns don't promise future ones."
      }
    ],
    shortName: "Rebalance",
    shortNameHi: "रीबैलेंस",
    shortFlavor: "Rebalance. (Stick to plan)",
    shortFlavorHi: "रीबैलेंस करें। (योजना पर टिकें)"
  },
  {
    id: "dc_s-077",
    name: "Hike Mila! Lifestyle Up?",
    nameHi: "हाइक मिला! लाइफस्टाइल अप?",
    type: "decision",
    tier: "common",
    flavor: "A 20% salary hike! Colleagues are upgrading to bigger flats and new cars. (Grow your savings faster than your lifestyle)",
    flavorHi: "20% सैलरी हाइक! साथी बड़े फ्लैट और नई कारों में अपग्रेड कर रहे हैं। (लाइफस्टाइल से तेज़ अपनी बचत बढ़ाएँ)",
    options: [
      {
        type: "save",
        label: "Keep Lifestyle",
        description: "Keep spending the same and save the hike",
        shortDescriptionHi: "पूरा हाइक बचाएँ",
        shortDescription: "Save the whole hike",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Keeping your lifestyle flat after a raise is the easiest way to grow savings without feeling any pinch."
      },
      {
        type: "invest",
        asset: "index",
        label: "Step-Up SIP",
        description: "Increase your SIP by the same 20%",
        shortDescriptionHi: "SIP 20% बढ़ाएँ",
        shortDescription: "Step up SIP by 20%",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Raising your SIP every time your salary rises (a step-up SIP) can build a much bigger corpus than a fixed SIP over 20 years."
      },
      {
        type: "spend",
        label: "Upgrade All",
        description: "Move to a bigger flat and take a new car loan",
        shortDescriptionHi: "बड़ा फ्लैट और नई कार",
        shortDescription: "Bigger flat and new car",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "This is lifestyle creep. New EMIs lock in higher spending and the hike vanishes within months."
      }
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
    type: "decision",
    tier: "rare",
    flavor: "A retirement calculator says you'll need several crores at 60. You're 32 and think 'abhi toh jawani hai'. (The earlier you start, the less you need to invest)",
    flavorHi: "रिटायरमेंट कैलकुलेटर कहता है 60 तक कई करोड़ चाहिए। आप 32 के हैं और सोचते हैं 'अभी तो जवानी है'। (जितनी जल्दी शुरू करेंगे, उतना कम लगाना पड़ेगा)",
    options: [
      {
        type: "save",
        label: "Boost PF",
        description: "Add Voluntary PF (VPF) to your EPF",
        shortDescriptionHi: "EPF में VPF जोड़ें",
        shortDescription: "Add VPF to EPF",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "VPF earns the same rate as EPF and is very safe. Interest on yearly employee contributions above ₹2.5 lakh is taxable."
      },
      {
        type: "invest",
        asset: "index",
        label: "Retirement SIP",
        description: "Calculate your corpus and start a dedicated SIP",
        shortDescriptionHi: "रिटायरमेंट SIP शुरू करें",
        shortDescription: "Start retirement SIP",
        effect: { type: "wealth_pct", value: 19, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "At 6% inflation, ₹50,000 of monthly expenses today becomes about ₹2.9 lakh a month in 30 years. A long-term equity SIP helps close that gap."
      },
      {
        type: "spend",
        label: "Later Dekhenge",
        description: "It's too early. Spend now and plan at 40",
        shortDescriptionHi: "40 तक टालें",
        shortDescription: "Delay planning till 40",
        effect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "Starting at 30 instead of 40 can cut the monthly investment needed for the same corpus to a third or less, thanks to compounding."
      }
    ],
    shortName: "Retirement Plan",
    shortNameHi: "रिटायरमेंट योजना",
    shortFlavor: "Corpus check. (Start now)",
    shortFlavorHi: "कॉर्पस जाँच। (अभी शुरू करें)"
  },
  {
    id: "dc_s-079",
    name: "Maa-Papa Ka Sahara",
    nameHi: "माँ-पापा का सहारा",
    type: "decision",
    tier: "common",
    flavor: "Your parents' savings are running low and their medical costs are rising. You want to help without derailing your own future. (Support parents and your own retirement together)",
    flavorHi: "माता-पिता की बचत कम हो रही है और इलाज का खर्च बढ़ रहा है। आप मदद करना चाहते हैं, पर अपना भविष्य भी नहीं बिगाड़ना। (माता-पिता और अपना रिटायरमेंट, दोनों साथ संभालें)",
    options: [
      {
        type: "save",
        label: "Monthly Help",
        description: "Send a fixed monthly amount from your budget",
        shortDescriptionHi: "हर महीने तय रकम भेजें",
        shortDescription: "Send fixed monthly support",
        effect: { type: "wealth_pct", value: 4, target: "self" },
        mentorInsight: "A fixed monthly amount, planned in your budget, helps parents steadily without wrecking your own goals."
      },
      {
        type: "invest",
        asset: "index",
        label: "Cover + SIP",
        description: "Buy their health insurance and keep your own SIP running",
        shortDescriptionHi: "माता-पिता का बीमा, SIP जारी",
        shortDescription: "Insure parents, keep SIP",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Health insurance for senior parents gives an extra 80D deduction (up to ₹50,000, old regime). Keeping your SIP running means your kids won't have to support you later."
      },
      {
        type: "spend",
        label: "Stop All SIPs",
        description: "Stop all your investments to cover everything",
        shortDescriptionHi: "अपना निवेश बंद करें",
        shortDescription: "Stop your own investing",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Supporting parents is dharma, but stopping your own retirement saving passes the same burden to your children. Find a balance."
      }
    ],
    shortName: "Parents' Support",
    shortNameHi: "माता-पिता का सहारा",
    shortFlavor: "Help parents. (Balance both)",
    shortFlavorHi: "माता-पिता की मदद। (संतुलन रखें)"
  },
  {
    id: "dc_s-080",
    name: "Doosra Flat: Investment?",
    nameHi: "दूसरा फ्लैट: निवेश?",
    type: "decision",
    tier: "epic",
    flavor: "A builder offers a 'pre-launch deal' on a second flat. Relatives say property never loses value. (An asset you can't sell quickly isn't always a good investment)",
    flavorHi: "बिल्डर दूसरे फ्लैट पर 'प्री-लॉन्च डील' दे रहा है। रिश्तेदार कहते हैं प्रॉपर्टी कभी नहीं गिरती। (जो संपत्ति जल्दी न बिके, वो हमेशा अच्छा निवेश नहीं)",
    options: [
      {
        type: "save",
        label: "Stay Liquid",
        description: "Skip it and keep spare money in safe, liquid options",
        shortDescriptionHi: "छोड़ें, पैसा लिक्विड रखें",
        shortDescription: "Skip and stay liquid",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "One home to live in is enough for most families. Liquid money helps with kids' and parents' needs."
      },
      {
        type: "invest",
        asset: "index",
        label: "SIP Instead",
        description: "Invest the down payment amount through diversified SIPs",
        shortDescriptionHi: "इसके बदले SIP करें",
        shortDescription: "Use SIPs instead",
        effect: { type: "wealth_pct", value: 26, target: "self" },
        investRisk: 40,
        failEffect: { type: "wealth_pct", value: -23, target: "self" },
        mentorInsight: "SIPs can start small, can be sold in parts when needed, and spread risk across many companies, unlike a single flat."
      },
      {
        type: "spend",
        label: "Buy 2nd Flat",
        description: "Take a second home loan for the flat",
        shortDescriptionHi: "लोन पर दूसरा फ्लैट लें",
        shortDescription: "Buy 2nd flat on loan",
        effect: { type: "wealth_pct", value: -28, target: "self" },
        mentorInsight: "Residential rent in India often yields just 2-3% a year. A second EMI plus slow resale can trap your money."
      }
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
    type: "decision",
    tier: "rare",
    flavor: "A colleague's family is stuck in court for two years after a sudden death. Your own nominations are outdated and there's no will. (Your family shouldn't have to search for your money)",
    flavorHi: "एक सहकर्मी की अचानक मौत के बाद उसका परिवार दो साल से कोर्ट के चक्कर काट रहा है। आपके नॉमिनी पुराने हैं और कोई वसीयत नहीं है। (परिवार को आपका पैसा ढूँढना न पड़े)",
    options: [
      {
        type: "save",
        label: "Nominees Only",
        description: "Update nominees on bank, EPF, demat and insurance",
        shortDescriptionHi: "सभी नॉमिनी अपडेट करें",
        shortDescription: "Update all nominees",
        effect: { type: "wealth_pct", value: 8, target: "self" },
        mentorInsight: "Correct nominees on bank accounts, EPF, demat and insurance make claims much smoother for your family."
      },
      {
        type: "invest",
        asset: "fd",
        label: "Will+Nominees",
        description: "Write a will, update nominees and list all accounts",
        shortDescriptionHi: "वसीयत लिखें, नॉमिनी अपडेट करें",
        shortDescription: "Write will, update nominees",
        effect: { type: "wealth_pct", value: 17, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -13, target: "self" },
        mentorInsight: "A nominee may only be a custodian; a will decides who actually inherits. Together, plus a list of accounts, they save your family years of paperwork."
      },
      {
        type: "spend",
        label: "Baad Mein",
        description: "I'm young. I'll do it later",
        shortDescriptionHi: "टाल दें",
        shortDescription: "Postpone it",
        effect: { type: "wealth_pct", value: -12, target: "self" },
        mentorInsight: "Without a will or nominees, your family may need succession certificates and court visits to access money when they need it most."
      }
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
    type: "decision",
    tier: "common",
    flavor: "A college friend's startup is raising money and wants ₹5 lakh from you. 'Next unicorn, bro!' (Only bet what you can afford to lose)",
    flavorHi: "कॉलेज के दोस्त का स्टार्टअप पैसा जुटा रहा है और आपसे ₹5 लाख चाहता है। 'अगला यूनिकॉर्न, भाई!' (उतना ही दाँव लगाएँ जितना खो सकें)",
    options: [
      {
        type: "save",
        label: "Decline",
        description: "Say no and keep your money in your core plan",
        shortDescriptionHi: "मना करें, योजना पर टिकें",
        shortDescription: "Decline and stick to plan",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "Saying no to a single risky bet is fine. Your family's core goals come first."
      },
      {
        type: "invest",
        asset: "smallcap",
        label: "Small Stake",
        description: "Invest a small amount you can afford to lose",
        shortDescriptionHi: "बस थोड़ी रकम लगाएँ",
        shortDescription: "Invest only a small amount",
        effect: { type: "wealth_pct", value: 12, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "If you back startups, keep it a small slice (say under 5% of your wealth). Most fail; the rare winners make up for it."
      },
      {
        type: "spend",
        label: "Go All In",
        description: "Put a big chunk of your savings into it",
        shortDescriptionHi: "बचत का बड़ा हिस्सा लगाएँ",
        shortDescription: "Put in big savings chunk",
        effect: { type: "wealth_pct", value: -6, target: "self" },
        mentorInsight: "Putting a big chunk of savings into one startup can wipe out years of progress if it fails, and most do."
      }
    ],
    shortName: "Angel Invest",
    shortNameHi: "एंजेल निवेश",
    shortFlavor: "Startup bet. (Keep it small)",
    shortFlavorHi: "स्टार्टअप दाँव। (छोटा रखें)"
  },
  {
    id: "dc_s-083",
    name: "Bachche Ki Tabiyat",
    nameHi: "बच्चे की तबीयत",
    type: "decision",
    tier: "common",
    flavor: "Your child needs a sudden hospital stay. The bill estimate is large. How do you pay? (This is exactly why you built protection)",
    flavorHi: "बच्चे को अचानक अस्पताल में भर्ती करना पड़ा। बिल का अनुमान बड़ा है। भुगतान कैसे करेंगे? (इसीलिए तो सुरक्षा बनाई थी)",
    options: [
      {
        type: "save",
        label: "Emergency Fund",
        description: "Pay from the emergency fund",
        shortDescriptionHi: "इमरजेंसी फंड का उपयोग करें",
        shortDescription: "Use the emergency fund",
        effect: { type: "wealth_pct", value: 5, target: "self" },
        mentorInsight: "This is what the emergency fund is for: paying without stress or debt. Refill it once things settle."
      },
      {
        type: "invest",
        asset: "debt",
        label: "Use Insurance",
        description: "Use cashless insurance; emergency fund covers the rest",
        shortDescriptionHi: "पहले बीमा क्लेम करें",
        shortDescription: "Claim insurance first",
        effect: { type: "wealth_pct", value: 10, target: "self" },
        investRisk: 30,
        failEffect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Cashless insurance covers most of the bill, the emergency fund handles the rest, and your long-term investments keep compounding."
      },
      {
        type: "spend",
        label: "Swipe & Borrow",
        description: "Swipe the credit card and take a personal loan",
        shortDescriptionHi: "क्रेडिट कार्ड और लोन लें",
        shortDescription: "Use credit card and loan",
        effect: { type: "wealth_pct", value: -7, target: "self" },
        mentorInsight: "Paying a hospital bill with a credit card or personal loan adds steep interest to an already stressful time."
      }
    ],
    shortName: "Child's Health",
    shortNameHi: "बच्चे का स्वास्थ्य",
    shortFlavor: "Medical emergency. (Use protection)",
    shortFlavorHi: "मेडिकल इमरजेंसी। (सुरक्षा का उपयोग)"
  }
];

// src/data/cards.ts
var DECISION_CARDS = [
  {
    id: "dc_small_windfall_dilemma_1",
    name: "Small Windfall Dilemma",
    nameHi: "छोटी अप्रत्याशित दुविधा",
    type: "decision",
    tier: "common",
    flavor: "You found a small amount of extra cash you didn't expect to have (e.g., in an old pocket or a small refund). It's burning a hole in your pocket. Do you secure it, grow it, or enjoy it right now?",
    flavorHi: "आपको थोड़ी मात्रा में अतिरिक्त नकदी मिली जिसकी आपको उम्मीद नहीं थी (उदाहरण के लिए, पुरानी जेब में या छोटा रिफंड)। यह आपकी जेब पर भारी पड़ रहा है। क्या आप इसे सुरक्षित रखते हैं, इसे विकसित करते हैं, या अभी इसका आनंद लेते हैं?",
    options: [
      { type: "spend", label: "Spend", description: "Spend it on a premium coffee or small indulgence.", mentorInsight: "Small treats are fine, but 'found money' vanishes fastest because it never felt like yours. Notice how quickly it's gone.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put it securely in your savings account.", mentorInsight: "Unplanned cash is the easiest money to save, since you never budgeted for it. Parking it safely adds a little cushion for free.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Invest it in a micro-fund. The compounding happens instantly!", mentorInsight: "Even tiny amounts grow when invested early. Compounding rewards time in the market more than the size of the first amount.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_group_vacation_planning_2",
    name: "Group Vacation Planning",
    nameHi: "समूह अवकाश योजना",
    type: "decision",
    tier: "rare",
    flavor: "Your friends are planning a weekend trip that costs ₹10,000 per person. You don't have the cash comfortably available without dipping into your emergency funds.",
    flavorHi: "आपके मित्र एक सप्ताहांत यात्रा की योजना बना रहे हैं जिसकी लागत प्रति व्यक्ति ₹10,000 है। आपके आपातकालीन निधि में निवेश किए बिना आपके पास आराम से नकदी उपलब्ध नहीं होगी।",
    options: [
      { type: "spend", label: "Spend", description: "Swipe your credit card to go on the trip.", mentorInsight: "Swiping for a trip you can't afford turns a weekend into months of card interest. If you can't pay the full bill, you pay 36-42% a year on the rest.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Decline the trip, save your money, and suggest a local meetup instead.", mentorInsight: "Your emergency fund is for emergencies, not FOMO. A cheaper local plan keeps the friendship and your safety net intact.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Put the ₹10,000 into a high-yield asset to fund a future trip. You instantly receive the 5-year returns.", mentorInsight: "Planning a future trip with a dedicated investment means you travel guilt-free later, paid for by your own savings, not debt.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_unexpected_cash_gift_3",
    name: "Unexpected Cash Gift",
    nameHi: "अप्रत्याशित नकद उपहार",
    type: "decision",
    tier: "common",
    flavor: "A relative gives you a generous monetary gift (₹5,000) for a life milestone.",
    flavorHi: "एक रिश्तेदार आपको जीवन के एक महत्वपूर्ण पड़ाव के लिए एक उदार मौद्रिक उपहार (₹5,000) देता है।",
    options: [
      { type: "spend", label: "Spend", description: "Upgrade a gadget you've been eyeing.", mentorInsight: "Gadgets lose value the day you open the box. A gift spent on one is gone; a gift invested keeps working for you.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Bank it immediately.", mentorInsight: "Banking a gift right away removes the temptation. It's a solid first brick for your emergency fund.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Put it into a mutual fund. The market matures instantly.", mentorInsight: "Gift money is perfect seed money for a mutual fund. Started young, even ₹5,000 has decades to compound.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_daily_convenience_habit_4",
    name: "Daily Convenience Habit",
    nameHi: "दैनिक सुविधा की आदत",
    type: "decision",
    tier: "rare",
    flavor: "You are spending ₹150 every day on outside coffee/food (₹4,500/month).",
    flavorHi: "आप बाहर की कॉफी/खाने पर हर दिन ₹150 (₹4,500/माह) खर्च कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Accept it as the cost of convenience.", mentorInsight: "₹150 a day feels tiny, but it's over ₹54,000 a year. Small daily habits are where most budgets quietly leak.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Wake up earlier to prepare meals at home.", mentorInsight: "Home-made meals cut a recurring cost, and recurring savings add up much faster than one-time cuts.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Invest that ₹4,500 monthly budget into a Systematic Investment Plan (SIP). You fast-forward 10 years!", mentorInsight: "Redirecting a daily habit into a monthly SIP is how ordinary people build wealth. At ~12% long-term, ₹4,500 a month can grow past ₹10 lakh in 10 years, though returns are never guaranteed.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_equipment_upgrade_5",
    name: "Equipment Upgrade",
    nameHi: "उपकरण उन्नयन",
    type: "decision",
    tier: "rare",
    flavor: "You need equipment for work. Brand-new costs ₹25,000. Second-hand costs ₹8,000.",
    flavorHi: "आपको काम के लिए उपकरण की आवश्यकता है. एकदम नए की कीमत ₹25,000 है। सेकेंड-हैंड की कीमत ₹8,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the brand-new model.", mentorInsight: "Brand-new isn't always better for the job. Paying three times the price for the same work output is an expensive ego boost.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy the second-hand model.", mentorInsight: "A good second-hand tool does the same work for a fraction of the cost. Buying for need, not for show, is a quiet superpower.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Buy second-hand and invest the ₹17,000 difference. You instantly receive the 3-year returns.", mentorInsight: "Buying smart and investing the difference turns a purchase decision into a wealth decision. That ₹17,000 keeps growing while you work.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_performance_bonus_6",
    name: "Performance Bonus",
    nameHi: "उप्लब्धि बोनस",
    type: "decision",
    tier: "common",
    flavor: "You receive a ₹20,000 bonus at work.",
    flavorHi: "आपको कार्यस्थल पर ₹20,000 का बोनस मिलता है।",
    options: [
      { type: "spend", label: "Spend", description: "Throw a massive party for your friends.", mentorInsight: "A party lasts one night; the bonus took a year to earn. Celebrate, but with a small slice, not the whole thing.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put 80% in savings, spend 20%.", mentorInsight: "Saving most and enjoying a little is a balanced rule. You reward yourself without undoing the hard work.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest 100% into an upskilling course to boost your salary. You instantly receive the career ROI.", mentorInsight: "Skills are an asset that pays every month. A course that raises your salary can beat most market returns.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_social_pressure_weekend_7",
    name: "Social Pressure Weekend",
    nameHi: "सामाजिक दबाव सप्ताहांत",
    type: "decision",
    tier: "epic",
    flavor: "A long weekend trip with friends costs ₹8,000. If you decline, you miss social bonding.",
    flavorHi: "दोस्तों के साथ एक लंबी सप्ताहांत यात्रा का खर्च ₹8,000 है। यदि आप अस्वीकार करते हैं, तो आप सामाजिक जुड़ाव से चूक जाते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Go along with the group.", mentorInsight: "Saying yes to every plan is how peer pressure drains a salary. Good friends will understand a 'not this time'.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Decline entirely and stay home.", mentorInsight: "Skipping protects your money, but isolation has a cost too. Look for cheaper ways to stay connected.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Host a cheap potluck (₹1,500) and invest the remaining ₹6,500. Receive the 7-year return instantly!", mentorInsight: "A potluck gives you the bonding without the bill. Investing the rest means your social life and savings both win.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_side_gig_opportunity_8",
    name: "Side Gig Opportunity",
    nameHi: "साइड गिग अवसर",
    type: "decision",
    tier: "rare",
    flavor: "A freelance project pays ₹15,000, but sacrifices your weekends.",
    flavorHi: "एक फ्रीलांस प्रोजेक्ट ₹15,000 का भुगतान करता है, लेकिन आपके सप्ताहांत का त्याग करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Reject the gig to enjoy weekends.", mentorInsight: "Rest matters, but early-career side income can speed up every goal. Turning down paid work has a real opportunity cost.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Take the gig and bank the amount.", mentorInsight: "Extra income saved is the fastest way to build an emergency fund. Remember freelance income is taxable, so keep records.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Take the gig and reinvest the ₹15,000 into better software/tools. You instantly realize 2 years of higher freelance rates!", mentorInsight: "Spending on tools that raise your rates is good spending. It's an investment in your earning power, not a luxury.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_minor_lost_cash_9",
    name: "Minor Lost Cash",
    nameHi: "मामूली सी नकदी खो गई",
    type: "decision",
    tier: "common",
    flavor: "You unexpectedly lose ₹1,000 due to a minor mistake (lost wallet, late fee).",
    flavorHi: "एक छोटी सी गलती (वॉलेट खो जाने, विलंब शुल्क) के कारण आपको अप्रत्याशित रूप से ₹1,000 का नुकसान हो जाता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Get angry and spend more defensively to "feel better."', mentorInsight: "Revenge spending turns a ₹1,000 loss into a bigger one. Feelings make bad financial advisors.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Cut back on non-essentials this week to balance it out.", mentorInsight: "Trimming non-essentials for a week absorbs small losses without touching savings. That's what a flexible budget is for.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Spend ₹1,000 on an automated tracking app to stop this happening. You instantly gain 5 years of prevented losses!", mentorInsight: "Tracking expenses and setting bill reminders kills late fees for good. Fixing the system beats fixing one mistake.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_bulk_discount_trap_10",
    name: "Bulk Discount Trap",
    nameHi: "थोक डिस्काउंट जाल",
    type: "decision",
    tier: "rare",
    flavor: 'A "Buy 3 Get 2 Free" sale. You only need 1 item (cost ₹2,000), but buying 3 costs ₹6,000.',
    flavorHi: 'एक "3 खरीदें 2 मुफ़्त पाएं" सेल। आपको केवल 1 वस्तु की आवश्यकता है (कीमत ₹2,000), लेकिन 3 खरीदने पर लागत ₹6,000 है।',
    options: [
      { type: "spend", label: "Spend", description: 'Spend ₹6,000 to get the "deal".', mentorInsight: "A 'deal' on things you don't need is not a saving, it's spending. You paid ₹6,000 to save nothing.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy only the 1 item you actually need.", mentorInsight: "Buying only what you need is the best discount there is. Sales are designed to make you spend more, not less.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy 1 item, and invest the ₹4,000 difference into a blue-chip stock. The stock matures instantly!", mentorInsight: "The money you didn't waste can grow. Diversified investments are safer than putting it all into one stock.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_found_cash_dilemma_11",
    name: "Found Cash Dilemma",
    nameHi: "नकद दुविधा मिली",
    type: "decision",
    tier: "common",
    flavor: "You find ₹1,000 lying on the street. It feels like free money.",
    flavorHi: "आपको सड़क पर ₹1,000 पड़े हुए मिलते हैं। यह मुफ़्त पैसे जैसा लगता है।",
    options: [
      { type: "spend", label: "Spend", description: "Treat yourself immediately to snacks.", mentorInsight: "Free money spent on impulse leaves nothing behind. 'Easy come, easy go' is a habit worth breaking.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put it straight into your savings account.", mentorInsight: "Treating found money like earned money builds discipline. Every small deposit makes your cushion thicker.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Invest it in a high-risk asset. The market swings instantly!", mentorInsight: "High-risk bets can go either way. Only gamble money you're truly okay losing, and never your emergency fund.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_lending_to_a_friend_12",
    name: "Lending to a Friend",
    nameHi: "किसी मित्र को उधार देना",
    type: "decision",
    tier: "rare",
    flavor: 'A close friend asks to borrow ₹5,000 for an "emergency."',
    flavorHi: "एक करीबी दोस्त ने ''आपातकाल'' के लिए ₹5,000 उधार लेने के लिए कहा।",
    options: [
      { type: "spend", label: "Spend", description: "Lend the full ₹5,000 without setting terms.", mentorInsight: "Lending without terms often costs both the money and the friendship. If you lend, only lend what you could afford to never get back.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Politely decline but offer non-financial help.", mentorInsight: "Saying no to money while offering help in other ways protects you and the friendship. Real emergencies have other options too.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Lend them the ₹5,000 as a micro-loan. They pay you back instantly with interest!", mentorInsight: "If you lend, agree on the amount and a repayment date, even with friends. Clear terms keep money from becoming awkward.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_virtual_microtransactions_13",
    name: "Virtual Microtransactions",
    nameHi: "आभासी सूक्ष्म लेनदेन",
    type: "decision",
    tier: "rare",
    flavor: 'A game you play offers a "limited-time" 50% discount on virtual currency for ₹1,500.',
    flavorHi: 'आपके द्वारा खेला जाने वाला गेम ₹1,500 की आभासी मुद्रा पर "सीमित समय" के लिए 50% की छूट प्रदान करता है।',
    options: [
      { type: "spend", label: "Spend", description: "Buy the virtual currency.", mentorInsight: "'Limited-time' offers are built to rush you. Virtual coins are worth nothing outside the game.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Ignore the notification entirely.", mentorInsight: "Ignoring urgency tricks keeps you in control. If it's still worth it tomorrow, you can decide calmly.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Use that ₹1,500 on an educational course instead. You instantly gain the career ROI.", mentorInsight: "The same ₹1,500 spent on a useful skill keeps paying off. Learning is the one purchase that grows in value.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_subscription_overlap_14",
    name: "Subscription Overlap",
    nameHi: "सदस्यता ओवरलैप",
    type: "decision",
    tier: "rare",
    flavor: "You are paying ₹1,200/month for two streaming services with similar content.",
    flavorHi: "आप समान सामग्री वाली दो स्ट्रीमिंग सेवाओं के लिए ₹1,200/माह का भुगतान कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Keep both.", mentorInsight: "Paying for two services you barely use is a slow leak. ₹1,200 a month is ₹14,400 a year.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Cancel one service.", mentorInsight: "Cutting duplicate subscriptions is a painless saving. You lose almost nothing and keep the cash every month.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Cancel both and use the ₹2,400 to start a mutual fund. The fund matures instantly!", mentorInsight: "Turning a monthly bill into a monthly SIP flips the cash flow in your favour. Same money, now building wealth.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_selling_unused_items_15",
    name: "Selling Unused Items",
    nameHi: "अप्रयुक्त वस्तुओं को बेचना",
    type: "decision",
    tier: "common",
    flavor: "You clear out your closet and sell some old electronics online, making ₹4,000.",
    flavorHi: "आप अपनी अलमारी साफ़ करते हैं और कुछ पुराने इलेक्ट्रॉनिक्स ऑनलाइन बेचते हैं, जिससे ₹4,000 कमाते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Use the ₹4,000 to buy new clothes immediately.", mentorInsight: "Clearing clutter only to buy new clutter keeps you stuck in the same cycle. Declutter for cash, not for space.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Deposit the money into your emergency fund.", mentorInsight: "Selling unused stuff and saving the money builds your emergency fund at zero cost. Aim for about 6 months of expenses.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Reinvest the ₹4,000 into raw materials for a side hustle. Your hustle scales instantly!", mentorInsight: "Putting money back into a side hustle can multiply it, but start small and test demand before scaling.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_food_delivery_dependency_16",
    name: "Food Delivery Dependency",
    nameHi: "खाद्य वितरण निर्भरता",
    shortName: "Food Delivery",
    shortNameHi: "फ़ूड डिलीवरी",
    type: "decision",
    tier: "rare",
    flavor: "You order food 3 times a week (₹7,200/month).",
    flavorHi: "आप सप्ताह में 3 बार खाना ऑर्डर करते हैं (₹7,200/माह)।",
    options: [
      { type: "spend", label: "Spend", description: "Keep ordering food.", mentorInsight: "Delivery fees, packaging charges and menu markups make ordering in much costlier than it looks. ₹7,200 a month is over ₹86,000 a year.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Batch-cook meals on Sundays.", mentorInsight: "Batch-cooking once a week saves both money and daily decision fatigue. Healthier, too.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Hire a cook for ₹3,000/month and invest the remaining ₹4,200. You instantly receive the 1-year returns!", mentorInsight: "Paying for convenience smartly and investing the rest is a great balance. You keep the comfort and still grow wealth.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_first_major_paycheck_17",
    name: "First Major Paycheck",
    nameHi: "पहला प्रमुख वेतन चेक",
    type: "decision",
    tier: "rare",
    flavor: "You receive your first major salary of ₹40,000.",
    flavorHi: "आपको अपना पहला बड़ा वेतन ₹40,000 मिलता है।",
    options: [
      { type: "spend", label: "Spend", description: "Blow ₹30,000 on a massive party.", mentorInsight: "Blowing most of your first salary sets a habit that's hard to undo. Celebrate with a small part, not 75%.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Save 50% immediately.", mentorInsight: "Saving half your first salary is a strong start. Pay yourself first, then spend what's left.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Set up an automated ₹10,000 SIP. The SIP compounds instantly!", mentorInsight: "Automating a SIP on salary day means you invest before you can spend. Starting at 22 instead of 32 can more than double what you retire with.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_upcoming_large_expense_18",
    name: "Upcoming Large Expense",
    nameHi: "आने वाला बड़ा खर्च",
    type: "decision",
    tier: "epic",
    flavor: "A mandatory expense of ₹24,000 is due in 3 months.",
    flavorHi: "3 महीने में ₹24,000 का अनिवार्य व्यय देय है।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore it for now.", mentorInsight: "Ignoring a known expense turns it into an emergency later. That's usually when people reach for costly loans.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Set aside ₹8,000 a month right now.", mentorInsight: "Splitting a big bill into monthly chunks is called a sinking fund. It turns a shock into a plan.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Put the full ₹24,000 in a liquid fund to earn interest. The interest pays out instantly!", mentorInsight: "For money needed in a few months, a low-risk liquid fund or FD beats a savings account. Never put short-term money in equity.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_information_access_choice_19",
    name: "Information Access Choice",
    nameHi: "सूचना पहुंच विकल्प",
    type: "decision",
    tier: "common",
    flavor: "A specific premium report/software tool costs ₹3,000.",
    flavorHi: "एक विशिष्ट प्रीमियम रिपोर्ट/सॉफ़्टवेयर टूल की लागत ₹3,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy it outright for immediate convenience but barely use it.", mentorInsight: "Buying tools you never use is a common trap. Pay only for things you have a clear plan for.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Find a free alternative or library copy.", mentorInsight: "Free alternatives and libraries cover most needs. Try free first, then pay only if it's truly holding you back.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy it, use the knowledge to land a client. The client pays you instantly!", mentorInsight: "A paid tool is worth it when it directly earns you money. Ask: will this help me make more than it costs?", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_speculative_investment_tip_20",
    name: "Speculative Investment Tip",
    nameHi: "सट्टा निवेश युक्ति",
    shortName: "Hot Crypto Tip",
    shortNameHi: "क्रिप्टो टिप",
    type: "decision",
    tier: "epic",
    flavor: 'An acquaintance pressures you to put ₹20,000 into a new crypto coin that will "double in a month."',
    flavorHi: 'एक परिचित आप पर एक नए क्रिप्टो सिक्के में ₹20,000 डालने का दबाव डालता है जो "एक महीने में दोगुना हो जाएगा।"',
    options: [
      { type: "spend", label: "Spend", description: "Go all in with ₹20,000 out of FOMO. It's a scam.", mentorInsight: "'Double in a month' is the classic scam line. No real investment promises guaranteed fast returns.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Refuse entirely. Stick to your boring, safe savings.", mentorInsight: "Walking away from hype protects your money. Boring and steady beats exciting and broke.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "crypto", label: "Invest", description: "Invest ₹2,000—an amount you are okay losing. The market resolves instantly!", mentorInsight: "If you want to try something risky, cap it at a small amount you can afford to lose. Keep the core of your money in diversified, regulated options.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_paid_upskilling_opportunity_21",
    name: "Paid Upskilling Opportunity",
    nameHi: "सशुल्क अपस्किलिंग अवसर",
    shortName: "Paid Course",
    shortNameHi: "पेड कोर्स",
    type: "decision",
    tier: "rare",
    flavor: "A certification course costs ₹15,000.",
    flavorHi: "एक प्रमाणन पाठ्यक्रम की लागत ₹15,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Reject it and spend ₹15,000 on a short vacation.", mentorInsight: "A vacation is fun for a few days; a skill pays for years. Choosing the short-term treat has a long-term cost.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Study free materials on YouTube instead.", mentorInsight: "Free resources can teach a lot. If you're disciplined, you get most of the skill without the fee.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹15,000. Your new skills land you a massive project instantly!", mentorInsight: "Courses that raise your income are good investments. Check reviews and outcomes before you pay.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_secondary_income_boost_22",
    name: "Secondary Income Boost",
    nameHi: "द्वितीयक आय वृद्धि",
    type: "decision",
    tier: "rare",
    flavor: "A secondary income stream brings in an extra ₹12,000 this month.",
    flavorHi: "एक द्वितीयक आय स्रोत इस महीने अतिरिक्त ₹12,000 लाता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy designer clothes.", mentorInsight: "Extra income spent on designer labels disappears without a trace. Lifestyle upgrades are easy to start and hard to stop.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Send it directly to your emergency fund.", mentorInsight: "Bonus income is the fastest way to fill your emergency fund. Once it covers ~6 months of expenses, you can take more risks.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Reinvest 100% of it into the business. The compounding snowball effect accelerates instantly!", mentorInsight: "Reinvesting profits can grow a business fast, but keep some cash aside so one bad month doesn't sink it.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_introductory_credit_offer_23",
    name: "Introductory Credit Offer",
    nameHi: "परिचयात्मक क्रेडिट प्रस्ताव",
    type: "decision",
    tier: "epic",
    flavor: 'You are offered a premium credit card with a "Free First Year" and a ₹5,000 joining voucher.',
    flavorHi: 'आपको "प्रथम वर्ष निःशुल्क" और ₹5,000 के जॉइनिंग वाउचर के साथ एक प्रीमियम क्रेडिट कार्ड की पेशकश की जाती है।',
    options: [
      { type: "spend", label: "Spend", description: "Max it out on a new TV and pay only the minimum.", mentorInsight: "Paying only the minimum due is the credit card trap. The rest gets charged 36-42% a year and your CIBIL score suffers.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Decline it.", mentorInsight: "Saying no is fine if you don't trust yourself with a card yet. No card is better than a debt habit.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Accept it, spend exactly ₹5,000 to get the voucher, and pay it instantly.", mentorInsight: "Use the card, grab the reward, pay the full bill on time. That builds a good CIBIL score (750+) without paying a rupee of interest.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_fronting_money_for_a_group_24",
    name: "Fronting Money for a Group",
    nameHi: "एक समूह के लिए अग्रिम धन",
    shortName: "Covering Friends",
    shortNameHi: "दोस्तों का बिल",
    type: "decision",
    tier: "rare",
    flavor: "A group of 5 friends is booking flights. Total cost is ₹50,000. They ask you to put it on your card.",
    flavorHi: "5 दोस्तों का एक समूह फ्लाइट बुक कर रहा है। कुल लागत ₹50,000 है. वे आपसे इसे अपने कार्ड पर लगाने के लिए कहते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Put it on a debit card without having confirmation. One friend bails.", mentorInsight: "Fronting money without confirmations leaves you holding the bill when someone drops out. Always collect first.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Demand everyone transfers their share before you click book.", mentorInsight: "'Pay your share by UPI first, then I book' is normal, not rude. It protects your money and your friendships.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Use a high-reward card to front it. The friends pay you back instantly, and you keep the points!", mentorInsight: "Rewards are a bonus only if everyone pays you back before the card due date. Otherwise the interest wipes them out.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_recurring_subscription_audit_25",
    name: "Recurring Subscription Audit",
    nameHi: "आवर्ती सदस्यता लेखापरीक्षा",
    type: "decision",
    tier: "common",
    flavor: "You notice 4 different apps are auto-renewing on your card. Total cost: ₹1,800/month.",
    flavorHi: "आप देखते हैं कि आपके कार्ड पर 4 अलग-अलग ऐप्स स्वतः नवीनीकरण कर रहे हैं। कुल लागत: ₹1,800/माह।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore it.", mentorInsight: "Auto-renewals are designed to be forgotten. ₹1,800 a month is ₹21,600 a year for apps you barely open.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Cancel the 3 unused ones immediately.", mentorInsight: "A quick subscription audit every few months is easy money. Check your UPI autopay mandates and card statements.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Cancel them all and downgrade to free tiers. Invest the savings. You instantly receive the 1-year returns!", mentorInsight: "Free tiers often do the job. Sending the saved money to a SIP turns a leak into growth.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_paying_for_ambience_26",
    name: "Paying for Ambience",
    nameHi: "माहौल के लिए भुगतान",
    shortName: "Fancy Café",
    shortNameHi: "महंगा कैफ़े",
    type: "decision",
    tier: "rare",
    flavor: "You like to work from a fancy café. A coffee costs ₹400 per visit (₹6,400/month).",
    flavorHi: "आपको फैंसी कैफे में काम करना पसंद है। एक कॉफ़ी की कीमत ₹400 प्रति विजिट (₹6,400/माह) है।",
    options: [
      { type: "spend", label: "Spend", description: "Keep going 4 times a week.", mentorInsight: "Paying for vibe every day adds up to a rent-sized bill. Make the expensive stuff occasional, not default.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Create a nice workspace at home.", mentorInsight: "A comfortable home setup is a one-time cost that saves every week. Smart spending is about cost per use.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Go to the café only once a week. Invest the difference. You instantly realize the future gains!", mentorInsight: "Keeping the treat but cutting the frequency is a sustainable middle path. You still enjoy it, and the gap gets invested.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_joining_signing_bonus_27",
    name: "Joining/Signing Bonus",
    nameHi: "बोनस में शामिल होना/हस्ताक्षर करना",
    shortName: "Joining Bonus",
    shortNameHi: "जॉइनिंग बोनस",
    type: "decision",
    tier: "rare",
    flavor: "You receive a one-time joining bonus of ₹50,000.",
    flavorHi: "आपको ₹50,000 का एकमुश्त ज्वाइनिंग बोनस मिलता है।",
    options: [
      { type: "spend", label: "Spend", description: "Use it as down payment for a luxury car EMI.", mentorInsight: "Using a one-time bonus to start a long car EMI is a mismatch. The bonus ends; the EMI doesn't.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Park 100% of it in an emergency liquid fund.", mentorInsight: "A bonus is a great way to build your emergency fund in one go. A liquid fund keeps it safe and accessible.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Use it to wipe out high-interest debt entirely. The interest savings are realized instantly!", mentorInsight: "Clearing high-interest debt like credit cards or personal loans is a guaranteed 'return' of 14-40%. No investment reliably beats that.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_out_of_budget_social_trip_28",
    name: "Out-of-Budget Social Trip",
    nameHi: "बजट से बाहर सामाजिक यात्रा",
    shortNameHi: "महंगी ट्रिप",
    type: "decision",
    tier: "epic",
    flavor: "Your friends are planning an international trip. The budget is ₹80,000. You only have ₹30,000.",
    flavorHi: "आपके मित्र किसी अंतर्राष्ट्रीय यात्रा की योजना बना रहे हैं। बजट है ₹80,000. आपके पास केवल ₹30,000 हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Put the remaining ₹50,000 on a personal loan.", mentorInsight: "A personal loan for a holiday is bad debt: high interest on something that leaves nothing behind. You'll be paying long after the photos fade.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Say no clearly.", mentorInsight: "A clear 'no' is a complete answer. Spending within your means is what keeps you free.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Offer to join them for just the domestic leg (₹25,000) and invest the remaining ₹5,000. You get an instant return!", mentorInsight: "Joining for the part you can afford keeps you in the memories without the debt. Smart compromises beat all-or-nothing choices.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_borrow_vs_buy_29",
    name: "Borrow vs. Buy",
    nameHi: "उधार बनाम खरीदें",
    type: "decision",
    tier: "common",
    flavor: "You want to try a new hobby that requires ₹15,000 worth of gear.",
    flavorHi: "आप एक नया शौक आज़माना चाहते हैं जिसके लिए ₹15,000 मूल्य के गियर की आवश्यकता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy brand new gear immediately.", mentorInsight: "Many hobbies get dropped within weeks. Buying everything new before you know you'll stick with it is risky.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Rent the gear for ₹1,500 for a weekend.", mentorInsight: "Renting lets you test a hobby cheaply. If you love it, buy later with confidence.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Buy second-hand gear for ₹10,000 and invest the ₹5,000. You instantly realize the future gains!", mentorInsight: "Good second-hand gear holds its value and can be resold. Investing the difference makes the hobby cheaper still.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_competition_award_winnings_30",
    name: "Competition/Award Winnings",
    nameHi: "प्रतियोगिता/पुरस्कार जीतें",
    shortName: "Award Winnings",
    shortNameHi: "पुरस्कार राशि",
    type: "decision",
    tier: "common",
    flavor: "You win a local competition with a ₹25,000 cash prize.",
    flavorHi: "आप ₹25,000 नकद पुरस्कार के साथ एक स्थानीय प्रतियोगिता जीतते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Treat everyone to dinner and buy a new console.", mentorInsight: "Treating friends is kind, but spending the whole prize means nothing remains of your win. Celebrate with a slice.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put it in a locked savings vault.", mentorInsight: "Saving the prize is safe, but idle cash loses value to 5-6% inflation. Saving is the start, not the finish.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Invest it entirely in an index fund. The market fast-forwards 15 years instantly!", mentorInsight: "A low-cost index fund spreads your money across many companies. Left for 15 years, compounding does the heavy lifting.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_essential_equipment_failure_31",
    name: "Essential Equipment Failure",
    nameHi: "आवश्यक उपकरण विफलता",
    type: "decision",
    tier: "rare",
    flavor: "Your primary work laptop or essential vehicle breaks down suddenly. It needs immediate fixing.",
    flavorHi: "आपका प्राथमिक कार्य लैपटॉप या आवश्यक वाहन अचानक खराब हो जाता है। इसे तत्काल ठीक करने की जरूरत है.",
    options: [
      { type: "spend", label: "Spend", description: "Buy the newest, most expensive model.", mentorInsight: "Panic upgrades are expensive. A breakdown is a reason to fix the problem, not to buy the top model.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay for a basic repair.", mentorInsight: "A basic repair gets you working again at the lowest cost. This is exactly why an emergency fund exists.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Trade it in, buy a reliable replacement, and use the extra productivity to finish a gig. You get paid instantly!", mentorInsight: "Tools you earn with deserve reliability. Spending on something that keeps your income flowing is a productive expense.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_side_hustle_offer_32",
    name: "Side Hustle Offer",
    nameHi: "साइड हसल ऑफर",
    type: "decision",
    tier: "rare",
    flavor: "You are offered a small side gig that pays ₹6,000, but it requires working over the weekend.",
    flavorHi: "आपको एक छोटे से अतिरिक्त कार्यक्रम की पेशकश की जाती है जिसका भुगतान ₹6,000 है, लेकिन इसके लिए सप्ताहांत में काम करना आवश्यक है।",
    options: [
      { type: "spend", label: "Spend", description: "Reject the gig to go to a concert instead.", mentorInsight: "Fun matters, but trading paid work for a one-time ticket has a real cost. Count what you're giving up.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Take the gig and put the money straight into your bank.", mentorInsight: "Small gigs banked consistently grow your safety net fast. Keep invoices for tax filing.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Take the gig, but reinvest the ₹6,000 immediately on better tools. Your business scales instantly!", mentorInsight: "Reinvesting in better tools raises what you can charge. Growing your earning ability compounds like money does.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_living_expense_increase_33",
    name: "Living Expense Increase",
    nameHi: "जीवनयापन व्यय में वृद्धि",
    type: "decision",
    tier: "epic",
    flavor: "Your rent or society maintenance fees have suddenly increased by ₹2,000 per month.",
    flavorHi: "आपका किराया या सोसायटी रखरखाव शुल्क अचानक ₹2,000 प्रति माह बढ़ गया है।",
    options: [
      { type: "spend", label: "Spend", description: "Accept the hike.", mentorInsight: "Accepting a cost hike without adjusting your budget eats straight into savings. Every rupee of rise needs a plan.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Cut back on your entertainment budget to cover the exact difference.", mentorInsight: "Cutting a 'want' to cover a 'need' keeps your savings rate intact. That's budgeting done right.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Negotiate a longer lease to freeze the rent, paying a one-time ₹5,000 fee. The savings over 5 years are realized instantly!", mentorInsight: "A longer rent agreement with a fixed rate can protect you from yearly hikes. Read the lock-in and exit clauses first.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_online_deal_scam_34",
    name: "Online Deal Scam",
    nameHi: "ऑनलाइन डील घोटाला",
    type: "decision",
    tier: "common",
    flavor: "You see an ad for a premium course/gadget for ₹999. It looks too good to be true.",
    flavorHi: "आप ₹999 के प्रीमियम कोर्स/गैजेट का विज्ञापन देखते हैं। यह सच होने के लिए बहुत अच्छा लगता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the ₹999 deal out of FOMO. It's a scam.", mentorInsight: "Too-good-to-be-true prices, countdown timers and no reviews are classic scam signs. FOMO is exactly what scammers sell.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Research reviews. Realize it's a scam and ignore it.", mentorInsight: "A few minutes checking reviews and the seller saves you from most online scams. Pause before you pay.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy the legitimate version for ₹5,000. The tool lands you a client instantly!", mentorInsight: "Paying a fair price for the genuine product is cheaper than losing money to a fake. Value beats the lowest price.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_paid_masterclass_35",
    name: "Paid Masterclass",
    nameHi: "सशुल्क मास्टरक्लास",
    type: "decision",
    tier: "rare",
    flavor: "A reputed expert is holding a one-day masterclass on personal finance or career growth for ₹2,000.",
    flavorHi: "एक प्रतिष्ठित विशेषज्ञ ₹2,000 में व्यक्तिगत वित्त या करियर विकास पर एक दिवसीय मास्टरक्लास आयोजित कर रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Use the ₹2,000 to go out drinking with friends instead.", mentorInsight: "One night out versus knowledge you'll use for years. Small choices like this shape where you are in five years.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Skip it and watch free videos instead.", mentorInsight: "Free videos teach a lot, but check the source. Avoid 'finfluencers' selling products or tips.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Attend the masterclass. The knowledge gives you an immediate financial optimization!", mentorInsight: "Learning money basics early is one of the highest-return investments you can make. Good habits compound for life.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_major_salary_jump_36",
    name: "Major Salary Jump",
    nameHi: "वेतन में बड़ी उछाल",
    type: "decision",
    tier: "epic",
    flavor: "You get a major promotion! Your income increases significantly.",
    flavorHi: "आपको एक बड़ी पदोन्नति मिलेगी! आपकी आय काफी बढ़ जाती है.",
    options: [
      { type: "spend", label: "Spend", description: "Move to a fancy apartment and upgrade your car.", mentorInsight: "Upgrading everything with every raise is lifestyle creep. Your income grows, but your savings never do.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Keep your lifestyle exactly the same. Save the entire raise.", mentorInsight: "Keeping your lifestyle flat after a raise is the fastest path to wealth. All the extra goes to your future.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Invest 100% of the raise into a high-growth startup index. It matures instantly!", mentorInsight: "Investing the raise is powerful, but don't put it all in one risky bet. Spread it across diversified funds.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_forced_savings_decision_37",
    name: "Forced Savings Decision",
    nameHi: "जबरन बचत का निर्णय",
    type: "decision",
    tier: "common",
    flavor: "Your company lets you opt into a voluntary retirement contribution (like VPF). It deducts ₹2,000 from your salary.",
    flavorHi: "आपकी कंपनी आपको सेवानिवृत्ति योजना चुनने की अनुमति देती है। यह आपके वेतन से ₹2,000 काट लेता है।",
    options: [
      { type: "spend", label: "Spend", description: "Opt out. You want the cash in hand now.", mentorInsight: "Cash in hand feels good, but retirement savings missed in your 20s are the hardest to make up later.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Opt in immediately.", mentorInsight: "Automatic salary deductions save money before you can spend it. Provident fund contributions also get tax benefits.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Opt in, and match it with a personal index fund. It compounds instantly!", mentorInsight: "Pairing safe retirement savings with an equity index SIP balances safety and growth. Time is your biggest advantage.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_stolen_device_38",
    name: "Stolen Device",
    nameHi: "चोरी हुआ उपकरण",
    type: "decision",
    tier: "rare",
    flavor: "Your smartphone is stolen. A basic replacement costs ₹12,000, while a flagship model costs ₹60,000.",
    flavorHi: "आपका स्मार्टफोन चोरी हो गया है. एक बेसिक रिप्लेसमेंट की कीमत ₹12,000 है, जबकि एक फ्लैगशिप मॉडल की कीमत ₹60,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the ₹60,000 flagship.", mentorInsight: "Replacing a stolen phone with a flagship turns one loss into two. A phone is a tool, not a status symbol.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy the basic ₹12,000 replacement with cash.", mentorInsight: "Paying cash for a basic replacement avoids EMIs and debt. Also block your SIM and UPI apps right away after a theft.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy a mid-range phone for ₹25,000 and use its features to start a vlog that goes viral instantly!", mentorInsight: "A mid-range phone that helps you earn is a reasonable middle ground. Spend in proportion to the value it creates.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_negotiation_opportunity_39",
    name: "Negotiation Opportunity",
    nameHi: "बातचीत का अवसर",
    shortName: "Ask for a Raise",
    shortNameHi: "सैलरी मोलभाव",
    type: "decision",
    tier: "epic",
    flavor: "It's appraisal season. Your boss offers a standard 5% raise. You know market rate is 15%.",
    flavorHi: "यह मूल्यांकन का मौसम है. आपका बॉस मानक 5% वृद्धि की पेशकश करता है। आप जानते हैं कि बाजार दर 15% है।",
    options: [
      { type: "spend", label: "Spend", description: "Get angry and quit impulsively without a backup job.", mentorInsight: "Quitting without a backup leaves you with zero income and EMIs still due. Always line up the next job first.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Accept the 5% silently to avoid conflict.", mentorInsight: "Staying silent is safe, but underpaid by 10% today compounds into lakhs lost over a career.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Negotiate firmly for 15%. Your boss says yes, and you instantly receive a year of the higher salary!", mentorInsight: "Negotiating with market data is professional, not rude. Your salary is the base for every future raise.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_lifestyle_inflation_temptation_40",
    name: "Lifestyle Inflation Temptation",
    nameHi: "जीवनशैली मुद्रास्फीति प्रलोभन",
    shortName: "Lifestyle Creep",
    shortNameHi: "बढ़ते शौक़",
    type: "decision",
    tier: "rare",
    flavor: "You've been earning well lately. You feel the urge to upgrade your lifestyle.",
    flavorHi: "आप हाल ही में अच्छी कमाई कर रहे हैं। आप अपनी जीवनशैली को उन्नत करने की चाहत महसूस करते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Upgrade everything. You earned it!", mentorInsight: "Upgrading everything at once is classic lifestyle creep. Bigger EMIs and bills can trap even high earners.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Resist the urge. Keep living like a student.", mentorInsight: "Living below your means while earning more creates a big gap. That gap is where wealth comes from.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "realestate", label: "Invest", description: "Invest ₹10,000 into a REIT (Real Estate Investment Trust). It pays out its 5-year dividend instantly!", mentorInsight: "REITs let you invest in real estate in small amounts and earn regular payouts. They add variety to a portfolio.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_annual_bonus_41",
    name: "Annual Bonus",
    nameHi: "वार्षिक बोनस",
    type: "decision",
    tier: "common",
    flavor: "You receive a ₹30,000 Diwali/Year-End bonus.",
    flavorHi: "आपको ₹30,000 दिवाली/वर्ष के अंत का बोनस मिलता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy a massive new TV you didn't plan for.", mentorInsight: "Unplanned big purchases are where festive bonuses vanish. Decide what the bonus is for before it lands.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Bank the entire amount immediately.", mentorInsight: "Banking the bonus is safe and smart. Next step: give it a job, like your emergency fund or a goal.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest ₹30,000 in a tech stock. It moons instantly!", mentorInsight: "Putting the whole bonus into a single stock is a gamble. Diversified funds reduce the chance of a big loss.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_networking_dinner_bill_42",
    name: "Networking Dinner Bill",
    nameHi: "नेटवर्किंग डिनर बिल",
    type: "decision",
    tier: "rare",
    flavor: "You go to a fancy dinner with seniors/clients. The bill is ₹8,000.",
    flavorHi: "आप वरिष्ठ नागरिकों/ग्राहकों के साथ एक फैंसी डिनर पर जाते हैं। बिल ₹8,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the full bill just to show off.", mentorInsight: "Paying big to impress rarely earns respect. People remember your work more than your bill.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Ask to split the bill evenly.", mentorInsight: "Splitting the bill is normal and fair. Don't let awkwardness make your money decisions.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the full bill. The networking lands you a massive contract instantly!", mentorInsight: "Hosting can be a real business expense when there's a clear opportunity. Spend with purpose, not pressure.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_savings_windfall_43",
    name: "Savings Windfall",
    nameHi: "बचत अप्रत्याशित",
    type: "decision",
    tier: "common",
    flavor: "Due to a change in routine, you realize you are saving ₹4,000 a month on commute.",
    flavorHi: "दिनचर्या में बदलाव के कारण, आपको एहसास होता है कि आप यात्रा पर प्रति माह ₹4,000 की बचत कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Use the "extra" ₹4,000 to upgrade your online shopping habits.', mentorInsight: "Money you save in one place often leaks into another. Without a plan, 'extra' money quietly disappears.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Leave it sitting in your savings account.", mentorInsight: "Idle cash in a savings account earns around 3%, below 5-6% inflation. It's safe, but slowly losing value.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Invest the ₹4,000 in an automated fund. You fast-forward 3 years instantly!", mentorInsight: "Redirecting a monthly saving straight into a SIP locks in the gain. Automate it so you never miss it.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_debt_consolidation_44",
    name: "Debt Consolidation",
    nameHi: "ऋण समेकन",
    type: "decision",
    tier: "epic",
    flavor: "You have multiple small loans. A bank offers a single consolidation loan at a lower rate.",
    flavorHi: "आपके ऊपर अनेक छोटे-छोटे ऋण हैं। एक बैंक कम दर पर एकल समेकन ऋण प्रदान करता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Take the loan, feel "debt-free", and buy a holiday.', mentorInsight: "Consolidation lowers the rate, but new spending on top just restarts the debt cycle. The loan isn't extra money.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Aggressively pay off the smallest debts first.", mentorInsight: "Clearing small debts first (the snowball method) gives quick wins and motivation. Each closed loan frees up cash.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Take the loan and invest the monthly savings. The savings compound instantly!", mentorInsight: "A lower interest rate means a lower EMI. Investing the difference works only if you stay disciplined with repayments.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_job_switch_bonus_45",
    name: "Job Switch Bonus",
    nameHi: "जॉब स्विच बोनस",
    type: "decision",
    tier: "rare",
    flavor: "You switch jobs and get a ₹20,000 signing bonus.",
    flavorHi: "आप नौकरी बदलते हैं और ₹20,000 का हस्ताक्षर बोनस प्राप्त करते हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Throw a "farewell" party.', mentorInsight: "A party for leaving one job and joining another can wait. Your new role may come with its own costs to plan for.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Save the entire bonus.", mentorInsight: "Job switches can bring gaps or notice-period surprises. Saving the bonus gives you a buffer.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Invest the bonus in a tax-saving instrument. You get the tax refund instantly!", mentorInsight: "Under the old tax regime, Section 80C lets you deduct up to ₹1.5 lakh. ELSS, PPF and EPF all count, so tax saving and investing can go together.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_daily_lunch_ordering_46",
    name: "Daily Lunch Ordering",
    nameHi: "दैनिक दोपहर के भोजन का ऑर्डर देना",
    shortNameHi: "रोज़ का लंच",
    type: "decision",
    tier: "common",
    flavor: "You order lunch to the office daily (₹6,000/month).",
    flavorHi: "आप प्रतिदिन कार्यालय में दोपहर का भोजन ऑर्डर करते हैं (₹6,000/माह)।",
    options: [
      { type: "spend", label: "Spend", description: "Keep ordering expensive food.", mentorInsight: "₹6,000 a month on office lunches is ₹72,000 a year. Daily habits are the biggest hidden expense.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Bring lunch from home.", mentorInsight: "Carrying lunch most days is a simple win for both health and wallet. Keep ordering as an occasional treat.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Invest the ₹6,000/month lunch budget into a health fund. It matures instantly!", mentorInsight: "Redirecting a daily expense into a monthly SIP is how small habits become big wealth over time.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_freelance_success_47",
    name: "Freelance Success",
    nameHi: "फ्रीलांस सफलता",
    type: "decision",
    tier: "rare",
    flavor: "Your side-hustle suddenly takes off, bringing in an unexpected ₹25,000.",
    flavorHi: "आपका पक्ष अचानक बढ़ जाता है, जिससे अप्रत्याशित रूप से ₹25,000 प्राप्त होते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Assume this is your new normal and sign a lease for a car.", mentorInsight: "One great month is not a salary. Committing to a long car lease on irregular income is risky.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Bank it securely.", mentorInsight: "Freelance income goes up and down. Keep a bigger buffer, and set aside some for advance tax.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Reinvest ₹25,000 into marketing. The campaign goes viral instantly!", mentorInsight: "Reinvesting in marketing can grow your client base, but track the results. Spend more only on what works.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_expensive_degree_choice_48",
    name: "Expensive Degree Choice",
    nameHi: "महँगी डिग्री का चुनाव",
    type: "decision",
    tier: "epic",
    flavor: "You are considering an advanced degree that costs ₹15 Lakhs.",
    flavorHi: "आप एक उन्नत डिग्री पर विचार कर रहे हैं जिसकी कीमत ₹15 लाख है।",
    options: [
      { type: "spend", label: "Spend", description: 'Take the loan for a low-tier college just for the "tag".', mentorInsight: "An education loan is good debt only if the degree raises your income. Check placement records before paying for a tag.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Reject the degree. Work your way up.", mentorInsight: "Experience can be as valuable as a degree. Avoiding a ₹15 lakh loan keeps you free to choose.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay ₹1 Lakh upfront for an elite bootcamp. You graduate and get hired instantly!", mentorInsight: "A focused, cheaper program with real outcomes can beat an expensive brand name. Judge education by its return, not its price.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_social_media_investment_tip_49",
    name: "Social Media Investment Tip",
    nameHi: "सोशल मीडिया निवेश युक्ति",
    shortName: "Social Media Tip",
    shortNameHi: "सोशल मीडिया टिप",
    type: "decision",
    tier: "rare",
    flavor: 'A famous influencer posts about a "guaranteed" penny stock.',
    flavorHi: 'एक प्रसिद्ध प्रभावशाली व्यक्ति "गारंटीयुक्त" पैनी स्टॉक के बारे में पोस्ट करता है।',
    options: [
      { type: "spend", label: "Spend", description: "Put your entire ₹50,000 into it. It's a scam.", mentorInsight: "'Guaranteed' penny stock tips are often pump-and-dump schemes. Influencers sell their shares to the people who follow them.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Report the post and do not engage.", mentorInsight: "Ignoring and reporting stock tips from strangers protects you and others. Regulated, diversified investments don't need hype.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "scam", label: "Invest", description: "Invest ₹10,000. The stock jumps, you sell immediately!", mentorInsight: "Getting lucky once doesn't make a tip safe. Never put money you can't afford to lose into a stock you don't understand.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_fitness_subscription_choice_50",
    name: "Fitness Subscription Choice",
    nameHi: "फिटनेस सदस्यता विकल्प",
    type: "decision",
    tier: "common",
    flavor: "A premium gym costs ₹3,000/month.",
    flavorHi: "एक प्रीमियम जिम की लागत ₹3,000 प्रति माह है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy a ₹50,000 home treadmill that you won't use.", mentorInsight: "Big fitness gadgets often turn into expensive clothes hangers. Test the habit cheaply before you buy the gear.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Run in the park for free.", mentorInsight: "A park run costs nothing and builds the same habit. Free options first, paid upgrades only once the habit sticks.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹3,000/month for the gym. It pays off in zero medical bills instantly!", mentorInsight: "Spending on health can be a real investment, since one hospital stay can cost more than years of gym fees. It only pays off if you actually show up.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_tax_refund_windfall_51",
    name: "Tax Refund Windfall",
    nameHi: "टैक्स रिफंड अप्रत्याशित लाभ",
    type: "decision",
    tier: "common",
    flavor: "You receive a surprise income tax refund of ₹18,000.",
    flavorHi: "आपको ₹18,000 का आश्चर्यजनक आयकर रिफंड प्राप्त होता है।",
    options: [
      { type: "spend", label: "Spend", description: "Book a luxury staycation.", mentorInsight: "A tax refund is your own money coming back, not a bonus. Blowing it on a staycation means you lent the government money for free and then spent it.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Immediately transfer it to your fixed deposits.", mentorInsight: "Parking a refund in an FD keeps it safe. Just remember FD interest is taxable, and after inflation it grows slowly.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest it in an aggressive growth fund. It matures instantly!", mentorInsight: "Lump sums like a refund are perfect for long-term investing. Growth funds can swing a lot, so only use money you won't need for 5+ years.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_trending_asset_hype_52",
    name: "Trending Asset Hype",
    nameHi: "ट्रेंडिंग एसेट प्रचार",
    type: "decision",
    tier: "epic",
    flavor: "Everyone is buying Gold because prices are rising.",
    flavorHi: "हर कोई सोना खरीद रहा है क्योंकि कीमतें बढ़ रही हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Buy physical gold jewellery at peak prices.", mentorInsight: "Jewellery comes with making charges of 8–25% and GST that you never get back. As an investment, it starts in a loss.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Ignore the noise.", mentorInsight: "Buying because everyone else is buying usually means you are buying near the top. Staying calm is a strategy too.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "gold", label: "Invest", description: "Put ₹20,000 into a low-cost gold ETF or gold fund instead of jewellery. Years of holding pass instantly!", mentorInsight: "Paper gold avoids making charges and storage worries. Keep gold to a small slice (around 5–10%) of your portfolio as a hedge, not a bet.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_rent_increase_notification_53",
    name: "Rent Increase Notification",
    nameHi: "किराया वृद्धि अधिसूचना",
    shortName: "Rent Hike",
    shortNameHi: "किराया बढ़ा",
    type: "decision",
    tier: "rare",
    flavor: "Your rent is increasing by ₹3,000 per month.",
    flavorHi: "आपका किराया प्रति माह ₹3,000 बढ़ रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Accept the hike.", mentorInsight: "₹3,000 more rent every month is ₹36,000 a year gone. Rent hikes are a good moment to recheck whether your housing still fits your budget.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Move to a cheaper apartment.", mentorInsight: "A common rule is to keep rent under about 30% of your take-home pay. Moving costs some effort, but the monthly saving adds up fast.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹5,000 upfront to a broker to negotiate a better deal. It works instantly!", mentorInsight: "Paying a little to cut a big recurring cost is smart maths. Always get the final terms in a written rent agreement.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_referral_reward_54",
    name: "Referral Reward",
    nameHi: "रेफरल इनाम",
    type: "decision",
    tier: "common",
    flavor: "You received a ₹10,000 referral bonus.",
    flavorHi: "आपको ₹10,000 का रेफरल बोनस प्राप्त हुआ।",
    options: [
      { type: "spend", label: "Spend", description: "Blow all ₹10,000 on designer shoes.", mentorInsight: "Easy money tends to disappear the fastest. Treating a bonus like 'free' money is how it vanishes in a single shopping cart.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put it straight into savings.", mentorInsight: "Saving windfalls is a painless way to grow your emergency fund, since you never had this money in your budget anyway.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Invest the ₹10,000 in a small-cap fund. It grows instantly!", mentorInsight: "Small-cap funds can grow fast but can also fall 30–40% in bad years. They suit long horizons and only a part of your portfolio.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_unused_memberships_55",
    name: "Unused Memberships",
    nameHi: "अप्रयुक्त सदस्यताएँ",
    type: "decision",
    tier: "rare",
    flavor: "You haven't been to the gym in 4 months, but they keep billing you ₹2,500/month.",
    flavorHi: "आप 4 महीने से जिम नहीं गए हैं, लेकिन वे आपसे प्रति माह ₹2,500 का बिल लेते रहते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Keep paying out of guilt.", mentorInsight: "Paying for something you don't use won't make you use it. That's the sunk cost trap: ₹2,500 a month is ₹30,000 a year down the drain.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Cancel it immediately without guilt.", mentorInsight: "Cancelling unused memberships is the easiest money you will ever 'earn'. Check your bank statement every month for silent auto-debits.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Hire a coach for ₹5,000 to build the habit. The habit pays off in medical savings instantly!", mentorInsight: "Paying for a coach only works if it fixes the real problem, which is the habit. Good health does lower future medical bills.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_health_insurance_upgrade_56",
    name: "Health Insurance Upgrade",
    nameHi: "स्वास्थ्य बीमा उन्नयन",
    type: "decision",
    tier: "epic",
    flavor: "A financial advisor suggests buying a personal health plan for ₹15,000.",
    flavorHi: "एक वित्तीय सलाहकार ₹15,000 में एक व्यक्तिगत स्वास्थ्य योजना खरीदने का सुझाव देता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy an expensive ULIP for ₹50,000.", mentorInsight: "A ULIP mixes insurance and investment, and usually does both badly with high charges. Health cover and investing work better as separate products.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Reject it.", mentorInsight: "Skipping health insurance saves a premium now, but one hospital bill can wipe out years of savings. Medical inflation in India runs well above general inflation.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Buy the policy for ₹15,000. You get sick the next day, but the policy pays out instantly!", mentorInsight: "A personal health policy stays with you even if you change or lose your job. Buying young means lower premiums and waiting periods done early.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_travel_vs_savings_dilemma_57",
    name: "Travel vs Savings Dilemma",
    nameHi: "यात्रा बनाम बचत की दुविधा",
    type: "decision",
    tier: "rare",
    flavor: "You saved ₹50,000. You can take a vacation or invest it.",
    flavorHi: "आपने ₹50,000 बचाए. आप छुट्टी ले सकते हैं या निवेश कर सकते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Spend the full ₹50,000 on luxury hotels.", mentorInsight: "Travel is great, but spending your whole savings on one trip leaves you with zero cushion. Plan trips from a separate travel fund instead.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Keep it as a dedicated emergency fund. Don't travel.", mentorInsight: "An emergency fund of about 6 months of expenses means a job loss or hospital visit won't push you into debt. Build that first, then plan fun.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Invest the ₹50,000. The market grants 10 years of compounding instantly!", mentorInsight: "₹50,000 left to compound for 10 years at around 12% can grow to roughly ₹1.5 lakh. Time in the market is what does the heavy lifting.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_skill_upgrade_roi_58",
    name: "Skill Upgrade ROI",
    nameHi: "कौशल उन्नयन आरओआई",
    type: "decision",
    tier: "rare",
    flavor: "A paid software tool costs ₹5,000 but promises to cut your daily work time by 2 hours.",
    flavorHi: "एक सशुल्क सॉफ़्टवेयर टूल की कीमत ₹5,000 है, लेकिन यह आपके दैनिक कार्य समय में 2 घंटे की कटौती करने का वादा करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the software, but use the free time to watch Netflix.", mentorInsight: "A tool that saves time is only worth it if you use that time well. Saved hours spent on scrolling don't pay the bills.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Continue doing the work manually for free.", mentorInsight: "Avoiding the cost keeps cash in hand, but your time has value too. Sometimes saving ₹5,000 costs you much more in lost hours.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy the software for ₹5,000. It frees you up to take a ₹20,000 gig instantly!", mentorInsight: "Spending on tools that raise your earning power is good spending. Your income is your biggest asset in your 20s.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_major_social_event_expense_59",
    name: "Major Social Event Expense",
    nameHi: "प्रमुख सामाजिक आयोजन व्यय",
    shortName: "Family Wedding",
    shortNameHi: "शादी का खर्च",
    type: "decision",
    tier: "epic",
    flavor: "A family member is getting married. Social expectations demand you contribute ₹1,00,000.",
    flavorHi: "परिवार के किसी सदस्य की शादी हो रही है. सामाजिक अपेक्षाएं आपसे ₹1,00,000 का योगदान मांगती हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Take out a personal loan to give ₹1,00,000.", mentorInsight: "Personal loans often charge 12–24% interest. Borrowing to meet social expectations turns one wedding into years of EMIs.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Set a boundary, and gift only ₹20,000.", mentorInsight: "A heartfelt gift within your budget is still a gift. Setting money boundaries with family is hard but saves relationships and finances.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Invest ₹1,00,000 in a joint venture with a cousin. It succeeds instantly!", mentorInsight: "Business deals with relatives need clear written terms and only money you can afford to lose. Mixing family and money can go wrong both ways.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_sudden_medical_bill_60",
    name: "Sudden Medical Bill",
    nameHi: "अचानक मेडिकल बिल",
    type: "decision",
    tier: "epic",
    flavor: "You require an unexpected minor surgery. The hospital bill is ₹80,000.",
    flavorHi: "आपको एक अप्रत्याशित छोटी सर्जरी की आवश्यकता है। अस्पताल का बिल ₹80,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Put the entire ₹80,000 on a credit card.", mentorInsight: "Unpaid credit card balances can cost around 36–42% a year. A medical bill on a card can quietly double if you only pay the minimum.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Empty your emergency fund to pay it in cash.", mentorInsight: "This is exactly what an emergency fund is for. Using it is not a failure; just start refilling it right after.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay an expert negotiator ₹5,000 to dispute the bill. They succeed instantly!", mentorInsight: "Hospital bills can have errors or extra charges, so asking for an itemised bill is smart. Health insurance would have made this much smaller.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_premium_coffee_habit_61",
    name: "Premium Coffee Habit",
    nameHi: "प्रीमियम कॉफ़ी की आदत",
    type: "decision",
    tier: "common",
    flavor: "You buy a ₹250 coffee every single day on your way to work. It costs you ₹7,500/month.",
    flavorHi: "आप हर दिन काम पर जाते समय ₹250 की कॉफी खरीदते हैं। इसकी कीमत आपको ₹7,500 प्रति माह है।",
    options: [
      { type: "spend", label: "Spend", description: `Keep buying it because "it's just ₹250."`, mentorInsight: "'It's just ₹250' becomes ₹90,000 a year. Small daily habits are where most budgets quietly leak.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Make coffee at home and bring a thermos.", mentorInsight: "Home coffee keeps the comfort and cuts the cost by over 80%. Keep the café trips as an occasional treat, not a daily default.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest that ₹7,500 into a blue-chip stock fund. You fast-forward 5 years instantly!", mentorInsight: "A ₹7,500 monthly SIP for 10 years at around 12% can grow to about ₹17 lakh. Redirecting small habits is how wealth gets built.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_damaged_cash_loss_62",
    name: "Damaged Cash Loss",
    nameHi: "क्षतिग्रस्त नकद हानि",
    type: "decision",
    tier: "common",
    flavor: "You discover a ₹500 note in your wallet is torn and shopkeepers won't accept it.",
    flavorHi: "आपको पता चलता है कि आपके बटुए में ₹500 का नोट फटा हुआ है और दुकानदार इसे स्वीकार नहीं करेंगे।",
    options: [
      { type: "spend", label: "Spend", description: "Throw the note away and curse your luck.", mentorInsight: "Banks exchange torn or soiled notes as per RBI rules, often for free. Throwing it away is just losing money.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Take the effort to go to the bank and exchange it.", mentorInsight: "A small trip to the bank recovers full value. Knowing your rights as a bank customer saves money in many little ways.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Spend 1 hour learning about digital currency/UPI instead. Your financial literacy improves instantly!", mentorInsight: "Using UPI and digital payments cuts the risk of damaged or lost cash. Just never share your UPI PIN or OTP with anyone.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_holiday_sale_fomo_63",
    name: "Holiday Sale FOMO",
    nameHi: "हॉलिडे सेल FOMO",
    type: "decision",
    tier: "rare",
    flavor: `A massive "Big Billion" festive sale is on. Electronics are heavily discounted. You didn't plan to buy anything.`,
    flavorHi: "एक विशाल ''बिग बिलियन'' त्योहारी बिक्री चल रही है। इलेक्ट्रॉनिक्स पर भारी छूट है। आपने कुछ भी खरीदने की योजना नहीं बनाई.",
    options: [
      { type: "spend", label: "Spend", description: "Buy a new smartwatch for ₹10,000 because it's 40% off.", mentorInsight: "40% off something you didn't need is still 100% extra spending. Sales are designed to create urgency, so pause before you pay.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Delete the shopping app until the sale ends.", mentorInsight: "Removing the temptation is easier than fighting it. If you still want it in a week, it's probably a real need.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest the ₹10,000 you wanted to spend into the stock of the company running the sale! It jumps instantly!", mentorInsight: "Redirecting impulse money into investments is a great habit. Just don't pick a stock only because you like its sale; a diversified fund is safer.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_unpaid_personal_loan_64",
    name: "Unpaid Personal Loan",
    nameHi: "अवैतनिक व्यक्तिगत ऋण",
    type: "decision",
    tier: "rare",
    flavor: "A friend borrowed ₹8,000 from you six months ago and is now ghosting your messages.",
    flavorHi: "एक दोस्त ने छह महीने पहले आपसे ₹8,000 उधार लिए थे और अब वह आपके संदेशों को भूल रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Get angry and hire a lawyer or debt collector for ₹3,000.", mentorInsight: "Spending ₹3,000 to chase ₹8,000 rarely makes sense, and it may still not come back. Keep the costs of recovery smaller than the loan.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Write it off mentally, but stop paying for their dinners when they do show up.", mentorInsight: "A good rule: only lend friends what you can afford to lose. You protect both your money and your peace.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Visit them in person, communicate clearly, and get them to sign a repayment schedule. They pay you back instantly with interest!", mentorInsight: "A calm talk and a simple repayment plan works better than anger. Putting it in writing, even on WhatsApp, makes it clear for both sides.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_dental_emergency_65",
    name: "Dental Emergency",
    nameHi: "डेंटल इमरजेंसी",
    type: "decision",
    tier: "epic",
    flavor: "You have a severe toothache. A root canal and crown will cost ₹25,000. It is not covered by your health insurance.",
    flavorHi: "आपके दांत में बहुत दर्द है. एक रूट कैनाल और क्राउन की लागत ₹25,000 होगी। यह आपके स्वास्थ्य बीमा द्वारा कवर नहीं किया गया है।",
    options: [
      { type: "spend", label: "Spend", description: "Put the ₹25,000 on a credit card and ignore it for months.", mentorInsight: "Ignoring a card bill means interest piles up at around 3% a month. ₹25,000 can grow fast if you only pay the minimum due.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Pay cash from your emergency fund.", mentorInsight: "Many health policies don't cover routine dental work, so an emergency fund fills that gap. Refill it after you use it.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹25,000 for the procedure and invest ₹2,000 in premium dental care tools. You instantly save years of future dental bills!", mentorInsight: "Prevention is the cheapest healthcare. Regular check-ups catch small problems before they become ₹25,000 problems.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_unpaid_invoice_66",
    name: "Unpaid Invoice",
    nameHi: "अवैतनिक चालान",
    type: "decision",
    tier: "rare",
    flavor: "You completed a side-hustle gig, but the client is delaying your ₹15,000 payment endlessly.",
    flavorHi: "आपने एक अतिरिक्त काम पूरा कर लिया है, लेकिन ग्राहक आपके ₹15,000 के भुगतान में लगातार देरी कर रहा है।",
    options: [
      { type: "spend", label: "Spend", description: 'Take out a ₹15,000 short-term loan because you "know the client will pay eventually."', mentorInsight: "Borrowing against money you haven't received yet is risky. If the client never pays, you are stuck with a loan and no income.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Send polite reminders but prepare your budget as if the money is gone.", mentorInsight: "Budget only with money that has actually reached your account. Freelancers should keep a bigger emergency fund because payments can be late.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Hire a virtual assistant for ₹2,000 to relentlessly follow up on all invoices. The system works instantly!", mentorInsight: "A clear follow-up system and written agreements help you get paid on time. Freelancers can also ask for an advance before starting work.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_0_emi_trap_67",
    name: "0% EMI Trap",
    nameHi: "0% ईएमआई ट्रैप",
    type: "decision",
    tier: "rare",
    flavor: 'You are offered a "No Cost EMI" on a ₹60,000 luxury item. It feels like free money.',
    flavorHi: 'आपको ₹60,000 की लक्जरी वस्तु पर "नो कॉस्ट ईएमआई" की पेशकश की जाती है। यह मुफ़्त पैसे जैसा लगता है।',
    options: [
      { type: "spend", label: "Spend", description: "You don't have the cash, but you take the 0% EMI anyway. You miss a payment.", mentorInsight: "'No Cost EMI' often hides processing fees or a lost cash discount. A missed EMI adds late fees and hurts your CIBIL score.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Decline it. You don't buy things you can't pay for in cash today.", mentorInsight: "If you can't buy it in cash, you probably can't afford it yet. Saving up first means no interest, no fees and no stress.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "You have the ₹60k cash. You take the EMI, but invest the cash in an FD. The interest pays out instantly!", mentorInsight: "A true 0% EMI while your cash earns interest can work, but only if you never miss a payment. Read the fine print for hidden charges.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_major_vehicle_repair_68",
    name: "Major Vehicle Repair",
    nameHi: "प्रमुख वाहन मरम्मत",
    type: "decision",
    tier: "epic",
    flavor: "Your car's transmission fails. The repair bill is ₹40,000.",
    flavorHi: "आपकी कार का ट्रांसमिशन विफल हो गया। मरम्मत का बिल ₹40,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Abandon the car and finance a brand new ₹10 Lakh car out of frustration.", mentorInsight: "A car loan for ₹10 lakh because of a ₹40,000 repair is an emotional decision. Cars lose value every year, so a car loan is usually bad debt.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Empty your emergency fund to pay it in cash.", mentorInsight: "Paying repairs from an emergency fund keeps you debt-free. That's the fund doing its job.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹5,000 for an independent mechanic inspection. They fix it cheaply, saving you cash instantly!", mentorInsight: "A second opinion can save a lot on big repairs. Spending a little on good advice often prevents a much bigger bill.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_late_night_online_shopping_69",
    name: "Late Night Online Shopping",
    nameHi: "देर रात ऑनलाइन शॉपिंग",
    shortName: "Night Shopping",
    shortNameHi: "रात की शॉपिंग",
    type: "decision",
    tier: "common",
    flavor: "You are bored at 1 AM and add ₹5,000 worth of random gadgets to your cart.",
    flavorHi: "आप रात के 1 बजे ऊब जाते हैं और अपने कार्ट में ₹5,000 मूल्य के यादृच्छिक गैजेट जोड़ लेते हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Hit "Buy Now."', mentorInsight: "Late-night boredom shopping is how most impulse buys happen. Saved cards and one-click checkout make it far too easy.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Close the app and go to sleep. Wait 48 hours.", mentorInsight: "A 48-hour wait kills most impulse buys. If you still want it after two days, at least it's a thought-through purchase.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Put that ₹5,000 into your investment account right now. You fast-forward 4 years instantly!", mentorInsight: "Moving 'impulse money' to investments turns a bad habit into a good one. Even small amounts compound over the years.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_charity_scam_70",
    name: "Charity Scam",
    nameHi: "दान घोटाला",
    type: "decision",
    tier: "common",
    flavor: "Someone approaches you on the street asking for a ₹1,000 donation for a supposed orphanage. They look suspicious.",
    flavorHi: "सड़क पर कोई आपसे एक कथित अनाथालय के लिए ₹1,000 का दान मांगने आता है। वे संदिग्ध लग रहे हैं.",
    options: [
      { type: "spend", label: "Spend", description: "Give them the ₹1,000 out of guilt. It was a scam.", mentorInsight: "Guilt-pressure and no proof are classic scam signs. Real charities are happy to share their registration details and give receipts.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: 'Say "No, thank you" and walk away.', mentorInsight: "Saying no to pressure is fine. You can always give later to a cause you have checked yourself.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Donate the ₹1,000 to an officially registered charity online. You get an instant tax break!", mentorInsight: "Registered charities give receipts, and donations to eligible ones can get a deduction under Section 80G in the old tax regime. Your kindness actually reaches people.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_missed_credit_card_payment_71",
    name: "Missed Credit Card Payment",
    nameHi: "क्रेडिट कार्ड से भुगतान छूट गया",
    shortName: "Missed Card Bill",
    shortNameHi: "कार्ड बिल छूटा",
    type: "decision",
    tier: "rare",
    flavor: "You forgot to pay your ₹20,000 credit card bill by 1 day. The bank slaps you with a ₹1,500 late fee and interest.",
    flavorHi: "आप 1 दिन तक अपने ₹20,000 क्रेडिट कार्ड बिल का भुगतान करना भूल गए। बैंक आप पर ₹1,500 विलंब शुल्क और ब्याज लगाता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Pay only the "Minimum Amount Due" (₹1,000) because you are frustrated.', mentorInsight: "Paying only the minimum due is the biggest credit card trap. Interest of around 36–42% a year runs on the full balance.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay the full ₹21,500 immediately from savings and accept the lesson.", mentorInsight: "Paying the full amount stops the interest right away. Set up auto-pay for the full bill so this never happens again.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Call the bank, threaten to close the card, and get the fee waived instantly!", mentorInsight: "Banks often waive a first-time late fee if you ask politely. A good payment history gives you that bargaining power.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_scratch_card_win_72",
    name: "Scratch Card Win",
    nameHi: "स्क्रैच कार्ड जीत",
    type: "decision",
    tier: "common",
    flavor: "You win ₹5,000 on a digital wallet scratch card!",
    flavorHi: "आप डिजिटल वॉलेट स्क्रैच कार्ड पर ₹5,000 जीतते हैं!",
    options: [
      { type: "spend", label: "Spend", description: "Use the ₹5,000 to gamble more or buy random app skins.", mentorInsight: "Using a win to chase more wins is how gambling habits start. Luck-based money should go somewhere boring and safe.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Transfer it to your bank account immediately.", mentorInsight: "Moving wallet money to your bank makes it real savings instead of spending credit. Small wins add up.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Use it to buy a fractional share of a growing tech company. It skyrockets instantly!", mentorInsight: "Buying a single stock is a concentrated bet. A diversified fund spreads your risk across many companies.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_speeding_ticket_73",
    name: "Speeding Ticket",
    nameHi: "स्पीडिंग टिकट",
    type: "decision",
    tier: "common",
    flavor: "You get caught speeding and fined ₹2,000.",
    flavorHi: "आप तेज गति से गाड़ी चलाते हुए पकड़े गए और ₹2,000 का जुर्माना लगाया जाएगा।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore the fine.", mentorInsight: "Unpaid e-challans don't disappear; they can block vehicle transfers or lead to court. Small problems grow when ignored.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Pay the fine immediately so it doesn't escalate.", mentorInsight: "Paying fines quickly keeps them small and your record clean. The cheapest fix is slowing down next time.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹2,000 fine AND buy a ₹1,000 dashcam. It instantly prevents a ₹20,000 future accident claim!", mentorInsight: "A dashcam can help settle accident and insurance disputes. Small safety spends can save big costs later.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_tax_audit_penalty_74",
    name: "Tax Audit Penalty",
    nameHi: "टैक्स ऑडिट जुर्माना",
    type: "decision",
    tier: "epic",
    flavor: "You filed your taxes incorrectly last year. The government demands ₹30,000 in penalties.",
    flavorHi: "आपने पिछले वर्ष अपना कर गलत तरीके से दाखिल किया था। सरकार जुर्माने के रूप में ₹30,000 की मांग करती है।",
    options: [
      { type: "spend", label: "Spend", description: "Hide and refuse to pay.", mentorInsight: "Ignoring Income Tax notices only adds interest and penalties. Always reply on time, even if just to ask for more time.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Use your emergency fund to pay it off and close the case.", mentorInsight: "Paying the dues and closing the case stops the interest. File carefully next year, and keep proofs for every deduction.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Hire a CA for ₹5,000 to find legal deductions. They find massive savings instantly!", mentorInsight: "A good CA can find deductions you didn't know about and file correctly. It's often worth the fee once your income gets complex.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_personal_trainer_pitch_75",
    name: "Personal Trainer Pitch",
    nameHi: "पर्सनल ट्रेनर पिच",
    type: "decision",
    tier: "rare",
    flavor: "A gym trainer hard-sells you a 3-month personal training package for ₹25,000.",
    flavorHi: "एक जिम ट्रेनर आपको ₹25,000 में 3 महीने का व्यक्तिगत प्रशिक्षण पैकेज बेचता है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹25,000 but stop going to the gym after week 2.", mentorInsight: "Big upfront packages make money for the seller even if you quit. Try a short trial before paying for months.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: 'Say "No" firmly and stick to your own routine.', mentorInsight: "Saying no to hard selling is a money skill. Free workout plans and consistency beat expensive packages you don't use.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹25,000. The fitness results land you a modeling/sports gig instantly!", mentorInsight: "Spending on your health and skills can pay back, but only if you finish what you start. Commitment matters more than price.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_market_correction_fear_76",
    name: "Market Correction Fear",
    nameHi: "बाजार सुधार का डर",
    type: "decision",
    tier: "epic",
    flavor: "The stock market crashes by 20%. Your portfolio value drops significantly. Financial news is screaming panic.",
    flavorHi: "शेयर बाज़ार 20% तक गिर गया। आपके पोर्टफोलियो का मूल्य काफी कम हो जाता है। वित्तीय खबरें घबराहट पैदा कर रही हैं।",
    options: [
      { type: "spend", label: "Spend", description: `Panic sell everything at a loss to "save what's left."`, mentorInsight: "Panic selling turns a temporary drop into a permanent loss. Indian markets have recovered from every major crash so far, though it can take time.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Do nothing. Turn off the news and wait for recovery.", mentorInsight: "Staying invested through a crash is often the hardest and best move. Keep your SIPs running; you buy more units when prices are low.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Leave the emergency fund alone and add your spare cash to your index fund while prices are 20% lower.", mentorInsight: "Buying in a dip can pay off, but only with spare money. Your emergency fund stays untouched so a job loss during the crash never forces you to sell low.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_annual_insurance_renewal_77",
    name: "Annual Insurance Renewal",
    nameHi: "वार्षिक बीमा नवीनीकरण",
    shortNameHi: "बीमा रिन्यूअल",
    type: "decision",
    tier: "rare",
    flavor: "Your ₹15,000 car/health insurance renewal is due.",
    flavorHi: "आपकी ₹15,000 की कार/स्वास्थ्य बीमा का नवीनीकरण देय है।",
    options: [
      { type: "spend", label: "Spend", description: "Let the policy lapse to save money.", mentorInsight: "Letting a policy lapse saves a little but risks a lot. Driving without third-party motor insurance is also illegal in India.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹15,000 to renew your existing policy.", mentorInsight: "Renewing on time keeps your cover and benefits like no-claim bonus and completed waiting periods.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Spend 2 hours comparing policies online. You switch providers and get a rebate instantly!", mentorInsight: "Comparing policies at renewal can cut premiums. Check the coverage too, not just the price.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_destination_wedding_invite_78",
    name: "Destination Wedding Invite",
    nameHi: "गंतव्य विवाह निमंत्रण",
    shortName: "Wedding Trip",
    shortNameHi: "शादी की ट्रिप",
    type: "decision",
    tier: "epic",
    flavor: "A close cousin is having a destination wedding. Flights, hotel, and outfits will cost you ₹60,000.",
    flavorHi: "एक करीबी चचेरा भाई डेस्टिनेशन वेडिंग कर रहा है। उड़ानें, होटल और पोशाकों पर आपको ₹60,000 का खर्च आएगा।",
    options: [
      { type: "spend", label: "Spend", description: "Go all out. Buy designer clothes and luxury flights on EMI.", mentorInsight: "Putting a cousin's wedding on EMI means you keep paying long after the party ends. Celebrate within your budget.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Decline politely and send a ₹5,000 gift instead.", mentorInsight: "A kind message and a thoughtful gift keep the relationship strong. Your real family will understand budget limits.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Go, but use air miles and budget hotels. You meet an investor at the wedding who writes a cheque instantly!", mentorInsight: "You can show up without overspending. Smart choices on travel and stay let you enjoy the event and keep your savings.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_washing_machine_broke_79",
    name: "Washing Machine Broke",
    nameHi: "वॉशिंग मशीन टूट गई",
    type: "decision",
    tier: "rare",
    flavor: "Your washing machine is broken. Repair is ₹6,000. A new one is ₹30,000.",
    flavorHi: "Your washing machine is broken. मरम्मत ₹6,000 है। एक नया ₹30,000 का है.",
    options: [
      { type: "spend", label: "Spend", description: "Throw clothes away and buy new ones instead of washing them.", mentorInsight: "Replacing things instead of fixing the real problem costs more over time. Panic buying is rarely the cheap option.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹6,000 repair.", mentorInsight: "A ₹6,000 repair versus a ₹30,000 replacement is an easy call if the machine still has life left. Repair first, replace when it truly dies.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy a highly energy-efficient new machine. The electricity savings pay out instantly!", mentorInsight: "Energy-efficient appliances (higher star rating) cost more upfront but cut electricity bills every month. Look at total cost, not just price.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_altcoin_crash_80",
    name: "Altcoin Crash",
    nameHi: "अल्टकॉइन क्रैश",
    type: "decision",
    tier: "rare",
    flavor: "A crypto coin you bought for ₹20,000 just crashed to ₹2,000 value.",
    flavorHi: "आपके द्वारा ₹20,000 में खरीदा गया एक क्रिप्टो सिक्का गिरकर ₹2,000 मूल्य पर आ गया है।",
    options: [
      { type: "spend", label: "Spend", description: 'Take out a ₹20,000 loan to "buy the dip" hoping it recovers.', mentorInsight: "Borrowing to average down on a crashed coin can double your loss. Never invest borrowed money in highly risky assets.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Accept the loss, sell the ₹2,000, and put it in a safe FD.", mentorInsight: "Accepting a loss is painful but stops further damage. Crypto in India also has a flat 30% tax on gains and no loss set-off.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Hold it, but spend ₹2,000 on a financial literacy course to never repeat this. The knowledge saves you instantly!", mentorInsight: "Learning why you lost is the best way to stop repeating it. Only put money in very risky assets that you can afford to lose fully.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_professional_certification_81",
    name: "Professional Certification",
    nameHi: "व्यावसायिक प्रमाणन",
    shortName: "Industry Cert",
    shortNameHi: "करियर कोर्स",
    type: "decision",
    tier: "rare",
    flavor: "A globally recognized certification costs ₹40,000. It is highly valued in your industry.",
    flavorHi: "विश्व स्तर पर मान्यता प्राप्त प्रमाणन की लागत ₹40,000 है। आपके उद्योग में इसे अत्यधिक महत्व दिया जाता है।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore the exam and buy a ₹40,000 gaming PC.", mentorInsight: "Choosing a gaming PC over a career boost trades long-term income for short-term fun. Your skills are your biggest earning asset.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Self-study the syllabus for free without taking the exam.", mentorInsight: "Free learning is great, but a recognised certificate can be what recruiters look for. Weigh the fee against the salary jump.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹40,000 and pass. Your company promotes you instantly!", mentorInsight: "Investing in skills often gives the highest return in your 20s. A higher salary lifts every future SIP and saving.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_expensive_hobby_gear_82",
    name: "Expensive Hobby Gear",
    nameHi: "महँगा हॉबी गियर",
    type: "decision",
    tier: "common",
    flavor: "You’ve taken up cycling/photography. The entry-level gear costs ₹12,000.",
    flavorHi: "आपने साइकिल चलाना/फ़ोटोग्राफ़ी शुरू कर दी है। एंट्री-लेवल गियर की कीमत ₹12,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the absolute top-tier professional gear for ₹80,000 on credit.", mentorInsight: "Buying pro gear on credit before you know you love the hobby is a costly gamble. Start basic, upgrade later.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Rent the gear first to make sure you like it.", mentorInsight: "Renting or borrowing first tests your interest at low cost. Many hobbies fade after a few months.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy the ₹12,000 gear and use it to win a local competition instantly!", mentorInsight: "Entry-level gear is enough to learn and grow. Hobbies can even earn money once your skills improve.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_taxed_bonus_shock_83",
    name: "Taxed Bonus Shock",
    nameHi: "कर बोनस का झटका",
    type: "decision",
    tier: "rare",
    flavor: "You were promised a ₹50,000 bonus, but after taxes, you only receive ₹35,000 in your bank.",
    flavorHi: "आपसे ₹50,000 बोनस का वादा किया गया था, लेकिन करों के बाद, आपको अपने बैंक में केवल ₹35,000 मिलते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "You already pre-spent the full ₹50,000 on a credit card before the bonus hit.", mentorInsight: "Always plan with your in-hand amount, not the promised amount. Bonuses are taxed at your slab rate, so the payout is smaller.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Accept the reality and bank the ₹35,000.", mentorInsight: "Banking the actual amount is realistic planning. Next time, estimate tax first and then decide how to use a bonus.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Hire a tax planner for ₹5,000. They restructure your pay and you get the tax back instantly!", mentorInsight: "Smart tax planning, like using 80C or NPS options under the old regime, can legally lower tax. Compare old and new regimes every year.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_lost_luggage_dilemma_84",
    name: "Lost Luggage Dilemma",
    nameHi: "सामान खोने की दुविधा",
    type: "decision",
    tier: "rare",
    flavor: "An airline loses your luggage. You need clothes for your trip immediately.",
    flavorHi: "एक एयरलाइन आपका सामान खो देती है. आपको अपनी यात्रा के लिए तुरंत कपड़ों की आवश्यकता है।",
    options: [
      { type: "spend", label: "Spend", description: "Use this as an excuse to buy an entirely new designer wardrobe for ₹40,000.", mentorInsight: "A bad day is not a reason for a ₹40,000 shopping spree. Emotional spending feels good for a moment and hurts for months.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy only the absolute basics (₹3,000) while waiting for the airline.", mentorInsight: "Buy only what you need and keep receipts. Airlines usually compensate for delayed bags if you file a claim on time.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "You bought Travel Insurance for ₹1,000. It pays out instantly!", mentorInsight: "Travel insurance is cheap and covers lost bags, delays and medical issues abroad. A small premium protects a costly trip.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_following_the_herd_85",
    name: "Following the Herd",
    nameHi: "झुंड के पीछे",
    type: "decision",
    tier: "rare",
    flavor: "Everyone in your friend circle is buying a specific meme stock. It’s up 300% this week.",
    flavorHi: "आपके मित्र मंडली में हर कोई एक विशिष्ट मीम स्टॉक खरीद रहा है। इस सप्ताह यह 300% बढ़ गया है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy at the absolute top out of FOMO. It crashes.", mentorInsight: "When a stock is up 300% in a week, most of the gain has already happened. FOMO buying usually means buying at the top.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Stick to your boring index funds.", mentorInsight: "Index funds feel boring, and that's their strength. Low cost and wide diversification beat chasing hype over the long run.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Skip the meme stock and start a SIP in a diversified flexi-cap mutual fund instead.", mentorInsight: "You don't need to bet for or against a hyped stock. Shorting is F&O territory where most retail traders lose; a diversified fund lets you own hundreds of real businesses without the drama.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_burnout_decision_86",
    name: "Burnout Decision",
    nameHi: "बर्नआउट निर्णय",
    type: "decision",
    tier: "epic",
    flavor: "You are working a main job and a side hustle. You are exhausted and nearing burnout.",
    flavorHi: "आप एक मुख्य काम और एक अतिरिक्त काम कर रहे हैं। आप थक चुके हैं और थकावट के करीब हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Keep working both, but spend ₹20,000 a month on alcohol and spa trips to "cope."', mentorInsight: "Coping spends can eat everything the extra hustle earns. Burnout also hurts your main job, which is your biggest income.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Pause the side hustle. Focus on rest.", mentorInsight: "Rest protects your health and your long-term earning power. Pausing is not quitting.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Use ₹10,000 to hire an assistant to automate the side hustle. It scales instantly!", mentorInsight: "Paying for help to free your time can make a side business grow. Make sure the extra income really covers the cost.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_emergency_vet_bill_87",
    name: "Emergency Vet Bill",
    nameHi: "आपातकालीन पशुचिकित्सक विधेयक",
    shortNameHi: "पालतू का इलाज",
    type: "decision",
    tier: "rare",
    flavor: "Your pet swallows something dangerous. The emergency surgery is ₹35,000.",
    flavorHi: "आपका पालतू जानवर कोई खतरनाक चीज़ निगल लेता है। आपातकालीन सर्जरी ₹35,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Put it on a 36% interest credit card.", mentorInsight: "A 36% credit card balance makes an emergency far costlier. If you must use a card, clear it within the interest-free period.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay from your emergency fund.", mentorInsight: "Pets are family, and their emergencies are real expenses. Keep them in mind when sizing your emergency fund.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "You bought Pet Insurance for ₹2,000. It pays out instantly!", mentorInsight: "Pet insurance is available in India and can cover surgery costs. A small yearly premium can save a big shock.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_colleague_s_farewell_gift_88",
    name: "Colleague's Farewell Gift",
    nameHi: "सहकर्मी का विदाई उपहार",
    type: "decision",
    tier: "common",
    flavor: "A colleague is leaving. The office is collecting ₹2,000 per person for a luxury watch gift.",
    flavorHi: "एक सहकर्मी जा रहा है. कार्यालय एक लक्जरी घड़ी उपहार के लिए प्रति व्यक्ति ₹2,000 एकत्र कर रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Contribute ₹5,000 to look like the most generous person in the office.", mentorInsight: "Overspending to look generous is a status trap. People remember kindness more than the amount.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Contribute only ₹500 and sign the card.", mentorInsight: "Giving within your means is fine. A warm note often means more than a costly gift.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Contribute ₹2,000 but use the farewell dinner to secure a freelance referral from them instantly!", mentorInsight: "Good relationships with colleagues can bring future jobs and referrals. Networking is a long-term career investment.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_streaming_service_hike_89",
    name: "Streaming Service Hike",
    nameHi: "स्ट्रीमिंग सेवा में बढ़ोतरी",
    type: "decision",
    tier: "common",
    flavor: "Your favorite streaming service increases its price from ₹500 to ₹800/month.",
    flavorHi: "आपकी पसंदीदा स्ट्रीमिंग सेवा अपनी कीमत ₹500 से बढ़ाकर ₹800/माह कर देती है।",
    options: [
      { type: "spend", label: "Spend", description: "Complain on Twitter but keep paying the monthly fee.", mentorInsight: "Subscriptions grow quietly. ₹800 a month is nearly ₹10,000 a year for one app.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Cancel the service. Read books from the library instead.", mentorInsight: "Rotating or cancelling subscriptions is easy money saved. Libraries and free content are great alternatives.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Switch to an annual plan upfront for ₹6,000. You instantly save the difference!", mentorInsight: "Annual plans are cheaper per month if you are sure you will use them all year. Just set a reminder before auto-renewal.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_fire_movement_choice_90",
    name: "FIRE Movement Choice",
    nameHi: "अग्नि आंदोलन विकल्प",
    type: "decision",
    tier: "epic",
    flavor: "You discover the FIRE (Financial Independence, Retire Early) movement. You can radically change your lifestyle.",
    flavorHi: "आपने FIRE (वित्तीय स्वतंत्रता, शीघ्र सेवानिवृत्ति) आंदोलन की खोज की। आप अपनी जीवनशैली में आमूल-चूल परिवर्तन कर सकते हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Reject FIRE entirely. "You Only Live Once" (YOLO).', mentorInsight: "YOLO spending ignores that you'll likely live 30+ years after retiring. Enjoy today, but pay your future self first.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Adopt extreme frugality. Save 70% of your income.", mentorInsight: "Extreme saving builds a big cushion, but cash alone loses to inflation. Saved money should also be invested to grow.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: 'Adopt "Coast FIRE". Invest heavily now, then shift to a lower-stress job. The market jumps instantly!', mentorInsight: "Coast FIRE means investing heavily early so compounding does the rest. Starting in your 20s gives your money the most time to grow.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_trendy_furniture_trap_91",
    name: "Trendy Furniture Trap",
    nameHi: "ट्रेंडी फ़र्निचर ट्रैप",
    type: "decision",
    tier: "rare",
    flavor: "You are moving apartments and want your place to look like a magazine. A designer couch costs ₹40,000.",
    flavorHi: "आप अपार्टमेंट बदल रहे हैं और चाहते हैं कि आपका स्थान एक पत्रिका जैसा दिखे। एक डिज़ाइनर सोफे की कीमत ₹40,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the designer couch on a 12-month EMI.", mentorInsight: "Furniture on EMI is debt for something that loses value fast. That's a classic bad-debt example.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy a sturdy, second-hand couch for ₹8,000.", mentorInsight: "Good second-hand furniture works just as well for a fraction of the price. Your home doesn't need to look like Instagram.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy the second-hand couch and invest the ₹32,000 difference in a home-building supply stock. The market jumps instantly!", mentorInsight: "Investing the difference is smart, but choose a diversified fund over a single themed stock. Spreading risk is the safer path.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_flash_sale_temptation_92",
    name: "Flash Sale Temptation",
    nameHi: "फ़्लैश सेल प्रलोभन",
    type: "decision",
    tier: "common",
    flavor: 'You get a notification: "FLASH SALE - 70% OFF Premium Headphones!" (Cost: ₹3,000). You already own working headphones.',
    flavorHi: 'आपको एक सूचना मिलेगी: "फ़्लैश सेल - प्रीमियम हेडफ़ोन पर 70% की छूट!" (लागत: ₹3,000)। आपके पास पहले से ही कार्यशील हेडफ़ोन हैं।',
    options: [
      { type: "spend", label: "Spend", description: "Buy them. It's too good a deal to pass up!", mentorInsight: "Buying something you already own because it's 70% off is still spending ₹3,000 you didn't need to. Flash sales thrive on urgency.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Swipe the notification away.", mentorInsight: "Turning off sale notifications removes a big temptation. You can't overspend on deals you never see.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest the ₹3,000 into a dividend stock instead. The stock pays out its 3-year dividend instantly!", mentorInsight: "Redirecting impulse money into investments builds wealth quietly. Dividends are nice, but total long-term growth matters more.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_hungry_grocery_shopping_93",
    name: "Hungry Grocery Shopping",
    nameHi: "भूखी किराने की खरीदारी",
    type: "decision",
    tier: "common",
    flavor: "You went to the supermarket hungry. Your cart is full of expensive snacks totaling ₹2,500.",
    flavorHi: "आप भूखे पेट सुपरमार्केट गए। आपका कार्ट कुल ₹2,500 के महंगे स्नैक्स से भरा है।",
    options: [
      { type: "spend", label: "Spend", description: "Check out with all the snacks. You deserve treats.", mentorInsight: "Shopping hungry is proven to raise impulse buying. A list and a full stomach save real money.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put all the snacks back and buy only the ₹500 staples you came for.", mentorInsight: "Sticking to a list cut this bill by 80%. Small grocery habits add up to thousands a month.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy the staples, and use the ₹2,000 saved to buy a meal-prep masterclass. The class cuts your grocery bill instantly!", mentorInsight: "Learning to plan and cook meals lowers food costs for life. That's a skill with lasting returns.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_unfair_dinner_bill_94",
    name: "Unfair Dinner Bill",
    nameHi: "अनुचित रात्रिभोज बिल",
    type: "decision",
    tier: "rare",
    flavor: "You are at dinner with a group. They drank expensive cocktails; you only had water and a salad. They suggest splitting the ₹12,000 bill evenly (₹3,000 each). Your actual share is ₹800.",
    flavorHi: "आप एक समूह के साथ रात्रि भोज पर हैं। उन्होंने महँगे कॉकटेल पीये; आपने केवल पानी और सलाद खाया। वे ₹12,000 बिल को समान रूप से विभाजित करने का सुझाव देते हैं (प्रत्येक ₹3,000)। आपका वास्तविक हिस्सा ₹800 है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹3,000 in silence and complain about it later.", mentorInsight: "Paying for others' cocktails in silence builds resentment and drains your budget. Your money, your choice.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Speak up and ask to pay only for what you ordered.", mentorInsight: "Politely asking to pay your share is normal. Splitting apps make itemised splits easy and awkward-free.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹3,000 evenly to avoid drama, but use the goodwill to instantly close a business deal with one of them!", mentorInsight: "Sometimes paying a bit extra for harmony is fine, if it's a conscious choice. Good relationships can open doors later.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_hard_sell_insurance_pitch_95",
    name: "Hard-Sell Insurance Pitch",
    nameHi: "हार्ड-सेल बीमा पिच",
    type: "decision",
    tier: "epic",
    flavor: 'A "financial advisor" (who is actually a salesman) uses emotional guilt to push you into a ₹50,000/year endowment policy with terrible returns.',
    flavorHi: 'एक "वित्तीय सलाहकार" (जो वास्तव में एक सेल्समैन है) आपको भयानक रिटर्न के साथ ₹50,000/वर्ष की बंदोबस्ती पॉलिसी में धकेलने के लिए भावनात्मक अपराध बोध का उपयोग करता है।',
    options: [
      { type: "spend", label: "Spend", description: "Sign up for the ₹50,000 policy out of guilt and confusion.", mentorInsight: "Endowment plans often give only 4–6% returns while offering low cover. Guilt-selling is a big red flag.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Walk away firmly. You only buy pure Term Life Insurance.", mentorInsight: "Term insurance gives large cover at a low premium. Buy it only if someone depends on your income.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy a pure Term Life policy for ₹10,000 and invest the ₹40,000 difference in a mutual fund. The fund matures instantly!", mentorInsight: "'Buy term, invest the rest' is a simple rule. You get proper cover and better long-term growth separately.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_vehicle_upgrade_itch_96",
    name: "Vehicle Upgrade Itch",
    nameHi: "वाहन अपग्रेड खुजली",
    type: "decision",
    tier: "rare",
    flavor: "Your 5-year-old car runs perfectly fine, but your neighbor just bought a luxury SUV. You feel the urge to upgrade.",
    flavorHi: "आपकी 5 साल पुरानी कार बिल्कुल ठीक चलती है, लेकिन आपके पड़ोसी ने हाल ही में एक लग्जरी एसयूवी खरीदी है। आप अपग्रेड करने की चाहत महसूस करते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Trade it in and take a massive loan for the luxury SUV.", mentorInsight: "A car loan to match the neighbours is a classic lifestyle-creep move. The SUV loses value the moment you drive it out.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Wash your car, detail the interior for ₹2,000, and keep driving it.", mentorInsight: "A well-kept car that works is a money machine: no EMI. Comparison is the thief of savings.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Take the ₹15,000/month EMI you would have paid, and invest it. The investment compounds instantly!", mentorInsight: "₹15,000 a month invested for 10 years at around 12% can grow to about ₹35 lakh. That's the real cost of the upgrade.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_leaky_roof_emergency_97",
    name: "Leaky Roof Emergency",
    nameHi: "टपकती छत का आपातकाल",
    shortName: "Leaky Roof",
    shortNameHi: "टपकती छत",
    type: "decision",
    tier: "epic",
    flavor: "A massive storm damages your roof (or apartment ceiling). It will cost ₹60,000 to fix immediately before water ruins the house.",
    flavorHi: "एक बड़ा तूफ़ान आपकी छत (या अपार्टमेंट की छत) को नुकसान पहुँचाता है। इससे पहले कि पानी घर को बर्बाद कर दे, इसे तुरंत ठीक करने में ₹60,000 का खर्च आएगा।",
    options: [
      { type: "spend", label: "Spend", description: "You have no emergency fund. You take a high-interest personal loan to fix it.", mentorInsight: "Without an emergency fund, every surprise becomes high-interest debt. That's why the fund comes before investing.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹60,000 from your emergency fund.", mentorInsight: "Fixing urgent damage fast prevents bigger costs. Your emergency fund just saved you from a loan.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "You bought Home Insurance previously. It pays out instantly!", mentorInsight: "Home insurance in India is surprisingly cheap and covers storms, fire and floods. Few people buy it, until they need it.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_hidden_app_subscriptions_98",
    name: "Hidden App Subscriptions",
    nameHi: "हिडन ऐप सब्सक्रिप्शन",
    shortName: "Hidden App Fees",
    shortNameHi: "छुपे ऐप चार्ज",
    type: "decision",
    tier: "common",
    flavor: "You check your bank statement and realize you've been paying ₹500/month for a meditation app you deleted a year ago.",
    flavorHi: "आप अपने बैंक स्टेटमेंट की जांच करते हैं और महसूस करते हैं कि आप एक साल पहले डिलीट किए गए ध्यान ऐप के लिए ₹500/माह का भुगतान कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: `Procrastinate. Tell yourself "I'll figure out how to cancel it this weekend."`, mentorInsight: "Every week you delay costs real money. Forgotten auto-debits are some of the sneakiest leaks.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Cancel it immediately through the Play Store or App Store.", mentorInsight: "Cancel and check your UPI AutoPay mandates too. A monthly statement check catches these early.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Cancel it, then email customer support demanding a refund for unused months. They comply instantly!", mentorInsight: "Asking for a refund costs nothing and sometimes works. Being an alert customer pays off.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_friend_s_startup_pitch_99",
    name: "Friend's Startup Pitch",
    nameHi: "मित्र की स्टार्टअप पिच",
    type: "decision",
    tier: "epic",
    flavor: "Your best friend is starting a restaurant and asks you to invest ₹1,00,000 for a 5% stake.",
    flavorHi: "आपका सबसे अच्छा दोस्त एक रेस्तरां शुरू कर रहा है और आपसे 5% हिस्सेदारी के लिए ₹1,00,000 का निवेश करने के लिए कहता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Give them the money as a "loan" without any paperwork. The restaurant fails.', mentorInsight: "Money given to friends without paperwork often means losing both the money and the friendship. Always put terms in writing.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: `Politely decline. "I don't mix money and friendship."`, mentorInsight: "Saying no kindly is fine. Most new restaurants struggle in their first years, so only invest money you can fully afford to lose.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Invest the ₹1,00,000. The restaurant becomes a massive hit instantly!", mentorInsight: "Backing a friend's business can pay off, but treat it as high risk. Keep it a small slice of your money and get a proper agreement.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_lottery_ticket_temptation_100",
    name: "Lottery Ticket Temptation",
    nameHi: "लॉटरी टिकट का प्रलोभन",
    shortName: "Lottery Ticket",
    shortNameHi: "लॉटरी टिकट",
    type: "decision",
    tier: "common",
    flavor: "A state lottery jackpot is at a record high. Everyone around you is buying ₹500 tickets.",
    flavorHi: "एक राज्य लॉटरी का जैकपॉट रिकॉर्ड ऊंचाई पर है। आपके आसपास हर कोई ₹500 का टिकट खरीद रहा है।",
    options: [
      { type: "spend", label: "Spend", description: 'Buy ₹5,000 worth of tickets to "increase your odds." You lose.', mentorInsight: "Lotteries are built so the house wins. Buying more tickets barely moves your odds but surely moves your money.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Ignore the hype. The odds of winning are far worse than one in a crore.", mentorInsight: "Skipping the hype is a quiet win. Even ₹500 a month in a SIP can grow into a real amount over 10–15 years.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Put that ₹500 into a high-risk microcap stock. It pumps instantly!", mentorInsight: "Swapping a lottery ticket for a single risky small-cap stock is still a gamble. Real wealth comes from diversified, long-term investing.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_underpaid_tax_surprise_101",
    name: "Underpaid Tax Surprise",
    nameHi: "कम भुगतान किया गया कर आश्चर्य",
    shortNameHi: "बकाया टैक्स",
    type: "decision",
    tier: "epic",
    flavor: "You miscalculated your freelance taxes. You owe the government a lump sum of ₹45,000 by tomorrow.",
    flavorHi: "आपने अपने फ्रीलांस करों की गलत गणना की। आप पर सरकार को कल तक ₹45,000 की एकमुश्त राशि बकाया है।",
    options: [
      { type: "spend", label: "Spend", description: "Put the tax bill on a credit card and ignore the high interest rate.", mentorInsight: "Paying tax with a credit card and rolling it over can cost 36–42% a year in interest. That turns a tax bill into a debt trap.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹45,000 from your emergency fund immediately.", mentorInsight: "This is exactly what an emergency fund is for. Paying on time also avoids interest and penalties from the Income Tax Department.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay ₹5,000 to a good CA to sort out your filings. They find every legal deduction you missed instantly!", mentorInsight: "A good CA can find deductions and plan advance tax for freelancers. Paying a fee to get your taxes right usually saves more than it costs.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_flight_upgrade_temptation_102",
    name: "Flight Upgrade Temptation",
    nameHi: "उड़ान उन्नयन प्रलोभन",
    shortName: "Flight Upgrade",
    shortNameHi: "फ़्लाइट अपग्रेड",
    type: "decision",
    tier: "rare",
    flavor: "You are at the airport. The airline offers you a Business Class upgrade for ₹15,000. It's a 4-hour flight.",
    flavorHi: "आप हवाई अड्डे पर हैं. एयरलाइन आपको ₹15,000 में बिजनेस क्लास अपग्रेड की पेशकश करती है। यह 4 घंटे की उड़ान है.",
    options: [
      { type: "spend", label: "Spend", description: 'Take the upgrade. You "deserve it."', mentorInsight: "Paying ₹15,000 for four hours of comfort is classic lifestyle creep. Small upgrades like this add up fast across a year.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Decline it. Economy gets you there at the exact same time.", mentorInsight: "Economy lands at the same time. The money you skip spending today can quietly compound in your investments.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Decline the flight upgrade, but buy a ₹2,000 lounge pass. You use the quiet space to finish a work project instantly!", mentorInsight: "Spending a little to be more productive can be smart. Ask yourself whether the spend helps you earn or just feels nice.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_delayed_medical_checkup_103",
    name: "Delayed Medical Checkup",
    nameHi: "मेडिकल जांच में देरी",
    type: "decision",
    tier: "rare",
    flavor: "You've had a nagging back pain for months. A specialist consultation and physio will cost ₹5,000.",
    flavorHi: "आपको कई महीनों से पीठ में दर्द हो रहा है। एक विशेषज्ञ परामर्श और फिजियो का खर्च ₹5,000 होगा।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore the pain and spend ₹5,000 on painkillers and massages over the year.", mentorInsight: "Ignoring health problems usually makes them more expensive later. Painkillers treat the symptom, not the cause.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹5,000 and start treatment immediately.", mentorInsight: "Early treatment is cheaper than late treatment. This is also why having health insurance in your 20s, when premiums are low, makes sense.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy ergonomic furniture for ₹10,000. It fixes your posture instantly!", mentorInsight: "Fixing your posture can help, but furniture is not a doctor. Get a proper diagnosis before spending on solutions.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_retail_warranty_trap_104",
    name: "Retail Warranty Trap",
    nameHi: "खुदरा वारंटी जाल",
    type: "decision",
    tier: "common",
    flavor: 'You are buying a ₹40,000 TV. The cashier pushes hard for a ₹4,000 "Extended 3-Year Warranty."',
    flavorHi: "आप ₹40,000 का टीवी खरीद रहे हैं। कैशियर ने ₹4,000 की ''3-वर्ष की विस्तारित वारंटी'' के लिए कड़ी मेहनत की।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the warranty out of fear.", mentorInsight: "Extended warranties are a big profit item for shops. Many electronics fail either very early (covered by the standard warranty) or very late.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Decline it. You'll rely on the standard 1-year manufacturer warranty.", mentorInsight: "The standard 1-year warranty covers most early defects. Keeping a small emergency fund works like your own warranty for all gadgets.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Decline it, and put that ₹4,000 into an index fund. The market jumps instantly!", mentorInsight: "Skipping add-ons and investing the difference is a solid habit. Over years, these small savings grow through compounding.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_latest_tech_release_105",
    name: "Latest Tech Release",
    nameHi: "नवीनतम तकनीकी रिलीज़",
    type: "decision",
    tier: "rare",
    flavor: "The new version of your favorite tablet/console just dropped. It costs ₹50,000. Your current one works fine.",
    flavorHi: "आपके पसंदीदा टैबलेट/कंसोल का नया संस्करण अभी जारी हुआ है। इसकी कीमत ₹50,000 है. आपका वर्तमान ठीक काम करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the new one and throw the old one in a drawer.", mentorInsight: "Upgrading a working gadget every year is one of the easiest ways to leak money. Gadgets lose value fast once you buy them.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Skip this generation entirely.", mentorInsight: "Skipping a generation saves a lot and you rarely miss much. Use gadgets till they truly stop meeting your needs.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Sell your old console for ₹20,000, buy the new one, and start a review channel. The channel gets monetized instantly!", mentorInsight: "Selling the old device to fund the new one cuts the real cost. Turning a hobby into a side income is even better, but it takes real effort.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_expensive_wedding_registry_106",
    name: "Expensive Wedding Gift",
    nameHi: "महंगा शादी का तोहफा",
    type: "decision",
    tier: "rare",
    flavor: "Your wealthy friend is getting married. In your friend group, the expected shagun or gift is at least ₹12,000.",
    flavorHi: "आपके अमीर दोस्त की शादी हो रही है। आपके दोस्तों के ग्रुप में शगुन या तोहफा कम से कम ₹12,000 का माना जा रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Gift a ₹25,000 coffee machine to show off.", mentorInsight: "Spending to impress at someone else's wedding helps nobody. A gift should fit your budget, not your friend's wealth.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Skip the pressure and give a thoughtful ₹3,000 personalised gift.", mentorInsight: "A thoughtful gift within your budget matters more than the price tag. Good friends value the gesture, not the amount.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Give the ₹12,000 gift, but use the wedding to instantly secure a high-paying client!", mentorInsight: "Weddings are great places to meet people, but a big gift is not a business plan. Stay within budget and build relationships naturally.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_expiring_reward_points_107",
    name: "Expiring Reward Points",
    nameHi: "पुरस्कार अंक समाप्त हो रहे हैं",
    type: "decision",
    tier: "common",
    flavor: "You have 10,000 credit card reward points expiring tomorrow.",
    flavorHi: "आपके 10,000 क्रेडिट कार्ड रिवॉर्ड पॉइंट कल समाप्त हो रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: 'Browse the "Rewards Catalog" and use points plus ₹3,000 cash to buy an overpriced toaster.', mentorInsight: "Reward catalogues often price items high so your points feel valuable. Adding cash to buy something you don't need is not a deal.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Convert them directly into ₹2,500 cashback against your statement.", mentorInsight: "Turning points into statement credit is simple and gives you real value. Points are only useful if you didn't overspend to earn them.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Convert points to air miles and book a business flight to a conference. You land a deal instantly!", mentorInsight: "Using points for a trip that helps your career can be smart. Just never spend extra on the card just to chase points.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_passion_project_job_offer_108",
    name: "Passion Project Job Offer",
    nameHi: "पैशन प्रोजेक्ट जॉब ऑफर",
    type: "decision",
    tier: "epic",
    flavor: "You are offered a job at a charity or startup you deeply believe in, but it pays ₹25,000 less per month than your current corporate job.",
    flavorHi: "आपको किसी ऐसे चैरिटी या स्टार्टअप में नौकरी की पेशकश की जाती है जिस पर आप गहरा विश्वास करते हैं, लेकिन यह आपकी वर्तमान कॉर्पोरेट नौकरी की तुलना में प्रति माह ₹25,000 कम भुगतान करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Take the lower-paying job, but refuse to downgrade your expensive lifestyle.", mentorInsight: "Taking a pay cut while keeping the same expenses is how people fall into debt. Your lifestyle must match your income.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Reject the offer. Keep the high-paying corporate job to secure your financial future.", mentorInsight: "A stable salary helps you build your emergency fund and SIPs. You can still support causes you love through time or small donations.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Take the job, but negotiate equity instead of salary. The startup gets acquired instantly!", mentorInsight: "Equity can be valuable, but most startups never get acquired. Keep enough cash salary to cover expenses and keep investing.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_designer_luxury_craving_109",
    name: "Designer Luxury Craving",
    nameHi: "डिजाइनर लक्जरी लालसा",
    type: "decision",
    tier: "rare",
    flavor: "You are obsessed with a designer bag/watch that costs ₹80,000. It's a pure status symbol.",
    flavorHi: "आप एक डिज़ाइनर बैग/घड़ी के प्रति जुनूनी हैं जिसकी कीमत ₹80,000 है। यह शुद्ध स्टेटस सिंबल है.",
    options: [
      { type: "spend", label: "Spend", description: 'Put it on a credit card today. You "need" it for an upcoming event.', mentorInsight: "Buying a luxury item on a credit card means you may pay interest on a status symbol. Revolving credit costs around 36–42% a year.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Set a rule: You can only buy it if you save up the cash over 6 months. (You realize you don't want it that bad).", mentorInsight: "A waiting period is a great filter. If you still want it after saving in cash, enjoy it guilt-free; often the urge simply fades.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Put ₹80,000 into the stock of the luxury company instead. The stock moons instantly!", mentorInsight: "Owning a business you like can be better than buying its product. But one company's stock is risky, so diversify.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_small_inheritance_110",
    name: "Small Inheritance",
    nameHi: "छोटी विरासत",
    type: "decision",
    tier: "common",
    flavor: "A distant relative passes away and leaves you a small sum of ₹50,000.",
    flavorHi: "किसी दूर के रिश्तेदार का निधन हो जाता है और वह आपके लिए ₹50,000 की एक छोटी राशि छोड़ जाता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Treat it as a "windfall" and blow it on a luxury vacation.', mentorInsight: "Windfalls disappear fast when treated as free money. Spending a small part on something meaningful and saving the rest is a good balance.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Put it in a secure fixed deposit in their memory.", mentorInsight: "An FD is safe, but its returns after tax may barely beat inflation. It is good for money you need in the next 1–3 years.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Invest it in a high-yield mutual fund. The fund compounds instantly!", mentorInsight: "For long-term goals, a diversified mutual fund can beat FDs over time. Short-term ups and downs are normal, so stay invested.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_sudden_job_loss_111",
    name: "Sudden Job Loss",
    nameHi: "अचानक नौकरी छूटना",
    type: "decision",
    tier: "epic",
    flavor: "Your company downsizes. You are laid off with zero severance pay.",
    flavorHi: "आपकी कंपनी का आकार छोटा हो गया है. आपको शून्य विच्छेद वेतन के साथ नौकरी से निकाल दिया गया है।",
    options: [
      { type: "spend", label: "Spend", description: 'Take out personal loans to maintain your lifestyle while looking for "the perfect job."', mentorInsight: "Borrowing to keep your lifestyle during a job loss can bury you in EMIs. Cut costs first, borrow last.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Immediately cut all non-essential expenses and live off your emergency fund.", mentorInsight: "This is why experts suggest an emergency fund of about 6 months of expenses. It buys you time to find the right job calmly.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Use your ₹30,000 emergency fund to rapidly upskill in AI. You land a better job instantly!", mentorInsight: "Upskilling during a gap can lead to a better role. Just keep enough of the emergency fund for rent, food and essential bills.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_expensive_city_relocation_112",
    name: "Expensive City Relocation",
    nameHi: "महँगा शहर स्थानांतरण",
    shortName: "Big City Move",
    shortNameHi: "बड़े शहर जाना",
    type: "decision",
    tier: "epic",
    flavor: "You are offered a job in Mumbai or Bengaluru. The salary is 20% higher, but the cost of living is 50% higher.",
    flavorHi: "आपको मुंबई या बेंगलुरु में नौकरी की पेशकश की जाती है। वेतन 20% अधिक है, लेकिन जीवनयापन की लागत 50% अधिक है।",
    options: [
      { type: "spend", label: "Spend", description: 'Move and rent a luxury 1BHK because "you need your own space."', mentorInsight: "If rent eats your raise and more, you are poorer in a bigger city. Always compare salary against cost of living.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Reject the offer. The math doesn't make sense.", mentorInsight: "A raise only counts if it beats your new expenses. Doing the math before saying yes is smart.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Move, but live with roommates to crush housing costs. The networking lands you a promotion instantly!", mentorInsight: "Sharing a flat in a big city keeps costs down while you grow your career. Metro cities often offer faster growth and better networks.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_elder_care_expense_113",
    name: "Elder Care Expense",
    nameHi: "बुजुर्गों की देखभाल का खर्च",
    type: "decision",
    tier: "epic",
    flavor: "Your parents need financial support for living expenses, amounting to ₹15,000 per month.",
    flavorHi: "आपके माता-पिता को जीवन-यापन के खर्च के लिए प्रति माह ₹15,000 की वित्तीय सहायता की आवश्यकता है।",
    options: [
      { type: "spend", label: "Spend", description: `Take out a personal loan to send them a lump sum of ₹2 Lakhs so you "don't have to worry about it."`, mentorInsight: "A personal loan to support parents adds interest on top of an ongoing need. Monthly support should come from a monthly budget.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Readjust your budget to cover it from your existing income without borrowing.", mentorInsight: "Supporting parents is a real Indian responsibility. Plan it into your budget, and make sure they have health insurance to avoid bigger shocks.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Help them restructure their own assets (selling unused property/gold) to generate passive income instantly!", mentorInsight: "Helping parents put idle gold or property to work can create income for them. Do it carefully and with the whole family on board.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_unread_book_pile_114",
    name: "Unread Book Pile",
    nameHi: "अपठित पुस्तक ढेर",
    type: "decision",
    tier: "common",
    flavor: 'You see a "Buy 2 Get 1 Free" sale on self-help books. You already have 5 unread books at home.',
    flavorHi: 'आप स्व-सहायता पुस्तकों पर "2 खरीदें 1 मुफ़्त पाएं" बिक्री देखें। आपके घर पर पहले से ही 5 अपठित पुस्तकें हैं।',
    options: [
      { type: "spend", label: "Spend", description: 'Buy 6 books for ₹2,000 to "motivate yourself." You read none.', mentorInsight: "Buying books is not the same as reading them. Discounts on things you won't use are still money spent.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Don't buy them until you finish the ones you have.", mentorInsight: "Finishing what you own before buying more is a simple rule that works for books, clothes and gadgets.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy one highly relevant book for ₹500. Read it immediately, apply the lesson, and get a raise instantly!", mentorInsight: "Learning one useful skill and applying it is one of the best investments. Your income is your biggest wealth tool in your 20s.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_leveraged_trading_gamble_115",
    name: "Leveraged Trading Gamble",
    nameHi: "लीवरेज्ड ट्रेडिंग जुआ",
    type: "decision",
    tier: "epic",
    flavor: "A trading app offers you 5x leverage. You can trade with ₹1,00,000 using only ₹20,000 of your own cash.",
    flavorHi: "एक ट्रेडिंग ऐप आपको 5x लीवरेज प्रदान करता है। आप अपनी नकदी में से केवल ₹20,000 का उपयोग करके ₹1,00,000 का व्यापार कर सकते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Max out the 5x leverage on a volatile stock. The stock drops 20% and you are wiped out.", mentorInsight: "With 5x leverage, a 20% fall wipes out 100% of your money. SEBI studies show most retail F&O traders lose money.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Decline leverage entirely. Only invest cash you actually own.", mentorInsight: "Investing only money you own means a market fall can't wipe you out. Time in the market beats leverage for most people.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Skip the leverage. Put your own ₹20,000 into a Nifty 50 index fund and hold it for years.", mentorInsight: "Leverage is borrowed money: it multiplies losses as fast as gains. Your own cash in a low-cost index fund can't be margin-called and grows with the whole economy.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_premium_broadband_pitch_116",
    name: "Premium Broadband Pitch",
    nameHi: "प्रीमियम ब्रॉडबैंड पिच",
    type: "decision",
    tier: "common",
    flavor: "Your internet provider offers an upgrade from 100 Mbps to 1 Gbps for an extra ₹1,500 a month. You mostly just watch OTT shows.",
    flavorHi: "आपका इंटरनेट प्रदाता अतिरिक्त ₹1,500 प्रति माह पर 100 एमबीपीएस से 1 जीबीपीएस तक अपग्रेड की पेशकश करता है। आप ज्यादातर बस OTT शो ही देखते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Upgrade just because 1 Gbps sounds cool.", mentorInsight: "Paying ₹1,500 more every month for speed you don't use is ₹18,000 a year gone. Recurring costs matter more than one-time ones.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Reject it. 100 Mbps is plenty for your needs.", mentorInsight: "Pay for what you actually need. Cutting small monthly bills is one of the easiest ways to free up money for SIPs.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Upgrade to 1 Gbps, but use the speed to start streaming/gaming professionally. You get sponsored instantly!", mentorInsight: "An upgrade can make sense if it helps you earn. Track whether the side income actually covers the extra cost.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_lost_keys_penalty_117",
    name: "Lost Keys Penalty",
    nameHi: "चाबी खो जाने पर जुर्माना",
    type: "decision",
    tier: "common",
    flavor: "You lost the only key to your apartment/car. The emergency locksmith charges ₹3,000.",
    flavorHi: "आपने अपने अपार्टमेंट/कार की एकमात्र चाबी खो दी है। आपातकालीन ताला बनाने वाला ₹3,000 का शुल्क लेता है।",
    options: [
      { type: "spend", label: "Spend", description: 'Pay the ₹3,000 but delay making a spare key because you are "too busy."', mentorInsight: "Delaying a ₹100 fix risks paying ₹3,000 again. Small preventive steps save big later.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹3,000, then immediately make a spare key for ₹100.", mentorInsight: "Making a spare key right away is cheap insurance. Planning for small mishaps is the same habit as building an emergency fund.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Pay the ₹3,000, but invest ₹5,000 in a smart lock system. You never need keys again and save time instantly!", mentorInsight: "Paying for convenience can be fine, but compare the cost against how often the problem really happens.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_hosting_a_house_party_118",
    name: "Hosting a House Party",
    nameHi: "एक हाउस पार्टी का आयोजन",
    type: "decision",
    tier: "rare",
    flavor: "You are hosting a party for 10 friends.",
    flavorHi: "आप 10 दोस्तों के लिए एक पार्टी की मेजबानी कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Go overboard. Hire a bartender and caterer to impress everyone (₹25,000).", mentorInsight: "Spending big to impress friends rarely makes the party better. Good company matters more than a caterer.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Make it a potluck. You provide the main dish (₹1,500), they bring the rest.", mentorInsight: "A potluck keeps things fun and cheap. Sharing costs is a smart way to enjoy social life without hurting your savings.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Spend ₹5,000 on great food and drinks, but use the night to introduce two friends who start a business and give you a finder's fee instantly!", mentorInsight: "Bringing people together can open real opportunities. Just keep the spending reasonable and don't count on a payout.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_annual_gym_contract_119",
    name: "Annual Gym Contract",
    nameHi: "वार्षिक जिम अनुबंध",
    type: "decision",
    tier: "rare",
    flavor: "The gym offers a monthly rate of ₹3,000, or a locked-in annual rate of ₹20,000 (saving ₹16,000).",
    flavorHi: "जिम ₹3,000 की मासिक दर, या ₹20,000 की लॉक-इन वार्षिक दर (₹16,000 की बचत) प्रदान करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹20,000 upfront, go twice, and never go again.", mentorInsight: "Gyms count on people paying upfront and not showing up. An unused annual plan is a loss, not a discount.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay monthly for the first 3 months to prove you will actually go.", mentorInsight: "Testing a habit with monthly payments first is smart. Commit to the yearly plan only after you know you'll stick with it.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹20,000 upfront. You go every day, get ripped, and become a fitness influencer instantly!", mentorInsight: "Paying upfront works only if you truly use it. Your health is an investment, but the discount means nothing if you quit.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_unpaid_mental_health_break_120",
    name: "Unpaid Mental Health Break",
    nameHi: "अवैतनिक मानसिक स्वास्थ्य ब्रेक",
    shortName: "Burnout Break",
    shortNameHi: "बर्नआउट ब्रेक",
    type: "decision",
    tier: "rare",
    flavor: "You are severely burnt out. You need 1 month off work, but it will be unpaid, costing you ₹40,000 in lost income.",
    flavorHi: "तुम बुरी तरह जल गये हो. आपको काम से 1 महीने की छुट्टी चाहिए, लेकिन यह अवैतनिक होगी, जिससे आपको ₹40,000 की आय का नुकसान होगा।",
    options: [
      { type: "spend", label: "Spend", description: 'Refuse to take the break because you "need the money," but your productivity crashes and you get fired.', mentorInsight: "Burnout can cost far more than a month's pay. Health is part of your wealth.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Use your emergency fund to comfortably cover your expenses while you rest.", mentorInsight: "Using your emergency fund for a real need like rest is exactly what it's for. Rebuild it once you're back at work.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Take the month off, rest for 2 weeks, and spend 2 weeks building a digital product. It sells instantly!", mentorInsight: "Rest first, then build something if you have energy. A side product can work, but don't let it become a second burnout.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_concert_ticket_scalper_121",
    name: "Concert Ticket Scalper",
    nameHi: "कॉन्सर्ट टिकट स्कैलपर",
    type: "decision",
    tier: "common",
    flavor: "Your favorite artist is in town, but tickets are sold out. A scalper is selling them for ₹15,000 (3x the original price).",
    flavorHi: "आपका पसंदीदा कलाकार शहर में है, लेकिन टिकटें बिक चुकी हैं। एक स्केलर उन्हें ₹15,000 (मूल कीमत से 3 गुना) में बेच रहा है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹15,000. It's a once-in-a-lifetime show!", mentorInsight: "Paying 3x to a reseller often comes with fake-ticket risk too. Buy only from official sellers.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Refuse to pay the markup. Stay home and watch their live performances online.", mentorInsight: "Skipping overpriced tickets keeps your budget safe. There will be other shows, and you can plan and save for them.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "You skip the concert, but invest ₹15,000 into the event management company's stock. The concert succeeds instantly!", mentorInsight: "Investing in a business because you saw one event is a hunch, not research. Diversified investing is safer than chasing one company.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_surge_pricing_cab_122",
    name: "Surge Pricing Cab",
    nameHi: "सर्ज प्राइसिंग कैब",
    type: "decision",
    tier: "common",
    flavor: "It's raining heavily. You need to get home. Normal cab fare is ₹300, but surge pricing makes it ₹1,200.",
    flavorHi: "भारी बारिश हो रही है. तुम्हें घर पहुंचना है. सामान्य कैब का किराया ₹300 है, लेकिन सर्ज प्राइसिंग के कारण यह ₹1,200 हो जाता है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹1,200 instantly because you hate waiting.", mentorInsight: "Paying 4x for convenience now and then is fine, but making it a habit drains money quietly.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Wait 45 minutes in a café until the surge pricing ends, then pay ₹300.", mentorInsight: "Waiting out surge pricing is a small win. Small habits like this add up to real savings over a year.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹1,200 surge, but use the fast ride home to jump on an urgent freelance call. You get paid instantly!", mentorInsight: "Paying extra can make sense if your time earns more than the extra cost. Know what an hour of your time is worth.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_borrowing_to_invest_123",
    name: "Borrowing to Invest",
    nameHi: "निवेश के लिए उधार लेना",
    type: "decision",
    tier: "epic",
    flavor: 'A friend promises a 50% return in one month on a "sure-thing" investment. You have no cash, but you have a ₹1,00,000 limit credit card.',
    flavorHi: 'एक मित्र ने "निश्चित चीज़" निवेश पर एक महीने में 50% रिटर्न का वादा किया है। आपके पास नकदी नहीं है, लेकिन आपके पास ₹1,00,000 की सीमा वाला क्रेडिट कार्ड है।',
    options: [
      { type: "spend", label: "Spend", description: "Swipe the ₹1,00,000 on the card and give it to the friend. The investment goes to zero immediately.", mentorInsight: "'50% in one month' is a classic scam sign. Borrowing on a credit card to chase it can leave you with a huge debt at 36–42% interest.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Decline it completely. Never borrow money to invest.", mentorInsight: "Never borrow to invest in something you don't understand. Guaranteed high returns are almost always a fraud.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Decline the friend's scheme, but cut your entertainment budget to invest ₹10,000 safely. It grows instantly!", mentorInsight: "Investing from your own budget, not debt, is the safe way. Real returns are steady, not 50% a month.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_unpaid_experience_trap_124",
    name: "Unpaid Experience Trap",
    nameHi: "अवैतनिक अनुभव जाल",
    type: "decision",
    tier: "rare",
    flavor: 'You are offered a 3-month "unpaid internship" or trial project for a prestigious company that will require 40 hours a week.',
    flavorHi: 'आपको एक प्रतिष्ठित कंपनी के लिए 3 महीने की "अवैतनिक इंटर्नशिप" या परीक्षण परियोजना की पेशकश की जाती है जिसके लिए सप्ताह में 40 घंटे की आवश्यकता होगी।',
    options: [
      { type: "spend", label: "Spend", description: "Take it without negotiating, borrowing money to survive the 3 months. The company doesn't hire you.", mentorInsight: "Borrowing to work for free is a risky bet on a job that may never come. Experience doesn't pay rent.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Reject it. You need an actual salary to survive.", mentorInsight: "Your time has value. Saying no to unpaid full-time work protects both your money and your bargaining power.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Accept it, but negotiate for them to pay for your massive upskilling courses during the trial. The skills land you a job instantly!", mentorInsight: "Negotiating for training or a stipend turns free work into a real investment in your skills.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_buy_1_get_1_clothing_125",
    name: "Buy 1 Get 1 Clothing",
    nameHi: "1 खरीदें 1 कपड़ा पाएं",
    type: "decision",
    tier: "common",
    flavor: 'You need a single ₹2,000 shirt for an event. The store offers "Buy 2 Get 2 Free" if you spend ₹4,000 total.',
    flavorHi: 'किसी कार्यक्रम के लिए आपको एक ₹2,000 की शर्ट चाहिए। यदि आप कुल ₹4,000 खर्च करते हैं तो स्टोर "2 खरीदें 2 मुफ़्त पाएं" ऑफर करता है।',
    options: [
      { type: "spend", label: "Spend", description: "Spend the ₹4,000 to get 4 shirts.", mentorInsight: "'Free' items you didn't need still cost you the extra ₹2,000. A deal is only a deal if you wanted all of it.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Buy the single ₹2,000 shirt you actually came for.", mentorInsight: "Buying only what you came for beats every 'Buy 2 Get 2' offer. Stick to your list.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Buy the ₹4,000 deal, keep the 1 shirt, and instantly resell the other 3 online!", mentorInsight: "Reselling can work, but it takes time and effort. Most people end up keeping the extras.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_family_emergency_support_126",
    name: "Family Emergency Support",
    nameHi: "पारिवारिक आपातकालीन सहायता",
    shortNameHi: "परिवार की मदद",
    type: "decision",
    tier: "epic",
    flavor: "A close relative requires ₹50,000 for a sudden medical treatment. They have no insurance.",
    flavorHi: "किसी करीबी रिश्तेदार को अचानक चिकित्सा उपचार के लिए ₹50,000 की आवश्यकता है। उनके पास कोई बीमा नहीं है.",
    options: [
      { type: "spend", label: "Spend", description: "You don't have savings, so you take a high-interest personal loan to help them.", mentorInsight: "Taking a high-interest loan to help others can hurt you both. Building your own savings first lets you help without debt.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Give the ₹50,000 out of your emergency fund.", mentorInsight: "This is what an emergency fund is for, including family emergencies. It also shows why every family member needs health insurance.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Give the ₹50,000, but take charge of their finances to instantly restructure their assets to pay you back!", mentorInsight: "Helping family plan their money can prevent the next crisis. Encourage them to get a health insurance cover too.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_smart_home_upgrade_127",
    name: "Smart Home Upgrade",
    nameHi: "स्मार्ट होम अपग्रेड",
    type: "decision",
    tier: "rare",
    flavor: "You are tempted to upgrade your home with smart lights, speakers, and gadgets for ₹25,000.",
    flavorHi: "आप ₹25,000 में अपने घर को स्मार्ट लाइट, स्पीकर और गैजेट्स के साथ अपग्रेड करने के लिए प्रलोभित हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Buy ₹25,000 worth of color-changing lights that provide no financial return.", mentorInsight: "Gadgets that only look cool are pure spending. Ask what problem they solve before buying.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Only buy a single ₹2,000 smart speaker and call it a day.", mentorInsight: "Buying one useful device instead of a full setup keeps the fun and saves money.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Invest ₹25,000 in an energy-efficient inverter AC and smart plugs. They instantly slash your electricity bill for 5 years!", mentorInsight: "Energy-saving upgrades can pay for themselves through lower bills. Check the payback period before buying.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_pet_health_plan_128",
    name: "Pet Health Plan",
    nameHi: "पालतू पशु स्वास्थ्य योजना",
    type: "decision",
    tier: "rare",
    flavor: "You just adopted a pet. The vet offers a preventative health plan for ₹15,000/year.",
    flavorHi: "आपने अभी-अभी एक पालतू जानवर गोद लिया है। पशुचिकित्सक ₹15,000/वर्ष के लिए एक निवारक स्वास्थ्य योजना प्रदान करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Decline the plan and don't save anything.", mentorInsight: "Pets bring vet bills sooner or later. Having no plan and no savings turns one illness into a crisis.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: 'Decline the plan, but manually put aside ₹1,200/month into a "pet sinking fund".', mentorInsight: "A separate 'sinking fund' for a known future cost is a great habit. It works for pets, gadgets, travel and more.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Buy the ₹15,000 plan. It instantly covers a major illness that would have cost ₹50,000!", mentorInsight: "Insurance makes sense when one big bill could hurt your finances. Read what's covered before you pay.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_car_lease_vs_buy_129",
    name: "Car Lease vs Buy",
    nameHi: "कार लीज बनाम खरीदें",
    type: "decision",
    tier: "rare",
    flavor: "You need a vehicle for work. You can buy a reliable used car for ₹3 Lakhs, or lease a brand new luxury car for ₹30,000/month.",
    flavorHi: "आपको काम के लिए एक वाहन की आवश्यकता है। आप ₹3 लाख में एक विश्वसनीय पुरानी कार खरीद सकते हैं, या ₹30,000/माह पर एक बिल्कुल नई लक्जरी कार किराए पर ले सकते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Lease the luxury car purely for status.", mentorInsight: "A luxury car loses value fast and the monthly cost eats into savings. Cars are a cost, not an investment.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Buy the used car with cash you saved up.", mentorInsight: "Buying a reliable used car in cash avoids EMIs and heavy depreciation. That leaves more money to invest.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Buy the reliable used car and SIP part of the ₹30,000/month a lease would have cost into an index fund.", mentorInsight: "A car is a cost, not an investment. Buying a dependable used one and investing what a luxury lease would have eaten turns a status expense into a growing asset.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_salary_advance_request_130",
    name: "Salary Advance Request",
    nameHi: "वेतन अग्रिम अनुरोध",
    type: "decision",
    tier: "rare",
    flavor: "You overspent this month and have ₹0 in your account. You need ₹15,000 to survive until payday next week.",
    flavorHi: "आपने इस महीने अधिक खर्च किया और आपके खाते में ₹0 हैं। अगले सप्ताह वेतन दिवस तक जीवित रहने के लिए आपको ₹15,000 की आवश्यकता है।",
    options: [
      { type: "spend", label: "Spend", description: "Take a cash advance from your credit card.", mentorInsight: "Credit card cash advances charge interest from day one plus a fee. It's one of the costliest ways to borrow.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Sell unused items from your house to generate the ₹15,000.", mentorInsight: "Selling unused stuff gets you cash without debt. Next, build a small buffer so payday gaps don't hurt.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Sell unused items for a little more than you need, then start a liquid-fund buffer that auto-fills every payday.", mentorInsight: "Running out before payday is a missing-buffer problem. Cover the gap without debt, then build a liquid-fund cushion so next month's surprise doesn't need a loan.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_bank_minimum_balance_penalty_131",
    name: "Bank Minimum Balance Penalty",
    nameHi: "बैंक न्यूनतम शेष पर जुर्माना",
    shortName: "Min Balance Fee",
    shortNameHi: "बैलेंस जुर्माना",
    type: "decision",
    tier: "common",
    flavor: "Your bank account balance dropped below the minimum. The bank deducts a ₹1,000 penalty.",
    flavorHi: "आपके बैंक खाते का शेष न्यूनतम से नीचे चला गया। बैंक ₹1,000 का जुर्माना काटता है।",
    options: [
      { type: "spend", label: "Spend", description: "Ignore the text message.", mentorInsight: "Ignoring bank charges lets them repeat every month. Small fees quietly eat your savings.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Transfer ₹1,000 from savings to restore the balance immediately.", mentorInsight: "Restoring the balance stops more penalties. Check your bank's minimum balance rule so it doesn't happen again.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Call the bank manager, demand a refund, and instantly upgrade to a zero-balance account!", mentorInsight: "Zero-balance savings accounts exist and avoid such penalties. Pick an account that suits how you actually use it.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_bottle_service_peer_pressure_132",
    name: "Bottle Service Peer Pressure",
    nameHi: "बोतल सेवा साथियों का दबाव",
    shortName: "VIP Bottle Bill",
    shortNameHi: "क्लब का बिल",
    type: "decision",
    tier: "epic",
    flavor: "You are at a club. Your friends impulsively order VIP bottle service for ₹40,000 and expect everyone to split the cost (₹10,000 each).",
    flavorHi: "आप एक क्लब में हैं. आपके मित्र बिना सोचे-समझे ₹40,000 की वीआईपी बोतल सेवा का ऑर्डर दे देते हैं और उम्मीद करते हैं कि हर कोई लागत (प्रत्येक ₹10,000) को विभाजित कर देगा।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹10,000 happily to look cool.", mentorInsight: "Paying for something you didn't order just to fit in is costly. Good friends will understand a polite no.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: `Refuse to pay. "I didn't order it, I'm not paying for it."`, mentorInsight: "Setting a clear rule on shared bills protects your budget. It's okay to only pay for what you agreed to.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹10,000, but use the VIP access to network with high-net-worth individuals nearby. You land a deal instantly!", mentorInsight: "Networking is valuable, but you don't need an expensive table to do it. Keep social costs within your budget.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_guru_s_mastermind_group_133",
    name: "Guru's Mastermind Group",
    nameHi: "गुरु का मास्टरमाइंड ग्रुप",
    type: "decision",
    tier: "rare",
    flavor: 'An internet "Guru" is selling access to an exclusive mastermind group for ₹25,000, promising "secrets of the wealthy."',
    flavorHi: 'एक इंटरनेट "गुरु" एक विशेष मास्टरमाइंड समूह तक पहुंच ₹25,000 में बेच रहा है, जो "अमीरों के रहस्य" का वादा करता है।',
    options: [
      { type: "spend", label: "Spend", description: "Buy the ₹25,000 course hoping it will magically make you rich without doing any work.", mentorInsight: "Courses promising 'secrets of the rich' usually make the seller rich. Watch out for big promises and pressure tactics.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Don't buy it. Buy a ₹300 book by an actual billionaire instead.", mentorInsight: "A good book or free, trusted resources teach the basics of money well. Real wealth building is simple, not secret.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹25,000 but only to steal the Guru's marketing strategy. You implement it and get sales instantly!", mentorInsight: "Learning from marketing tactics can help a business, but don't pay for hype. Check reviews and refund terms first.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_cracked_screen_repair_134",
    name: "Cracked Screen Repair",
    nameHi: "फटी स्क्रीन की मरम्मत",
    type: "decision",
    tier: "common",
    flavor: "You drop your phone and the screen shatters. Repair costs ₹8,000.",
    flavorHi: "आप अपना फ़ोन गिरा देते हैं और स्क्रीन टूट जाती है। मरम्मत की लागत ₹8,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Throw the phone away and buy a new one for ₹50,000.", mentorInsight: "Replacing a phone for a fixable problem wastes money. A ₹8,000 repair beats a ₹50,000 new phone.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Use it with a cracked screen for 6 months until you save up the cash.", mentorInsight: "Waiting until you can pay in cash avoids EMIs on a gadget. Just make sure the crack isn't a safety issue.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy a screen repair kit for ₹2,000 and fix it yourself using YouTube. You succeed instantly!", mentorInsight: "DIY repairs can save money if you're careful. If it goes wrong, you may spend more, so know your limits.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_premium_workout_gear_135",
    name: "Premium Workout Gear",
    nameHi: "प्रीमियम वर्कआउट गियर",
    type: "decision",
    tier: "common",
    flavor: "You start going to the gym. Everyone is wearing premium ₹6,000 athletic wear. You are in an old t-shirt.",
    flavorHi: "आप जिम जाना शुरू कर दीजिए. हर कोई प्रीमियम ₹6,000 का एथलेटिक परिधान पहन रहा है। आप एक पुरानी टी-शर्ट में हैं.",
    options: [
      { type: "spend", label: "Spend", description: 'Buy ₹30,000 worth of matching sets on your credit card to "commit to the lifestyle."', mentorInsight: "Buying expensive gear on credit doesn't build fitness. Commitment shows in habits, not outfits.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Keep wearing your old t-shirt. The weights don't care what you wear.", mentorInsight: "Old clothes work just fine. Spend on what makes a real difference, like good shoes or a trainer, only when needed.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy the ₹6,000 gear, and the confidence boost makes you hit a personal record instantly!", mentorInsight: "One good set is reasonable if it keeps you motivated. Don't let fitness turn into a shopping hobby.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_high_interest_payday_loan_136",
    name: "High-Interest Payday Loan",
    nameHi: "उच्च-ब्याज वेतन-दिवस ऋण",
    shortName: "Payday Loan",
    shortNameHi: "महंगा लोन",
    type: "decision",
    tier: "epic",
    flavor: "You are broke and an unexpected bill arrives. A predatory app offers you a ₹20,000 loan instantly, but the interest is 3% per day.",
    flavorHi: "आप टूट गए हैं और एक अप्रत्याशित बिल आ गया है। एक शिकारी ऐप आपको तुरंत ₹20,000 का ऋण प्रदान करता है, लेकिन ब्याज प्रति दिन 3% है।",
    options: [
      { type: "spend", label: "Spend", description: `Take the app loan because it's "easy and private."`, mentorInsight: "3% a day is over 1,000% a year. Many instant loan apps are illegal and harass borrowers, so check if the lender is RBI-registered.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Ask your employer for an advance or borrow from family instead.", mentorInsight: "Asking your employer or family is much cheaper than a predatory app. Then build an emergency fund to avoid this next time.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Sell your gaming console/TV for ₹20,000 instantly.", mentorInsight: "Selling things you don't need avoids any loan at all. Clearing a bill without debt is always the strongest move.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_impulse_puppy_purchase_137",
    name: "Impulse Puppy Purchase",
    nameHi: "आवेग पिल्ला खरीद",
    type: "decision",
    tier: "rare",
    flavor: "You see a cute puppy for sale for ₹15,000. You desperately want it.",
    flavorHi: "आप ₹15,000 में बिक्री के लिए एक प्यारा सा पिल्ला देख रहे हैं। आप इसे बेहद चाहते हैं.",
    options: [
      { type: "spend", label: "Spend", description: "Buy the puppy for ₹15,000 without realizing food and vet bills will cost ₹5,000/month.", mentorInsight: "A pet's real cost is food, vet visits and care every month. Always budget the ongoing cost, not just the price tag.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Adopt a stray/shelter dog for ₹1,000 instead.", mentorInsight: "Adopting is kinder and cheaper. Still plan for monthly pet expenses before bringing one home.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "You buy the puppy, but instantly start a pet-fluencer account that goes viral!", mentorInsight: "Social media income is uncertain. Love the pet first; treat any earnings as a bonus, not a plan.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_skipping_routine_maintenance_138",
    name: "Skipping Routine Maintenance",
    nameHi: "नियमित रखरखाव छोड़ना",
    shortName: "Skip Servicing",
    shortNameHi: "सर्विस टालना",
    type: "decision",
    tier: "rare",
    flavor: "Your car/bike is due for a ₹5,000 service. It feels fine right now.",
    flavorHi: "आपकी कार/बाइक पर ₹5,000 की सर्विस बकाया है। अभी यह ठीक लग रहा है.",
    options: [
      { type: "spend", label: "Spend", description: "Skip the service to save money.", mentorInsight: "Skipping service saves a little now but can lead to big repair bills later. Prevention is cheaper.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Pay the ₹5,000 and get it serviced.", mentorInsight: "Regular servicing keeps your vehicle reliable and protects its resale value.", effect: { type: "wealth_pct", value: 10, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy the oil and parts for ₹1,500 and service it yourself using a tutorial. You succeed instantly!", mentorInsight: "DIY servicing can save money if you know what you're doing. A mistake can cost more than the garage fee.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_airport_premium_parking_139",
    name: "Airport Premium Parking",
    nameHi: "एयरपोर्ट प्रीमियम पार्किंग",
    type: "decision",
    tier: "common",
    flavor: "You are flying out for a weekend. Premium airport parking is ₹3,000. A cab is ₹1,000 each way.",
    flavorHi: "आप सप्ताहांत के लिए बाहर जा रहे हैं। प्रीमियम एयरपोर्ट पार्किंग ₹3,000 है। कैब का हर तरफ का किराया ₹1,000 है।",
    options: [
      { type: "spend", label: "Spend", description: "Pay the ₹3,000 parking AND use valet service for an extra ₹1,000 because you feel fancy.", mentorInsight: "Paying for parking and valet to feel fancy is pure lifestyle spend. Comfort is nice, but know what it costs.", effect: { type: "wealth_pct", value: -8, target: "self" } },
      { type: "save", label: "Save", description: "Take a cab (total ₹2,000).", mentorInsight: "Comparing options before you go is smart. A cab here saves money with no real downside.", effect: { type: "wealth_pct", value: 4, target: "self" } },
      { type: "invest", asset: "equity", label: "Invest", description: "Pay the ₹3,000 parking, but use the time saved to instantly close a business email!", mentorInsight: "Paying more to save time only helps if you actually use that time well.", effect: { type: "wealth_pct", value: 10, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_bootstrapping_a_business_140",
    name: "Bootstrapping a Business",
    nameHi: "एक व्यवसाय को बूटस्ट्रैपिंग करना",
    shortNameHi: "अपना बिज़नेस",
    type: "decision",
    tier: "epic",
    flavor: "You want to quit your job to start a business. You have ₹5 Lakhs saved.",
    flavorHi: "आप व्यवसाय शुरू करने के लिए अपनी नौकरी छोड़ना चाहते हैं। आपके ₹5 लाख बच गए हैं.",
    options: [
      { type: "spend", label: "Spend", description: "Quit your job and spend ₹3 Lakhs immediately on a fancy office and a premium laptop before making a single sale.", mentorInsight: "Spending on a fancy office before your first sale burns your runway. Prove demand before spending big.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Keep your job. Start the business as a weekend hustle until it replaces your income.", mentorInsight: "Building on the side while your salary pays the bills lowers your risk. Quit once the business can support you.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "smallcap", label: "Invest", description: "Quit your job. Invest the ₹5 Lakhs. The business instantly finds product-market fit!", mentorInsight: "Going all in can work, but keep at least 6 months of personal expenses aside. Most businesses take longer than planned.", effect: { type: "wealth_pct", value: 35, target: "self" }, investRisk: 40, failEffect: { type: "wealth_pct", value: -25, target: "self" } }
    ]
  },
  {
    id: "dc_premium_cybersecurity_software_171",
    name: "Premium Cybersecurity Software",
    nameHi: "प्रीमियम साइबर सुरक्षा सॉफ्टवेयर",
    shortName: "Antivirus Plan",
    shortNameHi: "साइबर सुरक्षा",
    type: "decision",
    tier: "rare",
    flavor: "Cyber attacks are rising. You need to secure your digital wallets.",
    flavorHi: "साइबर हमले बढ़ रहे हैं. आपको अपने डिजिटल वॉलेट को सुरक्षित करने की आवश्यकता है।",
    options: [
      { type: "spend", label: "Spend", description: "Use the free trial and get hacked.", mentorInsight: "Free trials that lapse leave you exposed. Online fraud in India is rising, and recovering stolen money is hard.", effect: { type: "wealth_pct", value: -20, target: "self" } },
      { type: "save", label: "Save", description: "Use strong passwords but no premium software.", mentorInsight: "Strong, unique passwords and 2FA already stop many attacks. Never share OTPs or your UPI PIN with anyone.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy the premium software. It blocks a major attack instantly!", mentorInsight: "Good security tools add another layer of protection. Your habits still matter most: don't click unknown links or install unknown apps.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -5, target: "self" } }
    ]
  },
  {
    id: "dc_premium_travel_insurance_180",
    name: "Premium Travel Insurance",
    nameHi: "प्रीमियम यात्रा बीमा",
    type: "decision",
    tier: "rare",
    flavor: "You are booking an expensive international trip.",
    flavorHi: "आप एक महँगी अंतर्राष्ट्रीय यात्रा बुक कर रहे हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Don't buy insurance, and your flight gets cancelled.", mentorInsight: "One cancelled flight or medical issue abroad can cost far more than the policy. Skipping insurance on a big trip is risky.", effect: { type: "wealth_pct", value: -20, target: "self" } },
      { type: "save", label: "Save", description: "Buy the basic trip cancellation coverage.", mentorInsight: "Basic cover protects you from the most common problems at low cost. Always read what is and isn't covered.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Buy premium insurance. Your lost luggage results in a massive payout!", mentorInsight: "For costly international trips, wider coverage including medical care abroad can be worth it. Insurance is for protection, not profit.", effect: { type: "wealth_pct", value: 30, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -10, target: "self" } }
    ]
  },
  {
    id: "dc_comprehensive_pet_insurance_181",
    name: "Comprehensive Pet Insurance",
    nameHi: "व्यापक पालतू पशु बीमा",
    type: "decision",
    tier: "rare",
    flavor: "Your pet needs checkups. You are offered a premium health plan.",
    flavorHi: "आपके पालतू जानवर को चेकअप की आवश्यकता है। आपको एक प्रीमियम स्वास्थ्य योजना की पेशकश की जाती है।",
    options: [
      { type: "spend", label: "Spend", description: "Decline the plan and get hit with unexpected vet bills.", mentorInsight: "Without savings or cover, a sudden vet bill can hurt. Pets get sick just like people.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Set aside an emergency fund specifically for the pet.", mentorInsight: "A dedicated savings pot for your pet gives you control and flexibility. It works well if you stay disciplined.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Buy the comprehensive plan. It covers a major surgery instantly!", mentorInsight: "Insurance helps when one large bill could be hard to manage. Compare premiums, waiting periods and exclusions first.", effect: { type: "wealth_pct", value: 25, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -10, target: "self" } }
    ]
  },
  {
    id: "dc_diversified_portfolio_183",
    name: "Diversified Portfolio",
    nameHi: "विविध पोर्टफ़ोलियो",
    type: "decision",
    tier: "epic",
    flavor: "You are reviewing your investments. A guru suggests putting everything in one stock.",
    flavorHi: "आप अपने निवेश की समीक्षा कर रहे हैं. एक गुरु सब कुछ एक स्टॉक में रखने का सुझाव देता है।",
    options: [
      { type: "spend", label: "Spend", description: "Buy the guru's risky stock and it crashes.", mentorInsight: "Putting everything in one stock because someone said so can wipe out your savings. Never trust tips over research.", effect: { type: "wealth_pct", value: -30, target: "self" } },
      { type: "save", label: "Save", description: "Keep your money in a low-yield savings account.", mentorInsight: "A savings account feels safe, but around 3% interest loses to 5–6% inflation. Your money quietly shrinks.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "index", label: "Invest", description: "Build a diversified portfolio. The market surges and you win big!", mentorInsight: "Spreading money across asset types and companies reduces risk. Index funds or diversified mutual funds via SIP are a simple way to start.", effect: { type: "wealth_pct", value: 40, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -15, target: "self" } }
    ]
  },
  {
    id: "dc_extended_manufacturer_warranty_186",
    name: "Extended Manufacturer Warranty",
    nameHi: "विस्तारित निर्माता वारंटी",
    shortName: "Extra Warranty",
    shortNameHi: "एक्स्ट्रा वारंटी",
    type: "decision",
    tier: "common",
    flavor: "You just bought an expensive appliance. The cashier offers a 5-year warranty.",
    flavorHi: "आपने अभी-अभी एक महँगा उपकरण खरीदा है। कैशियर 5 साल की वारंटी प्रदान करता है।",
    options: [
      { type: "spend", label: "Spend", description: "Decline it. The appliance breaks the next week.", mentorInsight: "Skipping cover is fine only if you have savings for repairs. Without a buffer, one breakdown hurts.", effect: { type: "wealth_pct", value: -15, target: "self" } },
      { type: "save", label: "Save", description: "Set aside the warranty cost in your emergency fund.", mentorInsight: "Saving the warranty amount yourself means you keep it if nothing breaks. It's like self-insuring.", effect: { type: "wealth_pct", value: 5, target: "self" } },
      { type: "invest", asset: "debt", label: "Invest", description: "Buy the warranty. The appliance is completely replaced with a newer model!", mentorInsight: "For costly appliances that often need repairs, a warranty can be worth it. Check what it covers and the claim process.", effect: { type: "wealth_pct", value: 20, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -10, target: "self" } }
    ]
  },
  {
    id: "dc_home_security_cameras_196",
    name: "Home Security Cameras",
    nameHi: "गृह सुरक्षा कैमरे",
    type: "decision",
    tier: "rare",
    flavor: "Your neighborhood has seen a spike in car vandalism. You consider installing high-definition security cameras.",
    flavorHi: "आपके पड़ोस में कार बर्बरता में वृद्धि देखी गई है। आप हाई-डेफ़िनिशन सुरक्षा कैमरे स्थापित करने पर विचार करते हैं।",
    options: [
      { type: "spend", label: "Spend", description: "Buy cheap dummy cameras that provide no actual security.", mentorInsight: "Fake cameras give a false sense of safety. Spending on things that don't work is still a waste.", effect: { type: "wealth_pct", value: -5, target: "self" } },
      { type: "save", label: "Save", description: "Rely on standard locks and hope for the best.", mentorInsight: "Basic precautions help, but hoping for the best isn't a plan. Consider insuring valuables you can't afford to lose.", effect: { type: "wealth_pct", value: 2, target: "self" } },
      { type: "invest", asset: "fd", label: "Invest", description: "Buy the premium 4K cameras. They capture a thief instantly and you collect a massive reward!", mentorInsight: "Real security tools can deter theft and help with insurance claims. Choose based on your actual risk, not fear.", effect: { type: "wealth_pct", value: 15, target: "self" }, investRisk: 30, failEffect: { type: "wealth_pct", value: -10, target: "self" } }
    ]
  }
];
var ACTION_CARDS = [
  {
    id: "ac_cyber_hack_141",
    name: "Cyber Hack",
    nameHi: "साइबर हैक",
    type: "action",
    category: "fraud",
    tier: "rare",
    mentorInsight: "Weak passwords and reused PINs are an open door. Use app locks, a strong unique UPI PIN, and never install screen-sharing apps when a 'support agent' asks.",
    flavor: "You hire a hacker to break into your opponent's poorly secured UPI wallet.",
    flavorHi: "आप अपने प्रतिद्वंद्वी के कमज़ोर सुरक्षा वाले UPI वॉलेट में सेंध लगाने के लिए एक हैकर को लगाते हैं।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Hacker",
    shortNameHi: "हैकर",
    shortFlavor: "Hack digital wallet. (Attack)",
    shortFlavorHi: "डिजिटल वॉलेट हैक करें. (आक्रमण करना)"
  },
  {
    id: "ac_identity_theft_142",
    name: "Identity Theft",
    nameHi: "चोरी की पहचान",
    type: "action",
    category: "fraud",
    tier: "epic",
    mentorInsight: "Write the purpose and date across every PAN/Aadhaar photocopy you hand over, and check your credit report once a year so you spot loans you never took.",
    flavor: "Someone misuses your opponent's leaked PAN and Aadhaar copies to take instant loans in their name.",
    flavorHi: "कोई आपके प्रतिद्वंद्वी की लीक हुई PAN और आधार कॉपी का गलत इस्तेमाल करके उनके नाम पर इंस्टेंट लोन ले लेता है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Stolen ID",
    shortNameHi: "चोरी हुई आईडी",
    shortFlavor: "Steal identity. (Attack)",
    shortFlavorHi: "पहचान चुराओ. (आक्रमण करना)"
  },
  {
    id: "ac_market_manipulation_143",
    name: "Market Manipulation",
    nameHi: "बाज़ार में हेरफेर",
    type: "action",
    category: "market",
    tier: "rare",
    mentorInsight: "Rumours on WhatsApp and Telegram 'tip' groups move small stocks fast. Diversified investors who don't react to every rumour are hard to shake.",
    flavor: "You spread false rumors about the company your opponent invested in.",
    flavorHi: "आपने उस कंपनी के बारे में झूठी अफवाहें फैलाईं जिसमें आपके प्रतिद्वंद्वी ने निवेश किया था।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Fake News",
    shortNameHi: "फर्जी खबर",
    shortFlavor: "Spread false rumors. (Attack)",
    shortFlavorHi: "झूठी अफवाहें फैलाओ. (आक्रमण करना)"
  },
  {
    id: "ac_vexatious_lawsuit_144",
    name: "Vexatious Lawsuit",
    nameHi: "कष्टप्रद मुकदमा",
    type: "action",
    category: "legal",
    tier: "epic",
    mentorInsight: "Court cases in India can drag on for years and lawyers' fees add up. Clear written agreements and an emergency fund keep a legal fight from sinking you.",
    flavor: "You drag your opponent into a frivolous but expensive legal battle.",
    flavorHi: "आप अपने प्रतिद्वंद्वी को तुच्छ लेकिन महँगी कानूनी लड़ाई में घसीटते हैं।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Fake Lawsuit",
    shortNameHi: "फर्जी मुकदमा",
    shortFlavor: "Fake lawsuit. (Attack)",
    shortFlavorHi: "फर्जी मुकदमा. (आक्रमण करना)"
  },
  {
    id: "ac_tax_audit_trigger_145",
    name: "Tax Audit Trigger",
    nameHi: "टैक्स ऑडिट ट्रिगर",
    type: "action",
    category: "tax",
    lifeEvent: true,
    tier: "epic",
    mentorInsight: "Freelance income shows up in your AIS/Form 26AS anyway. Declare all income in your ITR and keep records; a notice hurts only when you have something to hide.",
    flavor: "The Income Tax Department matches your opponent's AIS with their ITR and finds undeclared freelance income. A notice arrives.",
    flavorHi: "आयकर विभाग आपके प्रतिद्वंद्वी के AIS को उनके ITR से मिलाता है और बिना बताई फ्रीलांस आय पकड़ लेता है। नोटिस आ जाता है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Tax Check",
    shortNameHi: "कर जांच",
    shortFlavor: "Tax audit. (Attack)",
    shortFlavorHi: "कर लेखापरीक्षा. (आक्रमण करना)"
  },
  {
    id: "ac_property_damage_146",
    name: "Property Damage",
    nameHi: "संपत्ति का नुकसान",
    type: "action",
    category: "property",
    lifeEvent: true,
    tier: "rare",
    mentorInsight: "Third-party motor insurance is mandatory in India, but it doesn't pay for your own car. A comprehensive (own-damage) policy covers falling trees, floods and accidents.",
    flavor: "A massive tree branch falls directly onto your opponent's parked car.",
    flavorHi: "एक विशाल पेड़ की शाखा सीधे आपके प्रतिद्वंद्वी की खड़ी कार पर गिरती है।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Broken Stuff",
    shortNameHi: "टूटा हुआ सामान",
    shortFlavor: "Property damage. (Attack)",
    shortFlavorHi: "संपत्ति का नुकसान। (आक्रमण करना)"
  },
  {
    id: "ac_phishing_scam_147",
    name: "Phishing Scam",
    nameHi: "फ़िशिंग घोटाले",
    type: "action",
    category: "fraud",
    tier: "common",
    mentorInsight: "Banks never ask you to update KYC through an SMS link or share an OTP. Urgency plus a link is the classic scam sign; open your bank app directly instead.",
    flavor: "You send your opponent a convincing fake 'KYC expiring, update now' SMS. They click the link.",
    flavorHi: "आप अपने प्रतिद्वंद्वी को 'KYC खत्म हो रही है, अभी अपडेट करें' वाला नकली SMS भेजते हैं। वे लिंक पर क्लिक कर देते हैं।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Fake Message",
    shortNameHi: "फर्जी संदेश",
    shortFlavor: "Phishing scam. (Attack)",
    shortFlavorHi: "फ़िशिंग घोटाले। (आक्रमण करना)"
  },
  {
    id: "ac_competitor_poaching_148",
    name: "Competitor Poaching",
    nameHi: "प्रतिस्पर्धी अवैध शिकार",
    type: "action",
    category: "job",
    tier: "rare",
    mentorInsight: "If one client brings in most of your side income, losing them hurts badly. Spread your earnings across several clients so no single exit breaks you.",
    flavor: "You poach the best-performing employee/client from your opponent's side hustle.",
    flavorHi: "आप अपने प्रतिद्वंद्वी की ओर से सबसे अच्छा प्रदर्शन करने वाले कर्मचारी/ग्राहक को पकड़ लेते हैं।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Stolen Worker",
    shortNameHi: "चोरी हुआ मजदूर",
    shortFlavor: "Poach client. (Attack)",
    shortFlavorHi: "ग्राहक को लूटो. (आक्रमण करना)"
  },
  {
    id: "ac_insurance_denial_149",
    name: "Insurance Denial",
    nameHi: "बीमा अस्वीकरण",
    type: "action",
    category: "legal",
    tier: "epic",
    mentorInsight: "Most claim rejections come from hidden health conditions or skipped fine print. Disclose everything honestly when buying, and read the exclusions and waiting periods.",
    flavor: "You find a loophole in your opponent's insurance policy, causing their recent claim to be denied.",
    flavorHi: "आप अपने प्रतिद्वंद्वी की बीमा पॉलिसी में एक खामी पाते हैं, जिसके कारण उनका हालिया दावा अस्वीकार कर दिया जाता है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "No Insurance",
    shortNameHi: "कोई बीमा नहीं",
    shortFlavor: "Deny insurance. (Attack)",
    shortFlavorHi: "बीमा से इनकार करें. (आक्रमण करना)"
  },
  {
    id: "ac_supply_chain_disruption_150",
    name: "Supply Chain Disruption",
    nameHi: "आपूर्ति शृंखला में व्यवधान",
    type: "action",
    category: "job",
    tier: "rare",
    mentorInsight: "A business that depends on one supplier or one delivery can stall overnight. Keep a cash buffer and a backup supplier.",
    flavor: "You intercept a major delivery meant for your opponent's business.",
    flavorHi: "आप अपने प्रतिद्वंद्वी के व्यवसाय के लिए की गई एक बड़ी डिलीवरी को रोकते हैं।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Lost Package",
    shortNameHi: "खोया हुआ पैकेज",
    shortFlavor: "Intercept delivery. (Attack)",
    shortFlavorHi: "अवरोधन वितरण. (आक्रमण करना)"
  },
  {
    id: "ac_car_towing_151",
    name: "Car Towing",
    nameHi: "कार खींचना",
    type: "action",
    category: "travel",
    tier: "common",
    mentorInsight: "Small fines and towing charges feel minor but they add up. Paying ₹50 for proper parking is cheaper than paying a fine plus the towing fee.",
    flavor: "You report your opponent's illegally parked car to the traffic police. The tow van arrives in minutes.",
    flavorHi: "आप अपने प्रतिद्वंद्वी की गलत जगह खड़ी कार की शिकायत ट्रैफिक पुलिस से करते हैं। टो वैन मिनटों में आ जाती है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Towed Car",
    shortNameHi: "खींची गई कार",
    shortFlavor: "Tow car. (Attack)",
    shortFlavorHi: "टो कार. (आक्रमण करना)"
  },
  {
    id: "ac_bad_investment_tip_152",
    name: "Bad Investment Tip",
    nameHi: "ख़राब निवेश युक्ति",
    type: "action",
    category: "market",
    tier: "rare",
    mentorInsight: "Hot tips from friends, finfluencers or overheard chats are not research. If you can't explain why you're buying, you're gambling, not investing.",
    flavor: "You 'accidentally' let your opponent overhear you hyping a terrible penny stock.",
    flavorHi: "आप 'गलती से' अपने प्रतिद्वंद्वी को एक बेकार पेनी स्टॉक की तारीफ करते हुए सुनने देते हैं।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Bad Tip",
    shortNameHi: "ख़राब सलाह",
    shortFlavor: "Bad stock tip. (Attack)",
    shortFlavorHi: "ख़राब स्टॉक टिप. (आक्रमण करना)"
  },
  {
    id: "ac_medical_emergency_trigger_153",
    name: "Medical Emergency Trigger",
    nameHi: "मेडिकल आपातकालीन ट्रिगर",
    type: "action",
    category: "medical",
    lifeEvent: true,
    tier: "epic",
    mentorInsight: "One hospital stay can wipe out years of savings. A personal health policy (not just your employer's cover) protects your wealth when it matters most.",
    flavor: "Your opponent slips on a wet floor and needs an emergency hospital visit.",
    flavorHi: "आपका प्रतिद्वंद्वी गीले फर्श पर फिसल जाता है और उसे तुरंत अस्पताल जाना पड़ता है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Hospital Trip",
    shortNameHi: "अस्पताल यात्रा",
    shortFlavor: "Medical emergency. (Attack)",
    shortFlavorHi: "चिकित्सा आपातकाल. (आक्रमण करना)"
  },
  {
    id: "ac_hidden_bank_fees_154",
    name: "Hidden Bank Fees",
    nameHi: "छिपी हुई बैंक फीस",
    type: "action",
    category: "debt",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Check your bank statement every month. Minimum-balance penalties, card annual fees and SMS charges quietly eat money you never agreed to spend.",
    flavor: "Your opponent's bank quietly charges minimum-balance penalties and SMS fees.",
    flavorHi: "आपके प्रतिद्वंद्वी का बैंक चुपचाप न्यूनतम बैलेंस पेनल्टी और SMS शुल्क काट लेता है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Bank Fees",
    shortNameHi: "बैंक शुल्क",
    shortFlavor: "Bank fees. (Attack)",
    shortFlavorHi: "बैंक शुल्क. (आक्रमण करना)"
  },
  {
    id: "ac_fraudulent_charge_155",
    name: "Fraudulent Charge",
    nameHi: "कपटपूर्ण आरोप",
    type: "action",
    category: "fraud",
    tier: "rare",
    mentorInsight: "Under RBI rules, reporting an unauthorised card transaction within 3 days can limit your loss to zero. Keep transaction alerts on and act fast.",
    flavor: "Your opponent's card is skimmed at a shady petrol pump and charges start rolling in.",
    flavorHi: "एक संदिग्ध पेट्रोल पंप पर आपके प्रतिद्वंद्वी का कार्ड स्किम हो जाता है और अनजान खर्च आने लगते हैं।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Fake Charge",
    shortNameHi: "फर्जी आरोप",
    shortFlavor: "Clone card. (Attack)",
    shortFlavorHi: "क्लोन कार्ड. (आक्रमण करना)"
  },
  {
    id: "ac_bounced_check_156",
    name: "Cheque Bounce",
    nameHi: "चेक बाउंस",
    type: "action",
    category: "job",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "A bounced cheque is a criminal offence under Section 138 of the Negotiable Instruments Act, but recovery still takes time. Don't plan spending around money that hasn't cleared.",
    flavor: "A client's cheque that your opponent was counting on bounces. Now come the bank charges and a long Section 138 case.",
    flavorHi: "जिस क्लाइंट के चेक पर आपका प्रतिद्वंद्वी निर्भर था, वह बाउंस हो जाता है। अब बैंक शुल्क और लंबा धारा 138 का केस।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Bounced Cheque",
    shortNameHi: "बाउंस चेक",
    shortFlavor: "Cheque bounce. (Attack)",
    shortFlavorHi: "चेक बाउंस. (आक्रमण करना)"
  },
  {
    id: "ac_emergency_travel_157",
    name: "Emergency Travel",
    nameHi: "आपातकालीन यात्रा",
    type: "action",
    category: "travel",
    lifeEvent: true,
    tier: "rare",
    mentorInsight: "Family emergencies don't wait for sales. This is exactly what an emergency fund is for, so you don't need a credit card or loan to get home.",
    flavor: "Your opponent is forced to book a last-minute, full-fare flight for a family emergency.",
    flavorHi: "आपके प्रतिद्वंद्वी को पारिवारिक आपात स्थिति के लिए अंतिम समय में पूर्ण किराया वाली उड़ान बुक करने के लिए मजबूर किया जाता है।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Sudden Trip",
    shortNameHi: "अचानक यात्रा",
    shortFlavor: "Emergency travel. (Attack)",
    shortFlavorHi: "आपातकालीन यात्रा. (आक्रमण करना)"
  },
  {
    id: "ac_broken_appliance_158",
    name: "Broken Appliance",
    nameHi: "टूटा हुआ उपकरण",
    type: "action",
    category: "property",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Fridges, ACs and phones all break eventually. A small 'repairs' bucket in your budget stops a breakdown from becoming EMI debt.",
    flavor: "Your opponent's refrigerator compressor dies in the middle of summer.",
    flavorHi: "आपके प्रतिद्वंद्वी का रेफ्रिजरेटर कंप्रेसर गर्मियों के बीच में बंद हो जाता है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Broken Fridge",
    shortNameHi: "टूटा हुआ फ्रिज",
    shortFlavor: "Broken fridge. (Attack)",
    shortFlavorHi: "टूटा हुआ फ्रिज. (आक्रमण करना)"
  },
  {
    id: "ac_roof_leak_159",
    name: "Roof Leak",
    nameHi: "छत का रिसाव",
    type: "action",
    category: "property",
    lifeEvent: true,
    tier: "epic",
    mentorInsight: "Home insurance in India is surprisingly cheap compared to the cost of repairs after floods or storms, yet very few people buy it.",
    flavor: "A severe monsoon storm wrecks the roof of your opponent's house.",
    flavorHi: "मानसून का तेज़ तूफ़ान आपके प्रतिद्वंद्वी के घर की छत तबाह कर देता है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Roof Leak",
    shortNameHi: "छत का रिसाव",
    shortFlavor: "Roof leak. (Attack)",
    shortFlavorHi: "छत का रिसाव. (आक्रमण करना)"
  },
  {
    id: "ac_pet_illness_160",
    name: "Pet Illness",
    nameHi: "पालतू जानवर की बीमारी",
    type: "action",
    category: "personal",
    lifeEvent: true,
    tier: "rare",
    mentorInsight: "Pets are family, and vet bills can be big. Budget for them before you adopt, and keep emergency money aside for surprise surgeries.",
    flavor: "Your opponent's dog swallows a sock and requires surgery.",
    flavorHi: "आपके प्रतिद्वंद्वी का कुत्ता एक जुर्राब निगल लेता है और उसे सर्जरी की आवश्यकता होती है।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Sick Pet",
    shortNameHi: "बीमार पालतू",
    shortFlavor: "Sick pet. (Attack)",
    shortFlavorHi: "बीमार पालतू. (आक्रमण करना)"
  },
  {
    id: "ac_lost_valuables_161",
    name: "Lost Valuables",
    nameHi: "कीमती सामान खो गया",
    type: "action",
    category: "personal",
    lifeEvent: true,
    tier: "rare",
    mentorInsight: "Gadget insurance and cloud backups turn a lost laptop from a disaster into an inconvenience. Your data is often worth more than the device.",
    flavor: "Your opponent leaves their brand new laptop on the metro.",
    flavorHi: "आपका प्रतिद्वंद्वी अपना नया लैपटॉप मेट्रो में छोड़ आता है।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Lost Bag",
    shortNameHi: "बैग खो गया",
    shortFlavor: "Lost laptop. (Attack)",
    shortFlavorHi: "लैपटॉप खो गया. (आक्रमण करना)"
  },
  {
    id: "ac_unfair_dismissal_162",
    name: "Unfair Dismissal",
    nameHi: "अनुचित बर्खास्तगी",
    type: "action",
    category: "job",
    lifeEvent: true,
    tier: "epic",
    mentorInsight: "Layoffs can happen to good employees too. Six months of expenses saved gives you time to find the right next job instead of the first one.",
    flavor: 'Your opponent is suddenly laid off due to "corporate restructuring."',
    flavorHi: 'आपके प्रतिद्वंद्वी को "कॉर्पोरेट पुनर्गठन" के कारण अचानक हटा दिया गया है।',
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Fired",
    shortNameHi: "निकाल दिया",
    shortFlavor: "Unfair dismissal. (Attack)",
    shortFlavorHi: "अनुचित बर्खास्तगी. (आक्रमण करना)"
  },
  {
    id: "ac_baggage_loss_163",
    name: "Baggage Loss",
    nameHi: "सामान की हानि",
    type: "action",
    category: "travel",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Keep essentials and valuables in cabin baggage, and file a written complaint with the airline before leaving the airport so your claim is on record.",
    flavor: "The airline completely loses your opponent's checked luggage on a business trip.",
    flavorHi: "व्यावसायिक यात्रा पर एयरलाइन आपके प्रतिद्वंद्वी का चेक किया हुआ सामान पूरी तरह से खो देती है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Lost Bag",
    shortNameHi: "बैग खो गया",
    shortFlavor: "Lost luggage. (Attack)",
    shortFlavorHi: "सामान खो गया. (आक्रमण करना)"
  },
  {
    id: "ac_bank_glitch_164",
    name: "Bank Glitch",
    nameHi: "बैंक गड़बड़ी",
    type: "action",
    category: "debt",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Instant loan apps can charge crazy effective interest and harass borrowers. Keeping some money in a second bank account avoids that trap.",
    flavor: "A server outage locks your opponent out of their account, so they borrow from a high-interest instant loan app for the weekend.",
    flavorHi: "सर्वर आउटेज से आपका प्रतिद्वंद्वी अपने खाते से बाहर हो जाता है, इसलिए वीकेंड के लिए वह महंगे इंस्टेंट लोन ऐप से उधार लेता है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Bank Error",
    shortNameHi: "बैंक त्रुटि",
    shortFlavor: "Bank glitch. (Attack)",
    shortFlavorHi: "बैंक की गड़बड़ी. (आक्रमण करना)"
  },
  {
    id: "ac_severe_market_crash_165",
    name: "Severe Market Crash",
    nameHi: "गंभीर बाज़ार दुर्घटना",
    type: "action",
    category: "market",
    lifeEvent: true,
    tier: "epic",
    mentorInsight: "Crashes hit everyone, but investors who stay diversified and don't panic-sell usually recover. Regular SIPs during a crash buy more units at lower prices.",
    flavor: "A global pandemic or economic crisis wipes out a huge chunk of the market.",
    flavorHi: "एक वैश्विक महामारी या आर्थिक संकट बाज़ार का एक बड़ा हिस्सा ख़त्म कर देता है।",
    effect: { type: "attack_all_pct", value: 15, target: "all" },
    shortName: "Market Crash",
    shortNameHi: "बाज़ार दुर्घटना",
    shortFlavor: "Market crash. (Attack)",
    shortFlavorHi: "बाज़ार दुर्घटना. (आक्रमण करना)"
  },
  {
    id: "ac_subscription_trap_166",
    name: "Subscription Trap",
    nameHi: "सदस्यता जाल",
    type: "action",
    category: "personal",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Free trials count on you forgetting. Set a reminder the day you sign up and review your UPI autopay mandates every month.",
    flavor: "Your opponent forgets to cancel a 'free trial' and the UPI autopay renews the annual premium plan.",
    flavorHi: "आपका प्रतिद्वंद्वी 'फ्री ट्रायल' कैंसल करना भूल जाता है और UPI ऑटोपे सालाना प्रीमियम प्लान रिन्यू कर देता है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Free Trial",
    shortNameHi: "मुफ्त परीक्षण",
    shortFlavor: "Subscription trap. (Attack)",
    shortFlavorHi: "सदस्यता जाल. (आक्रमण करना)"
  },
  {
    id: "ac_vandalism_167",
    name: "Vandalism",
    nameHi: "बर्बरता",
    type: "action",
    category: "property",
    tier: "rare",
    mentorInsight: "Scratches and dents are covered only under a comprehensive policy. Basic third-party cover won't pay a rupee for your own car.",
    flavor: "Someone keys your opponent's car overnight.",
    flavorHi: "कोई आपके प्रतिद्वंद्वी की कार में रातों-रात चाबी लगा देता है।",
    effect: { type: "wealth_pct", value: -10, target: "target" },
    shortName: "Scratched Car",
    shortNameHi: "खरोंच वाली कार",
    shortFlavor: "Vandalism. (Attack)",
    shortFlavorHi: "बर्बरता. (आक्रमण करना)"
  },
  {
    id: "ac_traffic_ticket_168",
    name: "Traffic Ticket",
    nameHi: "यातायात टिकट",
    type: "action",
    category: "legal",
    lifeEvent: true,
    tier: "common",
    mentorInsight: "Fines under the amended Motor Vehicles Act are steep. Driving safely is the cheapest insurance you'll ever have.",
    flavor: "Your opponent jumps a red light and the traffic camera sends an e-challan.",
    flavorHi: "आपका प्रतिद्वंद्वी रेड लाइट जंप करता है और ट्रैफिक कैमरा ई-चालान भेज देता है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Red Light",
    shortNameHi: "लाल बत्ती",
    shortFlavor: "Traffic ticket. (Attack)",
    shortFlavorHi: "यातायात टिकट. (आक्रमण करना)"
  },
  {
    id: "ac_rumor_mill_169",
    name: "Rumor Mill",
    nameHi: "अफवाह का कारखाना",
    type: "action",
    category: "job",
    tier: "common",
    mentorInsight: "Online reputation is real money for small sellers. Good service, quick replies and genuine reviews protect your side hustle.",
    flavor: "A bad review online ruins your opponent's weekend side-hustle sales.",
    flavorHi: "ऑनलाइन एक ख़राब समीक्षा आपके प्रतिद्वंद्वी की सप्ताहांत की बिक्री को बर्बाद कर देती है।",
    effect: { type: "wealth_pct", value: -5, target: "target" },
    shortName: "Bad Review",
    shortNameHi: "ख़राब समीक्षा",
    shortFlavor: "Bad review. (Attack)",
    shortFlavorHi: "ख़राब समीक्षा. (आक्रमण करना)"
  },
  {
    id: "ac_hostile_takeover_170",
    name: "Hostile Takeover",
    nameHi: "शत्रुतापूर्ण अधिग्रहण",
    type: "action",
    category: "legal",
    tier: "epic",
    mentorInsight: "A business that depends on one location or one deal is fragile. Owning your customer list and brand keeps you going even if you lose a shop.",
    flavor: "A larger company aggressively forces your opponent out of their prime business location.",
    flavorHi: "एक बड़ी कंपनी आक्रामक रूप से आपके प्रतिद्वंद्वी को उनके प्रमुख व्यावसायिक स्थान से बाहर कर देती है।",
    effect: { type: "wealth_pct", value: -15, target: "target" },
    shortName: "Forced Out",
    shortNameHi: "जबरन बाहर करना",
    shortFlavor: "Hostile takeover. (Attack)",
    shortFlavorHi: "शत्रुतापूर्ण अधिग्रहण. (आक्रमण करना)"
  }
];
var DEFENSE_CARDS = [
  {
    id: "def_top_tier_lawyer_on_retainer_172",
    name: "Top-Tier Lawyer on Retainer",
    nameHi: "रिटेनर पर शीर्ष स्तरीय वकील",
    type: "defense",
    blocksCategories: ["legal"],
    tier: "epic",
    mentorInsight: "Getting legal advice before you sign anything is far cheaper than fighting a case later.",
    flavor: "You have a sharp lawyer ready to send a legal notice at a moment's notice.",
    flavorHi: "आपके पास एक तेज़ वकील है जो पल भर में कानूनी नोटिस भेजने के लिए तैयार है।",
    effect: { type: "block_card", target: "self", blocks: ["Vexatious Lawsuit", "Hostile Takeover"] },
    shortName: "Good Lawyer",
    shortNameHi: "अच्छा वकील",
    shortFlavor: "Top lawyer. (Defense)",
    shortFlavorHi: "शीर्ष वकील. (रक्षा)"
  },
  {
    id: "def_comprehensive_health_insurance_173",
    name: "Comprehensive Health Insurance",
    nameHi: "व्यापक स्वास्थ्य बीमा",
    type: "defense",
    blocksCategories: ["medical"],
    tier: "epic",
    mentorInsight: "Buy health insurance while you're young and healthy: premiums are lower and waiting periods finish before you really need it. Watch out for co-pay and room-rent caps.",
    flavor: "You pay for a comprehensive health plan with no co-pay and no room-rent limits.",
    flavorHi: "आपके पास बिना को-पे और बिना रूम-रेंट सीमा वाली व्यापक स्वास्थ्य योजना है।",
    effect: { type: "block_card", target: "self", blocks: ["Medical Emergency Trigger"] },
    shortName: "Good Health",
    shortNameHi: "अच्छा स्वास्थ्य",
    shortFlavor: "Health insurance. (Defense)",
    shortFlavorHi: "स्वास्थ्य बीमा. (रक्षा)"
  },
  {
    id: "def_ironclad_contract_174",
    name: "Ironclad Contract",
    nameHi: "आयरनक्लाड अनुबंध",
    type: "defense",
    blocksCategories: ["job"],
    tier: "rare",
    mentorInsight: "Read your offer letter and client contracts carefully, especially notice period, payment terms and termination clauses. Written terms protect you when things go wrong.",
    flavor: "You had a professional draft your employment and client agreements with clear notice periods and payment terms.",
    flavorHi: "आपने एक पेशेवर से अपने रोज़गार और क्लाइंट अनुबंध साफ़ नोटिस अवधि और भुगतान शर्तों के साथ बनवाए।",
    effect: { type: "block_card", target: "self", blocks: ["Competitor Poaching", "Unfair Dismissal"] },
    shortName: "Strong Contract",
    shortNameHi: "मजबूत अनुबंध",
    shortFlavor: "Ironclad contract. (Defense)",
    shortFlavorHi: "आयरनक्लाड अनुबंध. (रक्षा)"
  },
  {
    id: "def_emergency_cash_reserve_175",
    name: "Emergency Cash Reserve",
    nameHi: "आपातकालीन नकद रिजर्व",
    type: "defense",
    blocksCategories: ["personal", "medical", "property", "travel", "job", "debt"],
    tier: "common",
    mentorInsight: "An emergency fund of about 6 months of expenses turns surprises like urgent travel or a broken fridge into minor bumps, not new debt.",
    flavor: "You have 6 months of living expenses sitting in a savings account or liquid fund you can access anytime.",
    flavorHi: "आपके पास 6 महीने का जीवन-यापन खर्च बचत खाते या लिक्विड फंड में है जिसे आप कभी भी निकाल सकते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Emergency Travel", "Broken Appliance", "Pet Illness", "Bank Glitch"] },
    shortName: "Cash Savings",
    shortNameHi: "नकद बचत",
    shortFlavor: "Cash reserve. (Defense)",
    shortFlavorHi: "नकद आरक्षित. (रक्षा)"
  },
  {
    id: "def_full_coverage_auto_insurance_176",
    name: "Full Coverage Auto Insurance",
    nameHi: "पूर्ण कवरेज ऑटो बीमा",
    type: "defense",
    blocksCategories: ["property"],
    tier: "rare",
    mentorInsight: "Comprehensive motor cover costs more than third-party only, but it pays for your own car's damage. Compare add-ons like zero depreciation before renewing.",
    flavor: "Your car has comprehensive insurance covering natural calamities, vandalism and accidents.",
    flavorHi: "आपकी कार का व्यापक बीमा है जो प्राकृतिक आपदा, तोड़फोड़ और दुर्घटनाओं को कवर करता है।",
    effect: { type: "block_card", target: "self", blocks: ["Property Damage", "Vandalism"] },
    shortName: "Car Insurance",
    shortNameHi: "गाड़ी बीमा",
    shortFlavor: "Auto insurance. (Defense)",
    shortFlavorHi: "ऑटो बीमा. (रक्षा)"
  },
  {
    id: "def_two_factor_authentication_2fa_177",
    name: "Two-Factor Authentication (2FA)",
    nameHi: "दो-कारक प्रमाणीकरण (2FA)",
    type: "defense",
    blocksCategories: ["fraud"],
    tier: "common",
    mentorInsight: "An OTP is the last lock on your money. No bank, courier or 'customer care' will ever genuinely ask you for it.",
    flavor: "You use authenticator apps, app locks and never share OTPs with anyone.",
    flavorHi: "आप ऑथेंटिकेटर ऐप्स और ऐप लॉक का उपयोग करते हैं और कभी किसी के साथ OTP साझा नहीं करते।",
    effect: { type: "block_card", target: "self", blocks: ["Phishing Scam"] },
    shortName: "Secure Login",
    shortNameHi: "सुरक्षित लॉगइन",
    shortFlavor: "Two-factor auth. (Defense)",
    shortFlavorHi: "दो-कारक प्रमाणीकरण. (रक्षा)"
  },
  {
    id: "def_homeowner_s_insurance_178",
    name: "Home Insurance",
    nameHi: "गृह बीमा",
    type: "defense",
    blocksCategories: ["property"],
    tier: "epic",
    mentorInsight: "Home insurance often costs just a few thousand rupees a year for lakhs of cover. Your home is usually your biggest asset, so protect it.",
    shortFlavorHi: "गृह बीमा. (रक्षा)",
    shortFlavor: "Home insurance. (Defense)",
    shortNameHi: "गृह बीमा",
    shortName: "Home Cover",
    flavor: "Your home and its contents are insured against storms, floods and structural damage.",
    flavorHi: "आपका घर और उसका सामान तूफ़ान, बाढ़ और ढांचागत नुकसान के विरुद्ध बीमित है।",
    effect: { type: "block_card", target: "self", blocks: ["Roof Leak"] }
  },
  {
    id: "def_trusted_accountant_ca_179",
    name: "Trusted Accountant (CA)",
    nameHi: "विश्वसनीय लेखाकार (सीए)",
    type: "defense",
    blocksCategories: ["tax"],
    tier: "epic",
    mentorInsight: "Filing your ITR on time and matching it with your AIS avoids most tax notices. A good CA saves you more than their fee.",
    flavor: "Your CA reviews your income and deductions before filing. Your ITR is spotless.",
    flavorHi: "आपका CA फ़ाइल करने से पहले आपकी आय और कटौतियों की जाँच करता है। आपका ITR बिल्कुल साफ़ है।",
    effect: { type: "block_card", target: "self", blocks: ["Tax Audit Trigger"] },
    shortName: "Good Accountant",
    shortNameHi: "अच्छा अकाउंटेंट",
    shortFlavor: "Trusted accountant. (Defense)",
    shortFlavorHi: "विश्वसनीय अकाउंटेंट. (रक्षा)"
  },
  {
    id: "def_strong_password_manager_182",
    name: "Strong Password Manager",
    nameHi: "मजबूत पासवर्ड मैनेजर",
    type: "defense",
    blocksCategories: ["fraud"],
    tier: "epic",
    mentorInsight: "Reusing one password everywhere means one leak opens everything. A password manager lets every account have its own strong password.",
    flavor: "You use auto-generated 24-character passwords for every site you use.",
    flavorHi: "आप अपने द्वारा उपयोग की जाने वाली प्रत्येक साइट के लिए स्वतः-जनरेटेड 24-वर्ण पासवर्ड का उपयोग करते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Identity Theft"] },
    shortName: "Safe Password",
    shortNameHi: "सुरक्षित पासवर्ड",
    shortFlavor: "Password manager. (Defense)",
    shortFlavorHi: "पासवर्ड मैनेजर. (रक्षा)"
  },
  {
    id: "def_reputation_management_pr_firm_184",
    name: "Reputation Management PR Firm",
    nameHi: "प्रतिष्ठा प्रबंधन पीआर फर्म",
    type: "defense",
    blocksCategories: ["job"],
    tier: "common",
    mentorInsight: "Reputation takes years to build and one viral post to damage. Responding calmly and fixing genuine complaints protects your brand.",
    flavor: "You have automated tools that monitor and suppress fake negative reviews online.",
    flavorHi: "आपके पास स्वचालित उपकरण हैं जो ऑनलाइन नकली नकारात्मक समीक्षाओं की निगरानी करते हैं और उन्हें दबा देते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Rumor Mill"] },
    shortName: "Good PR",
    shortNameHi: "अच्छा पीआर",
    shortFlavor: "PR firm. (Defense)",
    shortFlavorHi: "पीआर फर्म. (रक्षा)"
  },
  {
    id: "def_dashcam_footage_185",
    name: "Dashcam Footage",
    nameHi: "डैशकैम फ़ुटेज",
    type: "defense",
    blocksCategories: ["travel"],
    tier: "common",
    mentorInsight: "A dashcam is cheap proof in disputes and insurance claims. Evidence beats arguments.",
    flavor: "Your 4K dashcam proves you didn't run the red light.",
    flavorHi: "आपका 4K डैशकैम साबित करता है कि आपने लाल बत्ती नहीं जलाई।",
    effect: { type: "block_card", target: "self", blocks: ["Traffic Ticket"] },
    shortName: "Dashcam",
    shortNameHi: "डैशकैम",
    shortFlavor: "Dashcam footage. (Defense)",
    shortFlavorHi: "डैशकैम फ़ुटेज. (रक्षा)"
  },
  {
    id: "def_multiple_income_streams_187",
    name: "Multiple Income Streams",
    nameHi: "एकाधिक आय धाराएँ",
    type: "defense",
    blocksCategories: ["job"],
    tier: "rare",
    mentorInsight: "A second income stream, from freelancing, a skill or investments, means one bounced payment or lost client doesn't stop your life.",
    flavor: "You don't depend on a single client or salary for survival.",
    flavorHi: "आप जीवित रहने के लिए किसी एक क्लाइंट या वेतन पर निर्भर नहीं हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Cheque Bounce", "Supply Chain Disruption"] },
    shortName: "Many Jobs",
    shortNameHi: "अनेक नौकरियाँ",
    shortFlavor: "Multiple incomes. (Defense)",
    shortFlavorHi: "एकाधिक आय. (रक्षा)"
  },
  {
    id: "def_cloud_backup_drive_188",
    name: "Cloud Backup Drive",
    nameHi: "क्लाउड बैकअप ड्राइव",
    type: "defense",
    blocksCategories: ["personal"],
    tier: "rare",
    mentorInsight: "Back up your important documents and work to the cloud. Losing a device should cost you money, not your projects or memories.",
    flavor: "Your laptop was lost, but all your data is securely backed up to the cloud. You only lose the hardware, not your business.",
    flavorHi: "आपका लैपटॉप खो गया था, लेकिन आपका सारा डेटा सुरक्षित रूप से क्लाउड पर बैकअप है। आप केवल हार्डवेयर खोते हैं, अपना व्यवसाय नहीं।",
    effect: { type: "block_card", target: "self", blocks: ["Lost Valuables"] },
    shortName: "Cloud Backup",
    shortNameHi: "मेघ बैकअप",
    shortFlavor: "Cloud backup. (Defense)",
    shortFlavorHi: "मेघ बैकअप। (रक्षा)"
  },
  {
    id: "def_labor_union_rep_189",
    name: "Trade Union Rep",
    nameHi: "ट्रेड यूनियन प्रतिनिधि",
    type: "defense",
    blocksCategories: ["job"],
    tier: "epic",
    mentorInsight: "Know your rights: notice period pay, gratuity after 5 years of service, and PF are yours by law. Keep your offer letter and payslips safe.",
    flavor: "Your trade union steps in and, with help from labour laws, wins you a fair severance package.",
    flavorHi: "आपकी ट्रेड यूनियन आगे आती है और श्रम कानूनों की मदद से आपको उचित सेवरेंस पैकेज दिलाती है।",
    effect: { type: "block_card", target: "self", blocks: ["Unfair Dismissal"] },
    shortName: "Union Rep",
    shortNameHi: "संघ प्रतिनिधि",
    shortFlavor: "Union rep. (Defense)",
    shortFlavorHi: "संघ प्रतिनिधि. (रक्षा)"
  },
  {
    id: "def_emergency_roadside_assistance_190",
    name: "Emergency Roadside Assistance",
    nameHi: "आपातकालीन सड़क किनारे सहायता",
    type: "defense",
    blocksCategories: ["travel"],
    tier: "common",
    mentorInsight: "Small insurance add-ons like roadside assistance cost little and save a lot of stress. Check what your policy already includes before paying extra.",
    flavor: "Your car insurance's roadside-assistance add-on covers free towing up to 50 km.",
    flavorHi: "आपके कार बीमा का रोडसाइड असिस्टेंस ऐड-ऑन 50 किमी तक मुफ़्त टोइंग कवर करता है।",
    effect: { type: "block_card", target: "self", blocks: ["Car Towing"] },
    shortName: "Tow Truck",
    shortNameHi: "टो ट्रक",
    shortFlavor: "Roadside assist. (Defense)",
    shortFlavorHi: "सड़क किनारे सहायता. (रक्षा)"
  },
  {
    id: "def_privacy_shield_virtual_credit_card_191",
    name: "Privacy Shield / Virtual Credit Card",
    nameHi: "गोपनीयता शील्ड/वर्चुअल क्रेडिट कार्ड",
    type: "defense",
    blocksCategories: ["fraud"],
    tier: "common",
    mentorInsight: "Controlling where your card can be charged is the easiest way to beat subscription traps. Low limits mean small mistakes stay small.",
    flavor: "You use virtual cards with low limits for free trials, and review your UPI autopay list every month.",
    flavorHi: "आप फ्री ट्रायल के लिए कम लिमिट वाले वर्चुअल कार्ड इस्तेमाल करते हैं और हर महीने अपनी UPI ऑटोपे सूची जाँचते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Subscription Trap"] },
    shortName: "Safe Card",
    shortNameHi: "सुरक्षित कार्ड",
    shortFlavor: "Virtual card. (Defense)",
    shortFlavorHi: "आभासी कार्ड. (रक्षा)"
  },
  {
    id: "def_fraud_alert_service_192",
    name: "Fraud Alert Service",
    nameHi: "धोखाधड़ी चेतावनी सेवा",
    type: "defense",
    blocksCategories: ["fraud"],
    tier: "rare",
    mentorInsight: "Turn on SMS and email alerts for every transaction. The faster you report fraud, the more likely the bank covers the loss.",
    flavor: "Your bank flags the clone card and freezes it before the transaction clears.",
    flavorHi: "आपका बैंक क्लोन कार्ड को चिह्नित करता है और लेनदेन पूरा होने से पहले उसे फ्रीज कर देता है।",
    effect: { type: "block_card", target: "self", blocks: ["Fraudulent Charge"] },
    shortName: "Fraud Alert",
    shortNameHi: "धोखाधड़ी चेतावनी",
    shortFlavor: "Fraud alert. (Defense)",
    shortFlavorHi: "धोखाधड़ी की चेतावनी. (रक्षा)"
  },
  {
    id: "def_independent_financial_advisor_193",
    name: "Independent Financial Advisor",
    nameHi: "स्वतंत्र वित्तीय सलाहकार",
    type: "defense",
    blocksCategories: ["market"],
    tier: "rare",
    mentorInsight: "Check that an adviser is SEBI-registered. Advice you pay a fee for usually beats 'free' tips from someone earning commission on what you buy.",
    flavor: "You run every stock tip past a SEBI-registered investment adviser before buying.",
    flavorHi: "आप हर स्टॉक टिप को खरीदने से पहले SEBI-पंजीकृत निवेश सलाहकार से जाँचते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Bad Investment Tip"] },
    shortName: "Good Advisor",
    shortNameHi: "अच्छे सलाहकार",
    shortFlavor: "Financial advisor. (Defense)",
    shortFlavorHi: "वित्तीय सलाहकार। (रक्षा)"
  },
  {
    id: "def_ironclad_insurance_ombudsman_194",
    name: "Ironclad Insurance Ombudsman",
    nameHi: "आयरनक्लाड बीमा लोकपाल",
    type: "defense",
    blocksCategories: ["legal"],
    tier: "epic",
    mentorInsight: "If an insurer unfairly rejects your claim, complain to the insurer first, then go to the Insurance Ombudsman. It's free and you don't need a lawyer.",
    flavor: "You take the unfair claim rejection to the Insurance Ombudsman and win.",
    flavorHi: "आप अनुचित क्लेम अस्वीकृति को बीमा लोकपाल के पास ले जाते हैं और जीत जाते हैं।",
    effect: { type: "block_card", target: "self", blocks: ["Insurance Denial"] },
    shortName: "Insurance Help",
    shortNameHi: "बीमा सहायता",
    shortFlavor: "Insurance ombudsman. (Defense)",
    shortFlavorHi: "बीमा लोकपाल. (रक्षा)"
  },
  {
    id: "def_excellent_credit_score_195",
    name: "Excellent Credit Score",
    nameHi: "उत्कृष्ट क्रेडिट स्कोर",
    type: "defense",
    blocksCategories: ["debt"],
    tier: "rare",
    mentorInsight: "Paying every EMI and card bill in full and on time builds a 750+ credit score, which means cheaper loans and better deals for years.",
    flavor: "Your 780+ CIBIL score makes your bank happy to waive fees and offer better terms.",
    flavorHi: "आपके 780+ CIBIL स्कोर की वजह से बैंक खुशी से शुल्क माफ़ करता है और बेहतर शर्तें देता है।",
    effect: { type: "block_card", target: "self", blocks: ["Hidden Bank Fees"] },
    shortName: "Good Credit",
    shortNameHi: "अच्छा श्रेय",
    shortFlavor: "Good credit. (Defense)",
    shortFlavorHi: "अच्छा श्रेय. (रक्षा)"
  },
  {
    id: "def_not_my_problem_clause_197",
    name: '"Not My Problem" Clause',
    nameHi: "''मेरी समस्या नहीं'' खंड",
    type: "defense",
    blocksCategories: ["travel"],
    tier: "rare",
    mentorInsight: "Keep records like receipts, complaint numbers and police reports. Proof is what makes the other party pay instead of you.",
    flavor: "You prove you aren't legally or financially responsible: the airline owes you for lost bags, and loans taken by an identity thief aren't yours to repay.",
    flavorHi: "आप साबित करते हैं कि आप कानूनी या आर्थिक रूप से ज़िम्मेदार नहीं हैं: खोए बैग के लिए एयरलाइन ज़िम्मेदार है, और पहचान चोर के लिए लोन आपको नहीं चुकाने।",
    effect: { type: "block_card", target: "self", blocks: ["Baggage Loss", "Identity Theft"] }
  },
  {
    id: "def_cease_desist_letter_198",
    name: "Cease & Desist Letter",
    nameHi: "संघर्ष विराम एवं इच्छा पत्र",
    type: "defense",
    blocksCategories: ["legal"],
    tier: "rare",
    mentorInsight: "Spreading false information to hurt someone can be defamation. A formal legal notice is often enough to make people stop.",
    flavor: "A quick, firm legal notice for defamation and false rumours stops the attacker in their tracks.",
    flavorHi: "मानहानि और झूठी अफ़वाहों पर एक त्वरित, सख्त कानूनी नोटिस हमलावर को वहीं रोक देता है।",
    effect: { type: "block_card", target: "self", blocks: ["Rumor Mill", "Market Manipulation"] },
    shortName: "Stop Letter",
    shortNameHi: "पत्र रोकें",
    shortFlavor: "Cease letter. (Defense)",
    shortFlavorHi: "विराम पत्र. (रक्षा)"
  },
  {
    id: "def_severance_package_guarantee_199",
    name: "Severance Package Guarantee",
    nameHi: "विच्छेद पैकेज गारंटी",
    type: "defense",
    blocksCategories: ["job"],
    tier: "epic",
    mentorInsight: "Negotiate notice pay and severance before you join, not when you leave. It's your strongest bargaining moment.",
    flavor: "You negotiated a 6-month severance clause into your employment contract.",
    flavorHi: "आपने अपने रोज़गार अनुबंध में 6 महीने का सेवरेंस क्लॉज़ तय करवाया है।",
    effect: { type: "block_card", target: "self", blocks: ["Unfair Dismissal"] },
    shortName: "Job Safety",
    shortNameHi: "नौकरी की सुरक्षा",
    shortFlavor: "Severance package. (Defense)",
    shortFlavorHi: "विच्छेद पैकेज। (रक्षा)"
  },
  {
    id: "def_the_ultimate_shield_emergency_bailout_200",
    name: 'The Ultimate Shield: "Emergency Bailout"',
    nameHi: 'अंतिम ढाल: "आपातकालीन राहत"',
    shortName: "Bailout Shield",
    shortNameHi: "राहत ढाल",
    type: "defense",
    blocksCategories: ["personal", "medical", "property", "travel", "job", "debt"],
    tier: "epic",
    mentorInsight: "Family help is a blessing, but treat it as a loan you repay. Your own emergency fund is still the most reliable shield.",
    flavor: "Family steps in with a big, zero-interest emergency loan when you need it most.",
    flavorHi: "जब आपको सबसे ज़्यादा ज़रूरत होती है, परिवार बिना ब्याज का बड़ा आपातकालीन कर्ज़ लेकर आगे आता है।",
    effect: { type: "block_card", target: "self", blocks: ["any"] }
  }
];
var LEGENDARY_CARDS = [
  {
    id: "leg_warren_buffett",
    name: "The Warren Buffett",
    nameHi: "वारेन बफेट",
    type: "defense",
    blocksCategories: ["market", "fraud"],
    tier: "legendary",
    mentorInsight: "When everyone is excited about the market, be careful; when everyone is scared, good investments are often on sale. Staying calm is a skill.",
    flavor: "Be fearful when others are greedy.",
    flavorHi: "जब दूसरे लालची हों तो भयभीत रहें।",
    effect: { type: "block_card", blocks: ["any"], target: "self" }
  },
  {
    id: "leg_black_swan",
    name: "The Black Swan",
    nameHi: "काली बत्तख",
    type: "action",
    category: "market",
    tier: "legendary",
    mentorInsight: "Rare shocks like 2008 or the 2020 lockdown crash do happen. Diversification and an emergency fund are how you survive what nobody predicted.",
    flavor: "An impossible event that changes everything.",
    flavorHi: "एक असंभव घटना जो सब कुछ बदल देती है।",
    effect: { type: "market_crash_player", value: 25, target: "target" }
  },
  {
    id: "ac_time_warp",
    name: "Market Pause",
    nameHi: "बाज़ार विराम",
    type: "action",
    category: "market",
    tier: "legendary",
    mentorInsight: "Time in the market matters more than timing the market. Every extra year your money stays invested lets compounding do more work.",
    flavor: "Time stands still for everyone but you. Take another turn!",
    flavorHi: "आपके अलावा सबके लिए समय रुक गया है। एक और चाल चलो!",
    effect: { type: "skip_turn", target: "others", value: 1 }
  },
  {
    id: "ac_hostile_takeover_20",
    name: "Hostile Takeover",
    nameHi: "शत्रुतापूर्ण अधिग्रहण",
    type: "action",
    category: "legal",
    tier: "legendary",
    mentorInsight: "Concentrating everything in one asset makes you an easy target. Spreading your wealth across asset types limits how much any one hit can take.",
    flavor: "You quietly acquire a controlling stake in your opponent's most profitable assets.",
    flavorHi: "आप चुपचाप अपने प्रतिद्वंद्वी की सबसे लाभदायक संपत्ति में नियंत्रण हिस्सेदारी हासिल कर लेते हैं।",
    effect: { type: "steal_pct", target: "target", value: 25 }
  },
  {
    id: "leg_bankruptcy_shield",
    name: "Bankruptcy Shield",
    nameHi: "दिवालियापन ढाल (Bankruptcy Shield)",
    shortNameHi: "दिवालिया ढाल",
    type: "defense",
    tier: "legendary",
    mentorInsight: "Insurance, an emergency fund and avoiding high-interest debt are your real-life safety net. They decide how far a bad year can knock you down.",
    flavor: "A safety net you built earlier: no matter what happens, your wealth can't fall below the floor.",
    flavorHi: "पहले से बनाया गया सुरक्षा जाल: चाहे कुछ भी हो, आपकी संपत्ति एक तय सीमा से नीचे नहीं गिर सकती।",
    effect: { type: "wealth_floor", value: 5e4, target: "self" }
  },
  {
    id: "leg_compound_machine",
    name: "The Compound Machine",
    nameHi: "यौगिक मशीन",
    shortName: "Compound Machine",
    shortNameHi: "कंपाउंड मशीन",
    type: "decision",
    tier: "legendary",
    mentorInsight: "Compounding needs time more than money. Reinvesting returns instead of cashing out is what turns small SIPs into big numbers after 15-20 years.",
    flavor: "Compound interest: the 8th wonder of the world.",
    flavorHi: "चक्रवृद्धि ब्याज: दुनिया का आठवां अजूबा।",
    options: [
      { type: "spend", label: "Cash Out", description: "Take profits now", mentorInsight: "Cashing out early stops the compounding engine. Taking profits is fine for a goal, not just for spending.", effect: { type: "wealth_change", value: 8e4, target: "self" } },
      { type: "save", label: "Reinvest 50%", description: "Balanced approach", mentorInsight: "Reinvesting half is a balanced choice: some money in hand, the rest still growing.", effect: { type: "wealth_change", value: 12e4, target: "self" } },
      { type: "invest", asset: "index", label: "Full Compounding", description: "Let it ride", mentorInsight: "Letting it ride gives the biggest long-term growth, but markets can fall in the short term. Only do this with money you won't need soon.", effect: { type: "wealth_change", value: 18e4, target: "self" }, investRisk: 45, failEffect: { type: "wealth_change", value: -8e4, target: "self" } }
    ]
  },
  {
    id: "leg_daanik_founder",
    name: "Kuber",
    nameHi: "कुबेर (Kuber)",
    type: "decision",
    tier: "legendary",
    mentorInsight: "Real wealth comes from building assets, not showing off. Even the richest families grow their money by reinvesting, not by spending it.",
    flavor: "You set the rules of the game.",
    flavorHi: "आप खेल के नियम निर्धारित करते हैं।",
    options: [
      { type: "spend", label: "Spend Big", description: "Luxury lifestyle cost", mentorInsight: "Luxury spending shrinks wealth no matter how rich you are. Lifestyle creep doesn't stop at a certain income.", effect: { type: "wealth_change", value: -1e5, target: "self" } },
      { type: "save", label: "Strategic Partner", description: "Steady growth", mentorInsight: "Good partners and steady growth build durable wealth. Slow and steady usually wins.", effect: { type: "wealth_change", value: 12e4, target: "self" } },
      { type: "invest", asset: "equity", label: "Global Expansion", description: "Build the empire", mentorInsight: "Expanding into new markets is how businesses grow big, but it works best when built on a strong, steady base.", effect: { type: "wealth_change", value: 2e5, target: "self" } }
    ]
  }
];
var BASE_CARDS = [
  ...DECISION_CARDS,
  ...ACTION_CARDS,
  ...DEFENSE_CARDS,
  ...LEVEL_SITUATION_CARDS
];
var ALL_CARDS = [
  ...BASE_CARDS,
  ...LEGENDARY_CARDS
];
function createGameDeck() {
  const deck = [];
  for (const card of BASE_CARDS) {
    deck.push({ ...card, id: `${card.id}_1` });
  }
  for (const card of LEGENDARY_CARDS) {
    if (card.id === "ac_time_warp") {
      deck.push({ ...card, id: `${card.id}_1` });
      deck.push({ ...card, id: `${card.id}_2` });
    } else {
      deck.push({ ...card, id: `${card.id}_1` });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// src/data/mockData.ts
var SEASONS = [
  { number: 1, name: "IPO Boom", theme: "Tech IPOs flooding Dalal Street", special_rule: "All INVEST gains +40%", is_active: true },
  { number: 2, name: "GST Shock", theme: "Tax complexity cards dominate", special_rule: "Every 3rd turn costs a tax", is_active: false },
  { number: 3, name: "Startup Grind", theme: "Funding rounds and pivots", special_rule: "Players can acquire card packs", is_active: false },
  { number: 4, name: "Real Estate War", theme: "Property cards and black money", special_rule: "New asset class — property", is_active: false }
];
var DAILY_CONTRACTS = [
  { id: "1", title: "First Win", description: "Win 1 game at any level", difficulty: "easy", reward_dc: 15, reward_card_tier: null, requirement_type: "wins", requirement_value: 1, contract_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], is_weekly: false, created_at: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "2", title: "Investor Mindset", description: "Make 5 INVEST choices in one game", difficulty: "medium", reward_dc: 40, reward_card_tier: "common", requirement_type: "invest_choices", requirement_value: 5, contract_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], is_weekly: false, created_at: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "3", title: "Unbreakable", description: "Beat an Elite AI without taking EMI damage", difficulty: "hard", reward_dc: 100, reward_card_tier: "rare", requirement_type: "no_emi_win", requirement_value: 1, contract_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], is_weekly: false, created_at: (/* @__PURE__ */ new Date()).toISOString() },
  { id: "w1", title: "Weekly Champion", description: "Win 5 games this week", difficulty: "hard", reward_dc: 500, reward_card_tier: "epic", requirement_type: "weekly_wins", requirement_value: 5, contract_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], is_weekly: true, created_at: (/* @__PURE__ */ new Date()).toISOString() }
];

// src/data/assets.ts
var ASSETS = {
  fd: { id: "fd", name: "Fixed Deposit", nameHi: "एफडी", emoji: "🏦", meanPct: 7, swingPct: 0, crashChance: 0, crashPct: 0, exitPenaltyPct: 1, risk: "none", lesson: "Safe and steady, but barely beats inflation." },
  debt: { id: "debt", name: "PPF / Debt Fund", nameHi: "पीपीएफ / डेट फंड", emoji: "📜", meanPct: 7.5, swingPct: 1, crashChance: 0, crashPct: 0, exitPenaltyPct: 5, risk: "low", lesson: "Low risk, tax-friendly, locked for long-term goals." },
  gold: { id: "gold", name: "Gold", nameHi: "सोना", emoji: "🪙", meanPct: 8, swingPct: 10, crashChance: 0, crashPct: 0, exitPenaltyPct: 2, risk: "low", lesson: "A hedge, not a growth engine. Keep it to a small slice." },
  index: { id: "index", name: "Index Fund SIP", nameHi: "इंडेक्स फंड एसआईपी", emoji: "📈", meanPct: 13, swingPct: 15, crashChance: 0.05, crashPct: 20, exitPenaltyPct: 1, risk: "medium", lesson: "Owns the whole market. Bumpy years, strong decades." },
  equity: { id: "equity", name: "Stocks / Equity MF", nameHi: "शेयर / इक्विटी फंड", emoji: "💹", meanPct: 14, swingPct: 22, crashChance: 0.07, crashPct: 25, exitPenaltyPct: 1, risk: "high", lesson: "Higher return, bigger swings. Needs patience." },
  smallcap: { id: "smallcap", name: "Small-cap Stocks", nameHi: "स्मॉल-कैप शेयर", emoji: "🚀", meanPct: 16, swingPct: 35, crashChance: 0.12, crashPct: 40, exitPenaltyPct: 2, risk: "high", lesson: "Can double fast, can halve faster." },
  realestate: { id: "realestate", name: "Property", nameHi: "प्रॉपर्टी", emoji: "🏠", meanPct: 8, swingPct: 5, crashChance: 0.03, crashPct: 15, exitPenaltyPct: 15, risk: "medium", lesson: "Steady but illiquid: selling in a hurry costs a lot." },
  crypto: { id: "crypto", name: "Crypto", nameHi: "क्रिप्टो", emoji: "₿", meanPct: 15, swingPct: 60, crashChance: 0.2, crashPct: 70, exitPenaltyPct: 3, risk: "extreme", lesson: "Pure speculation. Only money you can afford to lose." },
  scam: { id: "scam", name: "Hot Tip / Scheme", nameHi: "टिप / स्कीम", emoji: "🎣", meanPct: 25, swingPct: 10, crashChance: 0.65, crashPct: 95, exitPenaltyPct: 50, risk: "extreme", lesson: "Guaranteed-return tips are how scams work. Most of it vanishes." }
};
function inferAsset(investRisk) {
  if (!investRisk) return "index";
  if (investRisk <= 10) return "debt";
  if (investRisk <= 30) return "index";
  if (investRisk <= 40) return "equity";
  return "smallcap";
}
var BASE_INFLATION_PCT = 6;
var LIFESTYLE_INFLATION_STEP_PCT = 1;
var MAX_LIFESTYLE_LEVEL = 5;

// src/data/lifeEvents.ts
var BUILTIN_LIFE_EVENTS = [
  {
    id: "le_diwali_bonus",
    name: "Diwali Bonus",
    nameHi: "दिवाली बोनस",
    type: "action",
    tier: "common",
    lifeEvent: true,
    category: "job",
    flavor: "Festive season! Everyone gets a bonus from work.",
    flavorHi: "त्योहार का मौसम! सबको काम से बोनस मिला।",
    mentorInsight: "A bonus is a great moment to top up your emergency fund or SIP before lifestyle eats it.",
    effect: { type: "wealth_pct", value: 4, target: "all" }
  },
  {
    id: "le_salary_hike",
    name: "Salary Hike",
    nameHi: "वेतन वृद्धि",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "job",
    flavor: "Your appraisal went well — a solid raise lands in your account.",
    flavorHi: "आपका अप्रेज़ल अच्छा रहा — अच्छी बढ़ोतरी मिली।",
    mentorInsight: "Raise your savings with every raise, not just your spending.",
    effect: { type: "wealth_pct", value: 8, target: "self" }
  },
  {
    id: "le_bull_run",
    name: "Bull Run",
    nameHi: "तेज़ी का दौर",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "market",
    flavor: "Markets rally on strong earnings. Equity holders smile.",
    flavorHi: "मज़बूत नतीजों पर बाज़ार में तेज़ी।",
    mentorInsight: "Only money that is already invested catches a rally. Timing the market rarely works; time in the market does.",
    effect: { type: "wealth_pct", value: 10, target: "all" }
  },
  {
    id: "le_market_crash",
    name: "Market Crash",
    nameHi: "बाज़ार में गिरावट",
    type: "action",
    tier: "epic",
    lifeEvent: true,
    category: "market",
    flavor: "A global sell-off hits stocks hard.",
    flavorHi: "वैश्विक बिकवाली से शेयर बुरी तरह गिरे।",
    mentorInsight: "Crashes are temporary for diversified, long-term investors. Selling in panic makes the loss permanent.",
    effect: { type: "wealth_pct", value: -15, target: "all" }
  },
  {
    id: "le_hospital_bill",
    name: "Hospital Bill",
    nameHi: "अस्पताल का बिल",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "medical",
    flavor: "A family member needs surgery. The bill arrives before the insurance does.",
    flavorHi: "परिवार में सर्जरी — बिल पहले आया, बीमा बाद में।",
    mentorInsight: "Health insurance plus 6 months of expenses in cash means a hospital bill never forces you to sell investments.",
    effect: { type: "wealth_pct", value: -8, target: "self" }
  },
  {
    id: "le_job_gap",
    name: "Job Gap",
    nameHi: "नौकरी में अंतराल",
    type: "action",
    tier: "epic",
    lifeEvent: true,
    category: "job",
    flavor: "Your company downsizes. Three months between jobs.",
    flavorHi: "कंपनी में छंटनी — तीन महीने बिना नौकरी।",
    mentorInsight: "This is exactly what an emergency fund is for: rent and EMIs keep getting paid while you find the next job.",
    effect: { type: "wealth_pct", value: -10, target: "self" }
  },
  {
    id: "le_car_repair",
    name: "Car Breakdown",
    nameHi: "गाड़ी खराब",
    type: "action",
    tier: "common",
    lifeEvent: true,
    category: "personal",
    flavor: "The engine gives up on the highway.",
    flavorHi: "हाईवे पर इंजन ने जवाब दे दिया।",
    mentorInsight: "Small surprises are certain — budget a little every month for repairs.",
    effect: { type: "wealth_pct", value: -4, target: "self" }
  },
  // Lures: the affected player (a bot when there is one, so humans watch it happen) moves
  // |value|% of their cash into a risky asset. A fraud defense blocks it.
  {
    id: "le_whatsapp_tip",
    name: "WhatsApp Stock Tip",
    nameHi: "व्हाट्सऐप स्टॉक टिप",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "fraud",
    lureAsset: "scam",
    flavor: '"Guaranteed 30% a month, sir — only for close friends!" Someone forwards a hot tip.',
    flavorHi: '"हर महीने 30% पक्का, सिर्फ़ दोस्तों के लिए!" — एक हॉट टिप आई।',
    mentorInsight: 'Nobody can guarantee high returns. "Guaranteed" + "urgent" + "secret" is the recipe of almost every investment scam.',
    effect: { type: "wealth_pct", value: -20, target: "self" }
  },
  {
    id: "le_chit_fund_scheme",
    name: "Double-Your-Money Scheme",
    nameHi: "पैसा डबल स्कीम",
    shortName: "Money Doubler",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "fraud",
    lureAsset: "scam",
    flavor: `A neighbour's "chit fund" promises to double your money in a year. Everyone in the building has joined.`,
    flavorHi: 'पड़ोसी की "चिट फंड" स्कीम एक साल में पैसा डबल करने का वादा करती है।',
    mentorInsight: "Unregistered schemes paying old investors with new investors' money collapse sooner or later. Check SEBI/RBI registration before investing.",
    effect: { type: "wealth_pct", value: -20, target: "self" }
  },
  {
    id: "le_crypto_influencer",
    name: "Crypto Influencer",
    nameHi: "क्रिप्टो इन्फ्लुएंसर",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "fraud",
    lureAsset: "crypto",
    flavor: "A finfluencer promises the next 100x coin. FOMO kicks in.",
    flavorHi: "एक फ़िनफ़्लुएंसर ने अगला 100x कॉइन बताया। FOMO हो गया।",
    mentorInsight: "Speculation is not investing. Only put in money you can afford to lose completely.",
    effect: { type: "wealth_pct", value: -15, target: "self" }
  },
  {
    id: "le_tax_notice",
    name: "Tax Notice",
    nameHi: "टैक्स नोटिस",
    type: "action",
    tier: "rare",
    lifeEvent: true,
    category: "tax",
    flavor: "You forgot to declare interest income. Pay the dues plus interest.",
    flavorHi: "ब्याज आय बताना भूल गए — बकाया और ब्याज भरें।",
    mentorInsight: "Declare all income, including FD and savings interest. Penalties cost more than the tax.",
    effect: { type: "wealth_pct", value: -5, target: "self" }
  }
];

// src/lib/economy.ts
var rngImpl = Math.random;
function setRng(fn) {
  rngImpl = fn ?? Math.random;
}
function rand() {
  return rngImpl();
}
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Math.floor(Math.random() * 1e12).toString(36)}_${Date.now().toString(36)}`;
  }
}
function getCash(player) {
  return player.cash ?? player.wealth;
}
function getHoldings(player) {
  return player.holdings ?? [];
}
function getHoldingsValue(player) {
  return getHoldings(player).reduce((sum, h) => sum + h.value, 0);
}
function getNetWorth(player) {
  return Math.round(getCash(player) + getHoldingsValue(player));
}
function syncWealth(player) {
  const cash = Math.max(0, Math.round(getCash(player)));
  const holdings = getHoldings(player);
  const wealth = Math.round(cash + holdings.reduce((s, h) => s + h.value, 0));
  return { ...player, cash, holdings, lifestyleLevel: player.lifestyleLevel ?? 0, wealth };
}
function addCash(player, amount) {
  return syncWealth({ ...player, cash: getCash(player) + Math.round(amount) });
}
function applyLoss(player, amount) {
  const base = syncWealth(player);
  const want = Math.max(0, Math.round(amount));
  const nw0 = base.wealth;
  if (want === 0) return { player: base, brokenShields: [], forcedSales: [], netWorthLost: 0, paid: 0, logs: [] };
  let cash = base.cash ?? 0;
  let holdings = [...base.holdings ?? []];
  const forcedSales = [];
  const logs = [];
  if (cash >= want) {
    cash -= want;
  } else {
    let shortfall = want - cash;
    cash = 0;
    const order = [...holdings].sort((a, b) => ASSETS[a.asset].exitPenaltyPct - ASSETS[b.asset].exitPenaltyPct);
    for (const h of order) {
      if (shortfall <= 0) break;
      const penPct = ASSETS[h.asset].exitPenaltyPct;
      const keep = 1 - penPct / 100;
      const grossNeeded = keep > 0 ? shortfall / keep : h.value;
      const sold = Math.min(h.value, Math.ceil(grossNeeded));
      const proceeds = sold * keep;
      shortfall -= proceeds;
      const penalty = Math.round(sold - proceeds);
      forcedSales.push({ asset: h.asset, name: h.name, sold: Math.round(sold), penalty, penaltyPct: penPct });
      holdings = holdings.map((x) => x.id === h.id ? { ...x, value: Math.round(x.value - sold) } : x).filter((x) => x.value > 0);
    }
    if (shortfall < 0) cash += Math.round(-shortfall);
  }
  for (const s of forcedSales) {
    const info = ASSETS[s.asset];
    logs.push(s.penaltyPct > 0 ? `🚨 ${base.name} had to sell ${info.emoji} ${info.name} at a ${s.penaltyPct}% penalty — an emergency fund would have avoided this.` : `🚨 ${base.name} had to sell ${info.emoji} ${info.name} to cover a loss — an emergency fund would have avoided this.`);
  }
  let next = syncWealth({ ...base, cash, holdings });
  let brokenShields = [];
  if (base.wealthFloor > 0 && next.wealth < base.wealthFloor && next.wealth < nw0) {
    const saved = Math.max(next.wealth, Math.min(nw0, base.wealthFloor));
    brokenShields = base.activeDefenses.filter((c) => c.effect?.type === "wealth_floor");
    next = syncWealth({
      ...next,
      cash: (next.cash ?? 0) + (saved - next.wealth),
      wealthFloor: 0,
      activeDefenses: base.activeDefenses.filter((c) => c.effect?.type !== "wealth_floor")
    });
    logs.push(`🛡️ ${base.name}'s Bankruptcy Shield held at ₹${saved.toLocaleString("en-IN")} and broke.`);
  }
  const netWorthLost = nw0 - next.wealth;
  return { player: next, brokenShields, forcedSales, netWorthLost, paid: Math.min(want, netWorthLost), logs };
}
var MARKET_ASSETS = ["index", "equity", "smallcap", "crypto"];
function shiftMarketHoldings(player, pct) {
  const holdings = getHoldings(player).map(
    (h) => MARKET_ASSETS.includes(h.asset) ? { ...h, value: Math.max(0, Math.round(h.value * (1 + pct / 100))) } : h
  ).filter((h) => h.value > 0);
  return syncWealth({ ...player, holdings });
}
var INVEST_FRACTION = {
  common: 0.35,
  rare: 0.5,
  epic: 0.65,
  legendary: 0.75
};
var MIN_INVEST_CASH = 1e3;
function addHolding(player, asset, name, amount, round) {
  const holdings = getHoldings(player);
  const existing = holdings.find((h) => h.asset === asset);
  const next = existing ? holdings.map((h) => h === existing ? { ...h, principal: h.principal + amount, value: h.value + amount } : h) : [...holdings, { id: newId(), asset, name, principal: amount, value: amount, boughtRound: round, lastChangePct: 0 }];
  return syncWealth({ ...player, cash: getCash(player) - amount, holdings: next });
}
function rollMarket(meanBoost = 1) {
  const out = {};
  for (const info of Object.values(ASSETS)) {
    let pct;
    if (info.crashChance > 0 && rand() < info.crashChance) {
      pct = -info.crashPct;
    } else {
      pct = info.meanPct * meanBoost + (rand() * 2 - 1) * info.swingPct;
    }
    out[info.id] = Math.round(pct * 10) / 10;
  }
  return out;
}
function applyMarketToPlayer(player, changes) {
  const wiped = [];
  const holdings = [];
  for (const h of getHoldings(player)) {
    const pct = changes[h.asset] ?? 0;
    const value = Math.max(0, Math.round(h.value * (1 + pct / 100)));
    if (value <= h.principal * 0.01) {
      wiped.push(h);
      continue;
    }
    holdings.push({ ...h, value, lastChangePct: pct });
  }
  return { player: syncWealth({ ...player, holdings }), wiped };
}
function inflationPct(player) {
  const level = Math.min(MAX_LIFESTYLE_LEVEL, player.lifestyleLevel ?? 0);
  return BASE_INFLATION_PCT + level * LIFESTYLE_INFLATION_STEP_PCT;
}
function applyInflation(player) {
  const cash = getCash(player);
  const lost = Math.max(0, Math.round(cash * inflationPct(player) / 100));
  return { player: syncWealth({ ...player, cash: cash - lost }), lost };
}
function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

// src/lib/learning.ts
function emptyStats(startNetWorth) {
  const start = Math.round(startNetWorth);
  return {
    saves: 0,
    spends: 0,
    invests: 0,
    investedByAsset: {},
    inflationLost: 0,
    forcedSales: 0,
    exitPenaltiesPaid: 0,
    attacksBlocked: 0,
    attacksTaken: 0,
    lossesTaken: 0,
    speculativeLosses: 0,
    maxSaveStreak: 0,
    peakNetWorth: start,
    netWorthByRound: [start],
    conceptsTriggered: [],
    currentSaveStreak: 0,
    defensesEquipped: 0,
    forcedSaleLog: [],
    hits: [],
    cashShareByRound: [1],
    worstMarketDrop: null
  };
}
function addConcepts(stats, ids) {
  const seen = new Set(stats.conceptsTriggered);
  const added = ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return added.length ? { ...stats, conceptsTriggered: [...stats.conceptsTriggered, ...added] } : stats;
}
var TEXT_CONCEPTS = [
  [/credit card/i, "credit_card_debt"],
  [/\btax|80C|ELSS/i, "tax_saving"],
  [/\bloans?\b|\bEMIs?\b|BNPL|\bborrow|\bdebt\b(?! fund)/i, "good_vs_bad_debt"],
  [/term (life )?(insurance|plan|cover)|life insurance|life cover/i, "term_insurance"],
  [/health insurance|mediclaim|health cover/i, "health_insurance"],
  [/\bscam|ponzi|chit fund|double[- ]your[- ]money/i, "scams"],
  [/phishing|\bOTP\b|hack|cyber|UPI fraud|2FA|two-factor/i, "cyber_safety"],
  [/\bSIP\b/, "sip"]
];
function conceptsFromText(text, isDefense = false) {
  const out = TEXT_CONCEPTS.filter(([re]) => re.test(text)).map(([, id]) => id);
  if (isDefense && /emergency/i.test(text)) out.push("emergency_fund");
  return out;
}
function assetConcepts(asset) {
  switch (asset) {
    case "index":
      return ["index_funds", "sip"];
    case "equity":
      return ["sip"];
    case "smallcap":
      return ["asset_risk"];
    case "crypto":
      return ["crypto_risk", "asset_risk"];
    case "scam":
      return ["scams"];
    case "gold":
      return ["gold"];
    case "realestate":
      return ["real_estate"];
    case "fd":
      return ["fd_vs_inflation"];
    case "debt":
      return ["tax_saving"];
  }
}
function categoryConcepts(card) {
  switch (card.category) {
    case "medical":
      return ["health_insurance"];
    case "fraud":
      return ["cyber_safety"];
    case "tax":
      return ["tax_saving"];
    case "debt":
      return ["good_vs_bad_debt"];
    default:
      return [];
  }
}
function speculativeValue(player) {
  return getHoldings(player).filter((h) => h.asset === "crypto" || h.asset === "scam").reduce((s, h) => s + h.value, 0);
}
function cashShare(player) {
  const nw = getNetWorth(player);
  return nw > 0 ? Math.round(getCash(player) / nw * 1e3) / 1e3 : 0;
}

// src/lib/levelRules.ts
var RULE_TUNING = {
  desire: {
    max: 100,
    plannedThreshold: 50,
    yearlyRise: 20,
    resistRise: 10,
    /** A whim (Spend below the planned threshold) only lowers the meter this much */
    whimDrop: 30,
    /** Impulse splurge: % of net worth lost, meter falls back to this */
    impulsePct: 15,
    afterImpulse: 40
  },
  streak: {
    cap: 5,
    /** Auto-SIP per streak level, as a share of the starting corpus */
    sipStepShare: 0.02
  },
  creep: {
    /** Yearly take-home salary as a share of the starting corpus */
    salaryShare: 0.12,
    raisePct: 10,
    startLifestylePct: 45,
    creepPerYear: 5,
    spendCreep: 12,
    saveCut: 10,
    minLifestylePct: 30,
    slots: 3
  },
  grihastha: {
    /** [goal, due year, amount as share of starting corpus] */
    goals: [
      ["home", 4, 0.25],
      ["education", 7, 0.2],
      ["parents_health", 9, 0]
    ],
    /** Parents' hospital bill, % of net worth */
    bossPct: 20,
    insuredShare: 0.2,
    /** Goal due without enough cash: extra cost on the shortfall, % (rushed sale / stop-gap loan) */
    rushPct: 20,
    /** Health-insurance cards added to the level deck so cover is always findable */
    extraInsuranceCards: 3
  },
  stars: {
    /** L2 habit: best streak at least this long */
    streakBest: 6,
    /** L3 habit: lifestyle share of salary at or below this at the end */
    lifestyleMaxPct: 60,
    /** Report-card average (A=4 … D=1) needed for the 3rd star */
    reportAverage: 3
  }
};
var MAX_RULE_EVENTS = 10;
var GOAL_WARNING_YEARS = 2;
function activeRule(state) {
  if (!state.levelConfig || !state.levelState) return null;
  return state.levelState.rule ?? null;
}
function ruleHumanIndex(state) {
  return state.players.findIndex((p) => !p.isBot && !p.hasForfeited);
}
function pushEvent(ls, ev) {
  return { ...ls, ruleEvents: [ev, ...ls.ruleEvents ?? []].slice(0, MAX_RULE_EVENTS) };
}
function setPlayer(state, idx, p) {
  return { ...state, players: state.players.map((x, i) => i === idx ? p : x) };
}
function optionAsset(option) {
  return option.asset ?? inferAsset(option.investRisk);
}
function slotsUsed(player) {
  return [...new Set(getHoldings(player).map((h) => h.asset))];
}
var GOAL_SAFE_ASSETS = ["fd", "debt"];
function readyMoney(player) {
  return getCash(player) + getHoldings(player).filter((h) => GOAL_SAFE_ASSETS.includes(h.asset)).reduce((s, h) => s + h.value, 0);
}
function withdrawSafe(player, amount) {
  let left = amount;
  const cash = getCash(player);
  const fromCash = Math.min(cash, left);
  left -= fromCash;
  const take = {};
  for (const asset of GOAL_SAFE_ASSETS) {
    for (const h of getHoldings(player)) {
      if (h.asset !== asset || left <= 0) continue;
      take[h.id] = Math.min(h.value, left);
      left -= take[h.id];
    }
  }
  const holdings = getHoldings(player).map((h) => take[h.id] ? { ...h, value: h.value - take[h.id], principal: Math.max(0, h.principal - take[h.id]) } : h).filter((h) => h.value > 0);
  return addCash({ ...player, cash: cash - fromCash, holdings }, 0);
}
function hasHealthCover(player) {
  return player.activeDefenses.some((d) => d.type === "defense" && !!d.blocksCategories?.includes("medical"));
}
var GOAL_NAMES = {
  home: { en: "Home down payment", hi: "घर का डाउन पेमेंट" },
  education: { en: "Kids' education fund", hi: "बच्चों की पढ़ाई का फंड" },
  parents_health: { en: "Parents' health", hi: "माता-पिता का स्वास्थ्य" }
};
function familyGoalName(id, hindi = false) {
  return hindi ? GOAL_NAMES[id].hi : GOAL_NAMES[id].en;
}
function levelDecisionBlock(state, playerIndex, option) {
  if (activeRule(state) !== "lifestyle_creep" || option.type !== "invest") return void 0;
  const player = state.players[playerIndex];
  if (!player || player.isBot || playerIndex !== ruleHumanIndex(state)) return void 0;
  const slots = state.levelState?.creep?.slots ?? RULE_TUNING.creep.slots;
  const used = slotsUsed(player);
  const asset = optionAsset(option);
  if (used.includes(asset) || used.length < slots) return void 0;
  return `All ${slots} investment slots are full — add to an investment you already hold`;
}
function noteBlockedDecision(state) {
  const ls = state.levelState;
  if (!ls?.creep) return state;
  const round = state.round ?? 1;
  const next = pushEvent({ ...ls, creep: { ...ls.creep, blockedInvests: ls.creep.blockedInvests + 1 } }, {
    round,
    kind: "slots_full",
    key: "campaign.events.slots_full",
    params: { n: ls.creep.slots },
    text: `All ${ls.creep.slots} investment slots are full.`,
    textHi: `सभी ${ls.creep.slots} निवेश स्लॉट भरे हैं।`
  });
  return { ...state, levelState: next };
}
function applyLevelDecision(state, playerIndex, choice, before) {
  const none = { state, lines: [], forcedSales: [], playerIndex: -1 };
  const rule = activeRule(state);
  if (!rule || playerIndex !== ruleHumanIndex(state)) return none;
  let ls = state.levelState;
  let s = state;
  const lines = [];
  const round = state.round ?? 1;
  const resist = choice === "save" || choice === "invest";
  if (rule === "desire_meter" && ls.desire) {
    const d = ls.desire;
    if (resist) {
      const value = Math.min(d.max, d.value + d.resistRise);
      ls = { ...ls, desire: { ...d, value } };
      if (value >= d.max) {
        lines.push(`🌙 Desire Meter full (${value}) — plan a treat now or you'll splurge on impulse next year.`);
        ls = pushEvent(ls, {
          round,
          kind: "desire_warning",
          key: "campaign.events.desire_warning",
          text: "Desire Meter is full — plan a treat now, or next year you splurge on impulse.",
          textHi: "इच्छा मीटर भर गया — अभी सोच-समझकर खर्च करें, वरना अगले साल अचानक फिज़ूलखर्ची होगी।"
        });
      }
    } else if (choice === "spend") {
      if (d.value >= d.plannedThreshold) {
        const p = s.players[playerIndex];
        s = setPlayer(s, playerIndex, { ...p, lifestyleLevel: before.lifestyleLevel ?? 0 });
        ls = pushEvent({ ...ls, desire: { ...d, value: 0, plannedTreats: d.plannedTreats + 1 } }, {
          round,
          kind: "planned_treat",
          key: "campaign.events.planned_treat",
          text: "Planned treat! You enjoyed it without guilt — the Desire Meter is back to 0.",
          textHi: "योजना वाला खर्च! बिना पछतावे के मज़ा लिया — इच्छा मीटर फिर 0 पर।"
        });
        lines.push("🎁 Planned treat — Desire Meter back to 0, no lifestyle creep.");
      } else {
        ls = { ...ls, desire: { ...d, value: Math.max(0, d.value - RULE_TUNING.desire.whimDrop) } };
        lines.push("🛍️ A whim, not a plan — the Desire Meter only dropped a little.");
      }
    }
  } else if (rule === "saving_streak" && ls.streak) {
    const st = ls.streak;
    if (resist) {
      const current = st.current + 1;
      ls = { ...ls, savingStreak: current, streak: { ...st, current, best: Math.max(st.best, current) } };
      lines.push(`🔥 Pay-yourself-first streak: ${current} year${current > 1 ? "s" : ""}`);
    } else if (choice === "spend" && st.current > 0) {
      ls = pushEvent({ ...ls, savingStreak: 0, streak: { ...st, current: 0, breaks: st.breaks + 1 } }, {
        round,
        kind: "streak_broken",
        key: "campaign.events.streak_broken",
        params: { n: st.current },
        text: `Streak of ${st.current} broken — your Auto-SIP bonus is gone.`,
        textHi: `${st.current} की लय टूट गई — ऑटो-SIP बोनस गया।`
      });
      lines.push(`💔 Streak of ${st.current} broken — the Auto-SIP bonus resets.`);
    }
  } else if (rule === "lifestyle_creep" && ls.creep) {
    const c = ls.creep;
    if (choice === "spend") {
      const pct = c.lifestylePct + c.spendCreep;
      ls = { ...ls, lifestyleCreep: pct, creep: { ...c, lifestylePct: pct, peakLifestylePct: Math.max(c.peakLifestylePct, pct) } };
      lines.push(`📈 Lifestyle now eats ${pct}% of your salary.`);
    } else if (choice === "save") {
      const pct = Math.max(c.minLifestylePct, c.lifestylePct - c.saveCut);
      ls = { ...ls, lifestyleCreep: pct, creep: { ...c, lifestylePct: pct } };
      lines.push(`✂️ Budget review: lifestyle down to ${pct}% of salary.`);
    }
  }
  return { state: { ...s, levelState: ls }, lines, forcedSales: [], playerIndex };
}
function applyLevelRoundStart(state) {
  const rule = activeRule(state);
  const idx = ruleHumanIndex(state);
  if (!rule || idx < 0) return { state, lines: [], forcedSales: [], playerIndex: -1 };
  const round = state.round ?? 1;
  let ls = state.levelState;
  let p = state.players[idx];
  const lines = [];
  const forcedSales = [];
  const brokenShields = [];
  const loss = (amount) => {
    const res = applyLoss(p, amount);
    p = res.player;
    forcedSales.push(...res.forcedSales);
    brokenShields.push(...res.brokenShields);
    lines.push(...res.logs);
    return res;
  };
  if (rule === "desire_meter" && ls.desire) {
    const d = ls.desire;
    const value = d.value + d.yearlyRise;
    if (value >= d.max) {
      const want = Math.round(getNetWorth(p) * RULE_TUNING.desire.impulsePct / 100);
      const res = loss(want);
      p = { ...p, lifestyleLevel: Math.min(MAX_LIFESTYLE_LEVEL, (p.lifestyleLevel ?? 0) + 1) };
      ls = pushEvent({
        ...ls,
        desire: { ...d, value: RULE_TUNING.desire.afterImpulse, impulseSplurges: d.impulseSplurges + 1, impulseLost: d.impulseLost + res.netWorthLost }
      }, {
        round,
        kind: "impulse_splurge",
        key: "campaign.events.impulse_splurge",
        params: { amount: formatINR(res.netWorthLost) },
        text: `Impulse splurge! Bottled-up wants burst out: ${formatINR(res.netWorthLost)} gone, and your lifestyle crept up.`,
        textHi: `अचानक फिज़ूलखर्ची! दबी इच्छाएँ फूट पड़ीं: ${formatINR(res.netWorthLost)} गए, और खर्च की आदत बढ़ गई।`,
        amount: res.netWorthLost
      });
      lines.push(`🌕 Impulse splurge! The Desire Meter maxed out — ${p.name} lost ${formatINR(res.netWorthLost)}.`);
    } else {
      ls = { ...ls, desire: { ...d, value } };
      if (value >= d.max - d.yearlyRise) {
        lines.push(`🌙 Desire Meter at ${value} — a planned treat now beats a splurge later.`);
        ls = pushEvent(ls, {
          round,
          kind: "desire_warning",
          key: "campaign.events.desire_warning",
          text: "Desire Meter is high — plan a treat now, or next year you splurge on impulse.",
          textHi: "इच्छा मीटर ऊँचा है — अभी सोच-समझकर खर्च करें, वरना अगले साल अचानक फिज़ूलखर्ची होगी।"
        });
      }
    }
  } else if (rule === "saving_streak" && ls.streak) {
    const st = ls.streak;
    if (st.current > 0) {
      const sip = Math.min(st.current, st.cap) * st.sipStep;
      p = addHolding(addCash(p, sip), "index", "Auto-SIP", sip, round);
      ls = pushEvent({ ...ls, streak: { ...st, autoSipTotal: st.autoSipTotal + sip } }, {
        round,
        kind: "auto_sip",
        key: "campaign.events.auto_sip",
        params: { amount: formatINR(sip), n: st.current },
        text: `Auto-SIP: ${formatINR(sip)} went into your index fund (streak ${st.current}).`,
        textHi: `ऑटो-SIP: ${formatINR(sip)} आपके इंडेक्स फंड में गए (लय ${st.current})।`,
        amount: sip
      });
      lines.push(`🔁 Auto-SIP: ${formatINR(sip)} into ${p.name}'s index fund (streak ${st.current}).`);
    }
  } else if (rule === "lifestyle_creep" && ls.creep) {
    const c = ls.creep;
    const salary = Math.round(c.salary * (1 + c.raisePct / 100));
    const pct = c.lifestylePct + c.creepPerYear;
    const left = Math.round(salary * (1 - pct / 100));
    if (left >= 0) p = addCash(p, left);
    else loss(-left);
    ls = pushEvent({
      ...ls,
      lifestyleCreep: pct,
      creep: { ...c, salary, lifestylePct: pct, peakLifestylePct: Math.max(c.peakLifestylePct, pct), savedFromSalary: c.savedFromSalary + left }
    }, {
      round,
      kind: "salary",
      key: "campaign.events.salary",
      params: { salary: formatINR(salary), pct, left: formatINR(left) },
      text: `Raise! Salary ${formatINR(salary)}, lifestyle takes ${pct}% — ${formatINR(left)} left for you.`,
      textHi: `इन्क्रीमेंट! वेतन ${formatINR(salary)}, खर्च ${pct}% — आपके लिए ${formatINR(left)} बचे।`,
      amount: left
    });
    lines.push(`💼 Salary ${formatINR(salary)} (+${c.raisePct}%), lifestyle ${pct}% → ${left >= 0 ? "+" : "-"}${formatINR(Math.abs(left))} for ${p.name}`);
  } else if (rule === "grihastha" && ls.family) {
    const fam = ls.family;
    let insuredAtBoss = fam.insuredAtBoss;
    const goals = fam.goals.map((g) => {
      if (g.status !== "pending" || g.dueRound !== round) return g;
      const name = familyGoalName(g.id);
      if (g.id === "parents_health") {
        const insured = hasHealthCover(p);
        insuredAtBoss = insured;
        const bill = Math.round(getNetWorth(p) * fam.bossPct / 100);
        const pay = insured ? Math.round(bill * fam.insuredShare) : bill;
        const sold = forcedSales.length;
        const res = loss(pay);
        const status2 = insured && forcedSales.length === sold ? "met" : "strained";
        lines.push(insured ? `🏥 Boss event: parents in hospital — insurance paid most of the ${formatINR(bill)} bill; you paid ${formatINR(res.netWorthLost)}.` : `🏥 Boss event: parents in hospital — no health cover, you paid ${formatINR(res.netWorthLost)}.`);
        ls = pushEvent(ls, {
          round,
          kind: "boss",
          key: insured ? "campaign.events.boss_insured" : "campaign.events.boss_uninsured",
          params: { bill: formatINR(bill), paid: formatINR(res.netWorthLost) },
          text: insured ? `Parents in hospital: the bill was ${formatINR(bill)}, insurance paid most — you paid ${formatINR(res.netWorthLost)}.` : `Parents in hospital with no health cover: you paid the full ${formatINR(res.netWorthLost)}.`,
          textHi: insured ? `माता-पिता अस्पताल में: बिल ${formatINR(bill)}, ज़्यादातर बीमे ने भरा — आपने ${formatINR(res.netWorthLost)} दिए।` : `माता-पिता अस्पताल में, कोई स्वास्थ्य बीमा नहीं: पूरे ${formatINR(res.netWorthLost)} आपने भरे।`,
          amount: res.netWorthLost
        });
        return { ...g, amount: bill, paid: res.netWorthLost, status: status2 };
      }
      const readyBefore = readyMoney(p);
      p = withdrawSafe(p, g.amount);
      const fromReady = Math.min(g.amount, readyBefore);
      const shortfall = g.amount - fromReady;
      let paid = fromReady;
      if (shortfall > 0) {
        const res = loss(shortfall);
        paid += res.paid;
        const rush = loss(Math.round(shortfall * fam.rushPct / 100));
        if (rush.netWorthLost > 0) lines.push(`💸 Rushing to raise ${formatINR(shortfall)} cost an extra ${formatINR(rush.netWorthLost)}.`);
      }
      if (g.id === "home" && paid > 0) {
        p = addHolding(addCash(p, paid), "realestate", "Family Home", paid, round);
      }
      const status = paid < g.amount ? "missed" : shortfall === 0 ? "met" : "strained";
      const key = status === "met" ? "goal_met" : "goal_strained";
      ls = pushEvent(ls, {
        round,
        kind: key,
        key: `campaign.events.${key}_${g.id}`,
        params: { amount: formatINR(g.amount) },
        text: status === "met" ? `${name} paid from ready money: ${formatINR(g.amount)}. Well planned!` : `${name} due and not enough ready money — investments were sold in a hurry.`,
        textHi: status === "met" ? `${familyGoalName(g.id, true)} तैयार पैसे से भरा: ${formatINR(g.amount)}। बढ़िया योजना!` : `${familyGoalName(g.id, true)} का समय आया पर तैयार पैसा कम था — निवेश जल्दबाज़ी में बेचने पड़े।`,
        amount: g.amount
      });
      lines.push(status === "met" ? `🏡 ${name}: ${formatINR(g.amount)} paid from cash / FD / debt fund.` : `⚠️ ${name}: ${formatINR(g.amount)} due — not enough ready money, investments sold.`);
      return { ...g, paid, status };
    });
    for (const g of goals) {
      const n = g.dueRound - round;
      if (g.status !== "pending" || n < 1 || n > GOAL_WARNING_YEARS) continue;
      const amountText = g.id === "parents_health" ? `${fam.bossPct}%` : formatINR(g.amount);
      const when = n === 1 ? "Next year" : `In ${n} years`;
      const whenHi = n === 1 ? "अगले साल" : `${n} साल में`;
      lines.push(`📌 ${when}: ${familyGoalName(g.id)} (${amountText}) — ${g.id === "parents_health" ? "keep health insurance equipped" : "keep cash / FD / debt fund ready"}.`);
      ls = pushEvent(ls, {
        round,
        kind: "goal_due_soon",
        key: `campaign.events.due_soon_${g.id}`,
        params: { amount: amountText, n },
        text: `${when}: ${familyGoalName(g.id)} (${amountText}).`,
        textHi: `${whenHi}: ${familyGoalName(g.id, true)} (${amountText})।`
      });
    }
    ls = { ...ls, bossTriggered: ls.bossTriggered || insuredAtBoss !== null, family: { ...fam, goals, insuredAtBoss } };
  }
  let s = setPlayer({ ...state, levelState: ls }, idx, p);
  if (brokenShields.length) s = { ...s, discardPile: [...s.discardPile, ...brokenShields] };
  return { state: s, lines, forcedSales, playerIndex: idx };
}
function canWinByTarget(state, player) {
  return !state.levelConfig || !player.isBot;
}
var HABIT_LABELS = {
  desire_meter: {
    label: "Enjoy at least one planned treat and never splurge on impulse",
    labelHi: "कम से कम एक योजना वाला खर्च करें और कभी अचानक फिज़ूलखर्ची न हो"
  },
  saving_streak: {
    label: `Reach a pay-yourself-first streak of ${RULE_TUNING.stars.streakBest} years`,
    labelHi: `${RULE_TUNING.stars.streakBest} साल की "पहले खुद को भुगतान" लय बनाएँ`
  },
  lifestyle_creep: {
    label: `Finish with lifestyle at or below ${RULE_TUNING.stars.lifestyleMaxPct}% of salary`,
    labelHi: `अंत में खर्च वेतन के ${RULE_TUNING.stars.lifestyleMaxPct}% या कम रखें`
  },
  grihastha: {
    label: "Meet every family goal: home and education from cash, parents insured",
    labelHi: "हर पारिवारिक लक्ष्य पूरा करें: घर और पढ़ाई नकद से, माता-पिता बीमित"
  }
};

// src/lib/gameEngine.ts
var STARTING_WEALTH = 5e5;
var TIME_LIMIT_MS = 20 * 60 * 1e3;
var CAMPAIGN_TIME_LIMIT_MS = 45 * 60 * 1e3;
var TURN_TIME_LIMIT_MS = 6e4;
var HAND_SIZE = 5;
var MAX_ROUNDS = 20;
var MAX_ACTIVE_DEFENSES = 3;
var SAVE_STREAK_CAP = 3;
var LIFE_EVENT_CHANCE = 0.5;
var LOG_MAX = 20;
function pushLogs(log, ...newestFirst) {
  return [...newestFirst, ...log].slice(0, LOG_MAX);
}
function ensureStats(player, state) {
  if (player.stats) return player;
  const start = getStartingWealth(state);
  const stats = emptyStats(start);
  return { ...player, stats: { ...stats, peakNetWorth: Math.max(start, getNetWorth(player)) } };
}
function patchStats(player, state, fn) {
  const p = ensureStats(player, state);
  return { ...p, stats: fn(p.stats, p) };
}
function withConcepts(s, ids) {
  return ids.length ? addConcepts(s, ids) : s;
}
function recordForcedSales(s, sales, round) {
  if (!sales.length) return s;
  const next = {
    ...s,
    forcedSales: s.forcedSales + sales.length,
    exitPenaltiesPaid: s.exitPenaltiesPaid + sales.reduce((sum, x) => sum + x.penalty, 0),
    forcedSaleLog: [...s.forcedSaleLog ?? [], ...sales.map((x) => ({ asset: x.asset, round, sold: x.sold, penalty: x.penalty, penaltyPct: x.penaltyPct }))]
  };
  const ids = ["emergency_fund", "liquidity"];
  if (sales.some((x) => x.asset === "realestate")) ids.push("real_estate");
  return addConcepts(next, ids);
}
function diversificationConcepts(p) {
  return new Set(getHoldings(p).map((h) => h.asset)).size >= 3 ? ["diversification"] : [];
}
function trackPeaks(state) {
  let changed = false;
  const players = state.players.map((p) => {
    const q = ensureStats(p, state);
    const nw = getNetWorth(q);
    if (q === p && nw <= q.stats.peakNetWorth) return p;
    changed = true;
    return { ...q, stats: { ...q.stats, peakNetWorth: Math.max(q.stats.peakNetWorth, nw) } };
  });
  return changed ? { ...state, players } : state;
}
function recordRoundEnd(state) {
  return {
    ...state,
    players: state.players.map((p) => {
      if (p.hasForfeited) return p;
      return patchStats(p, state, (s) => {
        const nw = getNetWorth(p);
        return {
          ...s,
          netWorthByRound: [...s.netWorthByRound, nw],
          cashShareByRound: [...s.cashShareByRound ?? [], cashShare(p)],
          peakNetWorth: Math.max(s.peakNetWorth, nw)
        };
      });
    })
  };
}
function recordFinal(state) {
  const round = state.round ?? 1;
  return {
    ...state,
    players: state.players.map((p) => {
      const q = ensureStats(p, state);
      if (q.stats.netWorthByRound.length > round) return q;
      return patchStats(q, state, (s) => ({
        ...s,
        netWorthByRound: [...s.netWorthByRound, getNetWorth(q)],
        cashShareByRound: [...s.cashShareByRound ?? [], cashShare(q)]
      }));
    })
  };
}
function recordHit(s, card, round, o) {
  const penalties = o.sales.reduce((sum, x) => sum + x.penalty, 0);
  const lossBefore = Math.max(0, o.lost - penalties);
  let next = recordForcedSales(s, o.sales, round);
  const ids = [...categoryConcepts(card), ...conceptsFromText(`${card.name} ${card.flavor ?? ""}`)];
  if (card.category === "market" && o.heldMarket) ids.push("market_patience");
  if (card.lureAsset) ids.push(...assetConcepts(card.lureAsset).filter((c) => c === "scams" || c === "crypto_risk"));
  if (o.specLost > 0) ids.push("asset_risk");
  next = withConcepts(next, ids);
  next = { ...next, speculativeLosses: next.speculativeLosses + Math.max(0, Math.round(o.specLost)) };
  const landed = !o.blocked && (lossBefore > 0 || o.skipped || o.lured);
  if (!o.blocked && !landed) return next;
  return {
    ...next,
    attacksBlocked: next.attacksBlocked + (o.blocked ? 1 : 0),
    attacksTaken: next.attacksTaken + (landed ? 1 : 0),
    lossesTaken: next.lossesTaken + (o.blocked ? 0 : lossBefore),
    hits: [...next.hits ?? [], {
      name: card.name,
      nameHi: card.nameHi,
      round,
      amount: o.blocked ? 0 : lossBefore,
      category: card.category,
      blocked: o.blocked,
      lifeEvent: !!card.lifeEvent,
      lureAsset: card.lureAsset
    }]
  };
}
var holdsMarket = (p) => getHoldings(p).some((h) => MARKET_ASSETS.includes(h.asset));
function splitLifeEvents(cards) {
  return { deck: cards.filter((c) => !c.lifeEvent), events: cards.filter((c) => c.lifeEvent) };
}
function buildEventDeck(events) {
  return shuffle([...events, ...BUILTIN_LIFE_EVENTS.map((c) => ({ ...c, id: `${c.id}_ev` }))]);
}
function newEconomyState(cards, isCampaign) {
  const { deck, events } = splitLifeEvents(cards);
  return {
    deck,
    eventDeck: buildEventDeck(events),
    round: 1,
    lastEvent: null,
    lastMarketTick: null,
    equippedThisTurn: false,
    maxRounds: isCampaign ? void 0 : MAX_ROUNDS,
    roundNews: null
  };
}
function refillDeck(state) {
  const onlyDefenseLeftInDeck = state.deck.length > 0 && state.deck.every((c) => c.type === "defense");
  if (state.deck.length > 0 && !onlyDefenseLeftInDeck) return state;
  if (state.discardPile.length > 0) {
    const shuffled = shuffle([...state.deck, ...state.discardPile.filter((c) => !c.lifeEvent)]);
    if (!shuffled.every((c) => c.type === "defense")) {
      return { ...state, deck: shuffled, discardPile: [], log: pushLogs(state.log, "Deck reshuffled.") };
    }
  }
  const fresh = splitLifeEvents(createGameDeck()).deck.map((c) => ({ ...c, id: `${c.id}_${newId().slice(0, 6)}` }));
  return { ...state, deck: fresh, discardPile: [], log: pushLogs(state.log, "Fresh deck created.") };
}
function drawCard(state, playerIndex) {
  const ready = refillDeck(state);
  const deck = [...ready.deck];
  const player = ready.players[playerIndex];
  const activeOpponents = ready.players.filter((p, i) => i !== playerIndex && !p.hasForfeited);
  const leaderWealth = activeOpponents.length > 0 ? Math.max(...activeOpponents.map((p) => p.wealth)) : 0;
  const isUnderdog = activeOpponents.length > 0 && activeOpponents.every((p) => p.wealth > player.wealth) && player.wealth < leaderWealth * 0.5;
  let cardIndexToDraw = 0;
  if (isUnderdog && deck.length >= 3) {
    const peek = deck.slice(0, 3);
    const strongCardIdx = peek.findIndex((c) => c.type === "action" && (c.tier === "epic" || c.tier === "legendary"));
    if (strongCardIdx !== -1) {
      cardIndexToDraw = strongCardIdx;
    }
  }
  const card = deck[cardIndexToDraw] ?? null;
  if (card) {
    deck.splice(cardIndexToDraw, 1);
  }
  const players = ready.players.map((p, i) => {
    if (i !== playerIndex || !card) return p;
    return { ...p, hand: [...p.hand, card] };
  });
  return {
    state: { ...ready, players, deck, drawnCard: card },
    card
  };
}
function startDrawPhase(state, playerIndex) {
  let currentState = state;
  let lastDrawnCard = null;
  let guard = 0;
  while (currentState.players[playerIndex].hand.length < HAND_SIZE && guard++ < HAND_SIZE) {
    const res = drawCard(currentState, playerIndex);
    currentState = res.state;
    if (!res.card) break;
    lastDrawnCard = res.card;
  }
  return { state: currentState, card: lastDrawnCard };
}
function setWealthWithFloor(player, proposedWealth) {
  const current = getNetWorth(player);
  const proposed = Math.round(proposedWealth);
  if (proposed >= current) return { player: addCash(player, proposed - current), brokenShields: [] };
  const res = applyLoss(player, current - proposed);
  return { player: res.player, brokenShields: res.brokenShields };
}
function canEquip(state, playerIndex, card) {
  const p = state.players[playerIndex];
  if (!p || state.equippedThisTurn) return false;
  if (card && card.type !== "defense") return false;
  return p.activeDefenses.length < MAX_ACTIVE_DEFENSES;
}
function equipDefense(state, playerIndex, card) {
  if (!canEquip(state, playerIndex, card)) return state;
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p;
    const hand = p.hand.filter((c) => c.id !== card.id);
    const activeDefenses = [...p.activeDefenses, card];
    const wealthFloor = card.effect?.type === "wealth_floor" ? Math.max(p.wealthFloor, card.effect.value ?? 0) : p.wealthFloor;
    const equipped = { ...p, hand, activeDefenses, wealthFloor };
    return patchStats(equipped, state, (st) => withConcepts(
      { ...st, defensesEquipped: (st.defensesEquipped ?? 0) + 1 },
      [
        // A broad "covers everything" defense teaches the emergency fund, not each category
        ...(card.blocksCategories?.length ?? 0) <= 2 ? (card.blocksCategories ?? []).flatMap((c) => categoryConcepts({ category: c })) : [],
        ...conceptsFromText(card.name, true)
      ]
    ));
  });
  return {
    ...state,
    players,
    equippedThisTurn: true,
    log: pushLogs(state.log, `🛡️ ${state.players[playerIndex].name} equipped ${card.name}`)
  };
}
function defenseBlocks(defense, incoming) {
  if (defense.type !== "defense") return false;
  if (incoming.category && defense.blocksCategories?.includes(incoming.category)) return true;
  const e = defense.effect;
  if (!e || e.type !== "block_card") return false;
  return !!(e.blocks?.includes("any") || e.blocks?.includes(incoming.name));
}
function isHarmful(card) {
  const e = card.effect;
  if (!e) return false;
  switch (e.type) {
    case "wealth_pct":
    case "wealth_change":
      return (e.value ?? 0) < 0;
    case "steal":
    case "steal_pct":
    case "attack_all_pct":
    case "market_crash_player":
    case "skip_turn":
      return true;
    default:
      return false;
  }
}
function tryBlock(player, incoming) {
  if (!isHarmful(incoming)) return { player, used: null };
  const def = player.activeDefenses.find((c) => defenseBlocks(c, incoming));
  if (!def) return { player, used: null };
  return { player: { ...player, activeDefenses: player.activeDefenses.filter((c) => c.id !== def.id) }, used: def };
}
function takeLoss(ctx, idx, amount) {
  const res = applyLoss(ctx.players[idx], amount);
  ctx.players[idx] = res.player;
  ctx.discarded.push(...res.brokenShields);
  ctx.logs.push(...res.logs);
  if (res.forcedSales.length) ctx.sales[idx] = [...ctx.sales[idx] ?? [], ...res.forcedSales];
  return res;
}
function applyEffect(state, effect, sourcePlayerIndex, targetPlayerIndex, card, exclude = /* @__PURE__ */ new Set()) {
  const ctx = { players: [...state.players], discarded: [], logs: [], sales: {} };
  const players = ctx.players;
  const isMarket = card?.category === "market";
  const source = players[sourcePlayerIndex];
  switch (effect.type) {
    case "wealth_change": {
      const val = Math.round(effect.value ?? 0);
      const doubled = source.doubleInvestActive && effect.target === "self" && val > 0 ? val * 2 : val;
      const idx = effect.target === "self" ? sourcePlayerIndex : targetPlayerIndex;
      if (doubled >= 0) players[idx] = addCash(players[idx], doubled);
      else takeLoss(ctx, idx, -doubled);
      break;
    }
    case "wealth_pct": {
      const pct = effect.value ?? 0;
      const idx = effect.target === "self" ? sourcePlayerIndex : targetPlayerIndex;
      if (isMarket) {
        players[idx] = shiftMarketHoldings(players[idx], pct);
      } else {
        const delta = Math.round(getNetWorth(players[idx]) * pct / 100);
        if (delta >= 0) players[idx] = addCash(players[idx], delta);
        else takeLoss(ctx, idx, -delta);
      }
      break;
    }
    case "wealth_next_turn": {
      const pending = { amount: Math.round(effect.value ?? 0), triggerAt: "next_turn", cardId: newId() };
      players[sourcePlayerIndex] = { ...source, pendingGains: [...source.pendingGains, pending] };
      break;
    }
    case "wealth_end_game": {
      const val = Math.round(effect.value ?? 0);
      const doubled = source.doubleInvestActive && val > 0 ? val * 2 : val;
      if (doubled >= 0) players[sourcePlayerIndex] = addCash(source, doubled);
      else takeLoss(ctx, sourcePlayerIndex, -doubled);
      break;
    }
    case "steal":
    case "steal_pct": {
      const targetNW = getNetWorth(players[targetPlayerIndex]);
      const amount = effect.type === "steal" ? Math.min(effect.value ?? 0, targetNW) : Math.round(targetNW * (effect.value ?? 0) / 100);
      const res = takeLoss(ctx, targetPlayerIndex, amount);
      players[sourcePlayerIndex] = addCash(players[sourcePlayerIndex], res.paid);
      break;
    }
    case "attack_all_pct": {
      const rawPct = effect.value ?? 0;
      const scaleFactor = players.length <= 2 ? 1 : players.length === 3 ? 0.8 : 0.65;
      const scaledPct = rawPct * scaleFactor;
      for (let i = 0; i < players.length; i++) {
        if (i === sourcePlayerIndex && !effect.includeSelf) continue;
        if (players[i].hasForfeited || exclude.has(i)) continue;
        if (isMarket) players[i] = shiftMarketHoldings(players[i], -scaledPct);
        else takeLoss(ctx, i, Math.round(getNetWorth(players[i]) * scaledPct / 100));
      }
      break;
    }
    case "skip_turn": {
      const target = players[targetPlayerIndex];
      players[targetPlayerIndex] = { ...target, skippedTurns: target.skippedTurns + (effect.value ?? 1) };
      break;
    }
    case "market_crash_player": {
      const pct = effect.value ?? 50;
      if (isMarket) players[targetPlayerIndex] = shiftMarketHoldings(players[targetPlayerIndex], -pct);
      else takeLoss(ctx, targetPlayerIndex, Math.round(getNetWorth(players[targetPlayerIndex]) * pct / 100));
      break;
    }
    case "wealth_floor": {
      players[sourcePlayerIndex] = { ...source, wealthFloor: Math.max(source.wealthFloor, effect.value ?? 0) };
      break;
    }
    case "double_invest": {
      players[sourcePlayerIndex] = { ...source, doubleInvestActive: true };
      break;
    }
  }
  return {
    state: {
      ...state,
      players,
      discardPile: ctx.discarded.length ? [...state.discardPile, ...ctx.discarded] : state.discardPile
    },
    logs: ctx.logs,
    sales: ctx.sales
  };
}
function getInvestAsset(option) {
  return option.asset ?? inferAsset(option.investRisk);
}
function resolveDecision(player, card, option, round) {
  const base = syncWealth(player);
  const nw = base.wealth;
  const e = option.effect;
  const logs = [];
  let brokenShields = [];
  let forcedSales = [];
  const loss = (p2, amount2) => {
    const res = applyLoss(p2, amount2);
    brokenShields = res.brokenShields;
    forcedSales = res.forcedSales;
    logs.push(...res.logs);
    return res.player;
  };
  const rawAmount = e.type === "wealth_pct" ? nw * (e.value ?? 0) / 100 : e.type === "wealth_change" ? e.value ?? 0 : NaN;
  if (option.type === "save") {
    const streak = Math.min(SAVE_STREAK_CAP, base.savingStreak + 1);
    const mult = 1 + streak * 0.05;
    let p2 = { ...base, savingStreak: streak };
    const amt = Number.isNaN(rawAmount) ? 0 : Math.round(rawAmount > 0 ? rawAmount * mult : rawAmount);
    p2 = amt >= 0 ? addCash(p2, amt) : loss(p2, -amt);
    if (streak > 1) logs.push(`🔥 Saving Streak x${streak}!`);
    return { player: p2, logs, brokenShields, investAmount: 0, forcedSales };
  }
  if (option.type === "spend") {
    let p2 = {
      ...base,
      savingStreak: 0,
      spendChoices: base.spendChoices + 1,
      lifestyleLevel: Math.min(MAX_LIFESTYLE_LEVEL, (base.lifestyleLevel ?? 0) + 1)
    };
    const amt = Number.isNaN(rawAmount) ? 0 : e.type === "wealth_pct" ? -Math.abs(Math.round(rawAmount)) : Math.round(rawAmount);
    p2 = amt >= 0 ? addCash(p2, amt) : loss(p2, -amt);
    return { player: p2, logs, brokenShields, investAmount: 0, forcedSales };
  }
  const asset = getInvestAsset(option);
  const cash = getCash(base);
  if (cash < MIN_INVEST_CASH) {
    return { player: base, logs, brokenShields, investAmount: 0, asset, forcedSales, disabled: `Need at least ${formatINR(MIN_INVEST_CASH)} cash to invest` };
  }
  const amount = Math.round(cash * INVEST_FRACTION[card.tier]);
  const p = addHolding({ ...base, savingStreak: 0, investChoices: base.investChoices + 1, doubleInvestActive: false }, asset, option.label && option.label !== "Invest" ? option.label : card.name, amount, round);
  return { player: p, logs, brokenShields, investAmount: amount, asset, forcedSales };
}
function previewDecision(state, playerIndex, card, choice) {
  const option = card.options?.find((o) => o.type === choice);
  const player = state.players[playerIndex];
  if (!option || !player) return { cashDelta: 0, investAmount: 0, netWorthDelta: 0, disabled: "Not available" };
  const blocked = levelDecisionBlock(state, playerIndex, option);
  if (blocked) return { cashDelta: 0, investAmount: 0, asset: getInvestAsset(option), netWorthDelta: 0, disabled: blocked };
  const out = resolveDecision(player, card, option, state.round ?? 1);
  return {
    cashDelta: getCash(out.player) - getCash(player),
    investAmount: out.investAmount,
    asset: out.asset,
    netWorthDelta: getNetWorth(out.player) - getNetWorth(player),
    disabled: out.disabled
  };
}
function assetLabel(asset) {
  return `${ASSETS[asset].emoji} ${ASSETS[asset].name}`;
}
function recordDecision(player, state, card, option, out) {
  const round = state.round ?? 1;
  return patchStats(player, state, (s0, p) => {
    let s = recordForcedSales(s0, out.forcedSales, round);
    const ids = [];
    if (option.type === "save") {
      const streak = (s.currentSaveStreak ?? 0) + 1;
      s = { ...s, saves: s.saves + 1, currentSaveStreak: streak, maxSaveStreak: Math.max(s.maxSaveStreak, streak) };
      if (streak >= 3) ids.push("pay_yourself_first");
    } else if (option.type === "spend") {
      s = { ...s, spends: s.spends + 1, currentSaveStreak: 0 };
      if ((p.lifestyleLevel ?? 0) >= 2) ids.push("lifestyle_creep");
    } else {
      const asset = out.asset ?? getInvestAsset(option);
      s = {
        ...s,
        invests: s.invests + 1,
        currentSaveStreak: 0,
        investedByAsset: { ...s.investedByAsset, [asset]: (s.investedByAsset[asset] ?? 0) + out.investAmount }
      };
      ids.push(...assetConcepts(asset), ...diversificationConcepts(p));
    }
    ids.push(...conceptsFromText(`${card.name} ${card.flavor ?? ""} ${option.label} ${option.description ?? ""}`));
    return withConcepts(s, ids);
  });
}
function processDecision(state, playerIndex, choice, card) {
  const option = card.options?.find((o) => o.type === choice);
  if (!option) return state;
  const player = state.players[playerIndex];
  const blocked = levelDecisionBlock(state, playerIndex, option);
  if (blocked) return noteBlockedDecision({ ...state, log: pushLogs(state.log, `⚠️ ${blocked}`) });
  const oldNW = getNetWorth(player);
  const out = resolveDecision(player, card, option, state.round ?? 1);
  if (out.disabled) {
    return { ...state, log: pushLogs(state.log, `⚠️ ${out.disabled}`) };
  }
  const decided = recordDecision(out.player, state, card, option, out);
  let newState = {
    ...state,
    players: state.players.map((p, i) => i === playerIndex ? decided : p),
    discardPile: out.brokenShields.length ? [...state.discardPile, ...out.brokenShields] : state.discardPile
  };
  const logs = [...out.logs];
  if (choice === "spend") {
    const drawResult = drawCard(newState, playerIndex);
    newState = drawResult.state;
    if (drawResult.card) logs.push(`🃏 Drew a free card!`);
  }
  const diff = getNetWorth(newState.players[playerIndex]) - oldNW;
  const diffStr = diff > 0 ? ` (+₹${Math.abs(diff).toLocaleString()})` : diff < 0 ? ` (-₹${Math.abs(diff).toLocaleString()})` : "";
  let logEntry = `${player.name} played ${card.name} → ${choice.toUpperCase()}${diffStr}`;
  if (choice === "invest" && out.asset) logEntry += ` — ${formatINR(out.investAmount)} moved into ${assetLabel(out.asset)}`;
  const ruled = applyLevelDecision(newState, playerIndex, choice, player);
  newState = ruled.state;
  logs.push(...ruled.lines);
  const hand = newState.players[playerIndex].hand.filter((c) => c.id !== card.id);
  const updatedPlayers = newState.players.map((p, i) => i === playerIndex ? { ...p, hand } : p);
  return checkWinCondition({
    ...newState,
    players: updatedPlayers,
    discardPile: [...newState.discardPile, card],
    playedCard: card,
    pendingDecision: null,
    log: pushLogs(newState.log, logEntry, ...logs)
  });
}
function processAction(state, playerIndex, card, targetIndex) {
  if (!card.effect) return state;
  const effect = card.effect;
  const isAoE = effect.target === "all" || effect.target === "others";
  const players = [...state.players];
  const discardPile = [...state.discardPile];
  const defended = /* @__PURE__ */ new Set();
  const defendLogs = [];
  const candidates = isAoE ? players.map((_, i) => i).filter((i) => (i !== playerIndex || effect.includeSelf) && !players[i].hasForfeited) : effect.target === "target" ? [targetIndex] : [];
  for (const i of candidates) {
    const res = tryBlock(players[i], card);
    if (res.used) {
      players[i] = res.player;
      discardPile.push(res.used);
      defended.add(i);
      defendLogs.push(`🛡️ ${players[i].name}'s ${res.used.name} blocked ${card.name}!`);
    }
  }
  const oldSource = getNetWorth(state.players[playerIndex]);
  const oldTarget = getNetWorth(state.players[targetIndex]);
  let newState = { ...state, players, discardPile };
  const effectLogs = [];
  const allSales = {};
  const collect = (r) => {
    for (const [k, v] of Object.entries(r.sales)) allSales[+k] = [...allSales[+k] ?? [], ...v];
  };
  const markEmiDamage = (s, idx) => ({
    ...s,
    players: s.players.map((p, i) => i === idx ? { ...p, emiDamageTaken: true } : p)
  });
  if (isAoE) {
    if (effect.type === "attack_all_pct") {
      const r = applyEffect(newState, effect, playerIndex, playerIndex, card, defended);
      newState = r.state;
      effectLogs.push(...r.logs);
      collect(r);
      if (card.id.startsWith("ac_emi_bomb")) {
        for (let i = 0; i < newState.players.length; i++) {
          if ((i !== playerIndex || effect.includeSelf) && !defended.has(i)) newState = markEmiDamage(newState, i);
        }
      }
    } else {
      for (let i = 0; i < newState.players.length; i++) {
        if (effect.target === "others" && i === playerIndex) continue;
        if (defended.has(i)) continue;
        const r = applyEffect(newState, effect, playerIndex, i, card);
        newState = r.state;
        effectLogs.push(...r.logs);
        collect(r);
        if (card.id.startsWith("ac_emi_bomb")) newState = markEmiDamage(newState, i);
      }
    }
  } else if (!defended.has(targetIndex)) {
    const r = applyEffect(newState, effect, playerIndex, targetIndex, card);
    newState = r.state;
    effectLogs.push(...r.logs);
    collect(r);
    if (card.id.startsWith("ac_emi_bomb")) newState = markEmiDamage(newState, targetIndex);
  }
  const targetDiff = getNetWorth(newState.players[targetIndex]) - oldTarget;
  const sourceDiff = getNetWorth(newState.players[playerIndex]) - oldSource;
  const targetDiffStr = targetDiff < 0 ? ` (-₹${Math.abs(targetDiff).toLocaleString()})` : targetDiff > 0 ? ` (+₹${Math.abs(targetDiff).toLocaleString()})` : "";
  const sourceDiffStr = sourceDiff > 0 ? ` (+₹${Math.abs(sourceDiff).toLocaleString()})` : "";
  const sourceHand = newState.players[playerIndex].hand.filter((c) => c.id !== card.id);
  const round = state.round ?? 1;
  const harmful = isHarmful(card);
  const finalPlayers = newState.players.map((p0, i) => {
    const p = i === playerIndex ? { ...p0, hand: sourceHand } : p0;
    const sales = allSales[i] ?? [];
    const isVictim = harmful && i !== playerIndex && candidates.includes(i);
    if (!isVictim) return sales.length ? patchStats(p, state, (s) => recordForcedSales(s, sales, round)) : p;
    const before = state.players[i];
    return patchStats(p, state, (s) => recordHit(s, card, round, {
      blocked: defended.has(i),
      lost: getNetWorth(before) - getNetWorth(p),
      sales,
      specLost: card.category === "market" ? Math.max(0, speculativeValue(before) - speculativeValue(p)) : 0,
      skipped: effect.type === "skip_turn",
      heldMarket: holdsMarket(before)
    }));
  });
  const targetName = state.players[targetIndex].name;
  let logEntry = isAoE ? `${state.players[playerIndex].name} played ${card.name} — affects all!` : `${state.players[playerIndex].name} played ${card.name} → ${targetName}${targetDiffStr}${sourceDiffStr}`;
  if (!isAoE && defended.has(targetIndex)) logEntry += ` 🛡️ (${targetName} Auto-Defended!)`;
  return checkWinCondition({
    ...newState,
    players: finalPlayers,
    discardPile: [...newState.discardPile, card],
    playedCard: card,
    pendingTarget: null,
    log: pushLogs(newState.log, logEntry, ...effectLogs, ...isAoE ? defendLogs : [])
  });
}
function passTurn(state, playerIndex, discardCardId) {
  const player = state.players[playerIndex];
  const card = player?.hand.find((c) => c.id === discardCardId);
  if (!player) return state;
  const next = card ? {
    ...state,
    players: state.players.map((p, i) => i === playerIndex ? { ...p, hand: p.hand.filter((c) => c.id !== card.id) } : p),
    discardPile: [...state.discardPile, card],
    pendingDecision: null,
    pendingTarget: null,
    log: pushLogs(state.log, `${player.name} passed (discarded ${card.name}).`)
  } : { ...state, log: pushLogs(state.log, `${player.name} passed.`) };
  return advanceTurn(next);
}
function processPendingGains(state, playerIndex) {
  const player = state.players[playerIndex];
  let total = 0;
  const remaining = player.pendingGains.filter((g) => {
    if (g.triggerAt === "next_turn") {
      total += g.amount;
      return false;
    }
    return true;
  });
  if (remaining.length === player.pendingGains.length) return state;
  const { player: settled, brokenShields } = setWealthWithFloor({ ...player, pendingGains: remaining }, getNetWorth(player) + total);
  const updatedPlayers = state.players.map((p, i) => i === playerIndex ? settled : p);
  return {
    ...state,
    players: updatedPlayers,
    discardPile: brokenShields.length ? [...state.discardPile, ...brokenShields] : state.discardPile
  };
}
function seasonMeanBoost() {
  const activeSeason = SEASONS.find((s) => s.is_active);
  if (activeSeason?.special_rule?.includes("INVEST gains")) {
    const match = activeSeason.special_rule.match(/(\d+)%/);
    if (match) return 1 + parseInt(match[1]) / 100;
  }
  return 1;
}
function getRoundLimit(state) {
  return state.levelConfig ? state.levelConfig.turnLimit : state.maxRounds ?? MAX_ROUNDS;
}
function activeIndices(state) {
  return state.players.map((p, i) => p.hasForfeited ? -1 : i).filter((i) => i >= 0);
}
function lifeEventEffect(effect) {
  const v = Math.abs(effect.value ?? 0);
  switch (effect.type) {
    case "attack_all_pct":
    case "steal_pct":
    case "market_crash_player":
      return { type: "wealth_pct", value: -v, target: "self" };
    case "steal":
      return { type: "wealth_change", value: -v, target: "self" };
    default:
      return { ...effect, target: "self" };
  }
}
function applyLifeEvent(state, card) {
  if (!card.effect) return { state, lines: [], affected: [] };
  const active = activeIndices(state);
  if (!active.length) return { state, lines: [], affected: [] };
  const everyone = !card.lureAsset && (card.effect.target === "all" || card.effect.target === "others");
  const pool = card.lureAsset && active.some((i) => state.players[i].isBot) ? active.filter((i) => state.players[i].isBot) : active;
  const targets = everyone ? active : [pool[Math.floor(rand() * pool.length)]];
  const effect = lifeEventEffect(card.effect);
  let s = state;
  const lines = [`🎲 Life event: ${card.name}${everyone ? " (everyone)" : ` — ${state.players[targets[0]].name}`}`];
  const round = state.round ?? 1;
  const harmful = isHarmful({ ...card, effect });
  const setStats = (idx, fn) => {
    s = { ...s, players: s.players.map((p, i) => i === idx ? patchStats(p, s, fn) : p) };
  };
  for (const idx of targets) {
    const block = tryBlock(s.players[idx], { ...card, effect });
    if (block.used) {
      s = {
        ...s,
        players: s.players.map((p, i) => i === idx ? block.player : p),
        discardPile: [...s.discardPile, block.used]
      };
      lines.push(`🛡️ ${s.players[idx].name}'s ${block.used.name} blocked ${card.name}!`);
      setStats(idx, (st) => recordHit(st, card, round, { blocked: true, lost: 0, sales: [], specLost: 0, heldMarket: holdsMarket(s.players[idx]) }));
      continue;
    }
    if (card.lureAsset) {
      const p = s.players[idx];
      const lure = card.lureAsset;
      const amount = Math.round(getCash(p) * Math.abs(card.effect.value ?? 0) / 100);
      if (amount > 0) {
        s = { ...s, players: s.players.map((pl, i) => i === idx ? addHolding(pl, lure, card.name, amount, s.round ?? 1) : pl) };
        lines.push(`🎣 ${p.name} fell for it: ${formatINR(amount)} moved into ${assetLabel(lure)}`);
        setStats(idx, (st) => recordHit(
          { ...st, investedByAsset: { ...st.investedByAsset, [lure]: (st.investedByAsset[lure] ?? 0) + amount } },
          card,
          round,
          { blocked: false, lost: 0, sales: [], specLost: 0, lured: true, heldMarket: false }
        ));
      }
      continue;
    }
    const beforePlayer = s.players[idx];
    const before = getNetWorth(beforePlayer);
    const r = applyEffect(s, effect, idx, idx, card);
    s = r.state;
    const diff = getNetWorth(s.players[idx]) - before;
    if (diff !== 0) lines.push(`${diff > 0 ? "🎉" : "💥"} ${s.players[idx].name}: ${diff > 0 ? "+" : "-"}${formatINR(Math.abs(diff))}`);
    lines.push(...r.logs);
    const sales = r.sales[idx] ?? [];
    if (harmful) {
      const after = s.players[idx];
      setStats(idx, (st) => recordHit(st, card, round, {
        blocked: false,
        lost: -diff,
        sales,
        specLost: card.category === "market" ? Math.max(0, speculativeValue(beforePlayer) - speculativeValue(after)) : 0,
        heldMarket: holdsMarket(beforePlayer)
      }));
    } else if (sales.length) {
      setStats(idx, (st) => recordForcedSales(st, sales, round));
    }
  }
  return { state: s, lines, affected: targets.map((i) => state.players[i].id) };
}
function recordMarketTick(before, after, changes, round, state) {
  const held = getHoldings(before);
  if (!held.length) return after;
  return patchStats(after, state, (st) => {
    const ids = [];
    let specLost = 0;
    let worst = st.worstMarketDrop ?? null;
    for (const h of held) {
      const pct = changes[h.asset] ?? 0;
      const now = getHoldings(after).find((x) => x.id === h.id);
      const value = now?.value ?? 0;
      if ((h.asset === "crypto" || h.asset === "scam") && value < h.value) specLost += h.value - value;
      if (pct <= -10) {
        ids.push("asset_risk");
        if (MARKET_ASSETS.includes(h.asset)) ids.push("market_patience");
        if (h.asset === "crypto") ids.push("crypto_risk");
        if (!worst || pct < worst.pct) worst = { round, asset: h.asset, pct };
      }
      if (h.asset === "scam" && value < h.value) ids.push("scams");
      if (now && (now.value >= 2 * now.principal || round - now.boughtRound >= 3 && now.value > now.principal)) ids.push("compounding");
    }
    ids.push(...diversificationConcepts(after));
    return withConcepts({ ...st, speculativeLosses: st.speculativeLosses + Math.round(specLost), worstMarketDrop: worst }, ids);
  });
}
function startNewRound(state) {
  const newRound = (state.round ?? 1) + 1;
  const lines = [`📅 Year ${newRound}`];
  const heldBefore = /* @__PURE__ */ new Set();
  state.players.forEach((p) => getHoldings(p).forEach((h) => heldBefore.add(h.asset)));
  const changes = rollMarket(seasonMeanBoost());
  let players = state.players.map((p) => {
    if (p.hasForfeited) return p;
    const { player, wiped } = applyMarketToPlayer(p, changes);
    wiped.forEach((h) => lines.push(`☠️ ${p.name}'s ${assetLabel(h.asset)} was wiped out.`));
    return recordMarketTick(p, player, changes, newRound, state);
  });
  if (heldBefore.size) {
    const moves = [...heldBefore].map((a) => `${ASSETS[a].emoji} ${changes[a] >= 0 ? "+" : ""}${changes[a]}%`).join("  ");
    lines.push(`📊 Market: ${moves}`);
  }
  players = players.map((p) => {
    if (p.hasForfeited) return p;
    const { player, lost } = applyInflation(p);
    if (lost > 0) lines.push(`💸 Inflation ate ${formatINR(lost)} of ${p.name}'s cash`);
    return patchStats(player, state, (st) => {
      const ids = lost > 0 ? ["inflation"] : [];
      const parked = getHoldings(player).some((h) => h.asset === "fd") || newRound >= 3 && cashShare(player) > 0.6;
      if (parked) ids.push("fd_vs_inflation");
      return withConcepts({ ...st, inflationLost: st.inflationLost + lost }, ids);
    });
  });
  let s = recordRoundEnd({
    ...state,
    players,
    round: newRound,
    lastMarketTick: { round: newRound, changes }
  });
  if (newRound > getRoundLimit(s)) {
    return endByLimit({ ...s, roundNews: { round: newRound, lines } }, lines);
  }
  const ruled = applyLevelRoundStart(s);
  if (ruled.playerIndex >= 0) {
    s = ruled.state;
    lines.push(...ruled.lines);
    if (ruled.forcedSales.length) {
      s = { ...s, players: s.players.map((p, i) => i === ruled.playerIndex ? patchStats(p, s, (st) => recordForcedSales(st, ruled.forcedSales, newRound)) : p) };
    }
  }
  let lastEvent = state.lastEvent ?? null;
  if (rand() < LIFE_EVENT_CHANCE) {
    let deck = s.eventDeck && s.eventDeck.length ? [...s.eventDeck] : buildEventDeck([]);
    const card = deck.shift();
    deck = [...deck, card];
    const r = applyLifeEvent({ ...s, eventDeck: deck }, card);
    s = r.state;
    lines.push(...r.lines);
    lastEvent = { card, round: newRound, affectedPlayerIds: r.affected };
  }
  return {
    ...s,
    lastEvent,
    roundNews: { round: newRound, lines },
    log: pushLogs(s.log, ...[...lines].reverse())
  };
}
function endByLimit(state, extraLogs = [], reason = "Round limit reached") {
  const log = pushLogs(state.log, ...[...extraLogs].reverse());
  const active = state.players.filter((p) => !p.hasForfeited);
  if (state.levelConfig) {
    const human = state.players.find((p) => !p.isBot);
    if (human && getNetWorth(human) >= state.wealthGoal) {
      return { ...state, winner: human, phase: "game_over", log: pushLogs(log, `🏆 Level Complete! Reached the target corpus in time.`) };
    }
    const bestBot = [...active].filter((p) => p.isBot).sort((a, b) => b.wealth - a.wealth)[0] ?? null;
    return {
      ...state,
      winner: bestBot,
      phase: "game_over",
      log: pushLogs(log, `❌ ${reason}! You needed ${formatINR(state.wealthGoal)} — try investing earlier and keeping an emergency fund.`)
    };
  }
  const winner = [...active].sort((a, b) => b.wealth - a.wealth)[0] ?? state.players[0];
  return { ...state, winner, phase: "game_over", log: pushLogs(log, `⌛ ${reason}! ${winner.name} wins with the highest net worth.`) };
}
function advanceTurn(state) {
  const n = state.players.length;
  let newState = { ...state, equippedThisTurn: false };
  let wrapped = state.currentPlayerIndex + 1 >= n;
  let nextIndex = (state.currentPlayerIndex + 1) % n;
  let loopCount = 0;
  while ((newState.players[nextIndex].hasForfeited || newState.players[nextIndex].skippedTurns > 0) && loopCount < n) {
    const p = newState.players[nextIndex];
    if (!p.hasForfeited) {
      newState = {
        ...newState,
        players: newState.players.map((pl, i) => i === nextIndex ? { ...pl, skippedTurns: pl.skippedTurns - 1 } : pl),
        log: pushLogs(newState.log, `${p.name} is skipping their turn.`)
      };
    }
    if (nextIndex + 1 >= n) wrapped = true;
    nextIndex = (nextIndex + 1) % n;
    loopCount++;
  }
  if (wrapped && n > 1) {
    newState = startNewRound(newState);
    if (newState.phase === "game_over") return newState;
  }
  newState = processPendingGains(newState, nextIndex);
  const checked = checkWinCondition(newState);
  if (checked.winner) return checked;
  const elapsed = Date.now() - state.startTime;
  if (elapsed >= state.timeLimit) {
    return endByLimit(recordFinal(checked), [], "Time up");
  }
  return {
    ...checked,
    currentPlayerIndex: nextIndex,
    turn: checked.turn + 1,
    phase: "draw",
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    turnStartTime: Date.now()
  };
}
function forceSkipTurn(state) {
  const p = state.players[state.currentPlayerIndex];
  const logEntry = `⏱️ ${p.name} took too long! Turn skipped.`;
  return advanceTurn({ ...state, pendingDecision: null, pendingTarget: null, log: pushLogs(state.log, logEntry) });
}
function checkWinCondition(input) {
  if (input.phase === "game_over" && input.winner) return input;
  let state = trackPeaks(input);
  const reached = state.players.filter((p) => !p.hasForfeited && getNetWorth(p) >= state.wealthGoal && canWinByTarget(state, p)).sort((a, b) => getNetWorth(b) - getNetWorth(a));
  if (reached.length) {
    state = recordFinal(state);
    const winner = state.players.find((p) => p.id === reached[0].id) ?? reached[0];
    return {
      ...state,
      winner,
      phase: "game_over",
      log: pushLogs(state.log, `🏆 ${winner.name} reached the wealth goal and WINS!`)
    };
  }
  const activePlayers = state.players.filter((p) => !p.hasForfeited);
  if (activePlayers.length === 1 && state.players.length > 1) {
    state = recordFinal(state);
    const remainingWinner = state.players.find((p) => p.id === activePlayers[0].id) ?? activePlayers[0];
    return {
      ...state,
      winner: remainingWinner,
      phase: "game_over",
      log: pushLogs(state.log, `🏆 Everyone else forfeited! ${remainingWinner.name} WINS!`)
    };
  }
  if ((state.round ?? 1) > getRoundLimit(state)) {
    return endByLimit(state);
  }
  return state;
}
function getStartingWealth(state) {
  return state.levelConfig?.startingCorpus ?? STARTING_WEALTH;
}

// src/lib/multiplayerAuthority.ts
var DISCONNECT_MS = 45e3;
var HEARTBEAT_MS = 1e4;
var MIN_PLAYERS = 2;
var MAX_PLAYERS = 6;
var MP_EMOTES = ["💰", "😭", "📉", "🚀", "😡"];
var LOG_MAX2 = 20;
var MP_MODES = {
  blitz: { wealthGoal: 15e5, timeLimitMs: 15 * 60 * 1e3, goalLabel: "₹15 Lakhs" },
  standard: { wealthGoal: 35e5, timeLimitMs: 20 * 60 * 1e3, goalLabel: "₹35 Lakhs" },
  epic: { wealthGoal: 5e6, timeLimitMs: 30 * 60 * 1e3, goalLabel: "₹50 Lakhs" }
};
function isMultiplayerMode(v) {
  return v === "blitz" || v === "standard" || v === "epic";
}
function buildInitialMultiplayerState(seats, mode, now) {
  if (seats.length < MIN_PLAYERS || seats.length > MAX_PLAYERS) {
    throw new Error(`A multiplayer game needs ${MIN_PLAYERS}-${MAX_PLAYERS} players`);
  }
  const cfg = MP_MODES[isMultiplayerMode(mode) ? mode : "standard"];
  const players = seats.map((s) => ({
    id: s.id,
    name: s.name,
    isBot: false,
    profile: s.avatar_url != null || s.rank_points != null ? { avatar_url: s.avatar_url ?? null, rank_points: s.rank_points ?? 0 } : void 0,
    wealth: STARTING_WEALTH,
    cash: STARTING_WEALTH,
    holdings: [],
    lifestyleLevel: 0,
    hand: [],
    activeDefenses: [],
    skippedTurns: 0,
    pendingGains: [],
    wealthFloor: 0,
    doubleInvestActive: false,
    investChoices: 0,
    spendChoices: 0,
    savingStreak: 0,
    greedIndex: 0,
    emiDamageTaken: false
  }));
  return {
    id: newId(),
    version: 1,
    players,
    ...newEconomyState(shuffle(createGameDeck()), false),
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: "draw",
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`Game started! First to ${cfg.goalLabel} wins — or richest after ${MAX_ROUNDS} years.`],
    wealthGoal: cfg.wealthGoal,
    timeLimit: cfg.timeLimitMs,
    startTime: now,
    turnStartTime: now,
    multiplayerMode: isMultiplayerMode(mode) ? mode : "standard",
    lastEvents: [{ type: "start" }]
  };
}
function pushLog(log, ...newestFirst) {
  return [...newestFirst, ...log].slice(0, LOG_MAX2);
}
function reject(full, error, message) {
  return { state: full, error, message, events: [], changed: false };
}
var activeCount = (s) => s.players.filter((p) => !p.hasForfeited).length;
function markForfeited(s, indices, reason) {
  if (!indices.length) return s;
  const discarded = [];
  const logs = [];
  const players = s.players.map((p, i) => {
    if (!indices.includes(i) || p.hasForfeited) return p;
    discarded.push(...p.hand);
    logs.push(reason === "forfeit" ? `🏳️ ${p.name} forfeited.` : `📡 ${p.name} disconnected and forfeited.`);
    return { ...p, hand: [], wealth: 0, cash: 0, holdings: [], pendingGains: [], hasForfeited: true };
  });
  return { ...s, players, discardPile: [...s.discardPile, ...discarded], log: pushLog(s.log, ...logs) };
}
function settleAfterForfeit(s, currentWasForfeited) {
  if (activeCount(s) === 0) {
    return { ...s, phase: "game_over", winner: null, log: pushLog(s.log, "Everyone left — no winner.") };
  }
  if (activeCount(s) === 1) return checkWinCondition(s);
  if (currentWasForfeited) return advanceTurn({ ...s, pendingDecision: null, pendingTarget: null });
  return checkWinCondition(s);
}
function endTurn(s) {
  return s.phase === "game_over" ? s : advanceTurn(s);
}
function finalize(prev, next, events, now) {
  const turnChanged = next.turn !== prev.turn || next.currentPlayerIndex !== prev.currentPlayerIndex;
  const out = {
    ...next,
    multiplayerMode: prev.multiplayerMode,
    pendingDecision: null,
    pendingTarget: null,
    turnStartTime: turnChanged ? now : next.turnStartTime,
    version: prev.version + 1,
    lastEvents: []
  };
  const allEvents = [...events];
  if (out.phase === "game_over" && prev.phase !== "game_over") {
    allEvents.push({ type: "game_over", winnerId: out.winner?.id ?? null });
  }
  out.lastEvents = allEvents;
  return { state: out, events: allEvents, changed: true };
}
function applyPlayerAction(full, actorId, action, now) {
  if (!action || typeof action !== "object" || typeof action.type !== "string") {
    return reject(full, "invalid_action", "Unknown action");
  }
  if (full.phase === "game_over") return reject(full, "game_over", "The game is over");
  if (action.type === "tick") return applyTick(full, action.lastSeen, now);
  const actorIndex = full.players.findIndex((p) => p.id === actorId);
  if (actorIndex < 0) return reject(full, "not_in_game", "You are not in this game");
  const actor = full.players[actorIndex];
  if (actor.hasForfeited) return reject(full, "forfeited", "You have left this game");
  if (action.type === "emote") {
    if (!MP_EMOTES.includes(action.emoji)) return reject(full, "bad_emote", "Unknown emote");
    return { state: full, events: [{ type: "emote", playerId: actorId, emoji: action.emoji }], changed: false };
  }
  if (action.type === "forfeit") {
    const wasCurrent = full.currentPlayerIndex === actorIndex;
    const s = settleAfterForfeit(markForfeited(full, [actorIndex], "forfeit"), wasCurrent);
    return finalize(full, s, [{ type: "forfeit", playerId: actorId }], now);
  }
  if (full.currentPlayerIndex !== actorIndex) return reject(full, "not_your_turn", "It's not your turn");
  switch (action.type) {
    case "draw": {
      if (full.phase !== "draw") return reject(full, "wrong_phase", "You already drew this turn");
      const { state } = startDrawPhase(full, actorIndex);
      return finalize(full, { ...state, phase: "play" }, [{ type: "draw", playerId: actorId }], now);
    }
    case "decision":
    case "action":
    case "equip":
    case "pass": {
      if (full.phase !== "play") return reject(full, "wrong_phase", "Draw your cards first");
      const cardId = action.cardId;
      const card = typeof cardId === "string" ? actor.hand.find((c) => c.id === cardId) : void 0;
      if (action.type === "pass") {
        if (!card && actor.hand.length > 0) return reject(full, "card_not_in_hand", "Pick a card from your hand to discard");
        const s2 = passTurn(full, actorIndex, card?.id ?? "");
        return finalize(full, s2, [{ type: "pass", playerId: actorId, cardName: card?.name }], now);
      }
      if (!card) return reject(full, "card_not_in_hand", "That card is not in your hand");
      if (action.type === "equip") {
        if (card.type !== "defense") return reject(full, "invalid_card", "Only defense cards can be equipped");
        if (!canEquip(full, actorIndex, card)) {
          return reject(full, "cannot_equip", full.equippedThisTurn ? "You can equip one defense per turn" : "Defense slots full (3)");
        }
        const s2 = equipDefense(full, actorIndex, card);
        return finalize(full, s2, [{ type: "equip", playerId: actorId, cardName: card.name }], now);
      }
      if (action.type === "decision") {
        if (card.type !== "decision") return reject(full, "invalid_card", "That is not a decision card");
        const choice = action.choice;
        if (!card.options?.some((o) => o.type === choice)) return reject(full, "invalid_action", "That choice is not on this card");
        const preview = previewDecision(full, actorIndex, card, choice);
        if (preview.disabled) return reject(full, "decision_disabled", preview.disabled);
        const s2 = endTurn(processDecision(full, actorIndex, choice, card));
        return finalize(full, s2, [{ type: "decision", playerId: actorId, cardName: card.name, choice }], now);
      }
      if (card.type !== "action" || !card.effect) return reject(full, "invalid_card", "That is not an action card");
      let targetIndex = actorIndex;
      if (card.effect.target === "target") {
        const t = action.targetIndex;
        const target = typeof t === "number" && Number.isInteger(t) ? full.players[t] : void 0;
        if (!target || t === actorIndex || target.hasForfeited) {
          return reject(full, "invalid_target", "Pick an opponent who is still playing");
        }
        targetIndex = t;
      }
      const s = endTurn(processAction(full, actorIndex, card, targetIndex));
      return finalize(full, s, [{
        type: "action",
        playerId: actorId,
        cardName: card.name,
        targetId: card.effect.target === "target" ? full.players[targetIndex].id : void 0
      }], now);
    }
    default:
      return reject(full, "invalid_action", "Unknown action");
  }
}
function applyTick(full, lastSeen, now) {
  if (full.phase === "game_over") return reject(full, "game_over", "The game is over");
  const events = [];
  let s = full;
  if (lastSeen) {
    const stale = full.players.map((p, i) => ({ p, i })).filter(({ p }) => !p.hasForfeited && now - (lastSeen[p.id] ?? full.startTime) > DISCONNECT_MS);
    if (stale.length) {
      const currentWasForfeited = stale.some((x) => x.i === full.currentPlayerIndex);
      s = settleAfterForfeit(markForfeited(s, stale.map((x) => x.i), "disconnect"), currentWasForfeited);
      stale.forEach(({ p }) => events.push({ type: "disconnect", playerId: p.id }));
    }
  }
  const turnMoved = s.turn !== full.turn || s.currentPlayerIndex !== full.currentPlayerIndex;
  if (s.phase !== "game_over" && !turnMoved && now - full.turnStartTime >= TURN_TIME_LIMIT_MS) {
    const timedOut = s.players[s.currentPlayerIndex];
    s = forceSkipTurn(s);
    events.push({ type: "timeout", playerId: timedOut.id });
  }
  if (!events.length) return { state: full, events: [], changed: false };
  return finalize(full, s, events, now);
}
function publicPlayer(p) {
  return { ...p, hand: [], handCount: p.hand.length };
}
function publicState(full) {
  return {
    ...full,
    players: full.players.map(publicPlayer),
    winner: full.winner ? publicPlayer(full.winner) : null,
    deck: [],
    eventDeck: [],
    discardPile: [],
    drawnCard: null,
    pendingDecision: null,
    pendingTarget: null,
    deckCount: full.deck.length,
    eventDeckCount: full.eventDeck?.length ?? 0,
    discardCount: full.discardPile.length
  };
}
function redactForPlayer(full, viewerId) {
  const pub = publicState(full);
  const me = full.players.find((p) => p.id === viewerId);
  const isCurrent = full.players[full.currentPlayerIndex]?.id === viewerId;
  return withOwnHand({ ...pub, drawnCard: isCurrent ? full.drawnCard : null }, viewerId, me?.hand ?? null);
}
function withOwnHand(pub, viewerId, hand) {
  if (!hand) return pub;
  return { ...pub, players: pub.players.map((p) => p.id === viewerId ? { ...p, hand, handCount: hand.length } : p) };
}
var HIDDEN_CARD = { id: "hidden", name: "", type: "situation", tier: "common", flavor: "" };
function toBoardState(view) {
  return {
    ...view,
    deck: Array.from({ length: view.deckCount }, () => HIDDEN_CARD)
  };
}
function changedHands(prev, next) {
  const out = {};
  for (const p of next.players) {
    const before = prev?.players.find((q) => q.id === p.id);
    if (!before || JSON.stringify(before.hand) !== JSON.stringify(p.hand)) out[p.id] = p.hand;
  }
  return out;
}
function computePlacements(state) {
  const winnerId = state.winner?.id ?? null;
  const ordered = [...state.players].sort((a, b) => {
    if (a.id === winnerId) return -1;
    if (b.id === winnerId) return 1;
    if (!!a.hasForfeited !== !!b.hasForfeited) return a.hasForfeited ? 1 : -1;
    return getNetWorth(b) - getNetWorth(a);
  });
  return ordered.map((p, i) => ({
    playerId: p.id,
    placement: i + 1,
    won: p.id === winnerId,
    finalWealth: Math.max(0, Math.round(getNetWorth(p))),
    forfeited: !!p.hasForfeited,
    stats: { investChoices: p.investChoices ?? 0, emiDamageTaken: !!p.emiDamageTaken, forfeited: !!p.hasForfeited }
  }));
}
function isGameOver(state) {
  return state.phase === "game_over";
}
export {
  DISCONNECT_MS,
  HEARTBEAT_MS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MP_EMOTES,
  MP_MODES,
  TURN_TIME_LIMIT_MS,
  applyPlayerAction,
  applyTick,
  buildInitialMultiplayerState,
  changedHands,
  computePlacements,
  isGameOver,
  isMultiplayerMode,
  publicState,
  redactForPlayer,
  setRng,
  toBoardState,
  withOwnHand
};
