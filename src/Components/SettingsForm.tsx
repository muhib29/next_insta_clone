"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Switch, TextArea, TextField } from "@radix-ui/themes";
import { CloudUploadIcon, LogOutIcon } from "lucide-react";
import {  updateProfile } from "@/action";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import Image from "next/image";

export default function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const fileInRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    setIsDarkMode(theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, []);

  useEffect(() => {
    if (file) {
      const upload = async () => {
        setIsUploading(true);
        const data = new FormData();
        data.set("file", file);
        try {
         const res = await fetch("/api/upload", {
            method: "POST",
            body: data,
          });

          if (!res.ok) {
            throw new Error("Failed to upload image");
          }

          const { url } = await res.json();
          setAvatarUrl(url);
        } catch (err) {
          console.error("Upload failed", err);
        } finally {
          setIsUploading(false);
        }
      };
      upload();
    }
  }, [file]);

  const handleThemeToggle = (checked: boolean) => {
    const theme = checked ? "dark" : "light";
    setIsDarkMode(checked);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  };

const handleLogout = async () => {
  const { signOut } = await import("next-auth/react");
  signOut({ redirect: true ,  callbackUrl: "/" });
};


  return (
    <div className="max-w-md mx-auto">
      <form
        action={async (data: FormData) => {
          await updateProfile(data);
          router.push("/profile");
          router.refresh();
        }}
      >
        <input type="hidden" name="avatar" value={avatarUrl || ""} />

        <div className="flex gap-4 items-center mb-6">
          <div className="bg-black size-24 rounded-full overflow-hidden aspect-square shadow-md shadow-gray-400">
            {/* {avatarUrl ? (
              <Image
                src={avatarUrl || '/userIcon.png'}
                alt="Avatar"  
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
            ) : (
              <Image
                src="/userImage.png"
                alt="Default Avatar"
                fill
                style={{ objectFit: 'cover' }}
                quality={100}
              />
            )} */}
                          <Image
                src={avatarUrl || '/userIcon.png'}
                alt="Avatar"
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
          </div>
          <div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(ev) => setFile(ev.target.files?.[0] || null)}
              ref={fileInRef}
            />
            <Button
              type="button"
              variant="surface"
              disabled={isUploading}
              onClick={() => fileInRef.current?.click()}
            >
              <CloudUploadIcon className="mr-2" />
              {isUploading ? "Uploading..." : "Change Avatar"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-bold">Username</p>
            <TextField.Root
              name="username"
              defaultValue={profile?.username || ""}
              placeholder="your_username"
              required
            />
          </div>

          <div>
            <p className="font-bold">Name</p>
            <TextField.Root
              name="name"
              defaultValue={profile?.name || ""}
              placeholder="John Doe"
            />
          </div>

          <div>
            <p className="font-bold">Subtitle</p>
            <TextField.Root
              name="subtitle"
              defaultValue={profile?.subtitle || ""}
              placeholder="Graphic designer"
            />
          </div>

          <div>
            <p className="font-bold">Bio</p>
            <TextArea name="bio" defaultValue={profile?.bio || ""} />
          </div>

          <label className="flex items-center gap-2 mt-4 font-medium">
            <span>Dark Mode</span>
            <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </label>

          <div className="flex justify-center mt-6 gap-4">
            <Button type="submit" variant="solid" disabled={isUploading}>
              Save Settings
            </Button>
            <Button
              type="button"
              variant="outline"
              color="red"
              className="cursor-pointer"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
