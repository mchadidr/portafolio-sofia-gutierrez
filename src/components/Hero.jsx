import { useEffect, useRef, useState } from 'react'
import './Hero.css'
import HERO_TEXT_POSITIONS, { SCENE2_TEXT_LAYOUT, SCENE3_TEXT_LAYOUT, SCENE6_TEXT_LAYOUT, SCENE7_TEXT_LAYOUT, SCENE8_TEXT_LAYOUT, SCENE16_TEXT_LAYOUT, toPercentPosition } from './heroTextPositions.jsx'

const FIRST_TRANSITION_DISTANCE_VIEWPORTS = 0.42
const ABOUT_NAV_OFFSET_VIEWPORTS = 0.08
const HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS = 1
const HORIZONTAL_TRANSITION_8TO9_DISTANCE_VIEWPORTS = 0.85
const PROJECTS_NAV_OFFSET_VIEWPORTS = 0.12
const CONTACT_NAV_OFFSET_VIEWPORTS = 0.08
const FIRST_TRANSITION_START_DEADZONE_PX = 10
const HORIZONTAL_TRANSITION_8TO9_START_DEADZONE_PX = 12
const FIRST_TRANSITION_INITIAL_SCALE = 0.75
const FIRST_TRANSITION_PEAK_SCALE = 0.98
const FIRST_TRANSITION_SCALE_PHASE_END = 0.32
const FIRST_TRANSITION_UNDER_REVEAL_START = 0.03
const FIRST_TRANSITION_UNDER_REVEAL_SETTLE_END = 0.2
const FIRST_TRANSITION_UNDER_SCENE_FADE_START = 0.3
const FIRST_TRANSITION_UNDER_REVEAL_OFFSET_VH = 7
const SCENE5_BRANCH_TRANSITION_MS = 620
const SCENE15_TO_16_START_DEADZONE_RATIO = 0
const SCENE15_TO_16_ENTRY_OFFSET_VH = 82
const SCENE15_TO_16_TRANSITION_DISTANCE_VIEWPORTS = 1.2

