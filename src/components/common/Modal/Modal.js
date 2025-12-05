import { useEffect } from 'react';
import './Modal.css';

/**
 * Utility function to show a modal by ID
 * @param {string} modalId - The ID of the modal to show
 */
export const showModal = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (modalEl && window.bootstrap) {
    const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
  }
};

/**
 * Utility function to hide a modal by ID
 * @param {string} modalId - The ID of the modal to hide
 */
export const hideModal = (modalId) => {
  const modalEl = document.getElementById(modalId);
  if (modalEl && window.bootstrap) {
    const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
};

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
  useEffect(() => {
    // Initialize Bootstrap modal when component mounts
    const modalEl = document.getElementById(id);
    if (modalEl && window.bootstrap) {
      // Create or get modal instance
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
      
      // Cleanup on unmount
      return () => {
        if (modalInstance) {
          modalInstance.dispose();
        }
      };
    }
  }, [id]);
  return (
    // The id allows external triggers to target this specific modal via data attributes
    <div id={id} className="modal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>{body}</p>
          </div>
          <div className="modal-footer">
            {/*
              Primary action: wait for the modal to be fully hidden before
              invoking the callback (e.g., navigation). This avoids leaving
              the backdrop/overlay visible on the next page.
            */}
            <button
              type="button"
              className="btn butns"
              onClick={() => {
                // Get the modal element by id
                const modalEl = document.getElementById(id);
                // If modal element is not found, call the primary action immediately
                if (!modalEl) {
                  actions.primary.onClick();
                  return;
                }
                // Define a handler to be called when the modal is fully hidden
                const onHidden = () => {
                  // Remove the event listener to avoid memory leaks
                  modalEl.removeEventListener('hidden.bs.modal', onHidden);
                  // Invoke the primary callback after the modal is hidden
                  actions.primary.onClick();
                };
                // Listen for Bootstrap's modal hidden event
                modalEl.addEventListener('hidden.bs.modal', onHidden);
                try {
                  // Use Bootstrap's Modal API to find or create a modal instance
                  const modalInstance = window.bootstrap?.Modal?.getOrCreateInstance
                    ? window.bootstrap.Modal.getOrCreateInstance(modalEl)
                    : null;
                  if (modalInstance) {
                    // Hide the modal, which will trigger the 'hidden.bs.modal' event
                    modalInstance.hide();
                  } else {
                    // Fallback: trigger native dismiss click if available
                    const closeBtn = modalEl.querySelector('[data-bs-dismiss="modal"]');
                    if (closeBtn) {
                      closeBtn.click();
                    } else {
                      // As a last resort, defer the action a tick
                      setTimeout(() => onHidden(), 0);
                    }
                  }
                } catch (e) {
                  actions.primary.onClick();
                }
              }}
            >
              {actions.primary.label}
            </button>
            {/*
              Secondary action: let Bootstrap close the modal, and only after
              it is hidden, invoke the callback. Keeps behavior consistent and
              avoids race conditions with the backdrop teardown.
            */}
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => {
                const modalEl = document.getElementById(id);
                if (!modalEl) {
                  actions.secondary.onClick();
                  return;
                }
                const onHidden = () => {
                  modalEl.removeEventListener('hidden.bs.modal', onHidden);
                  actions.secondary.onClick();
                };
                modalEl.addEventListener('hidden.bs.modal', onHidden);
              }}
            >
              {actions.secondary.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
