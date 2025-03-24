import React
from "react";
import BalanceViewer from "./components/BalanceViewer";

function App() {
    return (
        <div style={{ backgroundColor: "#121212", minHeight: "100vh", padding: "2rem" }}>
            <h1 style={{ color: "#ffffff", fontSize: "2rem", marginBottom: "2rem" }}>
                Hello from Flash Tether App!
            </h1>
            <BalanceViewer />
        </div>
    );
}

export default App;