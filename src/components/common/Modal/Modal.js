import './Modal.css';

/**
 * This is a modal component that is used to display a modal.
 * @param {Object} props - The props for the modal.
 * @param {string} props.id - The id of the modal.
 * @param {string} props.title - The title of the modal.
 * @param {string} props.body - The body of the modal.
 * @param {Object} props.actions - The actions of the modal.
 * @param {string} props.actions.primary - The primary action of the modal.
 * @param {string} props.actions.secondary - The secondary action of the modal.
 * @param {callback} props.actions.primary.onClick - The function to call when the primary action is clicked.
 * @param {callback} props.actions.secondary.onClick - The function to call when the secondary action is clicked.
 * @returns
 */
export default function Modal({ id, title, body, actions }) {
  return (
    <div id={id} class="modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{title}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>{body}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" onClick={actions.primary.onClick}>
              {actions.primary.label}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={actions.secondary.onClick}
            >
              {actions.secondary.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
