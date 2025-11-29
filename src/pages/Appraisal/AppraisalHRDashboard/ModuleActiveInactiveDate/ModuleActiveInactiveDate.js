import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ModuleActiveInactiveDate.css";
import { BackButton } from "../../../../components/common";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { appraisalAPI } from "../../../../services/api";
import { FaInfoCircle } from "react-icons/fa";
import LoadingSpinner from "../../../../components/Spinner";
import { toast } from "react-toastify";

const ModuleActiveInactiveDate = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
  moduleName: "",
  financialYear: "",
  quarter: "",
  scale: "",
  activeDate: "",
  inActiveDate: "",
});


    const [filteredData, setFilteredData] = useState([]);
  
const [showAddModal, setShowAddModal] = useState(false);
const openAddModal = () => setShowAddModal(true);
const closeAddModal = () => {
    setShowAddModal(false);
    // Reset form when closing modal
    setFilters({
        moduleName: "",
        financialYear: "",
        quarter: "",
        scale: "",
        activeDate: "",
        inActiveDate: "",
    });
};

const [showEditModal, setShowEditModal] = useState(false);
const [editingRow, setEditingRow] = useState(null);
const [editForm, setEditForm] = useState({
    activeDate: "",
    inActiveDate: "",
});

const openEditModal = (row) => {
    setEditingRow(row);
    setEditForm({
        activeDate: row.activeDate || "",
        inActiveDate: row.inactiveDate || row.inActiveDate || "",
    });
    setShowEditModal(true);
};

const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRow(null);
    setEditForm({
        activeDate: "",
        inActiveDate: "",
    });
};


    // React Query: Fetch module active/inactive list with filter metadata
    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["module-active-inactive"],
        queryFn: async () => {
            const res = await appraisalAPI.moduleActiveInactiveDateGetList();
            return res || {};
        },
        retry: false,
    });

    // Extract results and filter options from API response
    const results = apiData?.results || [];
    const filterOptions = apiData?.filter_data || {};

      const extractYear = (fy) => {
                         const match = fy.match(/FY (\d{4})/);
                         return match ? match[1] : new Date().getFullYear().toString();
                     };
                 
                       const { getUserProperty } = useAuth();
                     
                     // these are directly stored in userData in AuthContext.localStorage
                     const sol = getUserProperty("sol") 
                              || getUserProperty("LOCATION") 
                              || getUserProperty("solId");
                              
                     const empNo = getUserProperty("empNo") 
                                || getUserProperty("EMP_ID");
                     
                     const roleName = getUserProperty("ROLE_TYPE") 
                                   || getUserProperty("roleType") 
                                   || getUserProperty("designation")
                                   || getUserProperty("ROLE_NAME");
                     
                     console.log({roleName, sol, empNo});
                 
             
                     const [searchParams] = useSearchParams();
                                    // Q1
                     const financialYear = searchParams.get("financialYear"); 

