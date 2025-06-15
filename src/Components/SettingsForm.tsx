"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Button, Switch, TextArea, TextField } from "@radix-ui/themes";
import { CloudUploadIcon, LogOutIcon } from "lucide-react";
import { updateProfile } from "@/action";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import Image from "next/image";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z
    .string()
    .max(50, "Name must be at most 50 characters")
    .optional(),
  subtitle: z
    .string()
    .max(60, "Subtitle must be at most 60 characters")
    .optional(),
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters")
    .optional(),
});

export default function SettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const fileInRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      subtitle: profile?.subtitle || "",
      bio: profile?.bio || "",
    },
  });

  const username = watch("username");
  const name = watch("name") || "";
  const subtitle = watch("subtitle") || "";
  const bio = watch("bio") || "";

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
          const res = await fetch("/api/uploadProfile", {
            method: "POST",
            body: data,
          });
          if (!res.ok) throw new Error("Failed to upload image");
          const { url } = await res.json();
          setAvatarUrl(url);
        } catch (err) {
          toast.error("Avatar upload failed");
        } finally {
          setIsUploading(false);
        }
      };
      upload();
    }
  }, [file]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!username) return;
      const res = await fetch(`/api/check-username?username=${username}`);
      const { available } = await res.json();
      setUsernameAvailable(available);
      if (!available) {
        setError("username", { type: "manual", message: "Username is already taken" });
      } else {
        clearErrors("username");
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username, setError, clearErrors]);

  const handleThemeToggle = (checked: boolean) => {
    const theme = checked ? "dark" : "light";
    setIsDarkMode(checked);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  };

  const onSubmit = async (data: any) => {
    if (!usernameAvailable) return;
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.set("avatar", avatarUrl || "");
      await updateProfile(formData);
      toast.success("🎉 Profile updated successfully!", {
        transition: Zoom,
        position: "top-center",
      });
      router.push("/profile");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong", {
        transition: Zoom,
      });
    }
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <div className="max-w-md mx-auto">
      <ToastContainer autoClose={3000} limit={1} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="colored" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="avatar" value={avatarUrl || ""} />

        <div className="flex gap-4 items-center mb-6">
          <div className="size-24 rounded-full overflow-hidden aspect-square shadow-md bg-gray-200 relative">
            <Image
              src={avatarUrl || "/userIcon.png"}
              alt="Avatar"
              fill
              className="object-cover"
              priority
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
            <TextField.Root {...register("username")} placeholder="your_username" required className={errors.username ? "border border-red-500" : ""} />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            {!errors.username && usernameAvailable && username.length >= 3 && <p className="text-green-600 text-sm">Username is available</p>}
          </div>

          <div>
            <p className="font-bold">Name</p>
            <TextField.Root {...register("name")} placeholder="John Doe" className={errors.name ? "border border-red-500" : ""} style={{ textTransform: "capitalize" }} />
            <p className="text-xs text-gray-600">{name.length}/50</p>
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <p className="font-bold">Subtitle</p>
            <TextField.Root {...register("subtitle")} placeholder="Graphic designer" className={errors.subtitle ? "border border-red-500" : ""} style={{ textTransform: "capitalize" }} />
            <p className="text-xs text-gray-600">{subtitle.length}/60</p>
            {errors.subtitle && <p className="text-red-500 text-sm">{errors.subtitle.message}</p>}
          </div>

          <div>
            <p className="font-bold">Bio</p>
            <TextArea {...register("bio")} placeholder="A bit about yourself..." className={errors.bio ? "border border-red-500" : ""} />
            <p className="text-xs text-gray-600">{bio.length}/160</p>
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
          </div>

          <label className="flex items-center gap-2 mt-4 font-medium">
            <span>Dark Mode</span>
            <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </label>

          <div className="flex justify-center mt-6 gap-4">
            <Button type="submit" variant="solid" disabled={isUploading || isSubmitting || !isValid || !usernameAvailable}>
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
