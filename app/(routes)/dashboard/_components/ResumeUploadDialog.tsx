"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { File, Loader2Icon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function ResumeUploadDialog({ openResumeUpload, setOpenResumeDialog }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const onUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const recordId = uuidv4();
    const formData = new FormData();
    formData.append("recordId", recordId);
    formData.append("resumeFile", file);

    try {
      const result = await axios.post("/api/ai-resume-agent", formData);

      // ✅ get the recordId from the response
      const { recordId: returnedRecordId } = result.data;

      // 🔁 fallback in case recordId is missing
      const finalRecordId = returnedRecordId || recordId;

      // ✅ redirect to analysis page
      router.push(`/ai-tools/ai-resume-analyzer/${finalRecordId}`);

      setOpenResumeDialog(false);
    } catch (error: any) {
      console.error("Error uploading resume:", error.response?.data || error.message);
      alert("Something went wrong during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resume PDF File</DialogTitle>
          <DialogDescription>
            <label
              htmlFor="resumeUpload"
              className="flex flex-col items-center justify-center p-7 border border-dashed 
              rounded-xl hover:bg-slate-100 cursor-pointer transition"
            >
              <File className="h-10 w-10" />
              {file ? (
                <h2 className="mt-3 text-blue-600">{file.name}</h2>
              ) : (
                <h2 className="mt-3">Click here to upload a PDF</h2>
              )}
            </label>
            <input
              type="file"
              id="resumeUpload"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenResumeDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button disabled={!file || loading} onClick={onUploadAndAnalyze}>
            {loading ? <Loader2Icon className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Upload & Analyze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeUploadDialog;
