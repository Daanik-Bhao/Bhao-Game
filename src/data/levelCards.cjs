"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_SITUATION_CARDS = void 0;
exports.LEVEL_SITUATION_CARDS = [
    {
        "id": "dc_s-001",
        "name": "Pocket Money Dilemma",
        "type": "decision",
        "tier": "common",
        "flavor": "₹500 pocket money in hand. Vada pav or piggy bank? (Save first, spend what's left)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹300 saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 300,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹500 gone by Sunday",
                "effect": {
                    "type": "wealth_change",
                    "value": -500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-002",
        "name": "School Trip ka Chakkar",
        "type": "decision",
        "tier": "common",
        "flavor": "Trip costs ₹1,200. You have ₹800. Kya plan hai? (Planning beats panic)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Save ₹200/week, go later",
                "effect": {
                    "type": "wealth_change",
                    "value": 200,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹1,200 parents bail you out",
                "effect": {
                    "type": "wealth_change",
                    "value": -1200,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-003",
        "name": "Birthday Bonanza",
        "type": "decision",
        "tier": "common",
        "flavor": "Relatives gifted ₹3,000. 'Padhai ke liye hai beta.' (Gift money is seed money)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹2,000 in piggy bank",
                "effect": {
                    "type": "wealth_change",
                    "value": 2000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Open kids FD +₹100 interest",
                "effect": {
                    "type": "wealth_change",
                    "value": 100,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹3,000 on gaming credits",
                "effect": {
                    "type": "wealth_change",
                    "value": -3000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-004",
        "name": "Canteen Temptation",
        "type": "decision",
        "tier": "common",
        "flavor": "Daily canteen vs tiffin. Difference: ₹40/day. (Small daily habits = big yearly numbers)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹800/month saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 800,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹9,600/year on samosas",
                "effect": {
                    "type": "wealth_change",
                    "value": -9600,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-005",
        "name": "Second-Hand Cycle Deal",
        "type": "decision",
        "tier": "common",
        "flavor": "Classmate selling old cycle ₹800. New one costs ₹3,500. (Value > vanity)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Buy used, save ₹2,700",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹3,500 new one, EMI from parents",
                "effect": {
                    "type": "wealth_change",
                    "value": -3500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-006",
        "name": "Merit Scholarship",
        "type": "decision",
        "tier": "common",
        "flavor": "School gave ₹5,000 scholarship. Sab pooch rahe hain kya kiya? (Reward learning with more learning)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹3,500 banked",
                "effect": {
                    "type": "wealth_change",
                    "value": 3500,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹1,500 in book course",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹5,000 on new shoes & celebration",
                "effect": {
                    "type": "wealth_change",
                    "value": -5000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-007",
        "name": "Group Food Pressure",
        "type": "decision",
        "tier": "common",
        "flavor": "Every weekend eat-out with friends. FOMO is real. (Friendships don't depend on where you eat)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Skip 3 weekends, save ₹1,200",
                "effect": {
                    "type": "wealth_change",
                    "value": 3,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹400/weekend = -₹1,600/month",
                "effect": {
                    "type": "wealth_change",
                    "value": -400,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-008",
        "name": "Neighbour Uncle's Job",
        "type": "decision",
        "tier": "common",
        "flavor": "Uncle pays ₹300 for data entry work. Easy money! (First earned rupee deserves respect)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹200 saved, ₹100 spent",
                "effect": {
                    "type": "wealth_change",
                    "value": 200,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹300 spent same day",
                "effect": {
                    "type": "wealth_change",
                    "value": -300,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-009",
        "name": "Lost ₹200",
        "type": "decision",
        "tier": "common",
        "flavor": "Bhai, ₹200 gir gayi pocket se. Kya karte? (Losing money teaches more than earning)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Make do with ₹300 left",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Borrow ₹200 more and spend that too",
                "effect": {
                    "type": "wealth_change",
                    "value": -500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-010",
        "name": "Stationery Sale Trap",
        "type": "decision",
        "tier": "common",
        "flavor": "5 pens for ₹150 vs 1 quality pen for ₹80. Dono alag-alag shops. (Cheap bulk often costs more)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Buy 1 good pen, save ₹70",
                "effect": {
                    "type": "wealth_change",
                    "value": 1,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Buy all 5, lose 3 in a week",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-011",
        "name": "Find Money on Road",
        "type": "decision",
        "tier": "common",
        "flavor": "₹200 mil gayi footpath pe. No one's around. (Found money isn't free money)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹200 to piggy bank",
                "effect": {
                    "type": "wealth_change",
                    "value": 200,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹200 at chaat stall immediately",
                "effect": {
                    "type": "wealth_change",
                    "value": -200,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-012",
        "name": "Borrow Karna Padega",
        "type": "decision",
        "tier": "common",
        "flavor": "Friend needs ₹200. You have ₹250. Kya bologe? (Generosity with boundaries)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Lend ₹100, keep ₹150",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Lend all ₹200, you're now broke",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-013",
        "name": "Gaming Credit Offer",
        "type": "decision",
        "tier": "common",
        "flavor": "₹500 gaming credits on sale - 50% off today only! (Virtual spends are real losses)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Skip it - it's not real money",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹500 gone in 2 hours of play",
                "effect": {
                    "type": "wealth_change",
                    "value": -500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-014",
        "name": "Tiffin vs Canteen",
        "type": "decision",
        "tier": "common",
        "flavor": "Maa ne tiffin diya. Yaar bol raha hai 'canteen chal!' (Maa ka tiffin > peer pressure)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹40/day = ₹800/month saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 40,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹800/month for peer approval",
                "effect": {
                    "type": "wealth_change",
                    "value": -800,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-015",
        "name": "Garage Sale Find",
        "type": "decision",
        "tier": "common",
        "flavor": "Old comics sell for ₹600 at school flea market! (One man's old is another man's gold)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹400 to savings",
                "effect": {
                    "type": "wealth_change",
                    "value": 400,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Put ₹200 in piggy bank",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹600 on new comics immediately",
                "effect": {
                    "type": "wealth_change",
                    "value": -600,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-016",
        "name": "Zomato Zombie",
        "type": "decision",
        "tier": "common",
        "flavor": "Hostel mess ya Zomato roz? ₹120 vs ₹350 per meal. (Convenience has a monthly price tag)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹6,900/month with mess",
                "effect": {
                    "type": "wealth_change",
                    "value": 6900,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹6,900/month extra on Zomato",
                "effect": {
                    "type": "wealth_change",
                    "value": -6900,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-017",
        "name": "First Internship Pay",
        "type": "decision",
        "tier": "common",
        "flavor": "₹8,000 pehli kamai! Sab bol rahe hain 'treat de!' (First salary = first investment)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹3,000 in savings account",
                "effect": {
                    "type": "wealth_change",
                    "value": 3000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Start ₹1,000 SIP",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹8,000 on celebration treat",
                "effect": {
                    "type": "wealth_change",
                    "value": -8000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-018",
        "name": "Semester Fee Panic",
        "type": "decision",
        "tier": "common",
        "flavor": "₹25,000 fees in 2 months. No plan made. (Fee dates don't move. Your savings can.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Save ₹12,500/month from allowance",
                "effect": {
                    "type": "wealth_change",
                    "value": 12500,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Panic + parents ka call",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-019",
        "name": "Used Textbook Deal",
        "type": "decision",
        "tier": "common",
        "flavor": "Used copy ₹200 vs New copy ₹1,200. Dono available. (Knowledge matters. Not the spine.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹1,000 saved on books",
                "effect": {
                    "type": "wealth_change",
                    "value": 1000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹1,200 new book, used 4 times",
                "effect": {
                    "type": "wealth_change",
                    "value": -1200,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-020",
        "name": "Crypto Bro Advice",
        "type": "decision",
        "tier": "common",
        "flavor": "Dosto ne kaha: '₹5,000 lagao, double ho jaayega!' (FOMO is the most expensive emotion)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Say no, research first",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Only if you can afford to lose it",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹5,000 gone in the dip",
                "effect": {
                    "type": "wealth_change",
                    "value": -5000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-021",
        "name": "Skill Up or Chill",
        "type": "decision",
        "tier": "common",
        "flavor": "Coding bootcamp ₹15,000. Ya Netflix aur sona. (Skills compound like money)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Save over 3 months, then buy",
                "effect": {
                    "type": "wealth_change",
                    "value": 3,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Invest in skill - ROI is a job",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹15,000 on personal loan for skill",
                "effect": {
                    "type": "wealth_change",
                    "value": -15000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-022",
        "name": "Freelance Windfall",
        "type": "decision",
        "tier": "common",
        "flavor": "Client paid ₹6,000 for a logo design. Tu hi toh best hai! (Freelance income = freedom when saved)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹3,000 saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 3000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "SIP ₹2,000, spend ₹1,000",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹6,000 shopping for new clothes",
                "effect": {
                    "type": "wealth_change",
                    "value": -6000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-023",
        "name": "Credit Card Trap (College)",
        "type": "decision",
        "tier": "common",
        "flavor": "Bank ka representative on campus. 'Free credit card lo bhai!' (Free credit card isn't free anything)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Refuse. Debit card is enough.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹10,000 spent in month 1, interest compounds",
                "effect": {
                    "type": "wealth_change",
                    "value": -10000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-024",
        "name": "Group Project Bill",
        "type": "decision",
        "tier": "common",
        "flavor": "Group project material: ₹5,000. Kaun pay karega pehle? (Money agreements before work begins)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Split upfront - collect immediately",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Pay all yourself, spend weeks chasing",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-025",
        "name": "Subscription Overload",
        "type": "decision",
        "tier": "common",
        "flavor": "Netflix + Spotify + Prime = ₹1,100/month. Sab use hota hai? (Audit subscriptions every quarter)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Keep 1, share 1, drop 1 = ₹550 saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 1,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹1,100/month for shows you half-watch",
                "effect": {
                    "type": "wealth_change",
                    "value": -1100,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-026",
        "name": "Café Study Habit",
        "type": "decision",
        "tier": "common",
        "flavor": "Café pe study karna cool lagta hai. ₹200/visit. (Ambience doesn't help you pass exams)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Home 4 days, café once = save ₹600",
                "effect": {
                    "type": "wealth_change",
                    "value": 4,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹4,400/month for ambience",
                "effect": {
                    "type": "wealth_change",
                    "value": -4400,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-027",
        "name": "Placement Bonus",
        "type": "decision",
        "tier": "common",
        "flavor": "Campus placement! ₹12,000 joining bonus cheque in hand. (Joining bonus sets the tone for life)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹7,000 emergency fund seed",
                "effect": {
                    "type": "wealth_change",
                    "value": 7000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹3,000 first mutual fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹12,000 iPhone accessories haul",
                "effect": {
                    "type": "wealth_change",
                    "value": -12000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-028",
        "name": "Peer Pressure Trip",
        "type": "decision",
        "tier": "common",
        "flavor": "Friends ne Goa plan kiya. Budget: ₹12,000. Tune abhi nahi socha. (FOMO trips hurt more than FOMO feelings)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Skip this one, plan next trip properly",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹12,000 credit card swipe",
                "effect": {
                    "type": "wealth_change",
                    "value": -12000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-029",
        "name": "Library vs Amazon",
        "type": "decision",
        "tier": "common",
        "flavor": "Reference book: ₹800 on Amazon or free at library. (The goal is knowledge, not ownership)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Library. Save ₹800.",
                "effect": {
                    "type": "wealth_change",
                    "value": 800,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹800 Amazon same day delivery",
                "effect": {
                    "type": "wealth_change",
                    "value": -800,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-030",
        "name": "Won an Olympiad Prize",
        "type": "decision",
        "tier": "common",
        "flavor": "₹10,000 prize money! Parents bol rahe hain 'well done beta'. (Celebrate smart - the achievement is yours, not the spend)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹6,000 to savings",
                "effect": {
                    "type": "wealth_change",
                    "value": 6000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹3,000 in index fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹10,000 on party for 40 friends",
                "effect": {
                    "type": "wealth_change",
                    "value": -10000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-031",
        "name": "Laptop Breakdown",
        "type": "decision",
        "tier": "common",
        "flavor": "Laptop slow ho gaya. Repair ₹3,000 ya new one ₹40,000? (Repair before replace. Always.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Repair first, save for new",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹40,000 on EMI you can't afford",
                "effect": {
                    "type": "wealth_change",
                    "value": -40000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-032",
        "name": "Part-Time Job Offer",
        "type": "decision",
        "tier": "common",
        "flavor": "₹6,000/month part-time offer. Time toh lagega. (Earning is step 1. Saving is step 2.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹3,000/month saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 3000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹2,000 SIP start",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹6,000 lifestyle inflate immediately",
                "effect": {
                    "type": "wealth_change",
                    "value": -6000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-033",
        "name": "Mess Fee Hike",
        "type": "decision",
        "tier": "common",
        "flavor": "Hostel mess ne fees ₹500 barhaa di. Baaki budget tighten karo. (Budget is a living document - adjust it)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Cut eating-out by ₹500/month",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Borrow ₹500 extra from home",
                "effect": {
                    "type": "wealth_change",
                    "value": -500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-034",
        "name": "Latest Smartphone EMI",
        "type": "decision",
        "tier": "epic",
        "flavor": "Everyone has the new phone. You can get it on EMI!",
        "debtAmount": 50000,
        "interestRate": 0.12,
        "tenorMonths": 6,
        "mentorInsight": "Taking debt for a depreciating asset like a phone is a classic wealth trap.",
        "options": [
            {
                "type": "spend",
                "label": "Take EMI",
                "description": "Get ₹50,000 now, pay EMI",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "You just took a loan for a phone. The interest will bleed your wealth."
            },
            {
                "type": "save",
                "label": "Decline",
                "description": "Use old phone",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Great discipline! Delaying gratification keeps you debt-free."
            }
        ]
    },
    {
        "id": "dc_s-035",
        "name": "Gym Annual Subscription",
        "type": "decision",
        "tier": "rare",
        "flavor": "Huge discount on annual gym membership if you pay via credit card EMI.",
        "debtAmount": 20000,
        "interestRate": 0.15,
        "tenorMonths": 12,
        "mentorInsight": "Subscription traps often look like discounts. Be careful with EMIs.",
        "options": [
            {
                "type": "invest",
                "label": "Take EMI",
                "description": "Get ₹20,000 for gym",
                "effect": {
                    "type": "wealth_change",
                    "value": 20000,
                    "target": "self"
                },
                "mentorInsight": "Fitness is good, but paying 15% interest for a gym you might not visit is bad."
            },
            {
                "type": "save",
                "label": "Decline",
                "description": "Workout at home",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Smart choice. You avoided a subscription trap."
            }
        ]
    },
    {
        "id": "dc_s-036",
        "name": "Pehli Salary!",
        "type": "decision",
        "tier": "common",
        "flavor": "₹35,000 pehli salary. HR bol raha hai - 'Treat dena!' (50-30-20 rule starts from salary #1)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹7,000 emergency fund start",
                "effect": {
                    "type": "wealth_change",
                    "value": 7000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹3,000 first SIP!",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹35,000 blown in one weekend",
                "effect": {
                    "type": "wealth_change",
                    "value": -35000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-037",
        "name": "PF Opt In or Out",
        "type": "decision",
        "tier": "common",
        "flavor": "HR ne form diya - PF opt in ya out? 'Cash mein zyada milega bhai.' (PF is your future self's thank you note)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Opt in always - forced saving",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "It's investing in 60-year-you",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Opt out, spend the ₹1,800/month",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-038",
        "name": "Phone Snatch",
        "type": "decision",
        "tier": "common",
        "flavor": "Phone chura liya kisi ne! Replacement: ₹25,000. (Gadget insurance costs ₹100/month. Think.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Repair old phone for ₹3,000",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹25,000 flagship on impulse",
                "effect": {
                    "type": "wealth_change",
                    "value": -25000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-039",
        "name": "Salary Hike Time",
        "type": "decision",
        "tier": "common",
        "flavor": "Boss ne hint diya - appraisal aane wala hai. (Not negotiating is expensive)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Research market rate first",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Negotiate! Salary is your biggest asset",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Accept without asking. Lose ₹60,000/year.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-040",
        "name": "Lifestyle Creep",
        "type": "decision",
        "tier": "common",
        "flavor": "Salary badi toh sab kuch upgrade kar liya - rent, phone, food. (When income rises, savings rate should too)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Increase savings %, not just spends",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Save 50% of hike",
                "effect": {
                    "type": "wealth_change",
                    "value": 50,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹1,20,000/year in lifestyle inflation",
                "effect": {
                    "type": "wealth_change",
                    "value": -120000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-041",
        "name": "Year-End Bonus",
        "type": "decision",
        "tier": "common",
        "flavor": "₹20,000 performance bonus! Dost bol raha hai Manali chalte hain. (Bonus should work harder than you do)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹10,000 emergency fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 10000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹5,000 in mutual fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹20,000 on Manali trip",
                "effect": {
                    "type": "wealth_change",
                    "value": -20000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-042",
        "name": "Dinner with Seniors",
        "type": "decision",
        "tier": "common",
        "flavor": "Team dinner at a fancy place. Bill: ₹2,400. You suggested splitting. (Be politely firm about money boundaries)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Propose split equally, stick to ₹500 budget",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹2,400 'bhai tu junior hai, tereko pay karna chahiye'",
                "effect": {
                    "type": "wealth_change",
                    "value": -2400,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-043",
        "name": "Work From Home Savings",
        "type": "decision",
        "tier": "common",
        "flavor": "WFH bachata hai ₹3,000/month on commute & food. (Savings windfalls should be redirected, not spent)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹2,000 to SIP, ₹1,000 enjoy",
                "effect": {
                    "type": "wealth_change",
                    "value": 2000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Step up SIP",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹3,000 on new gaming chair",
                "effect": {
                    "type": "wealth_change",
                    "value": -3000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-044",
        "name": "EMI Bombarded",
        "type": "decision",
        "tier": "common",
        "flavor": "Phone EMI + bike EMI + credit card. 40% of salary gone. (EMIs don't feel heavy till they crush you)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "No new EMIs until existing ones end",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Add a laptop EMI. Why not.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-045",
        "name": "Job Switch ka Mania",
        "type": "decision",
        "tier": "common",
        "flavor": "₹10,000 hike at new company. Joining bonus bhi hai. (Hikes should boost savings more than lifestyle)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹5,000 saved from hike",
                "effect": {
                    "type": "wealth_change",
                    "value": 5000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Step up SIP by ₹2,000",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹10,000 lifestyle upgrade immediately",
                "effect": {
                    "type": "wealth_change",
                    "value": -10000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-046",
        "name": "Office Lunch Trap",
        "type": "decision",
        "tier": "common",
        "flavor": "₹150/day office lunch order. Monthly: ₹3,300. Mahine mein? (Convenience spending is the sneakiest)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Tiffin 3 days = save ₹2,000",
                "effect": {
                    "type": "wealth_change",
                    "value": 3,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹3,300/month ordering daily",
                "effect": {
                    "type": "wealth_change",
                    "value": -3300,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-047",
        "name": "Side Hustle Win",
        "type": "decision",
        "tier": "common",
        "flavor": "Content writing side hustle earned ₹12,000 this month! (Side income = fast-forward button on wealth)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹7,000 saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 7000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹4,000 in SIP",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹12,000 vacation fund (not planned)",
                "effect": {
                    "type": "wealth_change",
                    "value": -12000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-048",
        "name": "MBA Decision",
        "type": "decision",
        "tier": "common",
        "flavor": "₹15 lakh MBA loan. Worth it ya nahi? (Education loans need a repayment plan, not just hope)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Research ROI first. Placement record dekhna.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Only if placement data is strong",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹15L loan with no plan = debt trap",
                "effect": {
                    "type": "wealth_change",
                    "value": -15,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-049",
        "name": "Telegram Stock Tip",
        "type": "decision",
        "tier": "common",
        "flavor": "'Yaar ek tip hai. 3x ho jaayega 1 mahine mein!' (Free tips are the most expensive advice)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Ignore. Report the channel.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Stick to index funds",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹10,000 in pump-and-dump scheme",
                "effect": {
                    "type": "wealth_change",
                    "value": -10000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-050",
        "name": "Gym vs YouTube",
        "type": "decision",
        "tier": "common",
        "flavor": "Gym: ₹2,500/month. YouTube: Free. Fitness goals same. (Pay for habits only after proving them free)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "YouTube for 3 months. Gym if consistent.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹2,500/month, go 4 times, quit",
                "effect": {
                    "type": "wealth_change",
                    "value": -2500,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-051",
        "name": "Tax Refund Surprise",
        "type": "decision",
        "tier": "common",
        "flavor": "₹15,000 income tax refund arrived. 'Iska toh plan hi nahi tha!' (Unexpected income = unexpected future security)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹10,000 to emergency fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 10000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹5,000 in ELSS",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹15,000 weekend trip",
                "effect": {
                    "type": "wealth_change",
                    "value": -15000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-052",
        "name": "FOMO Investment",
        "type": "decision",
        "tier": "common",
        "flavor": "Sab bol rahe hain us startup mein invest karo. Unverified. (FOMO is not a financial strategy)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Wait. Research first.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Max ₹5,000 if you can lose it",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹30,000 in unverified startup",
                "effect": {
                    "type": "wealth_change",
                    "value": -30000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-053",
        "name": "Rent Negotiation",
        "type": "decision",
        "tier": "common",
        "flavor": "Landlord hike maang raha hai ₹1,500 extra. Compare karo. (Everything in India is negotiable)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Negotiate down or shift = ₹18,000/year",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Accept silently. ₹18,000 lost/year.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-054",
        "name": "Referral Bonus",
        "type": "decision",
        "tier": "common",
        "flavor": "Company referral bonus: ₹10,000 cheque! (Bonus ≠ spend. Bonus = advance your goals.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹6,000 in liquid fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 6000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "₹3,000 in SIP top-up",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹10,000 new headphone + watch combo",
                "effect": {
                    "type": "wealth_change",
                    "value": -10000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-055",
        "name": "Forgotten Subscriptions",
        "type": "decision",
        "tier": "common",
        "flavor": "4 apps auto-renewing. Total: ₹1,800/month. Kab subscribe kiya? (Audit your apps every 3 months)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Cancel 2 now = ₹900 saved",
                "effect": {
                    "type": "wealth_change",
                    "value": 2,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "-",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Forget them. ₹21,600/year gone.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-056",
        "name": "Health Insurance Confusion",
        "type": "decision",
        "tier": "common",
        "flavor": "Office plan only ya add personal plan bhi? (One surgery will make you wish you had more cover)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Office + ₹300/month personal top-up",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Health = wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "Only office plan. Hope nothing happens.",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-057",
        "name": "Invest or Travel?",
        "type": "decision",
        "tier": "common",
        "flavor": "₹50,000 saved. Europe trip ya mutual fund? (Travel is beautiful. Compound interest is more beautiful.)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "Put ₹35,000 in fund, travel local",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "+₹50,000 in equity fund",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹50,000 Europe trip on a whim",
                "effect": {
                    "type": "wealth_change",
                    "value": -50000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-058",
        "name": "Upskilling Payoff",
        "type": "decision",
        "tier": "common",
        "flavor": "₹8,000 course led to ₹15,000 salary hike! (Skills don't just pay - they compound)",
        "options": [
            {
                "type": "save",
                "label": "Save",
                "description": "+₹7,000/month more to save",
                "effect": {
                    "type": "wealth_change",
                    "value": 7000,
                    "target": "self"
                },
                "mentorInsight": "Saving builds the foundation of your wealth. A safe and reliable choice."
            },
            {
                "type": "invest",
                "label": "Invest",
                "description": "Step up SIP by ₹3,000",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing puts your money to work. Risk is involved, but so is growth."
            },
            {
                "type": "spend",
                "label": "Spend",
                "description": "-₹15,000 hike all spent on lifestyle",
                "effect": {
                    "type": "wealth_change",
                    "value": -15000,
                    "target": "self"
                },
                "mentorInsight": "Immediate gratification feels good now, but it delays your long-term goals."
            }
        ]
    },
    {
        "id": "dc_s-059",
        "name": "L4 Event 59",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-060",
        "name": "L4 Event 60",
        "type": "decision",
        "tier": "epic",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-061",
        "name": "L4 Event 61",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-062",
        "name": "L4 Event 62",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-063",
        "name": "L4 Event 63",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-064",
        "name": "L4 Event 64",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-065",
        "name": "L4 Event 65",
        "type": "decision",
        "tier": "epic",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-066",
        "name": "L4 Event 66",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-067",
        "name": "L4 Event 67",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-068",
        "name": "L4 Event 68",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-069",
        "name": "L4 Event 69",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-070",
        "name": "L4 Event 70",
        "type": "decision",
        "tier": "epic",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-071",
        "name": "L4 Event 71",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-072",
        "name": "L4 Event 72",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-073",
        "name": "L4 Event 73",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-074",
        "name": "L4 Event 74",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-075",
        "name": "L4 Event 75",
        "type": "decision",
        "tier": "epic",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-076",
        "name": "L4 Event 76",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-077",
        "name": "L4 Event 77",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-078",
        "name": "L4 Event 78",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-079",
        "name": "L4 Event 79",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-080",
        "name": "L4 Event 80",
        "type": "decision",
        "tier": "epic",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-081",
        "name": "L4 Event 81",
        "type": "decision",
        "tier": "rare",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-082",
        "name": "L4 Event 82",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    },
    {
        "id": "dc_s-083",
        "name": "L4 Event 83",
        "type": "decision",
        "tier": "common",
        "flavor": "A major mid-life financial decision approaches. The stakes are higher now.",
        "options": [
            {
                "type": "save",
                "label": "Conservative",
                "description": "Safe but slow",
                "effect": {
                    "type": "wealth_change",
                    "value": 50000,
                    "target": "self"
                },
                "mentorInsight": "At this stage, pure saving won't beat inflation, but it preserves capital."
            },
            {
                "type": "invest",
                "label": "Aggressive",
                "description": "High risk, high reward",
                "effect": {
                    "type": "wealth_change",
                    "value": 0,
                    "target": "self"
                },
                "mentorInsight": "Investing heavily is necessary for retirement, but ensure you diversify."
            },
            {
                "type": "spend",
                "label": "Lifestyle Up",
                "description": "Enjoy the wealth",
                "effect": {
                    "type": "wealth_change",
                    "value": -100000,
                    "target": "self"
                },
                "mentorInsight": "Lifestyle inflation can destroy years of hard work. Be mindful."
            }
        ]
    }
];
