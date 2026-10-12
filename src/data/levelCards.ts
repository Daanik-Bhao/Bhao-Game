import type { GameCard } from '../types/game'

export const LEVEL_SITUATION_CARDS: GameCard[] = [
  {
    id: "dc_s-001",
    name: "Pocket Money Dilemma",
    nameHi: "पॉकेट मनी दुविधा",
    type: 'decision',
    tier: 'common',
    flavor: "some money pocket money in hand. Vada pav or piggy bank? (Save first, spend what's left)",
    flavorHi: "हाथ में जेब खर्च के कुछ पैसे. वड़ा पाव या गुल्लक? (पहले बचत करें, जो बचा है उसे खर्च करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save in piggy bank",
          shortDescriptionHi: "गुल्लक में सहेजें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest for early growth",
          shortDescriptionHi: "शीघ्र विकास के लिए निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money gone by Sunday",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    name: "School Trip ka Chakkar",
    nameHi: "स्कूल ट्रिप का चक्कर",
    type: 'decision',
    tier: 'common',
    flavor: "Trip costs extra. You have some money. Kya plan hai? (Planning beats panic)",
    flavorHi: "ट्रिप में अतिरिक्त खर्च है। आपके पास कुछ पैसे हैं। क्या योजना है? (Planning beats panic)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save weekly expenses, go later",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save allowance for later",
          shortDescriptionHi: "बाद के लिए भत्ता बचाकर रखें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest trip funds for growth",
          shortDescriptionHi: "विकास के लिए ट्रिप फंड निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money parents bail you out",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Relatives gifted some money. 'Padhai ke liye hai beta.' (Gift money is seed money)",
    flavorHi: "Relatives gifted some money. 'Padhai ke liye hai beta.' (Gift money is seed money)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money in piggy bank",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save gift in piggy bank",
          shortDescriptionHi: "गुल्लक में उपहार सहेजें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Open kids FD Saved money interest",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Open kids fixed deposit",
          shortDescriptionHi: "ओपन किड्स फिक्स्ड डिपॉजिट"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on gaming credits",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Daily canteen vs tiffin. Difference: daily expenses. (Small daily habits = big yearly numbers)",
    flavorHi: "दैनिक कैंटीन बनाम टिफिन। अंतर: दैनिक खर्च. (छोटी दैनिक आदतें = बड़ी वार्षिक संख्याएँ)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money/month saved",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save money eating tiffin",
          shortDescriptionHi: "टिफ़िन खाने के पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest daily food savings",
          shortDescriptionHi: "दैनिक भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/year on samosas",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Classmate selling old cycle some money. New one costs extra. (Value > vanity)",
    flavorHi: "सहपाठी कुछ पैसों में पुरानी साइकिल बेच रहा है। नये की अतिरिक्त लागत है. (मूल्य > घमंड)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Buy used, save some money",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Buy used cycle and save",
          shortDescriptionHi: "पुरानी साइकिल खरीदें और बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest cycle savings wisely",
          shortDescriptionHi: "चक्र बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money new one, EMI from parents",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "School gave some money scholarship. Sab pooch rahe hain kya kiya? (Reward learning with more learning)",
    flavorHi: "School gave some money scholarship. Sab pooch rahe hain kya kiya? (Reward learning with more learning)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money banked",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Bank your scholarship money",
          shortDescriptionHi: "अपनी छात्रवृत्ति का पैसा बैंक में जमा करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in book course",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in educational courses",
          shortDescriptionHi: "शैक्षिक पाठ्यक्रमों में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on new shoes & celebration",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Every weekend eat-out with friends. FOMO is real. (Friendships don't depend on where you eat)",
    flavorHi: "हर सप्ताहांत दोस्तों के साथ बाहर खाना। FOMO वास्तविक है. (दोस्ती इस बात पर निर्भर नहीं करती कि आप कहां खाते हैं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip 3 weekends, save some money",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Skip weekends to save",
          shortDescriptionHi: "बचत करने के लिए सप्ताहांत छोड़ें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest weekend food savings",
          shortDescriptionHi: "सप्ताहांत भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/weekend = Spent money/month",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Uncle pays some money for data entry work. Easy money! (First earned rupee deserves respect)",
    flavorHi: "अंकल डाटा एंट्री के काम के लिए कुछ पैसे देते हैं। आसानी से कमाया जाने वाला धन! (पहला कमाया हुआ रुपया सम्मान का पात्र है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved, money spent",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice."
      },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth."
      },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money spent same day",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals."
      },
    ],
  },
  {
    id: "dc_s-009",
    name: "Lost some money",
    nameHi: "कुछ पैसे खो गए",
    type: 'decision',
    tier: 'common',
    flavor: "Bhai, some money gir gayi pocket se. Kya karte? (Losing money teaches more than earning)",
    flavorHi: "Bhai, some money gir gayi pocket se. Kya karte? (Losing money teaches more than earning)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Make do with some money left",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Make do with less",
          shortDescriptionHi: "कम से काम चलाओ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest remaining pocket money",
          shortDescriptionHi: "बची हुई पॉकेट मनी निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Borrow some money more and spend that too",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "5 pens for some money vs 1 quality pen for some money. Dono alag-alag shops. (Cheap bulk often costs more)",
    flavorHi: "कुछ पैसे के लिए 5 पेन बनाम कुछ पैसे के लिए 1 गुणवत्ता वाला पेन। डोनो अलग-अलग दुकानें। (सस्ते थोक की कीमत अक्सर अधिक होती है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Buy 1 good pen, save some money",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Buy one quality pen",
          shortDescriptionHi: "एक गुणवत्तापूर्ण पेन खरीदें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest saved stationery money",
          shortDescriptionHi: "बचाए गए स्टेशनरी के पैसे निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Buy all 5, lose 3 in a week",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money mil gayi footpath pe. No one's around. (Found money isn't free money)",
    flavorHi: "कुछ पैसे मिल गए फुटपाथ पर। आसपास कोई नहीं है. (पाया गया पैसा मुफ़्त पैसा नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money to piggy bank",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save found money securely",
          shortDescriptionHi: "पाए गए पैसे को सुरक्षित रूप से सहेजें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest found money for growth",
          shortDescriptionHi: "विकास के लिए पाया गया धन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money at chaat stall immediately",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    name: "Borrow Karna Padega",
    nameHi: "Borrow Karna Padega",
    type: 'decision',
    tier: 'common',
    flavor: "Friend needs some money. You have some money. Kya bologe? (Generosity with boundaries)",
    flavorHi: "दोस्त को कुछ पैसों की जरूरत है. आपके पास कुछ पैसे हैं. क्या बोलोगे? (सीमाओं के साथ उदारता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Lend some money keep some money",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Lend some and keep some",
          shortDescriptionHi: "कुछ उधार दो और कुछ रखो"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest kept money wisely",
          shortDescriptionHi: "रखे हुए धन का निवेश सोच-समझकर करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Lend all some money you're now broke",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money gaming credits on sale - 50% off today only! (Virtual spends are real losses)",
    flavorHi: "कुछ गेमिंग क्रेडिट बिक्री पर हैं - केवल आज के लिए 50% की छूट! (Virtual spends are real losses)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip it - it's not real money",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Skip virtual game purchases",
          shortDescriptionHi: "वर्चुअल गेम खरीदारी छोड़ें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest real money instead",
          shortDescriptionHi: "इसके बजाय वास्तविक धन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money gone in 2 hours of play",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Maa ne tiffin diya. Yaar bol raha hai 'canteen chal!' (Maa ka tiffin > peer pressure)",
    flavorHi: "माँ ने टिफिन दिया. यार बोल रहा है 'कैंटीन चल!' (मां का टिफिन > साथियों का दबाव)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money/day = monthly expenses saved",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Eat tiffin and save",
          shortDescriptionHi: "टिफ़िन खाओ और बचा लो"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest canteen money saved",
          shortDescriptionHi: "कैंटीन के निवेश का पैसा बचाया"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month for peer approval",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    name: "Garage Sale Find",
    nameHi: "गेराज बिक्री खोजें",
    type: 'decision',
    tier: 'common',
    flavor: "Old comics sell for some money at school flea market! (One man's old is another man's gold)",
    flavorHi: "पुरानी कॉमिक्स स्कूल के कबाड़ी बाजार में कुछ पैसों के लिए बिकती हैं! (एक आदमी का पुराना सोना दूसरे आदमी का सोना है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money to savings",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save comic sale money",
          shortDescriptionHi: "कॉमिक बिक्री के पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Put some money in piggy bank",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in your piggy bank",
          shortDescriptionHi: "अपने गुल्लक में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on new comics immediately",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Hostel mess ya Zomato roz? some money vs some money per meal. (Convenience has a monthly price tag)",
    flavorHi: "हॉस्टल में गड़बड़ है या ज़ोमैटो रोज़? प्रति भोजन कुछ पैसे बनाम कुछ पैसे। (सुविधा का मासिक मूल्य टैग है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money/month with mess",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Eat mess food and save",
          shortDescriptionHi: "मेस का खाना खाओ और बचाओ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest food delivery savings",
          shortDescriptionHi: "भोजन वितरण बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month extra on Zomato",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money pehli kamai! Sab bol rahe hain 'treat de!' (First salary = first investment)",
    flavorHi: "some money pehli kamai! Sab bol rahe hain 'treat de!' (First salary = first investment)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money in savings account",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save in savings account",
          shortDescriptionHi: "बचत खाते में बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Start some money SIP",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Start your first SIP",
          shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on celebration treat",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money fees in 2 months. No plan made. (Fee dates don't move. Your savings can.)",
    flavorHi: "2 महीने में कुछ पैसे फीस. कोई योजना नहीं बनी. (फीस की तारीखें नहीं बदलतीं। आपकी बचत बढ़ सकती है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save monthly expenses from allowance",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save from monthly allowance",
          shortDescriptionHi: "मासिक भत्ते से बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest allowance for fees",
          shortDescriptionHi: "फीस के लिए निवेश भत्ता"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Panic + parents ka call",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Used copy some money vs New copy some money. Dono available. (Knowledge matters. Not the spine.)",
    flavorHi: "पुरानी कॉपी में कुछ पैसे बनाम नई कॉपी में कुछ पैसे। डोनो उपलब्ध है. (ज्ञान मायने रखता है। रीढ़ नहीं।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved on books",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Buy used books and save",
          shortDescriptionHi: "प्रयुक्त पुस्तकें खरीदें और बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest book savings smartly",
          shortDescriptionHi: "बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money new book, used 4 times",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Dosto ne kaha: 'some money lagao, double ho jaayega!' (FOMO is the most expensive emotion)",
    flavorHi: "Dosto ne kaha: 'some money lagao, double ho jaayega!' (FOMO is the most expensive emotion)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Say no, research first",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Say no and research first",
          shortDescriptionHi: "ना कहें और पहले शोध करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Only if you can afford to lose it",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest only affordable losses",
          shortDescriptionHi: "किफायती घाटे पर ही निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money gone in the dip",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Coding bootcamp some money. Ya Netflix aur sona. (Skills compound like money)",
    flavorHi: "कोडिंग बूटकैंप कुछ पैसे। हां नेटफ्लिक्स और सोना। (कौशल पैसे की तरह मिश्रित होता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Save over 3 months, then buy",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save up for bootcamp",
          shortDescriptionHi: "बूटकैंप के लिए बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest in skill - ROI is a job",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in coding skills",
          shortDescriptionHi: "कोडिंग कौशल में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on personal loan for skill",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Client paid some money for a logo design. Tu hi toh best hai! (Freelance income = freedom when saved)",
    flavorHi: "ग्राहक ने लोगो डिज़ाइन के लिए कुछ पैसे चुकाए। तू ही तो सबसे अच्छा है! (स्वतंत्र आय = बचत होने पर स्वतंत्रता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save freelance logo income",
          shortDescriptionHi: "फ्रीलांस लोगो आय बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "SIP some money spend some money",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest freelance pay in SIP",
          shortDescriptionHi: "एसआईपी में फ्रीलांस वेतन निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money shopping for new clothes",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Bank ka representative on campus. 'Free credit card lo bhai!' (Free credit card isn't free anything)",
    flavorHi: "परिसर में बैंक का प्रतिनिधि। 'फ्री क्रेडिट कार्ड लो भाई!' (मुफ़्त क्रेडिट कार्ड कुछ भी मुफ़्त नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Refuse. Debit card is enough.",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Refuse free credit card",
          shortDescriptionHi: "मुफ़्त क्रेडिट कार्ड से इनकार करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest instead of borrowing",
          shortDescriptionHi: "उधार लेने के बजाय निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money spent in month 1, interest compounds",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Group project material: some money. Kaun pay karega pehle? (Money agreements before work begins)",
    flavorHi: "Group project material: some money. Kaun pay karega pehle? (Money agreements before work begins)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Split upfront - collect immediately",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Split upfront and collect",
          shortDescriptionHi: "पहले से विभाजित करें और एकत्र करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest project savings early",
          shortDescriptionHi: "परियोजना बचत का शीघ्र निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Pay all yourself, spend weeks chasing",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Netflix + Spotify + Prime = monthly expenses. Sab use hota hai? (Audit subscriptions every quarter)",
    flavorHi: "नेटफ्लिक्स + स्पॉटिफ़ + प्राइम = मासिक खर्च। सब यूज़ होता है? (प्रत्येक तिमाही में ऑडिट सदस्यता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Keep 1, share 1, drop 1 = money saved",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Audit and cancel subscriptions",
          shortDescriptionHi: "ऑडिट करें और सदस्यताएँ रद्द करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest subscription savings wisely",
          shortDescriptionHi: "सदस्यता बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month for shows you half-watch",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Café pe study karna cool lagta hai. some money/visit. (Ambience doesn't help you pass exams)",
    flavorHi: "कैफे पे स्टडी करना कूल लगता है। कुछ पैसे/यात्रा. (माहौल आपको परीक्षा उत्तीर्ण करने में मदद नहीं करता)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Home 4 days, café once = save some money",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Study at home and save",
          shortDescriptionHi: "घर पर पढ़ाई करें और बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest cafe study savings",
          shortDescriptionHi: "कैफ़े अध्ययन बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month for ambience",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Campus placement! some money joining bonus cheque in hand. (Joining bonus sets the tone for life)",
    flavorHi: "कैम्पस प्लेसमेंट! हाथ में कुछ पैसों का जॉइनिंग बोनस चेक। (ज्वाइनिंग बोनस जीवन के लिए दिशा निर्धारित करता है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money emergency fund seed",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save for emergency fund",
          shortDescriptionHi: "आपातकालीन निधि के लिए बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money first mutual fund",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in first mutual fund",
          shortDescriptionHi: "सबसे पहले म्यूचुअल फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money iPhone accessories haul",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
          shortDescription: "Buy expensive iPhone accessories",
          shortDescriptionHi: "महंगी iPhone एक्सेसरीज़ खरीदें"
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
    flavor: "Friends ne Goa plan kiya. Budget: some money. Tune abhi nahi socha. (FOMO trips hurt more than FOMO feelings)",
    flavorHi: "Friends ne Goa plan kiya. Budget: some money. Tune abhi nahi socha. (FOMO trips hurt more than FOMO feelings)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Skip this one, plan next trip properly",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Skip Goa and plan properly",
          shortDescriptionHi: "गोवा छोड़ें और ठीक से योजना बनाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest Goa trip budget",
          shortDescriptionHi: "गोवा यात्रा बजट में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money credit card swipe",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Reference book: some money on Amazon or free at library. (The goal is knowledge, not ownership)",
    flavorHi: "संदर्भ पुस्तक: अमेज़ॅन पर कुछ पैसे या लाइब्रेरी में मुफ़्त। (लक्ष्य ज्ञान है, स्वामित्व नहीं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Library. Save some money.",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Borrow from library and save",
          shortDescriptionHi: "पुस्तकालय से उधार लें और बचत करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest book purchase savings",
          shortDescriptionHi: "पुस्तक खरीद बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money Amazon same day delivery",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money prize money! Parents bol rahe hain 'well done beta'. (Celebrate smart - the achievement is yours, not the spend)",
    flavorHi: "कुछ धनराशि पुरस्कार राशि! माता-पिता बोल रहे हैं 'शाबाश बेटा'। (स्मार्ट जश्न मनाएं - उपलब्धि आपकी है, खर्च की नहीं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money to savings",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save prize money securely",
          shortDescriptionHi: "पुरस्कार राशि सुरक्षित रूप से सहेजें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in index fund",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest prize in index fund",
          shortDescriptionHi: "पुरस्कार को इंडेक्स फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on party for 40 friends",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Laptop slow ho gaya. Repair some money ya new one some money? (Repair before replace. Always.)",
    flavorHi: "लैपटॉप स्लो हो गया. कुछ पैसे मरम्मत या नया कुछ पैसे? (बदलने से पहले मरम्मत करें। हमेशा।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Repair first, save for new",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Repair first and save later",
          shortDescriptionHi: "पहले मरम्मत करें और बाद में बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest repair savings smartly",
          shortDescriptionHi: "मरम्मत की बचत को समझदारी से निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on EMI you can't afford",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "monthly expenses part-time offer. Time toh lagega. (Earning is step 1. Saving is step 2.)",
    flavorHi: "मासिक खर्च अंशकालिक प्रस्ताव। टाइम तो लगेगा. (कमाई चरण 1 है। बचत चरण 2 है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money/month saved",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save part-time job earnings",
          shortDescriptionHi: "अंशकालिक नौकरी की कमाई बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money SIP start",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Start SIP with part-time pay",
          shortDescriptionHi: "अंशकालिक वेतन के साथ एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money lifestyle inflate immediately",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Hostel mess ne fees some money barhaa di. Baaki budget tighten karo. (Budget is a living document - adjust it)",
    flavorHi: "हॉस्टल मेस ने फीस कुछ पैसे बरहा दी। बाकी बजट टाइट करो. (बजट एक जीवित दस्तावेज़ है - इसे समायोजित करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Cut eating-out by monthly expenses",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Cut eating out expenses",
          shortDescriptionHi: "बाहर खाने के खर्च में कटौती करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest remaining food budget",
          shortDescriptionHi: "बचे हुए भोजन बजट का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Borrow some money extra from home",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
        description: "Get some money now, pay EMI",
        effect: { type: 'wealth_pct', value: -27, target: 'self' },
        mentorInsight: "You just took a loan for a phone. The interest will bleed your wealth."
      },
      {
        type: 'save',
        label: "Decline",
        description: "Use old phone",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        mentorInsight: "Great discipline! Delaying gratification keeps you debt-free."
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
        type: 'invest',
        label: "Take EMI",
        description: "Get some money for gym",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -11, target: 'self' },
        mentorInsight: "Fitness is good, but paying 15% interest for a gym you might not visit is bad."
      },
      {
        type: 'save',
        label: "Decline",
        description: "Workout at home",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Smart choice. You avoided a subscription trap."
      },
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
    type: 'decision',
    tier: 'common',
    flavor: "some money pehli salary. HR bol raha hai - 'Treat dena!' (50-30-20 rule starts from salary #1)",
    flavorHi: "some money pehli salary. HR bol raha hai - 'Treat dena!' (50-30-20 rule starts from salary #1)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money emergency fund start",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Start your emergency fund",
          shortDescriptionHi: "अपना आपातकालीन कोष शुरू करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money first SIP!",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Start your first SIP",
          shortDescriptionHi: "अपना पहला एसआईपी शुरू करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money blown in one weekend",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "HR ne form diya - PF opt in ya out? 'Cash mein zyada milega bhai.' (PF is your future self's thank you note)",
    flavorHi: "HR ne form diya - PF opt in ya out? 'Cash mein zyada milega bhai.' (PF is your future self's thank you note)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Opt in always - forced saving",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Opt in for forced savings",
          shortDescriptionHi: "जबरन बचत का विकल्प चुनें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "It's investing in 60-year-you",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in your future self",
          shortDescriptionHi: "अपने भविष्य में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Opt out, spend the monthly expenses",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Phone chura liya kisi ne! Replacement: some money. (Gadget insurance costs monthly expenses. Think.)",
    flavorHi: "फ़ोन चुरा लिया किसी ने! प्रतिस्थापन: कुछ पैसे. (गैजेट बीमा का मासिक खर्च होता है। सोचिए।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Repair old phone for some money",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Repair old phone and save",
          shortDescriptionHi: "पुराने फोन की मरम्मत करें और बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest gadget insurance savings",
          shortDescriptionHi: "गैजेट बीमा बचत निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money flagship on impulse",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Boss ne hint diya - appraisal aane wala hai. (Not negotiating is expensive)",
    flavorHi: "Boss ne hint diya - appraisal aane wala hai. (Not negotiating is expensive)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Research market rate first",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Research market rate first",
          shortDescriptionHi: "पहले बाजार दर पर शोध करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Negotiate! Salary is your biggest asset",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Negotiate salary for better investment",
          shortDescriptionHi: "बेहतर निवेश के लिए वेतन पर बातचीत करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Accept without asking. Lose yearly expenses.",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Salary badi toh sab kuch upgrade kar liya - rent, phone, food. (When income rises, savings rate should too)",
    flavorHi: "Salary badi toh sab kuch upgrade kar liya - rent, phone, food. (When income rises, savings rate should too)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Increase savings %, not just spends",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Increase your savings rate",
          shortDescriptionHi: "अपनी बचत दर बढ़ाएँ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Save 50% of hike",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest half of your hike",
          shortDescriptionHi: "अपनी बढ़ोतरी का आधा हिस्सा निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/year in lifestyle inflation",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money performance bonus! Dost bol raha hai Manali chalte hain. (Bonus should work harder than you do)",
    flavorHi: "some money performance bonus! Dost bol raha hai Manali chalte hain. (Bonus should work harder than you do)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money emergency fund",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save bonus for emergency fund",
          shortDescriptionHi: "आपातकालीन निधि के लिए बोनस बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in mutual fund",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest bonus in mutual fund",
          shortDescriptionHi: "म्यूचुअल फंड में बोनस निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on Manali trip",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Team dinner at a fancy place. Bill: some money. You suggested splitting. (Be politely firm about money boundaries)",
    flavorHi: "एक शानदार जगह पर टीम का रात्रि भोज। बिल: कुछ पैसे. आपने बंटवारे का सुझाव दिया. (पैसे की सीमाओं के बारे में विनम्रतापूर्वक दृढ़ रहें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Propose split equally, stick to some money budget",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Split equally and stick budget",
          shortDescriptionHi: "समान रूप से विभाजित करें और बजट चिपकाएँ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest saved dinner budget",
          shortDescriptionHi: "रात के खाने के बजट में बचत करके निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money 'bhai tu junior hai, tereko pay karna chahiye'",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "WFH bachata hai monthly expenses on commute & food. (Savings windfalls should be redirected, not spent)",
    flavorHi: "WFH बचाता है आवागमन और भोजन पर मासिक खर्च। (बचत के अप्रत्याशित लाभ को पुनर्निर्देशित किया जाना चाहिए, खर्च नहीं किया जाना चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money to SIP, some money enjoy",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save commute and food money",
          shortDescriptionHi: "आवागमन और भोजन के पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Step up SIP",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Step up your monthly SIP",
          shortDescriptionHi: "अपना मासिक एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money on new gaming chair",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Avoid taking new EMI loans",
          shortDescriptionHi: "नई ईएमआई लोन लेने से बचें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest instead of paying EMI",
          shortDescriptionHi: "ईएमआई चुकाने के बजाय निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Add a laptop EMI. Why not.",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    name: "Job Switch ka Mania",
    nameHi: "जॉब स्विच उन्माद",
    type: 'decision',
    tier: 'common',
    flavor: "some money hike at new company. Joining bonus bhi hai. (Hikes should boost savings more than lifestyle)",
    flavorHi: "नई कंपनी में कुछ धन वृद्धि। जॉइनिंग बोनस भी है. (हाइक से जीवनशैली से ज्यादा बचत को बढ़ावा मिलना चाहिए)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved from hike",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save money from salary hike",
          shortDescriptionHi: "वेतन वृद्धि से पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Step up SIP by some money",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Step up SIP with hike",
          shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money lifestyle upgrade immediately",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "daily expenses office lunch order. Monthly: some money. Mahine mein? (Convenience spending is the sneakiest)",
    flavorHi: "दैनिक व्यय कार्यालय दोपहर के भोजन का आदेश। मासिक: कुछ पैसे. माहीन में? (सुविधा व्यय सबसे गुप्त है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Tiffin 3 days = save some money",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Bring tiffin to save money",
          shortDescriptionHi: "पैसे बचाने के लिए टिफ़िन लाएँ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest office lunch savings",
          shortDescriptionHi: "कार्यालय दोपहर के भोजन की बचत का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month ordering daily",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Content writing side hustle earned some money this month! (Side income = fast-forward button on wealth)",
    flavorHi: "कंटेंट राइटिंग साइड हसल ने इस महीने कुछ पैसे कमाए! (अतिरिक्त आय = धन पर तेजी से आगे बढ़ने वाला बटन)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money saved",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save content writing earnings",
          shortDescriptionHi: "सामग्री लेखन आय बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in SIP",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest side hustle in SIP",
          shortDescriptionHi: "एसआईपी में निवेश पक्ष की हलचल"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money vacation fund (not planned)",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money lakh MBA loan. Worth it ya nahi? (Education loans need a repayment plan, not just hope)",
    flavorHi: "कुछ पैसे लाख एमबीए ऋण. क्या यह इसके लायक है नहीं? (शिक्षा ऋण के लिए पुनर्भुगतान योजना की आवश्यकता है, न कि केवल आशा की)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Research ROI first. Placement record dekhna.",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Research ROI and placement first",
          shortDescriptionHi: "पहले आरओआई और प्लेसमेंट पर शोध करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Only if placement data is strong",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest only if placement strong",
          shortDescriptionHi: "प्लेसमेंट मजबूत हो तो ही निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent moneyL loan with no plan = debt trap",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "'Yaar ek tip hai. 3x ho jaayega 1 mahine mein!' (Free tips are the most expensive advice)",
    flavorHi: "'Yaar ek tip hai. 3x ho jaayega 1 mahine mein!' (Free tips are the most expensive advice)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Ignore. Report the channel.",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Ignore tip and report channel",
          shortDescriptionHi: "टिप और रिपोर्ट चैनल पर ध्यान न दें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Stick to index funds",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Stick to safe index funds",
          shortDescriptionHi: "सुरक्षित इंडेक्स फंड पर टिके रहें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money in pump-and-dump scheme",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Gym: monthly expenses. YouTube: Free. Fitness goals same. (Pay for habits only after proving them free)",
    flavorHi: "जिम: मासिक खर्च. यूट्यूब: निःशुल्क. फिटनेस लक्ष्य समान. (आदतों को मुफ़्त साबित करने के बाद ही उनका भुगतान करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "YouTube for 3 months. Gym if consistent.",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Try free YouTube workouts first",
          shortDescriptionHi: "पहले निःशुल्क YouTube वर्कआउट आज़माएँ"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest saved gym membership fees",
          shortDescriptionHi: "जिम सदस्यता शुल्क बचाकर निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money/month, go 4 times, quit",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money income tax refund arrived. 'Iska toh plan hi nahi tha!' (Unexpected income = unexpected future security)",
    flavorHi: "कुछ पैसे इनकम टैक्स रिफंड आ गए. 'इसका तो प्लान ही नहीं था!' (अप्रत्याशित आय = अप्रत्याशित भविष्य की सुरक्षा)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money to emergency fund",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save refund to emergency fund",
          shortDescriptionHi: "आपातकालीन निधि में धनवापसी बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in ELSS",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest tax refund in ELSS",
          shortDescriptionHi: "टैक्स रिफंड को ईएलएसएस में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money weekend trip",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Sab bol rahe hain us startup mein invest karo. Unverified. (FOMO is not a financial strategy)",
    flavorHi: "सब बोल रहे हैं हमें स्टार्टअप में निवेश करो। असत्यापित. (FOMO कोई वित्तीय रणनीति नहीं है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Wait. Research first.",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Wait and research startup first",
          shortDescriptionHi: "प्रतीक्षा करें और पहले स्टार्टअप पर शोध करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Max some money if you can lose it",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest maximum affordable loss amount",
          shortDescriptionHi: "अधिकतम किफायती हानि राशि का निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money in unverified startup",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Landlord hike maang raha hai some money extra. Compare karo. (Everything in India is negotiable)",
    flavorHi: "मकान मालिक ने कुछ पैसे अतिरिक्त मांगे हैं। कारो की तुलना करें. (भारत में हर चीज़ परक्राम्य है)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Negotiate down or shift = yearly expenses",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Negotiate rent or shift house",
          shortDescriptionHi: "किराए पर बातचीत करें या घर शिफ्ट करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest saved rent money",
          shortDescriptionHi: "बचाए हुए किराये के पैसे निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Accept silently. some money lost/year.",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Company referral bonus: some money cheque! (Bonus ≠ spend. Bonus = advance your goals.)",
    flavorHi: "कंपनी रेफरल बोनस: कुछ पैसे का चेक! (बोनस ≠ खर्च करें। बोनस = अपने लक्ष्यों को आगे बढ़ाएं।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money in liquid fund",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save bonus in liquid fund",
          shortDescriptionHi: "लिक्विड फंड में बोनस बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "some money in SIP top-up",
        effect: { type: 'wealth_pct', value: 9, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Top up SIP with bonus",
          shortDescriptionHi: "बोनस के साथ एसआईपी टॉप अप करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money new headphone + watch combo",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "4 apps auto-renewing. Total: monthly expenses. Kab subscribe kiya? (Audit your apps every 3 months)",
    flavorHi: "4 ऐप्स स्वत: नवीनीकरण। कुल: मासिक खर्च. कब सब्सक्राइब किया? (हर 3 महीने में अपने ऐप्स का ऑडिट करें)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Cancel 2 now = money saved",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Cancel unused subscriptions and save",
          shortDescriptionHi: "अप्रयुक्त सदस्यताएँ रद्द करें और सहेजें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Invest for potential growth",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest cancelled subscription savings",
          shortDescriptionHi: "रद्द की गई सदस्यता बचत को निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Forget them. yearly expenses gone.",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "Office plan only ya add personal plan bhi? (One surgery will make you wish you had more cover)",
    flavorHi: "केवल कार्यालय योजना, क्या व्यक्तिगत योजना भी जोड़ें? (एक सर्जरी से आप चाहेंगे कि आपके पास और अधिक कवर हो)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Office + monthly expenses personal top-up",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Top up personal health insurance",
          shortDescriptionHi: "व्यक्तिगत स्वास्थ्य बीमा टॉप अप करें"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Health = wealth",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest in your personal health",
          shortDescriptionHi: "अपने व्यक्तिगत स्वास्थ्य में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Only office plan. Hope nothing happens.",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "money saved. Europe trip ya mutual fund? (Travel is beautiful. Compound interest is more beautiful.)",
    flavorHi: "पैसा बचाया. यूरोप यात्रा या म्यूचुअल फंड? (यात्रा सुंदर है। चक्रवृद्धि ब्याज अधिक सुंदर है।)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Put some money in fund, travel local",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Travel local and save money",
          shortDescriptionHi: "स्थानीय यात्रा करें और पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Saved money in equity fund",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Invest savings in equity fund",
          shortDescriptionHi: "बचत को इक्विटी फंड में निवेश करें"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money Europe trip on a whim",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    flavor: "some money course led to some money salary hike! (Skills don't just pay - they compound)",
    flavorHi: "कुछ धन पाठ्यक्रम के कारण कुछ धन वेतन वृद्धि हुई! (कौशल केवल लाभ नहीं देता - वे जुड़ते हैं)",
    options: [
      {
        type: 'save',
        label: "Save",
        description: "Saved money/month more to save",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "Saving builds the foundation of your wealth. A safe and reliable choice.",
          shortDescription: "Save more money monthly",
          shortDescriptionHi: "मासिक रूप से अधिक पैसे बचाएं"
    },
      {
        type: 'invest',
        label: "Invest",
        description: "Step up SIP by some money",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing puts your money to work. Risk is involved, but so is growth.",
          shortDescription: "Step up SIP with hike",
          shortDescriptionHi: "बढ़ोतरी के साथ एसआईपी बढ़ाएं"
    },
      {
        type: 'spend',
        label: "Spend",
        description: "Spent money hike all spent on lifestyle",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Immediate gratification feels good now, but it delays your long-term goals.",
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
    name: "L4 Event 59",
    nameHi: "एल4 इवेंट 59",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-060",
    name: "L4 Event 60",
    nameHi: "एल4 इवेंट 60",
    type: 'decision',
    tier: 'epic',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 25, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -28, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-061",
    name: "L4 Event 61",
    nameHi: "एल4 इवेंट 61",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-062",
    name: "L4 Event 62",
    nameHi: "एल4 इवेंट 62",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-063",
    name: "L4 Event 63",
    nameHi: "एल4 इवेंट 63",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-064",
    name: "L4 Event 64",
    nameHi: "एल4 इवेंट 64",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-065",
    name: "L4 Event 65",
    nameHi: "एल4 इवेंट 65",
    type: 'decision',
    tier: 'epic',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 33, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -23, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -21, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-066",
    name: "L4 Event 66",
    nameHi: "एल4 इवेंट 66",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 20, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-067",
    name: "L4 Event 67",
    nameHi: "एल4 इवेंट 67",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-068",
    name: "L4 Event 68",
    nameHi: "एल4 इवेंट 68",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-069",
    name: "L4 Event 69",
    nameHi: "एल4 इवेंट 69",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 7, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 16, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -11, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-070",
    name: "L4 Event 70",
    nameHi: "एल4 इवेंट 70",
    type: 'decision',
    tier: 'epic',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 32, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -26, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-071",
    name: "L4 Event 71",
    nameHi: "एल4 इवेंट 71",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-072",
    name: "L4 Event 72",
    nameHi: "एल4 इवेंट 72",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 6, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 15, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -14, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -14, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-073",
    name: "L4 Event 73",
    nameHi: "एल4 इवेंट 73",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 11, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-074",
    name: "L4 Event 74",
    nameHi: "एल4 इवेंट 74",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 3, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-075",
    name: "L4 Event 75",
    nameHi: "एल4 इवेंट 75",
    type: 'decision',
    tier: 'epic',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 29, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -22, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -24, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-076",
    name: "L4 Event 76",
    nameHi: "एल4 इवेंट 76",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-077",
    name: "L4 Event 77",
    nameHi: "एल4 इवेंट 77",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-078",
    name: "L4 Event 78",
    nameHi: "एल4 इवेंट 78",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 19, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-079",
    name: "L4 Event 79",
    nameHi: "एल4 इवेंट 79",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 4, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-080",
    name: "L4 Event 80",
    nameHi: "एल4 इवेंट 80",
    type: 'decision',
    tier: 'epic',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 26, target: 'self' },
        investRisk: 40,
        failEffect: { type: 'wealth_pct', value: -23, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -28, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-081",
    name: "L4 Event 81",
    nameHi: "एल4 इवेंट 81",
    type: 'decision',
    tier: 'rare',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 8, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 17, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -13, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -12, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-082",
    name: "L4 Event 82",
    nameHi: "एल4 इवेंट 82",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 12, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -6, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
  {
    id: "dc_s-083",
    name: "L4 Event 83",
    nameHi: "एल4 इवेंट 83",
    type: 'decision',
    tier: 'common',
    flavor: "A major mid-life financial decision approaches. The stakes are higher now.",
    flavorHi: "मध्य जीवन का एक बड़ा वित्तीय निर्णय निकट आ रहा है। अब दांव ऊंचे हैं.",
    options: [
      {
        type: 'save',
        label: "Conservative",
        description: "Safe but slow",
        effect: { type: 'wealth_pct', value: 5, target: 'self' },
        mentorInsight: "At this stage, pure saving won't beat inflation, but it preserves capital."
      },
      {
        type: 'invest',
        label: "Aggressive",
        description: "High risk, high reward",
        effect: { type: 'wealth_pct', value: 10, target: 'self' },
        investRisk: 30,
        failEffect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Investing heavily is necessary for retirement, but ensure you diversify."
      },
      {
        type: 'spend',
        label: "Lifestyle Up",
        description: "Enjoy the wealth",
        effect: { type: 'wealth_pct', value: -7, target: 'self' },
        mentorInsight: "Lifestyle inflation can destroy years of hard work. Be mindful."
      },
    ],
      shortName: "Big Choice",
      shortNameHi: "बड़ा विकल्प",
      shortFlavor: "Big choice. (High stakes)",
      shortFlavorHi: "बड़ा विकल्प. (उच्च दांव)"
},
];
