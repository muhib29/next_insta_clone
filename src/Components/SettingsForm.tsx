"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Switch, TextArea, TextField } from "@radix-ui/themes";
import { CloudUploadIcon } from "lucide-react";
import { updateProfile } from "@/action";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import Image from "next/image";

export default function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const fileInRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Set initial theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    setIsDarkMode(theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, []);

  // Handle file upload
  useEffect(() => {
    if (file) {
      const data = new FormData();
      data.set("file", file);
      fetch("/api/upload", {
        method: "POST",
        body: data,
      }).then((response) => {
        response.json().then((url) => {
          setAvatarUrl(url);
        });
      });
    }
  }, [file]);

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    const theme = checked ? "dark" : "light";
    setIsDarkMode(checked);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  };

  return (
    <form
      action={async (data: FormData) => {
        await updateProfile(data);
        router.push("/profile");
        router.refresh();
      }}
    >
      <input type="hidden" name="avatar" value={avatarUrl || ""} />
      <div className="flex gap-4 items-center">
        <div>
        <div className="bg-black size-24 rounded-full overflow-hidden aspect-square shadow-md shadow-gray-400">
       {avatarUrl && (
      <Image
        src={avatarUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
        // layout="intrinsic"  // This helps maintain aspect ratio
        width={96} // Adjust size (24 * 4 = 96px)
        height={96} // Adjust size (24 * 4 = 96px)
        
      />
    )}
</div>

        </div>
        <div>
          <input
            type="file"
            className="hidden"
            id="avatar-input"
            onChange={(ev) => setFile(ev.target.files?.[0])}
            ref={fileInRef}
          />
          <Button
            type="button"
            variant="surface"
            onClick={() => fileInRef.current?.click()}
          >
            <CloudUploadIcon />
            Change avatar
          </Button>
        </div>
      </div>

      <p className="mt-2 font-bold">Username</p>
      <TextField.Root name="username" defaultValue={profile?.username || ""} placeholder="your_username" />
      <p className="mt-2 font-bold">Name</p>
      <TextField.Root name="name" defaultValue={profile?.name || ""} placeholder="John Doe" />
      <p className="mt-2 font-bold">Subtitle</p>
      <TextField.Root name="subtitle" defaultValue={profile?.subtitle || ""} placeholder="Graphic designer" />
      <p className="mt-2 font-bold">Bio</p>
      <TextArea name="bio" defaultValue={profile?.bio || ""} />

      <label className="flex items-center gap-2 mt-4 font-medium">
        <span>Dark Mode</span>
        <Switch
          checked={isDarkMode}
          onCheckedChange={handleThemeToggle}
        />
      </label>

      <div className="mt-4 flex justify-center">
        <Button variant="solid">Save settings</Button>
      </div>
    </form>
  );
}
