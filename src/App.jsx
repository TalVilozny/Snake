import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Snake from "./Snake/Snake.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="PageWrapper">
        <div className="Page">
          <Snake />
        </div>
      </div>
    </>
  );
}

export default App;
