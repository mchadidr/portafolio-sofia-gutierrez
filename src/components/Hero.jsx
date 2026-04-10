import { useEffect, useRef, useState } from 'react'
import './Hero.css'
import HERO_TEXT_POSITIONS, { toPercentPosition } from './heroTextPositions.jsx'

const FIRST_TRANSITION_DISTANCE_VIEWPORTS = 1
const HORIZONTAL_TRANSITION_DISTANCE_VIEWPORTS = 1
const FIRST_TRANSITION_START_DEADZONE_PX = 10

function Hero() {
  const [firstTransitionProgress, setFirstTransitionProgress] = useState(0)
  const [horizontalTransitionProgress, setHorizontalTransitionProgress] = useState(0)

  const firstTransitionRef = useRef(null)
  const horizontalTransitionRef = useRef(null)

  const imagePaths = Array.from({ length: 17 }, (_, index) => {
    const imageNumber = index + 1
    return `${import.meta.env.BASE_URL}images/${imageNumber}.png`
  })

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

      setStableProgress(setFirstTransitionProgress, nextFirstProgress)
      setStableProgress(setHorizontalTransitionProgress, nextHorizontalProgress)
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

          <p
            className="hero__overlay-role"
            style={toPercentPosition(HERO_TEXT_POSITIONS.role)}
          >
            Industrial designer
          </p>

          <p
            className="hero__overlay-name"
            style={{
              ...toPercentPosition(HERO_TEXT_POSITIONS.overlay1Name),
              fontFamily: HERO_TEXT_POSITIONS.overlay1Name.fontFamily,
            }}
          >
            I.D Sofía Gutiérrez Bohórquez.
          </p>
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

          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software1)}>Procreate</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software2)}>Keyshot</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software3)}>SolidWorks</p>
          <p className="hero__software-text hero__software-text--italic" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software4)}>CSWA</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software5)}>Canva</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software6)}>Rhinoceros 3D</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software7)}>Office 365</p>
          <p className="hero__software-text" style={toPercentPosition(HERO_TEXT_POSITIONS.overlay3Software8)}>Adobe Illustrator</p>
        </div>
      )
    }

    return null
  }

  const renderScene = (imageNumber) => {
    const imageSrc = imagePaths[imageNumber - 1]
    const anchorId = imageAnchors[imageNumber]
    const isVisibleOverlay = imageNumber === 1 || imageNumber === 2 || imageNumber === 3
    const isCompositionFixScene = imageNumber === 2 || imageNumber === 3

    return (
      <div
        className={`hero__image${isCompositionFixScene ? ' hero__image--composition-fix' : ''}`}
        id={anchorId}
        key={`scene-${imageNumber}`}
      >
        <img
          className="hero__image-layer"
          src={imageSrc}
          alt={`Featured work ${imageNumber}`}
          loading="lazy"
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

  return (
    <section className="hero" aria-label="Hero composition">
      <section className="hero__paper-transition" ref={firstTransitionRef} aria-label="First scene transition">
        <div className="hero__paper-transition-stage">
          <div className="hero__scene-layer hero__scene-layer--under">
            {renderScene(2)}
          </div>

          {/*
            Scene 1 is intentionally translated downward while scrolling through this stage.
            This creates the paper-sheet reveal effect over scene 2 underneath.
          */}
          <div
            className="hero__scene-layer hero__scene-layer--top"
            style={{ transform: `translate3d(0, ${firstTransitionProgress * 100}vh, 0)` }}
          >
            {renderScene(1)}
          </div>
        </div>
      </section>

      <section className="hero__horizontal-transition" ref={horizontalTransitionRef} aria-label="Scene 3 to 4 transition">
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

      {Array.from({ length: 13 }, (_, index) => index + 5).map((imageNumber) => renderScene(imageNumber))}
    </section>
  )
}

export default Hero
