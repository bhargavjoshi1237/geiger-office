"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link as LinkIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function LinkDialog({ activeUrl = "", open, onOpenChange, onSubmit }) {
  const [url, setUrl] = useState(activeUrl);
  const [text, setText] = useState("");

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setUrl(activeUrl);
      setText("");
    }

    onOpenChange(nextOpen);
  };

  const submitLink = () => {
    onSubmit({ href: url, text });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert link</DialogTitle>
          <DialogDescription>Add a URL to selected text, or enter display text to insert a new link.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm text-[#d4d4d4]">
            URL
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" autoFocus />
          </label>
          <label className="grid gap-1.5 text-sm text-[#d4d4d4]">
            Text
            <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Optional" />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => onSubmit({ href: "", text: "" })}>
            Remove
          </Button>
          <Button type="button" onClick={submitLink} disabled={!url.trim()}>
            <LinkIcon className="h-4 w-4" />
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ImageDialog({ open, onOpenChange, onSubmit }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setUrl("");
    setAlt("");
    setDragActive(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const insertImage = (src) => {
    onSubmit({ src, alt });
    handleOpenChange(false);
  };

  const insertFile = async (file) => {
    if (!file?.type.startsWith("image/")) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    insertImage(dataUrl);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    await insertFile(event.dataTransfer.files?.[0]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>Paste an image URL or drag a local image into the upload area.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm text-[#d4d4d4]">
            Image URL
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/image.png" autoFocus />
          </label>
          <label className="grid gap-1.5 text-sm text-[#d4d4d4]">
            Alt text
            <Input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Optional" />
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#474747] bg-[#242424] px-4 text-center text-sm text-[#a3a3a3] transition-colors hover:border-[#737373] hover:text-white",
              dragActive && "border-white bg-[#2a2a2a] text-white",
            )}
          >
            <UploadCloud className="h-6 w-6" />
            <span>Drag image here or click to upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => insertFile(event.target.files?.[0])}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => insertImage(url)} disabled={!url.trim()}>
            <ImagePlus className="h-4 w-4" />
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ImageDialog, LinkDialog };
