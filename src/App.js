import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TCTPage from "./TCTPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tct/:id" element={<TCTPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;