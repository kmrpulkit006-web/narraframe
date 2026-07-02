import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import "../styles/UploadSection.css";
import ProgressBar from "./ProgressBar";
import AIProcessing from "./AIProcessing";
import ResultsDashboard from "./ResultsDashboard";
import StoryboardViewer from "./StoryboardViewer";

function UploadSection() {
    const [showStoryboard, setShowStoryboard] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setIsAnalyzing(false);
            setCurrentStep(0);
            setProgress(0);
            setShowBurst(false);
            setSelectedFile(file);
            setShowResults(false);
        }
    };
    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();

        setIsDragging(false);

        const file = event.dataTransfer.files[0];

        if (file) {
            setIsAnalyzing(false);
            setShowResults(false);
            setCurrentStep(0);
            setProgress(0);
            setShowBurst(false);
            setSelectedFile(file);
        }
    };
    useEffect(() => {

        if (!selectedFile) return;

        setIsUploading(true);
        setProgress(0);
        const interval = setInterval(() => {

            setProgress((prev) => {

                if (prev >= 100) {

                    clearInterval(interval);

                    setShowBurst(true);

                    return 100;
                }

                return prev + 10;

            });

        }, 300);

        return () => clearInterval(interval);

    }, [selectedFile]);
    useEffect(() => {

        if (!isAnalyzing) return;

        const totalSteps = 6;

        setCurrentStep(0);

        let step = 0;

        const interval = setInterval(() => {

            step++;

            setCurrentStep(step);

            if (step >= totalSteps) {

                clearInterval(interval);

                setTimeout(() => {

                    setShowResults(true);

                }, 800);

            }

        }, 1200);

        return () => clearInterval(interval);

    }, [isAnalyzing]);
    return (
        <section
            id="upload-section"
            className="upload-section"
        >

            <motion.div
                className={`upload-card ${isDragging ? "dragging" : ""}`}

                whileHover={{ scale: 1.02 }}

                onDragOver={handleDragOver}

                onDragLeave={handleDragLeave}

                onDrop={handleDrop}
            >

                <Upload size={55} />

                <h2>
                    {isDragging
                        ? "Drop your story here!"
                        : "Upload Your Story"}
                </h2>

                <p>
                    Drag & Drop your novel, screenplay,
                    manga or fanfiction.
                </p>

                <span>

                    Supported Files

                    <strong>
                        TXT • PDF • DOCX • EPUB
                    </strong>

                </span>

                <label className="upload-button">

                    <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx,.epub"
                        hidden
                        onChange={handleFileChange}
                    />

                    {selectedFile ? "Change File" : "Choose File"}

                </label>
                {selectedFile && (

                    <div className="file-info">

                        <p className="file-name">
                            📄 {selectedFile.name}
                        </p>

                        <span className="upload-status">
                            {isUploading
                                ? `Uploading... ${progress}%`
                                : "✅ Ready for AI Analysis"}
                        </span>

                        {isUploading && (
                            <ProgressBar
                                progress={progress}
                                showBurst={showBurst}
                                setShowBurst={setShowBurst}
                                setIsUploading={setIsUploading}
                                setIsAnalyzing={setIsAnalyzing}
                            />
                        )}
                        {isAnalyzing && !showResults && (

                            <AIProcessing
                                currentStep={currentStep}
                            />

                        )}

                        {showResults && (

                            <ResultsDashboard
                                onOpenStoryboard={() => setShowStoryboard(true)}
                            />

                        )}

                        {showStoryboard && (

                            <StoryboardViewer />

                        )}
                    </div>

                )}

            </motion.div>

        </section>
    );
}

export default UploadSection;
