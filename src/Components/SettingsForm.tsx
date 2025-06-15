"use client";

import {
  useForm,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Button, Switch, TextArea, TextField } from "@radix-ui/themes";
import { CloudUploadIcon, LogOutIcon, CheckCircle, XCircle } from "lucide-react";
import { updateProfile } from "@/action";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import Image from "next/image";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().max(50, "Name must be at most 50 characters").optional(),
  subtitle: z.string().max(60, "Subtitle must be at most 60 characters").optional(),
  bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

type ProfileFormValues = z.infer<typeof schema>;

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
    control,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      subtitle: profile?.subtitle || "",
      bio: profile?.bio || "",
    },
  });

  const username = watch("username");

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    setIsDarkMode(theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, []);

  useEffect(() => {
    if (!username) return;
    const delayDebounce = setTimeout(async () => {
      const res = await fetch(`/api/check-username?username=${username}`);
      const data = await res.json();
      if (!data.available) {
        setUsernameAvailable(false);
        setError("username", { message: "Username already taken" });
      } else {
        setUsernameAvailable(true);
      }
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [username, setError]);

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
          toast.error("Upload failed");
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
    signOut({ redirect: true, callbackUrl: "/" });
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!usernameAvailable) return;
    try {
      const formData = new FormData();
      for (const key in data) {
        const value = data[key as keyof ProfileFormValues];
        if (typeof value === "string") {
          formData.append(key, value);
        }
      }
      formData.set("avatar", avatarUrl || "");

      await toast.promise(updateProfile(formData), {
        pending: "Saving profile...",
        success: "🎉 Profile updated successfully!",
        error: "Something went wrong",
      }, {
        transition: Zoom,
        position: "top-center",
      });

      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ToastContainer />
        <input type="hidden" name="avatar" value={avatarUrl || ""} />

        <div className="flex gap-4 items-center mb-6">
          <div className="size-24 rounded-full overflow-hidden aspect-square shadow-md shadow-gray-400 bg-gray-200 relative">
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
              onClick={() => !isUploading && fileInRef.current?.click()}
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
              {...register("username")}
              placeholder="your_username"
              required
              aria-invalid={!!errors.username}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
            {username && !errors.username && (
              <p className={`text-sm flex items-center gap-1 ${usernameAvailable ? "text-green-600" : "text-red-500"}`}>
                {usernameAvailable ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {usernameAvailable ? "Username is available" : "Username is taken"}
              </p>
            )}
          </div>

          <div>
            <p className="font-bold">Name</p>
            <TextField.Root
              {...register("name")}
              placeholder="John Doe"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <p className="font-bold">Subtitle</p>
            <TextField.Root
              {...register("subtitle")}
              placeholder="Graphic designer"
              aria-invalid={!!errors.subtitle}
            />
            {errors.subtitle && (
              <p className="text-red-500 text-sm">{errors.subtitle.message}</p>
            )}
          </div>

          <div>
            <p className="font-bold">Bio</p>
            <TextArea
              {...register("bio")}
              placeholder="Tell us a bit about yourself..."
              aria-invalid={!!errors.bio}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 mt-4 font-medium">
            <span>Dark Mode</span>
            <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </label>

          <div className="flex justify-center mt-6 gap-4">
            <Button type="submit" variant="solid" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving..." : "Save Settings"}
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
