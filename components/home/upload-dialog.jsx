"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_ACCEPT,
  UPLOAD_HINT,
  buildOfficeFileFromUpload,
  isSupportedUpload,
} from "@/lib/files/import-file";

/**
 * Upload dialog. Validates type/size on the client, parses the file into editor
 * content, then hands the payload to `onCreate` (which performs the API POST and
 * returns the created file). Created files belong to the uploader — the file API
 * stamps the owner from the authenticated session, so only they can open them.
 */
export function UploadDialog({ open, onOpenChange, onCreate, onCreated }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyName, setBusyName] = useState("");
  const [error, setError] = useState(null);

  const reset = () => {
    setDragging(false);
    setBusy(false);
    setBusyName("");
    setError(null);
  };

  const handleOpenChange = (next) => {
    if (busy) return; // don't let the dialog close mid-upload
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);

    if (!isSupportedUpload(file)) {
      setError("Unsupported file type. Upload a spreadsheet (.csv, .xlsx, .xls), document (.docx, .txt, .md, .html) or presentation (.pptx).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`That file is too large. The maximum upload size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`);
      return;
    }

    setBusy(true);
    setBusyName(file.name);
    try {
      const payload = await buildOfficeFileFromUpload(file);
      const created = await onCreate(payload);
      reset();
      onOpenChange(false);
      onCreated?.(created);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setBusy(false);
      setBusyName("");
    }
  };

  const onInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    handleFile(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[min(520px,calc(100vw-32px))]">
        <DialogHeader>
          <DialogTitle>Upload a file</DialogTitle>
          <DialogDescription>
            Import a spreadsheet or document. We&apos;ll convert it into an editable file you own.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-label="Choose a file or drop one here"
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-[#5b8def] bg-[#5b8def]/10"
              : "border-[#3a3a3a] bg-[#1b1b1b] hover:border-[#4a4a4a] hover:bg-[#202020]"
          } ${busy ? "cursor-default opacity-80" : "cursor-pointer"}`}
        >
          {busy ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-[#5b8def]" />
              <div className="text-sm text-[#e7e7e7]">
                Importing<span className="text-[#a3a3a3]">{busyName ? ` “${busyName}”` : ""}…</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#262626]">
                <UploadCloud className="h-6 w-6 text-[#a3a3a3]" />
              </div>
              <div className="text-sm font-medium text-[#e7e7e7]">
                Drag &amp; drop a file here, or <span className="text-[#5b8def]">browse</span>
              </div>
              <div className="text-xs text-[#737373]">{UPLOAD_HINT}</div>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_ACCEPT}
          className="hidden"
          onChange={onInputChange}
        />

        {error ? (
          <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-xs text-[#737373]">
            Up to {Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB. Only you can access files you upload.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
