import { useEffect, useRef, useState } from 'react'
import './Hero.css'
import HERO_TEXT_POSITIONS, { toPercentPosition } from './heroTextPositions.jsx'

const FIRST_TRANSITION_DISTANCE_VIEWPORTS = 0.42
const HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS = 1
const FIRST_TRANSITION_START_DEADZONE_PX = 10
const HORIZONTAL_TRANSITION_8TO9_START_DEADZONE_PX = 12
const FIRST_TRANSITION_INITIAL_SCALE = 0.75
const FIRST_TRANSITION_PEAK_SCALE = 0.98
const FIRST_TRANSITION_SCALE_PHASE_END = 0.32
const FIRST_TRANSITION_UNDER_REVEAL_START = 0.03
const FIRST_TRANSITION_UNDER_REVEAL_SETTLE_END = 0.2
const FIRST_TRANSITION_UNDER_REVEAL_OFFSET_VH = 7
const SCENE5_BRANCH_TRANSITION_MS = 620
const SCENE15_TO_16_START_DEADZONE_RATIO = 0.25
const SCENE15_TO_16_ENTRY_OFFSET_VH = 110
const SCENE15_TO_16_TRANSITION_DISTANCE_VIEWPORTS = 3

function Hero({ t, lang }) {
  const [firstTransitionProgress, setFirstTransitionProgress] = useState(0)
  const [horizontalTransitionProgress, setHorizontalTransitionProgress] = useState(0)
  const [horizontalTransition8To9Progress, setHorizontalTransition8To9Progress] = useState(0)
  const [scene15To16TransitionProgress, setScene15To16TransitionProgress] = useState(0)
  const [isScene5BOpen, setIsScene5BOpen] = useState(false)
  const [isScene5BMounted, setIsScene5BMounted] = useState(false)
  const [isScene5BClosing, setIsScene5BClosing] = useState(false)
  const [isScene6BOpen, setIsScene6BOpen] = useState(false)
  const [isScene6BMounted, setIsScene6BMounted] = useState(false)
  const [isScene6BClosing, setIsScene6BClosing] = useState(false)
  const [isScene7BOpen, setIsScene7BOpen] = useState(false)
  const [isScene7BMounted, setIsScene7BMounted] = useState(false)
  const [isScene7BClosing, setIsScene7BClosing] = useState(false)
  const [isScene8BOpen, setIsScene8BOpen] = useState(false)
  const [isScene8BMounted, setIsScene8BMounted] = useState(false)
  const [isScene8BClosing, setIsScene8BClosing] = useState(false)
  const [debugScrollY, setDebugScrollY] = useState(0)

  const firstTransitionRef = useRef(null)
  const horizontalTransitionRef = useRef(null)
  const horizontalTransition8To9Ref = useRef(null)
  const scene15To16TransitionRef = useRef(null)
  const isScene5BActiveRef = useRef(false)
  const isScene6BActiveRef = useRef(false)
  const isScene7BActiveRef = useRef(false)
  const isScene8BActiveRef = useRef(false)
  const scene5BCloseTimerRef = useRef(0)
  const scene6BCloseTimerRef = useRef(0)
  const scene7BCloseTimerRef = useRef(0)
  const scene8BCloseTimerRef = useRef(0)

  useEffect(() => {
    isScene5BActiveRef.current = isScene5BMounted || isScene5BClosing
    isScene6BActiveRef.current = isScene6BMounted || isScene6BClosing
    isScene7BActiveRef.current = isScene7BMounted || isScene7BClosing
    isScene8BActiveRef.current = isScene8BMounted || isScene8BClosing
  }, [isScene5BMounted, isScene5BClosing, isScene6BMounted, isScene6BClosing, isScene7BMounted, isScene7BClosing, isScene8BMounted, isScene8BClosing])

  const imagePaths = Array.from({ length: 17 }, (_, index) => {
    const imageNumber = index + 1
    return `${import.meta.env.BASE_URL}images/${imageNumber}.png`
  })

  const firstTransitionBackgroundSrc = `${import.meta.env.BASE_URL}images/background.svg`
  const sharedCompositionBackgroundSrc = `${import.meta.env.BASE_URL}images/background.svg`
  const sharedBackgroundDebugMode = new URLSearchParams(window.location.search).get('heroBackground') === 'red'
  const sharedBackgroundStyle = sharedBackgroundDebugMode
    ? { backgroundColor: '#d71920', backgroundImage: 'none' }
    : { backgroundImage: `url(${sharedCompositionBackgroundSrc})` }
  const h = t.hero

  const formatTemplate = (template, values) => {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, String(value)),
      template
    )
  }

  const imageAnchors = {
    2: 'about',
    4: 'projects',
    16: 'contact'
  }

  useEffect(() => {
    let animationFrameId = 0

    const calculateProgress = (element, transitionViewportDistance, startDeadzonePx = 0) => {
      if (!element) {
        return 0
      }

      const transitionRect = element.getBoundingClientRect()
      const transitionDistance = window.innerHeight * transitionViewportDistance
      const scrolledWithinTransition = Math.min(Math.max(-transitionRect.top, 0), transitionDistance)

      if (startDeadzonePx > 0) {
        // Keep the first few pixels static to avoid an initial micro-jitter at transition start.
        const effectiveDistance = Math.max(transitionDistance - startDeadzonePx, 1)
        const effectiveScrolled = Math.max(scrolledWithinTransition - startDeadzonePx, 0)
        return Math.min(Math.max(effectiveScrolled / effectiveDistance, 0), 1)
      }

      return Math.min(Math.max(scrolledWithinTransition / Math.max(transitionDistance, 1), 0), 1)
    }

    const setStableProgress = (setProgress, nextProgress) => {
      setProgress((previousProgress) => {
        if (Math.abs(previousProgress - nextProgress) < 0.0005) {
          return previousProgress
        }

        return nextProgress
      })
    }

    const updateTransitionProgress = () => {
      animationFrameId = 0

      if (isScene5BActiveRef.current || isScene6BActiveRef.current || isScene7BActiveRef.current || isScene8BActiveRef.current) {
        return
      }

      const nextFirstProgress = calculateProgress(
        firstTransitionRef.current,
        FIRST_TRANSITION_DISTANCE_VIEWPORTS,
        FIRST_TRANSITION_START_DEADZONE_PX
      )

      const nextHorizontalProgress = calculateProgress(
        horizontalTransitionRef.current,
        HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS
      )

      const nextHorizontal8To9Progress = calculateProgress(
        horizontalTransition8To9Ref.current,
        HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS,
        HORIZONTAL_TRANSITION_8TO9_START_DEADZONE_PX
      )

      const nextScene15To16Progress = calculateProgress(
        scene15To16TransitionRef.current,
        SCENE15_TO_16_TRANSITION_DISTANCE_VIEWPORTS,
        // Hold scene 15 longer before scene 16 starts entering.
        window.innerHeight * SCENE15_TO_16_START_DEADZONE_RATIO
      )

      setStableProgress(setFirstTransitionProgress, nextFirstProgress)
      setStableProgress(setHorizontalTransitionProgress, nextHorizontalProgress)
      setStableProgress(setHorizontalTransition8To9Progress, nextHorizontal8To9Progress)
      setStableProgress(setScene15To16TransitionProgress, nextScene15To16Progress)
      setDebugScrollY(Math.round(window.scrollY || 0))
    }

    const handleScroll = () => {
      if (isScene5BActiveRef.current || isScene6BActiveRef.current || isScene7BActiveRef.current || isScene8BActiveRef.current) {
        return
      }

      if (animationFrameId) {
        return
      }

      animationFrameId = window.requestAnimationFrame(updateTransitionProgress)
    }

    updateTransitionProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateTransitionProgress)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateTransitionProgress)

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  useEffect(() => {
    if ((!isScene5BMounted && !isScene5BClosing) && (!isScene6BMounted && !isScene6BClosing) && (!isScene7BMounted && !isScene7BClosing) && (!isScene8BMounted && !isScene8BClosing)) {
      return
    }

    // While Scene 5B is open, lock page scroll so the user stays inside the local branch flow.
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyTouchAction = document.body.style.touchAction

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.touchAction = previousBodyTouchAction
    }
  }, [isScene5BMounted, isScene5BClosing, isScene6BMounted, isScene6BClosing, isScene7BMounted, isScene7BClosing, isScene8BMounted, isScene8BClosing])

  useEffect(() => {
    return () => {
      if (scene5BCloseTimerRef.current) {
        window.clearTimeout(scene5BCloseTimerRef.current)
      }

      if (scene6BCloseTimerRef.current) {
        window.clearTimeout(scene6BCloseTimerRef.current)
      }

      if (scene7BCloseTimerRef.current) {
        window.clearTimeout(scene7BCloseTimerRef.current)
      }

      if (scene8BCloseTimerRef.current) {
        window.clearTimeout(scene8BCloseTimerRef.current)
      }
    }
  }, [])

  const openScene5B = () => {
    if (scene5BCloseTimerRef.current) {
      window.clearTimeout(scene5BCloseTimerRef.current)
      scene5BCloseTimerRef.current = 0
    }

    setIsScene5BMounted(true)
    setIsScene5BClosing(false)

    window.requestAnimationFrame(() => {
      setIsScene5BOpen(true)
    })
  }

  const closeScene5B = () => {
    if (scene5BCloseTimerRef.current) {
      window.clearTimeout(scene5BCloseTimerRef.current)
      scene5BCloseTimerRef.current = 0
    }

    // Keep the panel mounted during slide-out, then fully unmount it.
    setIsScene5BClosing(true)
    setIsScene5BOpen(false)

    scene5BCloseTimerRef.current = window.setTimeout(() => {
      setIsScene5BClosing(false)
      setIsScene5BMounted(false)
      scene5BCloseTimerRef.current = 0
    }, SCENE5_BRANCH_TRANSITION_MS)
  }

  const openScene6B = () => {
    if (scene6BCloseTimerRef.current) {
      window.clearTimeout(scene6BCloseTimerRef.current)
      scene6BCloseTimerRef.current = 0
    }

    setIsScene6BMounted(true)
    setIsScene6BClosing(false)

    window.requestAnimationFrame(() => {
      setIsScene6BOpen(true)
    })
  }

  const closeScene6B = () => {
    if (scene6BCloseTimerRef.current) {
      window.clearTimeout(scene6BCloseTimerRef.current)
      scene6BCloseTimerRef.current = 0
    }

    // Keep the panel mounted during slide-out, then fully unmount it.
    setIsScene6BClosing(true)
    setIsScene6BOpen(false)

    scene6BCloseTimerRef.current = window.setTimeout(() => {
      setIsScene6BClosing(false)
      setIsScene6BMounted(false)
      scene6BCloseTimerRef.current = 0
    }, SCENE5_BRANCH_TRANSITION_MS)
  }

  const openScene7B = () => {
    if (scene7BCloseTimerRef.current) {
      window.clearTimeout(scene7BCloseTimerRef.current)
      scene7BCloseTimerRef.current = 0
    }

    setIsScene7BMounted(true)
    setIsScene7BClosing(false)

    window.requestAnimationFrame(() => {
      setIsScene7BOpen(true)
    })
  }

  const closeScene7B = () => {
    if (scene7BCloseTimerRef.current) {
      window.clearTimeout(scene7BCloseTimerRef.current)
      scene7BCloseTimerRef.current = 0
    }

    // Keep the panel mounted during slide-out, then fully unmount it.
    setIsScene7BClosing(true)
    setIsScene7BOpen(false)

    scene7BCloseTimerRef.current = window.setTimeout(() => {
      setIsScene7BClosing(false)
      setIsScene7BMounted(false)
      scene7BCloseTimerRef.current = 0
    }, SCENE5_BRANCH_TRANSITION_MS)
  }

  const openScene8B = () => {
    if (scene8BCloseTimerRef.current) {
      window.clearTimeout(scene8BCloseTimerRef.current)
      scene8BCloseTimerRef.current = 0
    }

    setIsScene8BMounted(true)
    setIsScene8BClosing(false)

    window.requestAnimationFrame(() => {
      setIsScene8BOpen(true)
    })
  }

  const closeScene8B = () => {
    if (scene8BCloseTimerRef.current) {
      window.clearTimeout(scene8BCloseTimerRef.current)
      scene8BCloseTimerRef.current = 0
    }

    // Keep the panel mounted during slide-out, then fully unmount it.
    setIsScene8BClosing(true)
    setIsScene8BOpen(false)

    scene8BCloseTimerRef.current = window.setTimeout(() => {
      setIsScene8BClosing(false)
      setIsScene8BMounted(false)
      scene8BCloseTimerRef.current = 0
    }, SCENE5_BRANCH_TRANSITION_MS)
  }

  const renderOverlayContent = (imageNumber) => {
    const isPrimaryImage = imageNumber === 1
    const isAboutImage = imageNumber === 2
    const isEducationImage = imageNumber === 3
    const isSlide5Image = imageNumber === 5
    const isSlide6Image = imageNumber === 6
    const isSlide7Image = imageNumber === 7
    const isSlide8Image = imageNumber === 8
    const isContactImage = imageNumber === 16
    const readMoreLabel = lang === 'es' ? 'Más detalles' : 'Read more'
    const infoTriggerLangClass = lang === 'es' ? ' hero__info-trigger--es' : ''

    if (isPrimaryImage) {
      return (
        <div className="hero__overlay-content">
          <h1
            className="hero__overlay-year"
            style={toPercentPosition(HERO_TEXT_POSITIONS.year)}
          >
            {h.year}
          </h1>
        </div>
      )
    }

    if (isAboutImage) {
      return (
        <div className="hero__overlay-content hero__overlay-content--about">
          <h2
            className="hero__about-title"
            style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Title)}
          >
            <span className="hero__about-title-main">{h.about.titleMain}</span>
            <span className="hero__about-title-italic">{h.about.titleItalic}</span>
          </h2>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line1)}>
            {h.about.line1BeforeHighlight}<span className="hero__about-highlight">{h.about.line1Highlight}</span>{h.about.line1AfterHighlight}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line2)}>
            {h.about.line2}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line3)}>
            {h.about.line3}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line4)}>
            {h.about.line4}
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line5)}>
            {h.about.line5BeforeHighlight}<span className="hero__about-highlight">{h.about.line5Highlight}</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line6)}>
            <span className="hero__about-highlight">{h.about.line6Highlight}</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line7)}>
            <span className="hero__about-highlight">{h.about.line7Highlight}</span>{h.about.line7AfterHighlight}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line8)}>
            {h.about.line8}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line9)}>
            {h.about.line9}
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line10)}>
            {h.about.line10BeforeHighlight}<span className="hero__about-highlight">{h.about.line10Highlight}</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line11)}>
            <span className="hero__about-highlight">{h.about.line11Highlight}</span>{h.about.line11AfterHighlight}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line12)}>
            {h.about.line12}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line13)}>
            {h.about.line13}
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line14)}>
            <span className="hero__about-highlight">{h.about.line14Highlight}</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line15)}>
            <span className="hero__about-highlight">{h.about.line15Highlight}</span>{h.about.line15AfterHighlight}
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line16)}>
            {h.about.line16}
          </p>
        </div>
      )
    }

    if (isEducationImage) {
      return (
        <div className="hero__overlay-content hero__overlay-content--education">
          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleEducation)}>
            <span className="hero__section-bullet">•</span>
            <span>{h.education.titleEducationalBackground}</span>
          </p>

          <p className="hero__body-label" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3HighSchoolLabel)}>{h.education.highSchoolLabel}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3HighSchoolValue)}>
            {h.education.highSchoolValue}
          </p>

          <p className="hero__body-label" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityLabel)}>{h.education.universityLabel}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityValue1)}>
            {h.education.universityValue1}
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityValue2)}>
            {h.education.universityValue2}
          </p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleWork)}>
            <span className="hero__section-bullet">•</span>
            <span>{h.education.titleWork}</span>
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3WorkValue)}>
            {h.education.workValue}
          </p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleLanguages)}>
            <span className="hero__section-bullet">•</span>
            <span>{h.education.titleLanguages}</span>
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3LanguageValue1)}>{h.education.languageSpanish}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3LanguageValue2)}>{h.education.languageEnglish}</p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleSoftSkills)}>
            <span className="hero__section-bullet">•</span>
            <span>{h.education.titleSoftSkills}</span>
          </p>

          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft1)}>{h.education.skillLeft1}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft2)}>{h.education.skillLeft2}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft3)}>{h.education.skillLeft3}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft4)}>{h.education.skillLeft4}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft5)}>{h.education.skillLeft5}</p>

          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight1)}>{h.education.skillRight1}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight2)}>{h.education.skillRight2}</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight3)}>{h.education.skillRight3}</p>

          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software1), display: 'none' }}>{h.education.software1}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software2), display: 'none' }}>{h.education.software2}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software3), display: 'none' }}>{h.education.software3}</p>
          <p className="hero__software-text hero__software-text--italic" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software4), display: 'none' }}>{h.education.software4}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software5), display: 'none' }}>{h.education.software5}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software6), display: 'none' }}>{h.education.software6}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software7), display: 'none' }}>{h.education.software7}</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software8), display: 'none' }}>{h.education.software8}</p>
        </div>
      )
    }

    if (isSlide5Image) {
      const slide5SpanishSplitIndex = lang === 'es'
        ? h.slide5.paragraphLine3Highlight2.indexOf(',')
        : -1
      const slide5Line3HighlightFirst = slide5SpanishSplitIndex >= 0
        ? h.slide5.paragraphLine3Highlight2.slice(0, slide5SpanishSplitIndex + 1)
        : h.slide5.paragraphLine3Highlight2
      const slide5Line4Highlight = slide5SpanishSplitIndex >= 0
        ? h.slide5.paragraphLine3Highlight2.slice(slide5SpanishSplitIndex + 1).trimStart()
        : ''

      return (
        <div className="hero__overlay-content hero__overlay-content--slide5">
          <h2 className="hero__slide5-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay5Title)}>
            <span className="hero__slide5-title-number">{h.slide5.titleNumber}</span>
            <span className="hero__slide5-title-text">{h.slide5.titleText}</span>
            <button
              type="button"
              className={`hero__slide5-title-trigger${infoTriggerLangClass}`}
              aria-label={h.aria.openScene5Details}
              aria-expanded={isScene5BOpen ? 'true' : 'false'}
              onClick={openScene5B}
            >
              <span className="hero__info-trigger-icon" aria-hidden="true">i</span>
              <span className="hero__info-trigger-label" aria-hidden="true">{readMoreLabel}</span>
            </button>
          </h2>

          <p className="hero__slide5-paragraph" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay5Paragraph)}>
            <span className="hero__slide5-paragraph-line">{h.slide5.paragraphLine1BeforeHighlight}<span className="hero__slide5-highlight">{h.slide5.paragraphLine1Highlight}</span>{h.slide5.paragraphLine1AfterHighlight}</span>
            <span className="hero__slide5-paragraph-line">{h.slide5.paragraphLine2}</span>
            <span className="hero__slide5-paragraph-line"><span className="hero__slide5-highlight">{h.slide5.paragraphLine3Highlight1}</span>{h.slide5.paragraphLine3Middle}<span className="hero__slide5-highlight">{slide5Line3HighlightFirst}</span></span>
            {lang === 'es' && slide5Line4Highlight && (
              <span className="hero__slide5-paragraph-line"><span className="hero__slide5-highlight">{slide5Line4Highlight}</span></span>
            )}
          </p>

          <p className="hero__slide5-partnership" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay5Partnership)}>
            {h.slide5.partnership}
          </p>
        </div>
      )
    }

    if (isSlide6Image) {
      const slide6ParagraphClass = `hero__slide6-paragraph hero__slide6-paragraph--fused${lang === 'es' ? ' hero__slide6-paragraph--es' : ''}`

      return (
        <div className="hero__overlay-content hero__overlay-content--slide6">
          <h2 className="hero__slide6-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay6Title)}>
            <span className="hero__slide6-title-number">{h.slide6.titleNumber}</span>
            <span className="hero__slide6-title-text">{h.slide6.titleText}</span>
            <button
              type="button"
              className={`hero__slide6-title-trigger${infoTriggerLangClass}`}
              aria-label={h.aria.openScene6Details}
              aria-expanded={isScene6BOpen ? 'true' : 'false'}
              onClick={openScene6B}
            >
              <span className="hero__info-trigger-icon" aria-hidden="true">i</span>
              <span className="hero__info-trigger-label" aria-hidden="true">{readMoreLabel}</span>
            </button>
          </h2>

          <p className={slide6ParagraphClass} style={toPercentPosition(HERO_TEXT_POSITIONS.overlay6Paragraph1)}>
            <span className="hero__slide6-paragraph-group">
              {h.slide6.paragraph1Line1BeforeHighlight}<span className="hero__slide6-highlight">{h.slide6.paragraph1Line1Highlight1}</span>{h.slide6.paragraph1Line1Middle}<span className="hero__slide6-highlight">{h.slide6.paragraph1Line1Highlight2}</span>{' '}
              <span className="hero__slide6-highlight">{h.slide6.paragraph1Line2Highlight}</span>{' '}
              <span className="hero__slide6-highlight">{h.slide6.paragraph1Line3Highlight}</span>
            </span>
            <span className="hero__slide6-paragraph-break" aria-hidden="true" />
            <span className="hero__slide6-paragraph-group">
              {h.slide6.paragraph2Line1} {h.slide6.paragraph2Line2} {h.slide6.paragraph2Line3}
            </span>
            <span className="hero__slide6-paragraph-break" aria-hidden="true" />
            <span className="hero__slide6-paragraph-group">
              {h.slide6.paragraph3Line1} {h.slide6.paragraph3Line2} {h.slide6.paragraph3Line3} {h.slide6.paragraph3Line4} {h.slide6.paragraph3Line5}
            </span>
            <span className="hero__slide6-paragraph-break" aria-hidden="true" />
            <span className="hero__slide6-paragraph-group">
              <span className="hero__slide6-highlight">{h.slide6.paragraph4Line1Highlight}</span>{' '}
              <span className="hero__slide6-highlight">{h.slide6.paragraph4Line2Highlight}</span>{' '}
              <span className="hero__slide6-highlight">{h.slide6.paragraph4Line3Highlight}</span>
            </span>
            <span className="hero__slide6-partnership-inline">{h.slide6.partnership}</span>
          </p>
        </div>
      )
    }

    if (isSlide7Image) {
      const slide7ParagraphClass = `hero__slide7-paragraph${lang === 'es' ? ' hero__slide7-paragraph--es' : ''}`

      return (
        <div className="hero__overlay-content hero__overlay-content--slide7">
          <h2 className="hero__slide7-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay7Title)}>
            <span className="hero__slide7-title-number">{h.slide7.titleNumber}</span>
            <span className="hero__slide7-title-text">{h.slide7.titleText}</span>
            <button
              type="button"
              className={`hero__slide7-title-trigger${infoTriggerLangClass}`}
              aria-label={h.aria.openScene7Details}
              aria-expanded={isScene7BOpen ? 'true' : 'false'}
              onClick={openScene7B}
            >
              <span className="hero__info-trigger-icon" aria-hidden="true">i</span>
              <span className="hero__info-trigger-label" aria-hidden="true">{readMoreLabel}</span>
            </button>
          </h2>

          <p className={slide7ParagraphClass} style={toPercentPosition(HERO_TEXT_POSITIONS.overlay7Paragraph)}>
            <span className="hero__slide7-paragraph-line"><span className="hero__slide7-highlight">{h.slide7.paragraphLine1Highlight}</span>{h.slide7.paragraphLine1AfterHighlight}</span>
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine2}</span>
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine3}</span>
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine4}</span>
          </p>

          <p className="hero__slide7-partnership" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay7Partnership)}>
            {h.slide7.partnership}
          </p>
        </div>
      )
    }

    if (isSlide8Image) {
      return (
        <div className="hero__overlay-content hero__overlay-content--slide8">
          <h2 className="hero__slide8-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Title)}>
            <span className="hero__slide8-title-number">{h.slide8.titleNumber}</span>
            <span className="hero__slide8-title-text">{h.slide8.titleText}</span>
            <button
              type="button"
              className={`hero__slide8-title-trigger${infoTriggerLangClass}`}
              aria-label={h.aria.openScene8Details}
              aria-expanded={isScene8BOpen ? 'true' : 'false'}
              onClick={openScene8B}
            >
              <span className="hero__info-trigger-icon" aria-hidden="true">i</span>
              <span className="hero__info-trigger-label" aria-hidden="true">{readMoreLabel}</span>
            </button>
          </h2>

          <p className="hero__slide8-paragraph" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Paragraph1)}>
            <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line1Highlight}</span></span>
            <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line2Highlight}</span></span>
            <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line3Highlight}</span></span>
          </p>

          <p className="hero__slide8-paragraph" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Paragraph2)}>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line1}</span>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line2}</span>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line3}</span>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line4}</span>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line5}</span>
          </p>

          <p className="hero__slide8-paragraph" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Paragraph3)}>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph3Line1}</span>
            <span className="hero__slide8-paragraph-line">{h.slide8.paragraph3Line2}</span>
          </p>

          <p className="hero__slide8-award" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Award)}>
            <span className="hero__slide8-award-line">{h.slide8.awardLine1}</span>
            <span className="hero__slide8-award-line">{h.slide8.awardLine2}</span>
          </p>

          <p className="hero__slide8-partnership" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay8Partnership)}>
            {h.slide8.partnership}
          </p>
        </div>
      )
    }

    if (isContactImage) {
      return (
        <div className="hero__overlay-content hero__overlay-content--slide16">
          <p className="hero__slide16-contact-box" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay16EmailBox)}>
            <span className="hero__slide16-contact-label">{h.slide16.emailLabel}</span>
            <a className="hero__slide16-contact-value" href={`mailto:${h.slide16.emailValue}`}>
              {h.slide16.emailValue}
            </a>
          </p>

          <p className="hero__slide16-contact-box" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay16PhoneBox)}>
            <span className="hero__slide16-contact-label">{h.slide16.phoneLabel}</span>
            <span className="hero__slide16-contact-value">{h.slide16.phoneValue}</span>
          </p>

          <p className="hero__slide16-contact-box" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay16SocialBox)}>
            <span className="hero__slide16-contact-label">{h.slide16.socialLabel}</span>
            <a
              className="hero__slide16-contact-value"
              href="https://www.instagram.com/_sofiagutierrez1/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {h.slide16.socialValue}
            </a>
          </p>
        </div>
      )
    }

    return null
  }

  const renderScene = (imageNumber, options = {}) => {
    const { customImageSrc = null, customSlideLabel = null, hideOverlay = false, hideSlideIndex = false } = options
    const shouldUseSvgImage = (imageNumber === 1 || imageNumber === 3 || imageNumber === 5 || imageNumber === 6 || imageNumber >= 7) && imageNumber !== 9
    const firstSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/1es.svg`
      : `${import.meta.env.BASE_URL}images/1.svg`
    const thirdSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/3es.svg`
      : `${import.meta.env.BASE_URL}images/3.svg`
    const seventeenthSceneImageSrc = `${import.meta.env.BASE_URL}images/17.svg`
    const defaultImageSrc = shouldUseSvgImage
      ? (imageNumber === 1
        ? firstSceneImageSrc
        : imageNumber === 3
          ? thirdSceneImageSrc
          : imageNumber === 17
            ? seventeenthSceneImageSrc
            : `${import.meta.env.BASE_URL}images/${imageNumber}.svg`)
      : imagePaths[imageNumber - 1]
    const imageSrc = customImageSrc ?? defaultImageSrc
    const compositionForegroundSvgSrc = imageNumber === 3
      ? thirdSceneImageSrc
      : `${import.meta.env.BASE_URL}images/${imageNumber}.svg`
    const anchorId = imageAnchors[imageNumber]
    const isVisibleOverlay = (imageNumber === 1 || imageNumber === 2 || imageNumber === 3 || imageNumber === 5 || imageNumber === 6 || imageNumber === 7 || imageNumber === 8 || imageNumber === 16) && !hideOverlay
    const isCompositionFixScene = imageNumber === 2 || imageNumber === 3
    const isSlide5Scene = imageNumber === 5
    const isSlide6Scene = imageNumber === 6
    const isSlide7Scene = imageNumber === 7
    const isSlide8Scene = imageNumber === 8
    const isFirstScene = imageNumber === 1
    const sceneForegroundSrc = isCompositionFixScene ? compositionForegroundSvgSrc : imageSrc

    return (
      <div
        className={`hero__image${isFirstScene ? ' hero__image--svg-transparent' : ''}${isCompositionFixScene ? ' hero__image--composition-fix' : ''}${isSlide5Scene ? ' hero__image--slide5-responsive' : ''}${isSlide6Scene ? ' hero__image--slide6-responsive' : ''}${isSlide7Scene ? ' hero__image--slide7-responsive' : ''}${isSlide8Scene ? ' hero__image--slide8-responsive' : ''}`}
        id={anchorId}
        key={`scene-${imageNumber}`}
      >
        {!hideSlideIndex && (
          <span className="hero__slide-index" aria-hidden="true">{formatTemplate(h.templates.slideIndex, { label: customSlideLabel ?? imageNumber })}</span>
        )}

        <img
          className={`hero__image-layer${isCompositionFixScene ? ' hero__image-layer--composition-foreground' : ''}`}
          src={sceneForegroundSrc}
          alt={formatTemplate(h.templates.featuredWorkAlt, { number: imageNumber })}
          loading="lazy"
          onError={(event) => {
            if (isCompositionFixScene && event.currentTarget.src !== imageSrc) {
              // Temporary fallback until scene-specific foreground SVG files are available.
              event.currentTarget.onerror = null
              event.currentTarget.src = imageSrc
            }
          }}
        />

        <div
          className={`hero__overlay-container${imageNumber === 1 ? ' hero__overlay-container--primary' : ''}`}
          id={`hero-overlay-${imageNumber}`}
          data-image-number={imageNumber}
          aria-hidden={isVisibleOverlay ? 'false' : 'true'}
        >
          {isVisibleOverlay ? renderOverlayContent(imageNumber) : null}
        </div>
      </div>
    )
  }

  const renderScene5Branch = () => {
    const isOpen = isScene5BOpen
    const isVisible = isScene5BMounted || isScene5BClosing

    return (
      <section className="hero__scene5-branch" aria-label={h.aria.scene5Branch}>
        <div className="hero__scene5-branch-base">
          {renderScene(5)}
        </div>

        {isVisible && (
          <div className={`hero__scene5b-modal${isOpen ? ' is-open' : ' is-closing'}`} aria-hidden={isOpen ? 'false' : 'true'}>
            <button
              type="button"
              className="hero__scene5b-dim"
              aria-label={h.aria.closeScene5Details}
              onClick={closeScene5B}
            />

            <div
              className="hero__scene5b-panel"
              role="dialog"
              aria-modal="true"
              aria-label={h.aria.scene5DetailsDialog}
            >
              <div className="hero__scene5b-panel-inner">
                <div
                  className="hero__scene5b-backdrop"
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${sharedCompositionBackgroundSrc})` }}
                />

                <div className="hero__scene5b-canvas">
                  {renderScene(5, {
                    customImageSrc: `${import.meta.env.BASE_URL}images/5B.svg`,
                    customSlideLabel: '5B',
                    hideOverlay: true,
                    hideSlideIndex: true
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  }

  const renderScene6Branch = () => {
    const isOpen = isScene6BOpen
    const isVisible = isScene6BMounted || isScene6BClosing

    return (
      <section className="hero__scene6-branch" aria-label={h.aria.scene6Branch}>
        <div className="hero__scene6-branch-base">
          {renderScene(6)}
        </div>

        {isVisible && (
          <div className={`hero__scene6b-modal${isOpen ? ' is-open' : ' is-closing'}`} aria-hidden={isOpen ? 'false' : 'true'}>
            <button
              type="button"
              className="hero__scene6b-dim"
              aria-label={h.aria.closeScene6Details}
              onClick={closeScene6B}
            />

            <div
              className="hero__scene6b-panel"
              role="dialog"
              aria-modal="true"
              aria-label={h.aria.scene6DetailsDialog}
            >
              <div className="hero__scene6b-panel-inner">
                <div
                  className="hero__scene6b-backdrop"
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${sharedCompositionBackgroundSrc})` }}
                />

                <div className="hero__scene6b-canvas">
                  {renderScene(6, {
                    customImageSrc: `${import.meta.env.BASE_URL}images/6B.svg`,
                    customSlideLabel: '6B',
                    hideOverlay: true,
                    hideSlideIndex: true
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  }

  const renderScene7Branch = () => {
    const isOpen = isScene7BOpen
    const isVisible = isScene7BMounted || isScene7BClosing

    return (
      <section className="hero__scene7-branch" aria-label={h.aria.scene7Branch}>
        <div className="hero__scene7-branch-base">
          {renderScene(7)}
        </div>

        {isVisible && (
          <div className={`hero__scene7b-modal${isOpen ? ' is-open' : ' is-closing'}`} aria-hidden={isOpen ? 'false' : 'true'}>
            <button
              type="button"
              className="hero__scene7b-dim"
              aria-label={h.aria.closeScene7Details}
              onClick={closeScene7B}
            />

            <div
              className="hero__scene7b-panel"
              role="dialog"
              aria-modal="true"
              aria-label={h.aria.scene7DetailsDialog}
            >
              <div className="hero__scene7b-panel-inner">
                <div
                  className="hero__scene7b-backdrop"
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${sharedCompositionBackgroundSrc})` }}
                />

                <div className="hero__scene7b-canvas">
                  {renderScene(7, {
                    customImageSrc: `${import.meta.env.BASE_URL}images/7B.svg`,
                    customSlideLabel: '7B',
                    hideOverlay: true,
                    hideSlideIndex: true
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  }

  const renderScene8Branch = () => {
    const isOpen = isScene8BOpen
    const isVisible = isScene8BMounted || isScene8BClosing

    if (!isVisible) {
      return null
    }

    return (
      <div className={`hero__scene8b-modal${isOpen ? ' is-open' : ' is-closing'}`} aria-hidden={isOpen ? 'false' : 'true'}>
        <button
          type="button"
          className="hero__scene8b-dim"
          aria-label={h.aria.closeScene8Details}
          onClick={closeScene8B}
        />

        <div
          className="hero__scene8b-panel"
          role="dialog"
          aria-modal="true"
          aria-label={h.aria.scene8DetailsDialog}
        >
          <div className="hero__scene8b-panel-inner">
            <div
              className="hero__scene8b-backdrop"
              aria-hidden="true"
              style={{ backgroundImage: `url(${sharedCompositionBackgroundSrc})` }}
            />

            <div className="hero__scene8b-canvas">
              {renderScene(8, {
                customImageSrc: `${import.meta.env.BASE_URL}images/8B.svg`,
                customSlideLabel: '8B',
                hideOverlay: true,
                hideSlideIndex: true
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const firstScalePhaseProgress = Math.min(
    firstTransitionProgress / Math.max(FIRST_TRANSITION_SCALE_PHASE_END, 0.0001),
    1
  )

  const firstDropPhaseProgress = firstTransitionProgress <= FIRST_TRANSITION_SCALE_PHASE_END
    ? 0
    : (firstTransitionProgress - FIRST_TRANSITION_SCALE_PHASE_END) / Math.max(1 - FIRST_TRANSITION_SCALE_PHASE_END, 0.0001)

  const firstScenePanelScale =
    FIRST_TRANSITION_INITIAL_SCALE +
    (FIRST_TRANSITION_PEAK_SCALE - FIRST_TRANSITION_INITIAL_SCALE) * firstScalePhaseProgress

  const firstScenePanelDropVh = firstDropPhaseProgress * 100
  const firstSceneOpacity = firstTransitionProgress >= 0.999 ? 0 : 1
  const hasFirstTransitionStarted = firstTransitionProgress >= FIRST_TRANSITION_UNDER_REVEAL_START
  const shouldShowFirstTransitionBackground =
    firstTransitionProgress < FIRST_TRANSITION_UNDER_REVEAL_START
  // Delay + smooth reveal for scene 2: it stays lower until reveal starts, then settles into place.
  const underRevealProgress = firstTransitionProgress <= FIRST_TRANSITION_UNDER_REVEAL_START
    ? 0
    : Math.min(
      (firstTransitionProgress - FIRST_TRANSITION_UNDER_REVEAL_START) /
      Math.max(FIRST_TRANSITION_UNDER_REVEAL_SETTLE_END - FIRST_TRANSITION_UNDER_REVEAL_START, 0.0001),
      1
    )
  const underSceneOffsetVh = FIRST_TRANSITION_UNDER_REVEAL_OFFSET_VH * (1 - underRevealProgress)
  const firstTransitionProgressPercent = Math.round(firstTransitionProgress * 100)
  const horizontalTransitionProgressPercent = Math.round(horizontalTransitionProgress * 100)
  const horizontalTransition8To9ProgressPercent = Math.round(horizontalTransition8To9Progress * 100)
  const scene15To16TransitionProgressPercent = Math.round(scene15To16TransitionProgress * 100)

  return (
    <section className="hero" aria-label={h.aria.composition}>
      {/* Shared backdrop: one fixed background for the full hero so scenes 2+ move over the same stationary layer. */}
      <div className="hero__scene-fixed-background" aria-hidden="true" style={sharedBackgroundStyle} />

      {/* Temporary debug counters for tuning hero transition timing. */}
      <div className="hero__progress-counter" aria-live="polite">
        <p className="hero__progress-counter-line">{h.debug.y} {debugScrollY}px</p>
        <p className="hero__progress-counter-line">{h.debug.oneToTwo} {firstTransitionProgressPercent}%</p>
        <p className="hero__progress-counter-line">{h.debug.threeToFour} {horizontalTransitionProgressPercent}%</p>
        <p className="hero__progress-counter-line">{h.debug.eightToNine} {horizontalTransition8To9ProgressPercent}%</p>
        <p className="hero__progress-counter-line">{h.debug.fifteenToSixteen} {scene15To16TransitionProgressPercent}%</p>
      </div>

      <section className="hero__paper-transition hero__paper-transition--first" ref={firstTransitionRef} aria-label={h.aria.firstTransition}>
        <div className="hero__paper-transition-stage">
          <div
            className="hero__scene-layer hero__scene-layer--background"
            aria-hidden="true"
          >
            <div
              className="hero__first-transition-background"
              /* Background base for the first transition panel stack. */
              style={{
                backgroundImage: `url(${firstTransitionBackgroundSrc})`,
                opacity: shouldShowFirstTransitionBackground ? 1 : 0,
              }}
            />
          </div>

          {/*
            Scene 2 is always mounted directly beneath scene 1 in the same wrapper.
            This ensures transparent SVG regions in scene 1 reveal scene 2, not page background.
          */}
          <div
            className="hero__scene-layer hero__scene-layer--under"
            /* First frame: show slide 1 over background only. Once scrolling starts, reveal scene 2 under the SVG. */
            style={{
              opacity: hasFirstTransitionStarted ? 1 : 0,
              transform: `translate3d(0, ${underSceneOffsetVh}vh, 0)`
            }}
          >
            {renderScene(2)}
          </div>

          {/*
            Sequence:
            1) Scene 1 starts as a reduced panel so the background layer is visible.
            2) Early scroll subtly scales the panel up.
            3) Remaining scroll drops the full panel down to reveal scene 2 from the top.
          */}
          <div
            className="hero__scene-layer hero__scene-layer--top hero__scene-layer--first-top"
            style={{
              transform: `translate3d(0, ${firstScenePanelDropVh}vh, 0) scale(${firstScenePanelScale})`,
              opacity: firstSceneOpacity
            }}
          >
            {renderScene(1)}
          </div>
        </div>
      </section>

      <section className="hero__horizontal-transition hero__horizontal-transition--scene3" ref={horizontalTransitionRef} aria-label={h.aria.scene3To4Transition}>
        <div className="hero__horizontal-transition-stage">
          {/* Scene 3 exits to the left as scroll progresses. */}
          <div
            className="hero__scene-layer hero__scene-layer--horizontal-current"
            style={{ transform: `translate3d(${-horizontalTransitionProgress * 100}%, 0, 0)` }}
          >
            {renderScene(3)}
          </div>

          {/* Scene 4 enters from the right in sync with scene 3. */}
          <div
            className="hero__scene-layer hero__scene-layer--horizontal-next"
            style={{ transform: `translate3d(${(1 - horizontalTransitionProgress) * 100}%, 0, 0)` }}
          >
            {renderScene(4)}
          </div>
        </div>
      </section>

      {renderScene5Branch()}

      {renderScene6Branch()}

      {renderScene7Branch()}

      {renderScene8Branch()}

      <section className="hero__horizontal-transition" ref={horizontalTransition8To9Ref} aria-label={h.aria.scene8To9Transition}>
        <div className="hero__horizontal-transition-stage">
          {/* Scene 8 exits to the left as scroll progresses. */}
          <div
            className="hero__scene-layer hero__scene-layer--horizontal-current"
            style={{ transform: `translate3d(${-horizontalTransition8To9Progress * 100}%, 0, 0)` }}
          >
            {renderScene(8)}
          </div>

          {/* Scene 9 enters from the right in sync with scene 8. */}
          <div
            className="hero__scene-layer hero__scene-layer--horizontal-next"
            style={{ transform: `translate3d(${(1 - horizontalTransition8To9Progress) * 100}%, 0, 0)` }}
          >
            {renderScene(9)}
          </div>
        </div>
      </section>

      {Array.from({ length: 5 }, (_, index) => index + 10).map((imageNumber) => renderScene(imageNumber))}

      <section className="hero__paper-transition hero__paper-transition--scene15to16" ref={scene15To16TransitionRef} aria-label={h.aria.scene15To16Transition}>
        <div className="hero__paper-transition-stage hero__paper-transition-stage--scene15to16">
          <div
            className="hero__scene-layer hero__scene-layer--under"
            /* Scene 15 slides up while scene 16 slides down during the extended transition. */
            style={{
              transform: `translate3d(0, ${-scene15To16TransitionProgress * 110}vh, 0)`
            }}
          >
            {renderScene(15)}
          </div>

          {/*
            Inverted paper move: scene 16 drops in from above while scrolling down.
            Scene 15 stays underneath so there is no duplicate scene rendering.
          */}
          <div
            className="hero__scene-layer hero__scene-layer--top"
            /* Scene 16 slides down from further above now that we have extended scrollable space. */
            style={{ 
              transform: `translate3d(0, ${(-SCENE15_TO_16_ENTRY_OFFSET_VH + scene15To16TransitionProgress * SCENE15_TO_16_ENTRY_OFFSET_VH)}vh, 0)`,
              opacity: Math.max(0, scene15To16TransitionProgress * 20)
            }}
          >
            {renderScene(16)}
          </div>
        </div>
      </section>

      {renderScene(17)}
    </section>
  )
}

export default Hero
