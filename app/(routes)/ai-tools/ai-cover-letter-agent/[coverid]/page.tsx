"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CoverLetterDialog from "@/app/(routes)/dashboard/_components/CoverLetterDialog";
import { Clipboard, Pencil, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function CoverLetterGeneratorAgent() {
  const params = useParams();
  const coverid = params?.coverid as string;

  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const coverRef = useRef<HTMLDivElement>(null);
  const [openCoverDialog,setOpenCoverDialog]=useState(false);

  useEffect(() => {
    if (coverid) GetCoverLetterDetails();
  }, [coverid]);

  const GetCoverLetterDetails = async () => {
    try {
      setLoading(true);
      const result = await axios.get("/api/history?recordId=" + coverid);
      setCoverLetter(result.data?.content?.coverLetter || null);
      setMetaData(result.data?.metaData || null);
    } catch (error) {
      console.error("Error fetching cover letter details:", error);
      setError("Failed to load cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (coverRef.current) {
      const canvas = await html2canvas(coverRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("cover-letter.pdf");
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#BE575F] via-[#A338E3] to-[#AC76D6] py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          AI-Generated Cover Letter
        </h1>

        {loading && <p className="text-white/90">Loading cover letter...</p>}
        {error && <p className="text-red-200">{error}</p>}

        {!loading && !error && coverLetter && (
          <>
            <div
              ref={coverRef}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6"
            >
              <pre className="whitespace-pre-wrap text-gray-800 text-md font-serif">
                {coverLetter}
              </pre>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleDownloadPDF}
                className="bg-white/20 text-white px-4 py-2 rounded-lg shadow-md backdrop-blur-md hover:bg-white/30 transition flex items-center gap-2"
              >
                <Download size={18} />
                Download as PDF
              </Button>

              <Button
                onClick={handleCopy}
                className="bg-white/20 text-white px-4 py-2 rounded-lg shadow-md backdrop-blur-md hover:bg-white/30 transition flex items-center gap-2"
              >
                <Clipboard size={18} />
                Copy to Clipboard
              </Button>

              <Button
                className="bg-white/20 text-white px-4 py-2 rounded-lg shadow-md backdrop-blur-md hover:bg-white/30 transition flex items-center gap-2"
                onClick={()=>setOpenCoverDialog(true)}
              > 
                <Pencil size={18} />
                Edit & Regenerate
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ✅ Copy Toast */}
      {showCopied && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg z-50 transition-all duration-300 animate-fade-in-up">
          ✅ Copied to clipboard!
        </div>
      )}

      <CoverLetterDialog openDialog={openCoverDialog}
            setOpenDialog={()=>setOpenCoverDialog(false)}/>
    </div>
  );
}

export default CoverLetterGeneratorAgent;