const handleSearch = () => {
    let filtered = results;

    if (filters.moduleName && filters.moduleName !== "-Select-") {
        filtered = filtered.filter(item =>
            item.moduleName.toLowerCase().includes(filters.moduleName.toLowerCase())
        );
    }

    if (filters.financialYear && filters.financialYear !== "-Select-") {
        filtered = filtered.filter(item =>
            item.financialYear.toString() === filters.financialYear
        );
    }

    if (filters.quarter && filters.quarter !== "-Select-") {
        filtered = filtered.filter(item =>
            item.quarter === filters.quarter
        );
    }

    if (filters.scale && filters.scale !== "-Select-") {
        filtered = filtered.filter(item =>
            item.scale.toString() === filters.scale
        );
    }

    // override current paginated data
    setCurrentPage(1);
    setFilteredData(filtered);
};



  // React Query mutation: Insert module
  const insertMutation = useMutation({
    mutationFn: async (payload) => {
      return await appraisalAPI.moduleActiveInactiveDateUpdate({
        intent: "INSERT",
        payload,
      });
    },
    onSuccess: (data) => {
      console.log("API RESPONSE:", data);
      toast.success("Module inserted successfully!");
      closeAddModal();
      queryClient.invalidateQueries({ queryKey: ["module-active-inactive"] }); // Refresh list
    },
    onError: (error) => {
      console.error("INSERT ERROR:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Insert failed!";
      toast.error(errorMessage);
    },
  });

  const handleInsertSubmit = () => {
    if (
      !filters.moduleName ||
      !filters.financialYear ||
      !filters.quarter ||
      !filters.scale ||
      !filters.activeDate ||
      !filters.inActiveDate
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      moduleName: filters.moduleName.toLowerCase(), // Backend expects lowercase
      selectedYear: filters.financialYear,
      selectedQuater: filters.quarter,
      selectedScale: filters.scale,
      activeDate: filters.activeDate,
      inActiveDate: filters.inActiveDate,
      employeeNumber: String(empNo || "65327"), // Use empNo from auth context
    };

    console.log("FINAL PAYLOAD SENT =>", payload);
    insertMutation.mutate(payload);
  };



  // React Query mutation: Update module
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return await appraisalAPI.moduleActiveInactiveDateUpdate({
        intent: "UPDATE",
        payload,
      });
    },
    onSuccess: (data) => {
      console.log("UPDATE RESPONSE:", data);
      toast.success("Module updated successfully!");
      closeEditModal();
      queryClient.invalidateQueries({ queryKey: ["module-active-inactive"] }); // Refresh list
    },
    onError: (error) => {
      console.error("UPDATE ERROR:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Update failed!";
      toast.error(errorMessage);
    },
  });

  // Handle Edit Submit
  const handleEditSubmit = () => {
    if (!editingRow) return;

    if (!editForm.activeDate || !editForm.inActiveDate) {
      toast.error("Please fill both Active Date and Inactive Date");
      return;
    }

    const payload = {
      moduleName: String(editingRow.moduleName || "").toLowerCase(),
      selectedYear: String(editingRow.financialYear || ""),
      selectedQuater: String(editingRow.quarter || ""),
      selectedScale: String(editingRow.scale || ""),
      activeDate: editForm.activeDate,
      inActiveDate: editForm.inActiveDate,
      employeeNumber: String(empNo || "65327"),
    };

    console.log("UPDATE PAYLOAD =>", payload);
    updateMutation.mutate(payload);
  };

    // React Query mutation: Delete module
  const deleteMutation = useMutation({
    mutationFn: async (payload) => {
      return await appraisalAPI.moduleActiveInactiveDateUpdate({
        intent: "DELETE",
        payload,
      });
    },
    onSuccess: (data) => {
      console.log("DELETE RESPONSE:", data);
      toast.success("Module deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["module-active-inactive"] }); // Refresh list
    },
    onError: (error) => {
      console.error("DELETE ERROR:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Delete failed!";
      toast.error(errorMessage);
    },
  });

    // Delete Module
const handleDelete = (row) => {
  const confirmDel = window.confirm("Delete this module?");
  if (!confirmDel) return;

  const payload = {
    moduleName: String(row.moduleName || "").toLowerCase(),
    selectedYear: String(row.financialYear || ""),
    selectedQuater: String(row.quarter || ""),
    selectedScale: String(row.scale || ""),
    activeDate: row.activeDate || "",
    inActiveDate: row.inactiveDate || row.inActiveDate || "",
    employeeNumber: String(empNo || "65327"),
  };

  console.log("DELETE PAYLOAD =>", payload);
  deleteMutation.mutate(payload);
};




    // ---------------- PAGINATION ----------------
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const listToUse = filteredData.length > 0 ? filteredData : results;

    const totalPages = Math.ceil(listToUse.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = listToUse.slice(startIndex, startIndex + itemsPerPage);





    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

 const handleReset = () => {
    setFilters({ moduleName: "", financialYear: "", quarter: "", scale: "" });
    setFilteredData([]);
    setCurrentPage(1);
};

    // ---------------- LOADER ----------------
    if (isLoading) {
        return (
            <div className="pageWrapper">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Appraisal Home
                    </h1>
                </div>
                <LoadingSpinner />
            </div>
        );
    }

    // ---------------- UI ----------------
    return (
        <div className="AppraiserContaniner">
            <div className="breadcrumb-header d-flex justify-content-between align-items-center px-3 py-2">
                <div className="breadcrumb-path">
                    <span className="breadcrumb-link">Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">Appraisal HR Dashboard</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active">
                        Module Active Inactive Date
                    </span>
                </div>

                <div className="breadcrumb-info d-flex align-items-center">
                    <span className="breadcrumb-fy me-2">FY 2025-2026</span>
                    <button className="blue-button m-0 d-inline-flex align-items-center gap-1 fw-medium shadow-sm bg-white px-2 py-1 border border-opacity-10 border-dark">
                        <FaInfoCircle size={13} /> Info
                    </button>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                <div className="pageWrapper-header">
                    <BackButton />
                    <h1 className="dashboard-title text-primary fw-bold mb-0 ms-3">
                        Module Active Inactive Date
                    </h1>
                </div>
               <button className="btn  primary-button" onClick={openAddModal}>
   Add Module
</button>

{showAddModal && (
  <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Add Module Active/Inactive Dates</h5>
          <button type="button" className="btn-close" onClick={closeAddModal}></button>
        </div>

        <div className="modal-body">
          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label fw-semibold">Module Name</label>
              <select
                className="form-select"
                value={filters.moduleName}
                onChange={(e) => setFilters({ ...filters, moduleName: e.target.value })}
              >
                <option value="">-Select-</option>
                <option>SelfAppraisal</option>
                <option>REPA</option>
                <option>REVA</option>
                <option>AC</option>
                <option>Reporting Authority Appraisal</option>
                <option>Reviewing Authority Appraisal</option>
                <option>Accepting Authority APPRAIAL</option>
                <option>Appeal</option>
                <option>Self Exception</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Financial Year</label>
              <select
                className="form-select"
                value={filters.financialYear}
                onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
              >
                <option value="">-Select-</option>
                <option>2024</option>
                <option>2025</option>
                <option>2026</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Quarter</label>
              <select
                className="form-select"
                value={filters.quarter}
                onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
              >
                <option value="">-Select-</option>
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
                <option>ANNUAL</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Scale</label>
              <select
                className="form-select"
                value={filters.scale}
                onChange={(e) => setFilters({ ...filters, scale: e.target.value })}
              >
                <option value="">-Select-</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Active Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.activeDate || ""}
                onChange={(e) => setFilters({ ...filters, activeDate: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Inactive Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.inActiveDate || ""}
                onChange={(e) => setFilters({ ...filters, inActiveDate: e.target.value })}
              />
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeAddModal} disabled={insertMutation.isPending}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleInsertSubmit}
            disabled={insertMutation.isPending}
          >
            {insertMutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>

      </div>
      </div>
    </div>
  )}

{/* Edit Modal */}
{showEditModal && editingRow && (
  <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Edit Module Active/Inactive Dates</h5>
          <button type="button" className="btn-close" onClick={closeEditModal}></button>
        </div>

        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label fw-semibold">Module Name</label>
              <input
                type="text"
                className="form-control"
                value={editingRow.moduleName || ""}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Financial Year</label>
              <input
                type="text"
                className="form-control"
                value={editingRow.financialYear || ""}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Quarter</label>
              <input
                type="text"
                className="form-control"
                value={editingRow.quarter || ""}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Scale</label>
              <input
                type="text"
                className="form-control"
                value={editingRow.scale || ""}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Active Date</label>
              <input
                type="date"
                className="form-control"
                value={editForm.activeDate || ""}
                onChange={(e) => setEditForm({ ...editForm, activeDate: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Inactive Date</label>
              <input
                type="date"
                className="form-control"
                value={editForm.inActiveDate || ""}
                onChange={(e) => setEditForm({ ...editForm, inActiveDate: e.target.value })}
              />
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={closeEditModal}
            disabled={updateMutation.isPending}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleEditSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update"}
          </button>
        </div>

      </div>
    </div>
  </div>
)}


            </div>

            {/* ---------------- FILTERS ---------------- */}
            <section className="mb-4 p-4">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Module NAME</label>
                        <select
                            className="form-select"
                            value={filters.moduleName}
                            onChange={(e) =>
                                setFilters({ ...filters, moduleName: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>appeal</option>
                            <option>appraisal</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Financial Year</label>
                        <select
                            className="form-select"
                            value={filters.financialYear}
                            onChange={(e) =>
                                setFilters({ ...filters, financialYear: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>2025</option>
                            <option>2026</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">QUARTER</label>
                        <select
                            className="form-select"
                            value={filters.quarter}
                            onChange={(e) =>
                                setFilters({ ...filters, quarter: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>Q1</option>
                            <option>Q2</option>
                            <option>Q3</option>
                            <option>Q4</option>
                            <option>ANNUAL</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">SCALE</label>
                        <select
                            className="form-select"
                            value={filters.scale}
                            onChange={(e) =>
                                setFilters({ ...filters, scale: e.target.value })
                            }
                        >
                            <option>-Select-</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>

                    <div className="col-md-2 d-flex gap-2">
    {/* <button className="reset-btn px-3" >
        Search
    </button> */}

    <button className="reset-btn px-3" onClick={handleReset}>
        Reset ↻
    </button>
</div>

                </div>

                {/* ---------------- TABLE ---------------- */}
                <div className="d-flex justify-content-end mt-5">
                    <table className="table mb-0 align-middle">
                        <thead className="table-header">
                            <tr>
                                <th>Module Name</th>
                                <th>Quarter</th>
                                <th>Scale</th>
                                <th>Financial Year</th>
                                <th>Active Date</th>
                                <th>Inactive Date</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.moduleName}</td>
                                    <td>{row.quarter}</td>
                                    <td>{row.scale}</td>
                                    <td>{row.financialYear}</td>
                                    <td>{row.activeDate}</td>
                                    <td>{row.inactiveDate}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm edit-button me-2"
                                            onClick={() => openEditModal(row)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-sm delete-button"
                                            onClick={() => handleDelete(row)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ---------------- PAGINATION ---------------- */}
                <div className="d-flex justify-content-between align-items-center px-4 py-3">
                    <small className="text-muted">
                        Showing {listToUse.length === 0 ? 0 : startIndex + 1} to{" "}
                        {Math.min(startIndex + itemsPerPage, listToUse.length)} of {listToUse.length}{" "}
                        entries
                    </small>

                    <div>
                        <button
                            className="btn btn-link text-decoration-none p-0 me-3"
                            disabled={currentPage === 1}
                            onClick={handlePrev}
                        >
                            Previous
                        </button>

                        <button
                            className="btn btn-link text-decoration-none p-0"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ModuleActiveInactiveDate;
