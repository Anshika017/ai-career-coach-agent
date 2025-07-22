// File: app/(routes)/dashboard/_components/CoverLetterDialog.tsx

"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon, SparkleIcon } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

interface CoverLetterDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

const CoverLetterDialog: React.FC<CoverLetterDialogProps> = ({
  openDialog,
  setOpenDialog,
}) => {
  const [applicantName, setApplicantName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const isFormValid =
    Boolean(applicantName && jobTitle && companyName && keySkills);

  const handleGenerateCoverLetter = async () => {
    const coverid = uuidv4();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post("/api/ai-cover-letter-agent", {
        coverid,
        userInput: {
          applicantName,
          jobTitle,
          companyName,
          keySkills,
          additionalNotes,
        },
      });

      if (res.status === 200 && res.data.coverid) {
        setOpenDialog(false);
        router.push(`/ai-tools/ai-cover-letter-agent/${res.data.coverid}`);
      } else {
        console.error("❌ Failed to generate cover letter:", res.data);
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Error during generation:", err);
      setErrorMsg(err.response?.data?.error || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Your Cover Letter</DialogTitle>
          <DialogDescription>
            Fill in the fields below to generate a personalized cover letter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <InputField
            label="Your Full Name"
            placeholder=""
            value={applicantName}
            onChange={setApplicantName}
          />
          <InputField
            label="Job Title"
            placeholder="e.g. Frontend Developer"
            value={jobTitle}
            onChange={setJobTitle}
          />
          <InputField
            label="Company Name"
            placeholder="e.g. IBM"
            value={companyName}
            onChange={setCompanyName}
          />
          <InputField
            label="Key Skills"
            placeholder="e.g. React, TypeScript, UI/UX"
            value={keySkills}
            onChange={setKeySkills}
          />
          <InputField
            label="Additional Notes (optional)"
            placeholder="Any specific points?"
            value={additionalNotes}
            onChange={setAdditionalNotes}
          />
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            disabled={!isFormValid || loading}
            onClick={handleGenerateCoverLetter}
          >
            {loading ? (
              <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <SparkleIcon className="w-4 h-4 mr-2" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoverLetterDialog;

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}
const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
