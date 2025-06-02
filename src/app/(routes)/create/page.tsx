'use client';
import { Button, TextArea } from "@radix-ui/themes";
import { CloudUploadIcon, SendIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { postEntry } from "@/action";
import Image from "next/image";

export default function CreatePage() {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (file) {
      setIsUploading(true);
      const data = new FormData();
      data.set("file", file);
      fetch("/api/upload", {
        method: "POST",
        body: data,
      }).then(response => {
        response.json().then(({ url }) => {
          setImageUrl(url);
          setIsUploading(false);
        });
      });

    }
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  return (
    <form className="max-w-md mx-auto" action={async data => {
      const id = await postEntry(data);
      router.push(`/posts/${id}`);
      router.refresh();
    }} >
      <input type="hidden" name="image" value={imageUrl} />
      <div className="flex flex-col gap-4">
        <div>
          <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
            {previewUrl || imageUrl ? (
              imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                />
              ) : (
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image selected
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white font-bold z-10">
                Uploading...
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center z-0">
              <input
                type="file"
                className="hidden"
                ref={fileInRef}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  if (selectedFile) {
                    const localUrl = URL.createObjectURL(selectedFile);
                    setPreviewUrl(localUrl);
                  } else {
                    setPreviewUrl(null);
                  }
                }}
                accept="image/*"
                name="file"
              />
              <Button
                disabled={isUploading}
                onClick={() => fileInRef.current?.click()}
                type="button"
                variant="surface"
              >
                {isUploading ? 'Uploading...' : <><CloudUploadIcon size={16} /> Choose image</>}
              </Button>
            </div>
          </div>


          <div className="flex flex-col gap-2 mt-5">
            <TextArea
              name="description"
              className="h-16"
              placeholder="Add photo description..."
            />
          </div>
        </div>
      </div>
      <div className="flex mt-4 justify-center ">
      <button
        type="submit"
        disabled={!imageUrl || isUploading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition"
      >
        <div className="flex items-center gap-2">
          <SendIcon size={16} />
          <span>Publish</span>
        </div>
      </button>

      </div>

    </form>
  );
}
