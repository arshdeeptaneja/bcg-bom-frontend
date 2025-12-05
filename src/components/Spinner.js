/**
 * The function `LoadingSpinner` displays a loading spinner component with customizable color and
 * styling.
 * @returns The `LoadingSpinner` component is being returned. It consists of a HashLoader component
 * from react-spinners library that displays a loading spinner when the `loading` state is true. The
 * spinner is displayed in the center of the screen with a semi-transparent background.
 */
import { useState } from "react";
import { HashLoader } from "react-spinners";

const override = {
  borderColor: "#185f73",
};

function LoadingSpinner() {
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#185f73"); 

  return (
    <div>    
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999, 
          }}
        >
          <HashLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  );
}

export default LoadingSpinner;
