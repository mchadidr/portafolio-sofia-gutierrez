const HERO_COMPOSITION_WIDTH = 1600
const HERO_COMPOSITION_HEIGHT = 900

const HERO_TEXT_POSITIONS = {
  year: {
    x: 225,
    y: 130
  },
  role: {
    x: 1050,
    y: 300
  },
  overlay1Name: {
    x: 334,
    y: 729,
    fontFamily: 'Libre Baskerville'
  },
  overlay2Title: {
    x: 510,
    y: 110
  },
  overlay2Body: {
    x: 630,
    y: 321
  },
  overlay2Line1: { x: 630, y: 321 },
  overlay2Line2: { x: 630, y: 352 },
  overlay2Line3: { x: 630, y: 383 },
  overlay2Line4: { x: 630, y: 414 },
  overlay2Line5: { x: 630, y: 452 },
  overlay2Line6: { x: 630, y: 483 },
  overlay2Line7: { x: 630, y: 514 },
  overlay2Line8: { x: 630, y: 545 },
  overlay2Line9: { x: 630, y: 576 },
  overlay2Line10: { x: 630, y: 624 },
  overlay2Line11: { x: 630, y: 655 },
  overlay2Line12: { x: 630, y: 686 },
  overlay2Line13: { x: 630, y: 717 },
  overlay2Line14: { x: 630, y: 765 },
  overlay2Line15: { x: 630, y: 796 },
  overlay2Line16: { x: 630, y: 827 },

  overlay3TitleEducation: { x: 30, y: 118 },
  overlay3HighSchoolLabel: { x: 50, y: 162 },
  overlay3HighSchoolValue: { x: 50, y: 186 },
  overlay3UniversityLabel: { x: 50, y: 245 },
  overlay3UniversityValue1: { x: 50, y: 270 },
  overlay3UniversityValue2: { x: 50, y: 295 },

  overlay3TitleWork: { x: 30, y: 350 },
  overlay3WorkValue: { x: 50, y: 390 },

  overlay3TitleLanguages: { x: 30, y: 445 },
  overlay3LanguageValue1: { x: 50, y: 485 },
  overlay3LanguageValue2: { x: 50, y: 510 },

  overlay3TitleSoftSkills: { x: 30, y: 574 },
  overlay3SkillLeft1: { x: 50, y: 615 },
  overlay3SkillLeft2: { x: 50, y: 642 },
  overlay3SkillLeft3: { x: 50, y: 670 },
  overlay3SkillLeft4: { x: 50, y: 698 },
  overlay3SkillLeft5: { x: 50, y: 726 },
  overlay3SkillRight1: { x: 240, y: 615 },
  overlay3SkillRight2: { x: 240, y: 642 },
  overlay3SkillRight3: { x: 240, y: 670 },

  overlay3Software1: { x: 724, y: 258 },
  overlay3Software2: { x: 940, y: 258 },
  overlay3Software3: { x: 1120, y: 258 },
  overlay3Software4: { x: 1300, y: 323 },
  overlay3Software5: { x: 742, y: 424 },
  overlay3Software6: { x: 910, y: 424 },
  overlay3Software7: { x: 1116, y: 424 },
  overlay3Software8: { x: 1268, y: 424 },

  overlay5Title: { x: 60, y: 570 },
  overlay5Paragraph: { x:40, y: 698 },
  overlay5Partnership: { x: 40, y: 840 },

  overlay6Title: { x: 840, y: 54 },
  overlay6Paragraph1: { x: 830, y: 150 },
  overlay6Paragraph2: { x: 830, y: 330 },
  overlay6Paragraph3: { x: 830, y: 430 },
  overlay6Paragraph4: { x: 830, y: 590 },
  overlay6Partnership: { x: 830, y: 750 },

  overlay7Title: { x: 50, y: 44 },
  overlay7Paragraph: { x: 50, y: 220 },
  overlay7Partnership: { x: 30, y: 825 },

  overlay8Title: { x: 90, y: 58 },
  overlay8Paragraph1: { x:105, y: 248 },
  overlay8Paragraph2: { x: 105, y: 340 },
  overlay8Paragraph3: { x: 105, y: 495 },
  overlay8Award: { x: 105, y: 578 },
  overlay8Partnership: { x: 105, y: 664 },

  overlay16EmailBox: { x: 98, y: 538},
  overlay16PhoneBox: { x: 680, y: 538 },
  overlay16SocialBox: { x: 1100, y: 538 }
}

function toPercentPosition({ x, y }) {
  return {
    left: `${(x / HERO_COMPOSITION_WIDTH) * 100}%`,
    top: `${(y / HERO_COMPOSITION_HEIGHT) * 100}%`
  }
}

export { HERO_COMPOSITION_WIDTH, HERO_COMPOSITION_HEIGHT, toPercentPosition }

export default HERO_TEXT_POSITIONS