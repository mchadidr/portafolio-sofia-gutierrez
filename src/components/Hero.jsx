import './Hero.css'

function Hero() {
  const imagePaths = Array.from({ length: 17 }, (_, index) => {
    const imageNumber = index + 1
    return `${import.meta.env.BASE_URL}images/${imageNumber}.png`
  })

  return (
    <section className="hero" id="projects" aria-label="Featured work">
      {imagePaths.map((imageSrc, index) => (
        <div className="hero__image" key={imageSrc}>
          <img src={imageSrc} alt={`Featured work ${index + 1}`} loading="lazy" />
        </div>
      ))}
    </section>
  )
}

export default Hero
