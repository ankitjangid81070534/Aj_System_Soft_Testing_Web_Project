"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { z } from "zod";

const uploadSchema = z.object({
  bucket: z.enum([
    "public-site",
    "project-media",
    "team-media",
    "client-media",
    "blog-media",
    "private-media",
  ]),
  alt: z.string().trim().max(300),
});

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
};

function mediaRedirect(kind: "notice" | "error", message: string): never {
  redirect(`/ajadmin/media?${new URLSearchParams({ [kind]: message }).toString()}`);
}

export async function uploadMediaAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:write")) {
    mediaRedirect("error", "Your session cannot upload media.");
  }

  const bucket = z.string().safeParse(formData.get("bucket"));
  const parsed = uploadSchema.safeParse({
    bucket: bucket.success ? bucket.data : "public-site",
    alt: String(formData.get("alt") ?? ""),
  });
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File) || file.size === 0) {
    mediaRedirect("error", "Choose a valid file and media bucket.");
  }

  const ext = MIME_EXT[file.type];
  if (!ext) mediaRedirect("error", "This file type is not supported.");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  const admin = createSupabaseAdminLooseClient();
  const { error } = await admin.storage.from(parsed.data.bucket).upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    console.error("[admin] media upload failed", { code: error.name, message: error.message });
    mediaRedirect(
      "error",
      "The file could not be uploaded. Check the storage bucket configuration.",
    );
  }

  const { data: urlData } = admin.storage.from(parsed.data.bucket).getPublicUrl(path);
  const { error: indexError } = await admin.from("media_assets").insert({
    bucket: parsed.data.bucket,
    storage_path: path,
    url: urlData.publicUrl,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    alt_text: parsed.data.alt,
    is_public: parsed.data.bucket !== "private-media",
    uploaded_by: user.id,
  });
  if (indexError) {
    await admin.storage.from(parsed.data.bucket).remove([path]);
    console.error("[admin] media index failed", {
      code: indexError.code,
      message: indexError.message,
    });
    mediaRedirect(
      "error",
      "The upload was rolled back because its library record could not be saved.",
    );
  }
  revalidatePath("/ajadmin/media");
  mediaRedirect("notice", "Media uploaded successfully.");
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:write")) {
    mediaRedirect("error", "Your session cannot delete media.");
  }
  const id = z.string().uuid().safeParse(formData.get("__id"));
  if (!id.success) mediaRedirect("error", "Invalid media item.");

  const admin = createSupabaseAdminLooseClient();
  const { data: rows } = await admin.from("media_assets").select("*").eq("id", id.data).limit(1);
  const row = (rows ?? [])[0] as Record<string, unknown> | undefined;
  if (!row) mediaRedirect("error", "This media item no longer exists.");

  const bucket = String(row.bucket);
  const path = String(row.storage_path);
  // Delete the library record first: if the storage removal fails afterwards
  // the bucket holds an orphaned file (harmless), whereas the reverse order
  // would leave a library row pointing at a file that no longer exists.
  const { error } = await admin.from("media_assets").delete().eq("id", id.data);
  if (error) {
    console.error("[admin] media record delete failed", {
      code: error.code,
      message: error.message,
    });
    mediaRedirect("error", "The media library record could not be deleted.");
  }
  if (bucket && path) {
    const { error: storageError } = await admin.storage.from(bucket).remove([path]);
    if (storageError) {
      // The row is already gone; surface the orphaned file in the server log.
      console.error("[admin] media storage delete failed", {
        bucket,
        path,
        message: storageError.message,
      });
    }
  }
  revalidatePath("/ajadmin/media");
  mediaRedirect("notice", "Media deleted successfully.");
}
