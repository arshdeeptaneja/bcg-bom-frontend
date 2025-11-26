/**
 * The provided JavaScript functions `loadAppraisalData` and `saveAppraisalData` help in loading and
 * saving appraisal data respectively using localStorage.
 * @returns The `loadAppraisalData` function returns the parsed data loaded from storage if it exists,
 * or an empty object if no existing data is found. The `saveAppraisalData` function does not return
 * anything explicitly, but it saves the merged data successfully to the localStorage.
 */
export const loadAppraisalData = () => {
  try {
    const stored = localStorage.getItem("appraisalFormData");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(" loadAppraisalData(): Loaded from storage", parsed);
      return parsed;
    }
    console.warn(" loadAppraisalData(): No existing data found.");
    return {};
  } catch (error) {
    console.error(" Error loading appraisal data:", error);
    return {};
  }
};

export const saveAppraisalData = (updates) => {
  try {
    const current = loadAppraisalData();
    const merged = { ...current, ...updates };
    localStorage.setItem("appraisalFormData", JSON.stringify(merged));
    console.log(" saveAppraisalData(): Data saved successfully", merged);
  } catch (error) {
    console.error(" Error saving appraisal data:", error);
  }
};