function buildCaseAgnosticSvgCandidates(sourcePath) {
  if (typeof sourcePath !== 'string' || !/\.svg(?:[?#].*)?$/i.test(sourcePath)) {
    return [sourcePath]
  }

  const match = sourcePath.match(/^(.*\/)?([^/?#]+)\.svg([?#].*)?$/i)

  if (!match) {
    return [sourcePath]
  }

  const directory = match[1] ?? ''
  const fileStem = match[2]
  const suffix = match[3] ?? ''
  const capitalizedStem = fileStem.length > 0
    ? `${fileStem.charAt(0).toUpperCase()}${fileStem.slice(1).toLowerCase()}`
    : fileStem
  const stemCandidates = [...new Set([
    fileStem,
    fileStem.toLowerCase(),
    fileStem.toUpperCase(),
    capitalizedStem
  ])]
  const extensionCandidates = ['svg', 'SVG']
  const candidates = []

  stemCandidates.forEach((stemCandidate) => {
    extensionCandidates.forEach((extensionCandidate) => {
      candidates.push(`${directory}${stemCandidate}.${extensionCandidate}${suffix}`)
    })
  })

  return [...new Set(candidates)]
}

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
        HORIZONTAL_TRANSITION_8TO9_DISTANCE_VIEWPORTS,
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
    const isCreditsImage = imageNumber === 17
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

          <p
            className="hero__slide2-paragraph hero__slide2-text-box"
            style={{
              ...toPercentPosition(SCENE2_TEXT_LAYOUT.textBox),
              width: `${SCENE2_TEXT_LAYOUT.textBox.widthPercent}%`,
              fontSize: `${SCENE2_TEXT_LAYOUT.textBox.fontSizeCqw}cqw`,
              padding: `${SCENE2_TEXT_LAYOUT.textBox.paddingCqw}cqw`
            }}
          >
            <span className="hero__slide2-paragraph-group">
              <span className="hero__slide2-paragraph-line">{h.about.line1BeforeHighlight}<span className="hero__about-highlight">{h.about.line1Highlight}</span>{h.about.line1AfterHighlight}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line2}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line3}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line4}</span>
            </span>
            <span className="hero__slide2-paragraph-break" aria-hidden="true" />
            <span className="hero__slide2-paragraph-group">
              <span className="hero__slide2-paragraph-line">{h.about.line5BeforeHighlight}<span className="hero__about-highlight">{h.about.line5Highlight}</span></span>{' '}
              <span className="hero__slide2-paragraph-line"><span className="hero__about-highlight">{h.about.line6Highlight}</span></span>{' '}
              <span className="hero__slide2-paragraph-line"><span className="hero__about-highlight">{h.about.line7Highlight}</span>{h.about.line7AfterHighlight}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line8}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line9}</span>
            </span>
            <span className="hero__slide2-paragraph-break" aria-hidden="true" />
            <span className="hero__slide2-paragraph-group">
              <span className="hero__slide2-paragraph-line">{h.about.line10BeforeHighlight}<span className="hero__about-highlight">{h.about.line10Highlight}</span></span>{' '}
              <span className="hero__slide2-paragraph-line"><span className="hero__about-highlight">{h.about.line11Highlight}</span>{h.about.line11AfterHighlight}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line12}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line13}</span>
            </span>
            <span className="hero__slide2-paragraph-break" aria-hidden="true" />
            <span className="hero__slide2-paragraph-group">
              <span className="hero__slide2-paragraph-line"><span className="hero__about-highlight">{h.about.line14Highlight}</span></span>{' '}
              <span className="hero__slide2-paragraph-line"><span className="hero__about-highlight">{h.about.line15Highlight}</span>{h.about.line15AfterHighlight}</span>{' '}
              <span className="hero__slide2-paragraph-line">{h.about.line16}</span>
            </span>
          </p>
        </div>
      )
    }

    if (isEducationImage) {
      return <div className="hero__overlay-content hero__overlay-content--education" />
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
      const slide6ParagraphClass = `hero__slide6-paragraph${lang === 'es' ? ' hero__slide6-paragraph--es' : ''}`

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

          <p
            className={slide6ParagraphClass}
            style={{
              ...toPercentPosition(SCENE6_TEXT_LAYOUT.paragraph),
              width: `${SCENE6_TEXT_LAYOUT.paragraph.widthPercent}%`,
              fontSize: `${SCENE6_TEXT_LAYOUT.paragraph.fontSizeCqw}cqw`
            }}
          >
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
          </p>

          <p
            className="hero__slide6-partnership"
            style={{
              ...toPercentPosition(SCENE6_TEXT_LAYOUT.partnership),
              fontSize: `${SCENE6_TEXT_LAYOUT.partnership.fontSizeCqw}cqw`
            }}
          >
            {h.slide6.partnership}
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

          <p
            className={`${slide7ParagraphClass} hero__slide7-text-box`}
            style={{
              ...toPercentPosition(SCENE7_TEXT_LAYOUT.textBox),
              width: `${SCENE7_TEXT_LAYOUT.textBox.widthPercent}%`,
              fontSize: `${SCENE7_TEXT_LAYOUT.textBox.fontSizeCqw}cqw`,
              padding: `${SCENE7_TEXT_LAYOUT.textBox.paddingCqw}cqw`
            }}
          >
            <span className="hero__slide7-paragraph-line"><span className="hero__slide7-highlight">{h.slide7.paragraphLine1Highlight}</span>{h.slide7.paragraphLine1AfterHighlight}</span>{' '}
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine2}</span>{' '}
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine3}</span>{' '}
            <span className="hero__slide7-paragraph-line">{h.slide7.paragraphLine4}</span>
          </p>

          <p className="hero__slide7-partnership" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay7Partnership)}>
            {h.slide7.partnership}
          </p>
        </div>
      )
    }

    if (isSlide8Image) {
      const scene8SharedX = SCENE8_TEXT_LAYOUT.paragraph.x
      const scene8AwardY = SCENE8_TEXT_LAYOUT.paragraph.y + SCENE8_TEXT_LAYOUT.award.offsetY
      const scene8PartnershipY = SCENE8_TEXT_LAYOUT.paragraph.y + SCENE8_TEXT_LAYOUT.partnership.offsetY

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

          <p
            className="hero__slide8-paragraph hero__slide8-text-box"
            style={{
              ...toPercentPosition({ x: scene8SharedX, y: SCENE8_TEXT_LAYOUT.paragraph.y }),
              width: `${SCENE8_TEXT_LAYOUT.paragraph.widthPercent}%`,
              fontSize: `${SCENE8_TEXT_LAYOUT.paragraph.fontSizeCqw}cqw`,
              padding: `${SCENE8_TEXT_LAYOUT.paragraph.paddingCqw}cqw`
            }}
          >
            <span className="hero__slide8-paragraph-group">
              <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line1Highlight}</span></span>{' '}
              <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line2Highlight}</span></span>{' '}
              <span className="hero__slide8-paragraph-line"><span className="hero__slide8-highlight">{h.slide8.paragraph1Line3Highlight}</span></span>
            </span>
            <span className="hero__slide8-paragraph-break" aria-hidden="true" />
            <span className="hero__slide8-paragraph-group">
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line1}</span>{' '}
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line2}</span>{' '}
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line3}</span>{' '}
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line4}</span>{' '}
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph2Line5}</span>
            </span>
            <span className="hero__slide8-paragraph-break" aria-hidden="true" />
            <span className="hero__slide8-paragraph-group">
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph3Line1}</span>{' '}
              <span className="hero__slide8-paragraph-line">{h.slide8.paragraph3Line2}</span>
            </span>
          </p>

          <p
            className="hero__slide8-award hero__slide8-text-box"
            style={{
              ...toPercentPosition({ x: scene8SharedX, y: scene8AwardY }),
              width: `${SCENE8_TEXT_LAYOUT.award.widthPercent}%`,
              fontSize: `${SCENE8_TEXT_LAYOUT.award.fontSizeCqw}cqw`,
              padding: `${SCENE8_TEXT_LAYOUT.award.paddingCqw}cqw`
            }}
          >
            <span className="hero__slide8-award-line">{h.slide8.awardLine1}</span>
            <span className="hero__slide8-award-line">{h.slide8.awardLine2}</span>
          </p>

          <p
            className="hero__slide8-partnership hero__slide8-text-box"
            style={{
              ...toPercentPosition({ x: scene8SharedX, y: scene8PartnershipY }),
              width: `${SCENE8_TEXT_LAYOUT.partnership.widthPercent}%`,
              fontSize: `${SCENE8_TEXT_LAYOUT.partnership.fontSizeCqw}cqw`,
              padding: `${SCENE8_TEXT_LAYOUT.partnership.paddingCqw}cqw`
            }}
          >
            {h.slide8.partnership}
          </p>
        </div>
      )
    }

    if (isContactImage) {
      const emailBoxStyle = {
        ...toPercentPosition({ x: SCENE16_TEXT_LAYOUT.email.x, y: SCENE16_TEXT_LAYOUT.email.y }),
        '--slide16-font-size-cqw': SCENE16_TEXT_LAYOUT.email.fontSizeCqw
      }
      const phoneBoxStyle = {
        ...toPercentPosition({ x: SCENE16_TEXT_LAYOUT.phone.x, y: SCENE16_TEXT_LAYOUT.phone.y }),
        '--slide16-font-size-cqw': SCENE16_TEXT_LAYOUT.phone.fontSizeCqw
      }
      const socialBoxStyle = {
        top: `${(SCENE16_TEXT_LAYOUT.social.y / 900) * 100}%`,
        right: `${(SCENE16_TEXT_LAYOUT.social.right / 1600) * 100}%`,
        '--slide16-font-size-cqw': SCENE16_TEXT_LAYOUT.social.fontSizeCqw
      }

      return (
        <div className="hero__overlay-content hero__overlay-content--slide16">
          <p className="hero__slide16-contact-box" style={emailBoxStyle}>
            <span className="hero__slide16-contact-label">{h.slide16.emailLabel}</span>
            <a className="hero__slide16-contact-value" href={`mailto:${h.slide16.emailValue}`}>
              {h.slide16.emailValue}
            </a>
          </p>

          <p className="hero__slide16-contact-box" style={phoneBoxStyle}>
            <span className="hero__slide16-contact-label">{h.slide16.phoneLabel}</span>
            <span className="hero__slide16-contact-value">{h.slide16.phoneValue}</span>
          </p>

          <p className="hero__slide16-contact-box" style={socialBoxStyle}>
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

    if (isCreditsImage) {
      return (
        <div className="hero__overlay-content hero__overlay-content--slide17">
          <div className="hero__slide17-credit hero__slide17-credit--design">
            <p className="hero__slide17-credit-line hero__slide17-credit-line--design">
              {h.slide17.designedBy}
            </p>
            <span className="hero__slide17-particles hero__slide17-particles--design" aria-hidden="true">
              <span className="hero__slide17-sparkle hero__slide17-sparkle--one">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--two">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--three">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--four">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--five">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--six">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--seven">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--eight">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--nine">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--ten">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--eleven">✦</span>
              <span className="hero__slide17-sparkle hero__slide17-sparkle--twelve">✦</span>
            </span>
          </div>
          <div className="hero__slide17-credit hero__slide17-credit--website">
            <a
              className="hero__slide17-credit-line hero__slide17-credit-line--website"
              href="https://github.com/mchadidr"
              target="_blank"
              rel="noopener noreferrer"
            >
              {h.slide17.websiteBy}
            </a>
            <span className="hero__slide17-particles hero__slide17-particles--website" aria-hidden="true">
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--one">0</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--two">1</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--three">&gt;</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--four">&lt;&gt;</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--five">0</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--six">1</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--seven">&gt;</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--eight">&lt;&gt;</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--nine">0</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--ten">1</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--eleven">&gt;</span>
              <span className="hero__slide17-digital-particle hero__slide17-digital-particle--twelve">&lt;&gt;</span>
            </span>
          </div>
          <p className="hero__slide17-credit-line hero__slide17-credit-line--copyright">
            {h.slide17.copyright}
          </p>
        </div>
      )
    }

    return null
  }

  const renderScene = (imageNumber, options = {}) => {
    const { customImageSrc = null, customSlideLabel = null, hideOverlay = false, hideSlideIndex = false } = options
    const shouldUseSvgImage = imageNumber === 1 || imageNumber >= 3
    const firstSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/1es.svg`
      : `${import.meta.env.BASE_URL}images/1.svg`
    const thirdSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/3es.svg`
      : `${import.meta.env.BASE_URL}images/3.svg`
    const fourthSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/4es.svg`
      : `${import.meta.env.BASE_URL}images/4.svg`
    const ninthSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/9es.svg`
      : `${import.meta.env.BASE_URL}images/9.svg`
    const sixteenthSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/16es.svg`
      : `${import.meta.env.BASE_URL}images/16.svg`
    const seventeenthSceneImageSrc = lang === 'es'
      ? `${import.meta.env.BASE_URL}images/17es.svg`
      : `${import.meta.env.BASE_URL}images/17.svg`
    const tenthToFifteenthSceneImageSrc =
      lang === 'es' && imageNumber >= 10 && imageNumber <= 15
        ? `${import.meta.env.BASE_URL}images/${imageNumber}es.svg`
        : `${import.meta.env.BASE_URL}images/${imageNumber}.svg`
    const defaultImageSrc = shouldUseSvgImage
      ? (imageNumber === 1
        ? firstSceneImageSrc
        : imageNumber === 3
          ? thirdSceneImageSrc
          : imageNumber === 4
            ? fourthSceneImageSrc
            : imageNumber === 9
              ? ninthSceneImageSrc
              : imageNumber === 16
                ? sixteenthSceneImageSrc
                : imageNumber === 17
                  ? seventeenthSceneImageSrc
                  : tenthToFifteenthSceneImageSrc)
      : imagePaths[imageNumber - 1]
    const imageSrc = customImageSrc ?? defaultImageSrc
    const compositionForegroundSvgSrc = imageNumber === 3
      ? thirdSceneImageSrc
      : `${import.meta.env.BASE_URL}images/${imageNumber}.svg`
    const isVisibleOverlay = (imageNumber === 1 || imageNumber === 2 || imageNumber === 3 || imageNumber === 5 || imageNumber === 6 || imageNumber === 7 || imageNumber === 8 || imageNumber === 16 || imageNumber === 17) && !hideOverlay
    const isCompositionFixScene = imageNumber === 2 || imageNumber === 3
    const isSlide5Scene = imageNumber === 5
    const isSlide6Scene = imageNumber === 6
    const isSlide7Scene = imageNumber === 7
    const isSlide8Scene = imageNumber === 8
    const isFirstScene = imageNumber === 1
    const sceneForegroundSrc = isCompositionFixScene ? compositionForegroundSvgSrc : imageSrc
    const sceneForegroundSrcCandidates = buildCaseAgnosticSvgCandidates(sceneForegroundSrc)
    const initialSceneForegroundSrc = sceneForegroundSrcCandidates[0] ?? sceneForegroundSrc

    return (
      <div
        className={`hero__image${isFirstScene ? ' hero__image--svg-transparent' : ''}${isCompositionFixScene ? ' hero__image--composition-fix' : ''}${isSlide5Scene ? ' hero__image--slide5-responsive' : ''}${isSlide6Scene ? ' hero__image--slide6-responsive' : ''}${isSlide7Scene ? ' hero__image--slide7-responsive' : ''}${isSlide8Scene ? ' hero__image--slide8-responsive' : ''}`}
        key={`scene-${imageNumber}`}
      >
        {!hideSlideIndex && (
          <span className="hero__slide-index" aria-hidden="true">{formatTemplate(h.templates.slideIndex, { label: customSlideLabel ?? imageNumber })}</span>
        )}

        <img
          className={`hero__image-layer${isCompositionFixScene ? ' hero__image-layer--composition-foreground' : ''}`}
          src={initialSceneForegroundSrc}
          alt={formatTemplate(h.templates.featuredWorkAlt, { number: imageNumber })}
          loading={imageNumber === 1 ? 'eager' : 'lazy'}
          onLoad={() => {
            if (imageNumber === 8) {
              console.log('✓ Scene 8 image loaded successfully:', initialSceneForegroundSrc)
            }
          }}
          onError={(event) => {
            const nextFallbackIndex = Number(event.currentTarget.dataset.fallbackIndex ?? '0') + 1

            if (nextFallbackIndex < sceneForegroundSrcCandidates.length) {
              event.currentTarget.dataset.fallbackIndex = String(nextFallbackIndex)
              event.currentTarget.src = sceneForegroundSrcCandidates[nextFallbackIndex]
              return
            }

            if (imageNumber === 8) {
              console.log('✗ Scene 8 image failed to load:', sceneForegroundSrcCandidates)
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
                    customImageSrc: lang === 'es'
                      ? `${import.meta.env.BASE_URL}images/5bes.svg`
                      : `${import.meta.env.BASE_URL}images/5B.svg`,
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
                    customImageSrc: lang === 'es'
                      ? `${import.meta.env.BASE_URL}images/6bes.svg`
                      : `${import.meta.env.BASE_URL}images/6B.svg`,
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
                    customImageSrc: lang === 'es'
                      ? `${import.meta.env.BASE_URL}images/7bes.svg`
                      : `${import.meta.env.BASE_URL}images/7B.svg`,
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
                customImageSrc: lang === 'es'
                  ? `${import.meta.env.BASE_URL}images/8bes.svg`
                  : `${import.meta.env.BASE_URL}images/8B.svg`,
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
  const underSceneFadeProgress = firstTransitionProgress <= FIRST_TRANSITION_UNDER_SCENE_FADE_START
    ? 0
    : Math.min(
      (firstTransitionProgress - FIRST_TRANSITION_UNDER_SCENE_FADE_START) /
      Math.max(1 - FIRST_TRANSITION_UNDER_SCENE_FADE_START, 0.0001),
      1
    )
  const underSceneOpacity = Math.pow(underSceneFadeProgress, 0.45)
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
        <span
          id="about"
          className="hero__nav-anchor"
          aria-hidden="true"
          style={{ top: `${(FIRST_TRANSITION_DISTANCE_VIEWPORTS + ABOUT_NAV_OFFSET_VIEWPORTS) * 100}vh` }}
        />

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
              opacity: underSceneOpacity,
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
        <span
          id="projects"
          className="hero__nav-anchor"
          aria-hidden="true"
          style={{ top: `${(HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS + PROJECTS_NAV_OFFSET_VIEWPORTS) * 100}vh` }}
        />

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

      <section className="hero__horizontal-transition hero__horizontal-transition--scene8to9" ref={horizontalTransition8To9Ref} aria-label={h.aria.scene8To9Transition}>
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
        <span
          id="contact"
          className="hero__nav-anchor"
          aria-hidden="true"
          style={{ top: `${(SCENE15_TO_16_TRANSITION_DISTANCE_VIEWPORTS + CONTACT_NAV_OFFSET_VIEWPORTS) * 100}vh` }}
        />

        <div className="hero__paper-transition-stage hero__paper-transition-stage--scene15to16">
          <div
            className="hero__scene-layer hero__scene-layer--under"
            /* Scene 15 slides up while scene 16 slides down during the extended transition. */
            style={{
              transform: `translate3d(0, ${-scene15To16TransitionProgress * SCENE15_TO_16_ENTRY_OFFSET_VH}vh, 0)`
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
              opacity: Math.min(1, scene15To16TransitionProgress * 7)
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
