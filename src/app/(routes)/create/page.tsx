'use client';
import { Button, TextArea } from "@radix-ui/themes";
import { CloudUploadIcon, SendIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { postEntry } from "@/action";
import Image from "next/image";
import { upload } from '@vercel/blob/client';

export default function CreatePage() {

  const [isUploading, setIsUploading] = useState(false);
  const fileInRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [files, setFiles] = useState<
    { file: File; previewUrl: string; type: 'image' | 'video' }[]
  >([]);
  const [uploadedMedia, setUploadedMedia] = useState<
    { url: string; type: 'image' | 'video' }[]
  >([]);

  // *** REVISED UPLOAD LOGIC ***
  useEffect(() => {
    async function uploadAll() {
      if (files.length === 0) return;

      setIsUploading(true);

      try {
        const uploads = await Promise.all(
          files.map(async ({ file, type }) => {
            // 1. Upload directly to Vercel Blob from the client
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/blob-upload-url', // 👈 only needed here
            });



            // 2. Pass the Vercel Blob URL to our secure server route for Pinata pinning
            const pinRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blobUrl: newBlob.url, filename: file.name, type }),
            });

            if (!pinRes.ok) {
              throw new Error('Failed to pin file to IPFS.');
            }

            const { IpfsHash } = await pinRes.json();

            // 3. Return the final Pinata gateway URL
            return {
              url: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
              type,
            };
          })
        );
        setUploadedMedia((prev) => [...prev, ...uploads]);
      } catch (error) {
        console.error("Upload failed:", error);
        // Handle error state for the user here
      } finally {
        setIsUploading(false);
        // Clear the files array after successful upload
        setFiles([]);
      }
    }

    uploadAll();
  }, [files]);


  useEffect(() => {
    // This cleanup function still works perfectly
    return () => {
      files.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, [files]);


  function getMediaType(file: File): "image" | "video" {
    return file.type.startsWith("video/") ? "video" : "image";
  }

  return (
    <form
      className="max-w-md mx-auto  py-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        const formData = new FormData();
        const mediaArray = uploadedMedia.map((m) => ({ url: m.url, type: m.type }));
        formData.append("media", JSON.stringify(mediaArray));

        const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value ?? "";
        formData.append("description", description);

        const id = await postEntry(formData);
        router.push(`/posts/${id}`);
        router.refresh();
      }}
    >
      {/* --- The rest of your JSX is perfect, no changes needed below --- */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
            {uploadedMedia.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-2">
                {uploadedMedia.map(({ url, type }, idx) => (
                  <div key={idx} className="relative w-full h-40">
                    {type === "video" ? (
                      <video src={url} className="w-full h-full object-cover" controls />
                    ) : (
                      <Image src={url} fill className="object-cover" alt={`uploaded-media-${idx}`} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No media selected
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
                multiple
                className="hidden"
                ref={fileInRef}
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);

                  const previews = selectedFiles.map((file) => {
                    const previewUrl = URL.createObjectURL(file);
                    const type: 'image' | 'video' = getMediaType(file);
                    return { file, previewUrl, type };
                  });
                  // Set files to trigger the useEffect
                  setFiles(previews);
                }}
                accept="image/*,video/*"
              />
              <Button
                disabled={isUploading}
                onClick={() => fileInRef.current?.click()}
                type="button"
                variant="surface"
              >
                {isUploading ? 'Uploading...' : <><CloudUploadIcon size={16} /> Choose Media</>}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <TextArea
              name="description"
              className="h-16"
              placeholder="Add a description..."
            />
          </div>
        </div>
      </div>
      <div className="flex mt-4 justify-center ">
        <button
          type="submit"
          disabled={uploadedMedia.length === 0 || isUploading}
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