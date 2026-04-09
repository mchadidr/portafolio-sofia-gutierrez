import './Hero.css'

function Hero() {
  return (
    <section className="hero" id="projects" aria-label="Featured work">

      {/* ── Section label ── */}
      <p className="hero__label">Selected Works</p>

      {/* ── 3-image grid ── */}
      <div className="hero__grid">

        <div className="hero__image hero__image--primary">
          <img src="/images/1.png" alt="Featured work — image 1" />
        </div>

        {/*
          IMAGE PLACEHOLDER 2 — Top-right image
          Replace <div> with <img src="..." alt="..." /> when asset is ready.
          Recommended: a detail / close-up shot of a product.
        */}
        <div className="hero__image hero__image--secondary-top" aria-hidden="true">
          <span className="hero__image-label">Image 02</span>
        </div>

        {/*
          IMAGE PLACEHOLDER 3 — Bottom-right image
          Replace <div> with <img src="..." alt="..." /> when asset is ready.
          Recommended: a process or sketch image.
        */}
        <div className="hero__image hero__image--secondary-bottom" aria-hidden="true">
          <span className="hero__image-label">Image 03</span>
        </div>

      </div>

      {/* ── Tagline / intro copy ── */}
      {/*
        CONTENT PLACEHOLDER
        Replace the text below with Sofia's actual tagline or intro statement.
      */}
      <div className="hero__copy">
        <h1 className="hero__title">
          Designing with intention,<br />crafting with care.
        </h1>
        <p className="hero__subtitle">
          {/* PLACEHOLDER — replace with a 1–2 sentence bio or portfolio descriptor */}
          Industrial designer crafting thoughtful objects and experiences.
        </p>
      </div>

    </section>
  )
}

export default Hero
