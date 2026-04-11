import { useEffect, useRef, useState } from 'react'
import './Hero.css'
import HERO_TEXT_POSITIONS, { toPercentPosition } from './heroTextPositions.jsx'

const FIRST_TRANSITION_DISTANCE_VIEWPORTS = 0.26
const HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS = 1
const FIRST_TRANSITION_START_DEADZONE_PX = 10
const FIRST_TRANSITION_INITIAL_SCALE = 0.75
const FIRST_TRANSITION_PEAK_SCALE = 0.98
const FIRST_TRANSITION_SCALE_PHASE_END = 0.32
const FIRST_TRANSITION_UNDER_REVEAL_START = 0.03
const FIRST_TRANSITION_UNDER_REVEAL_SETTLE_END = 0.2
const FIRST_TRANSITION_UNDER_REVEAL_OFFSET_VH = 7
const SCENE15_TO_16_START_DEADZONE_RATIO = 0.25
const SCENE15_TO_16_ENTRY_OFFSET_VH = 110
const SCENE15_TO_16_TRANSITION_DISTANCE_VIEWPORTS = 3

function Hero() {
  const [firstTransitionProgress, setFirstTransitionProgress] = useState(0)
  const [horizontalTransitionProgress, setHorizontalTransitionProgress] = useState(0)
  const [horizontalTransition8To9Progress, setHorizontalTransition8To9Progress] = useState(0)
  const [scene15To16TransitionProgress, setScene15To16TransitionProgress] = useState(0)
  const [debugScrollY, setDebugScrollY] = useState(0)

  const firstTransitionRef = useRef(null)
  const horizontalTransitionRef = useRef(null)
  const horizontalTransition8To9Ref = useRef(null)
  const scene15To16TransitionRef = useRef(null)

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
        HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS
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

  const renderOverlayContent = (imageNumber) => {
    const isPrimaryImage = imageNumber === 1
    const isAboutImage = imageNumber === 2
    const isEducationImage = imageNumber === 3

    if (isPrimaryImage) {
      return (
        <div className="hero__overlay-content">
          <h1
            className="hero__overlay-year"
            style={toPercentPosition(HERO_TEXT_POSITIONS.year)}
          >
            2 0 2 6
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
            <span className="hero__about-title-main">About</span>
            <span className="hero__about-title-italic">me</span>
          </h2>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line1)}>
            Welcome to my creative portfolio, where <span className="hero__about-highlight">imagination meets tangibility.</span> Here,
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line2)}>
            you will find a curated selection of projects that reflect my passion for design,
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line3)}>
            storytelling, and visual exploration, each one driven by a constant desire to
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line4)}>
            push creative boundaries.
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line5)}>
            I am a <span className="hero__about-highlight">Product Design student pursuing a double degree between</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line6)}>
            <span className="hero__about-highlight">Universidad Pontificia Bolivariana in Colombia and LCI Veritas in Costa</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line7)}>
            <span className="hero__about-highlight">Rica.</span> This international academic experience has allowed me to develop a
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line8)}>
            broader, more diverse perspective on design, integrating different
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line9)}>
            methodologies, cultural contexts, and approaches to problem-solving.
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line10)}>
            As a future designer, <span className="hero__about-highlight">I stand out for my creativity, passion, and</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line11)}>
            <span className="hero__about-highlight">determination.</span> I approach every challenge as an opportunity to grow,
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line12)}>
            consistently stepping outside my comfort zone to expand my skills and
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line13)}>
            perspective.
          </p>

          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line14)}>
            <span className="hero__about-highlight">My work is defined by energy, leadership, and a strong commitment to</span>
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line15)}>
            <span className="hero__about-highlight">excellence.</span> I strive to reflect this mindset in every project I develop—
          </p>
          <p className="hero__about-line" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay2Line16)}>
            transforming ideas into meaningful and tangible experiences.
          </p>
        </div>
      )
    }

    if (isEducationImage) {
      return (
        <div className="hero__overlay-content hero__overlay-content--education">
          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleEducation)}>
            <span className="hero__section-bullet">•</span>
            <span>Educational background</span>
          </p>

          <p className="hero__body-label" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3HighSchoolLabel)}>High School:</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3HighSchoolValue)}>
            Instituto Jorge Robledo in Medellín, Colombia
          </p>

          <p className="hero__body-label" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityLabel)}>University:</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityValue1)}>
            Universidad Pontificia Bolivariana, Medellín, Colombia.
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3UniversityValue2)}>
            LCI Veritas, San José, Costa Rica.
          </p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleWork)}>
            <span className="hero__section-bullet">•</span>
            <span>Work</span>
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3WorkValue)}>
            Class monitor at Universidad Pontificia Bolivariana
          </p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleLanguages)}>
            <span className="hero__section-bullet">•</span>
            <span>Languages</span>
          </p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3LanguageValue1)}>Spanish C1 (native)</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3LanguageValue2)}>English B2 (certified)</p>

          <p className="hero__section-title" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3TitleSoftSkills)}>
            <span className="hero__section-bullet">•</span>
            <span>Soft skills</span>
          </p>

          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft1)}>Detail-oriented</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft2)}>Teamwork</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft3)}>Time management</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft4)}>Leadership</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillLeft5)}>Creative thinking</p>

          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight1)}>Problem solving</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight2)}>Fast thinking</p>
          <p className="hero__body-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3SkillRight3)}>Active listening</p>

          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software1), display: 'none' }}>Procreate</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software2), display: 'none' }}>Keyshot</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software3), display: 'none' }}>SolidWorks</p>
          <p className="hero__software-text hero__software-text--italic" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software4), display: 'none' }}>CSWA</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software5), display: 'none' }}>Canva</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software6), display: 'none' }}>Rhinoceros 3D</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software7), display: 'none' }}>Office 365</p>
          <p className="hero__software-text" style={{ ...toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software8), display: 'none' }}>Adobe Illustrator</p>
        </div>
      )
    }

    return null
  }

  const renderScene = (imageNumber) => {
    const shouldUseSvgImage = imageNumber === 1 || (imageNumber >= 10 && imageNumber <= 16)
    const imageSrc = shouldUseSvgImage
      ? `${import.meta.env.BASE_URL}images/${imageNumber}.svg`
      : imagePaths[imageNumber - 1]
    const compositionForegroundSvgSrc = `${import.meta.env.BASE_URL}images/${imageNumber}.svg`
    const anchorId = imageAnchors[imageNumber]
    const isVisibleOverlay = imageNumber === 1 || imageNumber === 2 || imageNumber === 3
    const isCompositionFixScene = imageNumber === 2 || imageNumber === 3
    const isFirstScene = imageNumber === 1
    const sceneForegroundSrc = isCompositionFixScene ? compositionForegroundSvgSrc : imageSrc

    return (
      <div
        className={`hero__image${isFirstScene ? ' hero__image--svg-transparent' : ''}${isCompositionFixScene ? ' hero__image--composition-fix' : ''}`}
        id={anchorId}
        key={`scene-${imageNumber}`}
      >
        <img
          className={`hero__image-layer${isCompositionFixScene ? ' hero__image-layer--composition-foreground' : ''}`}
          src={sceneForegroundSrc}
          alt={`Featured work ${imageNumber}`}
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
          {renderOverlayContent(imageNumber)}
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
    <section className="hero" aria-label="Hero composition">
      {/* Shared backdrop: one fixed background for the full hero so scenes 2+ move over the same stationary layer. */}
      <div className="hero__scene-fixed-background" aria-hidden="true" style={sharedBackgroundStyle} />

      {/* Temporary debug counters for tuning hero transition timing. */}
      <div className="hero__progress-counter" aria-live="polite">
        <p className="hero__progress-counter-line">y: {debugScrollY}px</p>
        <p className="hero__progress-counter-line">1 to 2: {firstTransitionProgressPercent}%</p>
        <p className="hero__progress-counter-line">3 to 4: {horizontalTransitionProgressPercent}%</p>
        <p className="hero__progress-counter-line">8 to 9: {horizontalTransition8To9ProgressPercent}%</p>
        <p className="hero__progress-counter-line">15 to 16: {scene15To16TransitionProgressPercent}%</p>
      </div>

      <section className="hero__paper-transition hero__paper-transition--first" ref={firstTransitionRef} aria-label="First scene transition">
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

      <section className="hero__horizontal-transition hero__horizontal-transition--scene3" ref={horizontalTransitionRef} aria-label="Scene 3 to 4 transition">
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

      {Array.from({ length: 3 }, (_, index) => index + 5).map((imageNumber) => renderScene(imageNumber))}

      <section className="hero__horizontal-transition" ref={horizontalTransition8To9Ref} aria-label="Scene 8 to 9 transition">
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

      <section className="hero__paper-transition hero__paper-transition--scene15to16" ref={scene15To16TransitionRef} aria-label="Scene 15 to 16 inverted paper transition">
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
              transform: `translate3d(0, ${(-100 + scene15To16TransitionProgress * 100)}vh, 0)`,
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
