import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const mediaType = formData.get("mediaType") as string;
    const authorName = formData.get("authorName") as string;
    const blessingText = formData.get("blessingText") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!authorName) {
      return NextResponse.json({ error: "Missing author name" }, { status: 400 });
    }
    
    if (!file && !blessingText) {
      return NextResponse.json({ error: "Must provide either a file or text" }, { status: 400 });
    }

    let generatedUrl = null;
    let finalMediaType = mediaType;

    if (file && file.size > 0) {
      // Generate a unique file name
      const ext = file.type.split("/")[1] || "bin";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      generatedUrl = publicUrlData.publicUrl;
    } else {
      finalMediaType = "text";
    }

    // Save to Database
    const decoration = formData.get("decoration") as string;

    const payload: any = {
      author: authorName,
      raw_blessing: blessingText || "",
      media_type: finalMediaType || "text",
      generated_media_url: generatedUrl,
      tts_media_url: null,
    };
    
    if (decoration && decoration !== "none") {
      payload.decoration = decoration;
    }

    if (parentId) {
      payload.parent_id = parentId;
    }

    const { error: dbError } = await supabase
      .from("ai_creations")
      .insert([payload]);

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message} (Code: ${dbError.code})`);
    }

    return NextResponse.json({ success: true, url: generatedUrl });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
