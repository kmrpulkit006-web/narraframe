import Background from "./components/Background";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import UploadSection from "./components/UploadSection";
import { Routes, Route } from "react-router-dom";
import StoryboardViewer from "./pages/StoryboardViewer";
import ManhwaViewer from "./pages/ManhwaViewer";
import ProjectsList from "./pages/ProjectsList";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState } from "react";
import LandingSections from "./components/LandingSections";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [storyboard, setStoryboard] = useState(null);
  return (
    <>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <>
              <Background />
              <Navbar />
              <Hero />
              <UploadSection setStoryboard={setStoryboard} />
              <LandingSections />
            </>
          }
        />

        <Route
          path="/viewer"
          element={<StoryboardViewer storyboard={storyboard} />}
        />

        <Route
          path="/manhwa"
          element={<ManhwaViewer storyboard={storyboard} />}
        />

        <Route
          path="/projects"
          element={<ProjectsList />}
        />

      </Routes>
      <Analytics />
    </>
  );
}

export default App;