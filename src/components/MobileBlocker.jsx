import './MobileBlocker.css'

function MobileBlocker() {
  return (
    <div className="mobile-blocker" role="alert" aria-live="polite">
      <p className="mobile-blocker__message">
        This site is not available for mobile view yet.
        <br />
        Please use a desktop device.
      </p>
    </div>
  )
}

export default MobileBlocker
