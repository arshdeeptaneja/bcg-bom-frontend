/**
 * This section renders a form with the questions as provided in the parameters.
 * @param {Object} props
 * @param {Object} props.questions - The questions to render in the form
 * @param {Object} props.questions.question - The question to render in the form
 * @param {Object} props.questions.options - The options to render in the form
 * @param {Object} props.questions.required - Whether the question is required
 */
export default function DevelopmentInputs({ questions }) {
  return (
    <div className="d-flex flex-column gap-3">
      {questions.map((question, index) => (
        <div key={question.question} className="d-flex flex-column gap-1">
          {/* Question number and question text */}
          <div className="d-flex flex-row gap-1">
            <span className="fw-bold">{index + 1}.</span>
            <span className="fw-bold">{question.question}</span>
            {question.required && <span className="text-danger">*</span>}
          </div>

          {/* Radio buttons for multiple choice questions */}
          {question.options && (
            <div className="d-flex flex-row gap-3">
              {question.options.map((option) => (
                <div className="form-check" key={option}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`question-${index}`}
                    id={`question-${index}-option-${option}`}
                    value={option}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`question-${index}-option-${option}`}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}
          {/* Textarea for free text response */}
          <textarea className="form-control" placeholder="Enter your Response" rows={3} />
        </div>
      ))}
    </div>
  );
}
