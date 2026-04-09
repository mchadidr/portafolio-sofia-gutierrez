import './Hero.css'

function Hero() {
  const imagePaths = Array.from({ length: 17 }, (_, index) => {
    const imageNumber = index + 1
    return `${import.meta.env.BASE_URL}images/${imageNumber}.png`
  })

  const imageAnchors = {
    2: 'about',
    4: 'projects',
    16: 'contact'
  }

  return (
    <section className="hero" aria-label="Featured work">
      {imagePaths.map((imageSrc, index) => {
        const imageNumber = index + 1

        return (
          <div className="hero__image" id={imageAnchors[imageNumber]} key={imageSrc}>
            <img src={imageSrc} alt={`Featured work ${imageNumber}`} loading="lazy" />
          </div>
        )
      })}
    </section>
  )
}

export default Hero
