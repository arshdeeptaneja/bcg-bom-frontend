import './ImageTab.css';

/**
 * Rectangular promotional tab with heading, subtitle and an icon/image.
 */
export default function RectangleTab({ heading, body, image, onClick }) {
  return (
    <div className="rectangle-tab" onClick={onClick} role="button" tabIndex={0}>
      <div className="rectangle-tab-content">
        <h3 className="rectangle-tab-heading">{heading}</h3>
        <p className="rectangle-tab-body mb-0">{body}</p>
      </div>
      <div className="rectangle-tab-image" aria-hidden>
        {image}
      </div>
    </div>
  );
}
