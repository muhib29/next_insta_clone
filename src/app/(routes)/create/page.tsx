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
        response.json().then(url => {
          setImageUrl(url);
          setIsUploading(false);
        });
      });
    }
  }, [file]);

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
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image selected
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <input
                type="file"
                className="hidden"
                ref={fileInRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
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
      <div className="flex mt-4 justify-center">
        <Button type="submit" disabled={!imageUrl || isUploading}>
          <SendIcon size={16} />
          Publish
        </Button>
      </div>

    </form>
  );
}
