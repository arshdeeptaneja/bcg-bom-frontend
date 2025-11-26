/**
 * The `SideDrawer` component in React handles various offcanvas interactions for accepting,
 * discussing, and deleting roles, as well as responding to role acceptance discussions.
 * @param props - The `SideDrawer` component receives the following props:
 * @returns The `SideDrawer` component is being returned. It contains offcanvas elements for accepting
 * a role mix, choosing a reason for discussion, deleting a role, and responding to a discussion. Each
 * offcanvas section has specific UI elements and functionality related to role management and
 * discussions.
 */
import React, { useEffect, useState } from "react";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";


const reasons = [
  "My job role is different from the role allocated to me",
  "More job roles have been allocated to me than I actually work on",
  "There are additional job roles that I work on, that are not allocated to me",
  "The indicated duration for the allocated role is incorrect",
  "Other",
];


function SideDrawer(props) {
  const { handleOpenDrawer, openDrawer, handleRoleAcceptance, handleChooseReasonDiscussion, discussionReason, handleDeleteAllocatedRole, handleSelectedRole, handleChangeComment, disscussionComment, responseReason, respondComment, handleChangeRespond, handleSubmitRespond, acceptanceKRADetails, discussionComment } = props;
  const { res_new } = acceptanceKRADetails || {}
  const roleStatus = res_new?.STATUS || ''
  const [localComment, setLocalComment] = useState(discussionComment);

  const handleCloseDrawer = () => {
    handleOpenDrawer(null);
  };

  useEffect(() => {
    if (discussionComment !== null && discussionComment !== undefined) {
      setLocalComment(discussionComment);
    }
  }, [discussionComment]);

  useEffect(() => {
    // Initialize Accept Role Offcanvas
    const acceptEl = document.getElementById("offcanvasWithBackdrop");
    if (acceptEl) {
      const bsAccept =
        bootstrap.Offcanvas.getInstance(acceptEl) ||
        new bootstrap.Offcanvas(acceptEl, { backdrop: true });
      if (openDrawer === "accept") bsAccept.show();
      else bsAccept.hide();
    }

    // Initialize Discuss Offcanvas
    const discussEl = document.getElementById("offcanvasWithBothOptions");
    if (discussEl) {
      const bsDiscuss =
        bootstrap.Offcanvas.getInstance(discussEl) ||
        new bootstrap.Offcanvas(discussEl, { backdrop: true });
      if (openDrawer === "discuss") bsDiscuss.show();
      else bsDiscuss.hide();
    }
    // Delete Drawer
    const deleteEl = document.getElementById("offcanvasDeleteRole");
    if (deleteEl) {
      const bsDelete =
        bootstrap.Offcanvas.getInstance(deleteEl) ||
        new bootstrap.Offcanvas(deleteEl, { backdrop: true });
      if (openDrawer === "delete-role") bsDelete.show();
      else bsDelete.hide();
    }
    const respondEl = document.getElementById("offcanvasAcceptorResponse");
    if (respondEl) {
      const bsRespond =
        bootstrap.Offcanvas.getInstance(respondEl) ||
        new bootstrap.Offcanvas(respondEl, { backdrop: true });
      if (openDrawer === "respondCard") bsRespond.show();
      else bsRespond.hide();
    }

  }, [openDrawer]);

  return (
    <div>
      {/* Accept Role Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        data-bs-scroll="true"
        tabIndex="-1"
        id="offcanvasWithBackdrop"
        aria-labelledby="offcanvasWithBackdropLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold" id="offcanvasWithBackdropLabel">
            Accept Role Mix
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={handleCloseDrawer}
          ></button>
        </div>

        <div className="offcanvas-body">
          <div className="card shadow-sm p-4 border-0 rounded-3 text-center d-flex justify-center align-items-center">
            <img
              src="http://180.149.245.93/bcg-bom/assets/img/role-acceptance.svg"
              alt="Confirmation role"
              className="modal-img mb-4"
              style={{ width: "250px", maxWidth: "100%" }}
            />
            <p className="modal-description fw-medium mb-3 fs-6">
              Do you want to proceed with the role mix?
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button
                className="btn btn-outline-danger px-4 shadow-sm"
                onClick={handleCloseDrawer}
              >
                No
              </button>
              <button className="btn btn-primary px-4 shadow-sm" onClick={() => handleRoleAcceptance('YES')}>Yes</button>
            </div>
          </div>

          <div>{discussionReason}</div>
        </div>
      </div>

      {/* Reason For Discussion Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasWithBothOptions"
        aria-labelledby="offcanvasWithBothOptionsLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold">Reason For Discussion</h5>
          <button type="button" className="btn-close" onClick={handleCloseDrawer}></button>
        </div>

        <div className="offcanvas-body">
          <div className="card shadow-sm p-3 border-0 rounded-3">
            <p className="text-muted mb-3">
              Please choose the appropriate reason for raising the discussion.
            </p>

            <form id="comment_form" className="d-flex flex-column gap-3">
              {reasons?.map((reason, index) => (
                <div className="form-check" key={index}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="comment"
                    id={`radio${index}`}
                    value={reason.toLowerCase() === "other" ? "other" : reason}
                    checked={discussionReason === (reason.toLowerCase() === "other" ? "other" : reason)}
                    onChange={(e) => handleChooseReasonDiscussion(e)}
                  />
                  <label className="form-check-label" htmlFor={`radio${index}`}>
                    {reason}
                  </label>
                </div>
              ))}

              {/* <span id="comment_reason"></span> */}
              {/* <p className="text-danger small mb-0">Please select a reason.</p> */}
              {discussionReason === 'other' ?
                <div>
                  <label htmlFor="comment">Comment:</label>
                  <textarea
                    id="comment"
                    value={disscussionComment}
                    onChange={(e) => handleChangeComment(e)}
                    placeholder="Write something..."
                    rows={4}
                    className="form-control rounded"
                  />
                </div>
                :
                null
              }
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-primary shadow-sm px-4"
                  onClick={() => handleRoleAcceptance()}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Drawer (for role) */}

      {/* Delete Role Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasDeleteRole"
        aria-labelledby="offcanvasDeleteRoleLabel"
      >
        {/* <div className="offcanvas-header">
    <h5 className="offcanvas-title fw-bold" id="offcanvasDeleteRoleLabel">
      Delete Role
    </h5>
    <button
      type="button"
      className="btn-close text-reset"
      onClick={handleCloseDrawer}
    ></button>
  </div>

  <div className="offcanvas-body">
    <div className="card shadow-sm p-4 border-0 rounded-3 text-center d-flex justify-center align-items-center">
      <img
        src="http://180.149.245.93/bcg-bom/assets/img/delete.svg"
        alt="Delete confirmation"
        className="modal-img mb-4"
        style={{ width: "200px", maxWidth: "100%" }}
      />
      <p className="modal-description fw-medium mb-3 fs-6 text-danger">
        Are you sure you want to delete this role?
      </p>
      <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-outline-secondary px-4 shadow-sm"
          onClick={handleCloseDrawer}
        >
          Cancel
        </button>
        <button
          className="btn btn-danger px-4 shadow-sm"
          onClick={() => handleRoleAcceptance("DELETE")}
        >
          Delete
        </button>
      </div>
    </div>
  </div> */}

        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold" id="offcanvasWithBackdropLabel">
            Delete Role
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={handleCloseDrawer}
          ></button>
        </div>

        <div className="offcanvas-body">
          <div className="card shadow-sm p-4 border-0 rounded-3 text-center d-flex justify-center align-items-center">
            <img
              src="http://180.149.245.93/bcg-bom/assets/img/role-acceptance.svg"
              alt="Confirmation role"
              className="modal-img mb-4"
              style={{ width: "250px", maxWidth: "100%" }}
            />
            <p className="modal-description fw-medium mb-3 fs-6">
              {/* Do you want to proceed with the r? */}
              {/* Confirmation */}
              Do you want to proceed with Delete Role ?
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button
                className="btn btn-outline-danger px-4 shadow-sm"
                onClick={handleCloseDrawer}
              >
                No
              </button>
              <button className="btn btn-primary px-4 shadow-sm" onClick={() => handleDeleteAllocatedRole('YES')}>Yes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Respond card */}
      <div className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasAcceptorResponse"
        aria-labelledby="offcanvasAcceptorResponseLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title fw-bold" id="offcanvasWithBackdropLabel">
            Your Response
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={handleCloseDrawer}
          ></button>
        </div>

        <div className="offcanvas-body">
          <form id="comment_form">
            <p className="fw-bold fs-5 mb-3">Conclusion</p>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="radio"
                id="p_discussion_y"
                name="responseReason"
                value="Y"
                checked={responseReason === "Y"}
                onChange={(e) =>
                  handleChangeRespond("conclusionReason", e.target.value)
                }
              />
              <label className="form-check-label ms-2" htmlFor="p_discussion_y">
                Yes, the reason cited by the acceptor is valid &amp; he/she is eligible
                to get a new role mix.
              </label>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="radio"
                id="p_discussion_n"
                name="responseReason"
                value="N"
                checked={responseReason === "N"}
                onChange={(e) =>
                  handleChangeRespond("conclusionReason", e.target.value)
                }
              />
              <label className="form-check-label ms-2" htmlFor="p_discussion_n">
                No, a detailed discussion was carried out with the role acceptor and
                he/she agrees to the scope of the role mix allocated.
              </label>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              {/* <button type="button" className="btn btn-outline-secondary">
            Cancel
          </button> */}
              <button type="submit" className="btn btn-primary" onClick={(e) => handleSubmitRespond(e)}>
                Submit
              </button>
            </div>
          </form>
          {localComment ? (
            <div className="mt-4 p-3 border rounded bg-light">
              <p className="mb-0">{localComment}</p>
            </div>
          ) : null}  </div>
      </div>
    </div>
  );
}

export default React.memo(SideDrawer);
