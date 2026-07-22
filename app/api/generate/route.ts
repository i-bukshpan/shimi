import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { prompt, mediaType, authorName, blessingText, parentId } = await req.json();

    let generatedUrl = "";
    
    if (mediaType === "image") {
      // MAGNIFIC API INTEGRATION
      const magnificKey = process.env.MAGNIFIC_API_KEY;
      if (!magnificKey) throw new Error("MAGNIFIC_API_KEY is missing");

      // 1. Trigger the Generation (Mystic endpoint)
      const startRes = await fetch("https://api.magnific.com/v1/ai/mystic", {
        method: "POST",
        headers: {
          "x-magnific-api-key": magnificKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "fluid", // Reverted to fluid due to Magnific endpoint validation
          aspect_ratio: "square_1_1"
        })
      });

      if (!startRes.ok) {
        const errText = await startRes.text();
        throw new Error(`Magnific Start Failed: ${errText}`);
      }

      const startData = await startRes.json();
      const taskId = startData.data?.task_id;
      if (!taskId) throw new Error("No task_id returned from Magnific");

      // 2. Poll for Completion (up to 40 seconds)
      let status = "IN_PROGRESS";
      let attempts = 0;
      
      while (status !== "COMPLETED" && status !== "FAILED" && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
        attempts++;

        const checkRes = await fetch(`https://api.magnific.com/v1/ai/mystic/${taskId}`, {
          method: "GET",
          headers: { "x-magnific-api-key": magnificKey }
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          status = checkData.data?.status;
          if (status === "COMPLETED" && checkData.data?.generated?.length > 0) {
            generatedUrl = checkData.data.generated[0];
            break;
          }
        }
      }

      if (!generatedUrl) {
        throw new Error("Generation timed out or failed");
      }
      
    } else if (mediaType === "audio") {
      // MAGNIFIC AUDIO API INTEGRATION
      const magnificKey = process.env.MAGNIFIC_API_KEY;
      if (!magnificKey) throw new Error("MAGNIFIC_API_KEY is missing");

      // 1. Trigger the Generation (Music endpoint)
      const startRes = await fetch("https://api.magnific.com/v1/ai/music-generation", {
        method: "POST",
        headers: {
          "x-magnific-api-key": magnificKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          music_length_seconds: 60
        })
      });

      if (!startRes.ok) {
        const errText = await startRes.text();
        throw new Error(`Magnific Audio Start Failed: ${errText}`);
      }

      const startData = await startRes.json();
      const taskId = startData.data?.task_id;
      if (!taskId) throw new Error("No task_id returned from Magnific Audio");

      // 2. Poll for Completion (up to 60 seconds)
      let status = "IN_PROGRESS";
      let attempts = 0;
      
      while (status !== "COMPLETED" && status !== "FAILED" && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

        const checkRes = await fetch(`https://api.magnific.com/v1/ai/music-generation/${taskId}`, {
          method: "GET",
          headers: { "x-magnific-api-key": magnificKey }
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          status = checkData.data?.status;
          if (status === "COMPLETED" && checkData.data?.generated?.length > 0) {
            generatedUrl = checkData.data.generated[0];
            break;
          }
        }
      }

      if (!generatedUrl) {
        throw new Error("Audio generation timed out or failed");
      }
    } else if (mediaType === "text") {
      generatedUrl = ""; // No media for text
    }

    // --- UPLOAD TO SUPABASE STORAGE ---
    if (generatedUrl && (mediaType === "image" || mediaType === "audio" || mediaType === "video")) {
      try {
        const fileRes = await fetch(generatedUrl);
        const fileBlob = await fileRes.blob();
        
        const ext = mediaType === "image" ? "jpg" : mediaType === "audio" ? "mp3" : "mp4";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, fileBlob, {
            contentType: fileBlob.type,
            upsert: true
          });
          
        if (uploadError) {
          console.error("Storage upload failed, using temporary URL.", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName);
          generatedUrl = publicUrlData.publicUrl;
        }
      } catch (e) {
        console.error("Error uploading to Supabase Storage:", e);
      }
    }

    const { data, error } = await supabase
      .from("ai_creations")
      .insert([
        {
          author: authorName,
          raw_blessing: blessingText,
          generated_media_url: generatedUrl,
          tts_media_url: null,
          media_type: mediaType,
          parent_id: parentId || null,
        }
      ])
      .select();

    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: "Failed to generate media" }, { status: 500 });
  }
}
