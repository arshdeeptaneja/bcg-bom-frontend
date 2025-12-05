import './ImageTab.css';

/**
 * Rectangular promotional tab with heading, subtitle and an icon/image.
 */
export default function RectangleTab({ heading, body, image, onClick }) {
  // --- Split heading after 1 word ---
  const headingWords = heading.split(" ");
  const formattedHeading =
    headingWords.length > 1
      ? (
          <>
            {headingWords[0]} <br />
            {headingWords.slice(1).join(" ")}
          </>
        )
      : heading;

  // --- Split body after 3 words ---
  const bodyWords = body.split(" ");
  const formattedBody =
    bodyWords.length > 3
      ? (
          <>
            {bodyWords.slice(0, 3).join(" ")} <br />
            {bodyWords.slice(3).join(" ")}
          </>
        )
      : body;

  return (
    <div className="rectangle-tab" onClick={onClick} role="button" tabIndex={0}>
      <div className="rectangle-tab-content">
        <h3 className="rectangle-tab-heading">{formattedHeading}</h3>
        <p className="rectangle-tab-body mb-0">{formattedBody}</p>
      </div>
      <div className="rectangle-tab-image" aria-hidden>
        {image}
      </div>
    </div>
  );
}
