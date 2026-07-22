import { NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { supabase } from '@/utils/supabase/client';
import fs from 'fs';

export async function POST() {
  try {
    console.log("Fetching creations for video...");
    // 1. Fetch data
    const { data: creationsData } = await supabase
      .from("ai_creations")
      .select("*")
      .order("created_at", { ascending: true });

    if (!creationsData || creationsData.length === 0) {
      return NextResponse.json({ error: "אין יצירות עדיין" }, { status: 400 });
    }

    // Input props for the video
    const inputProps = {
      creations: creationsData
    };

    const durationInFrames = creationsData.length * 180; // 6 seconds each

    // 2. Bundle the Remotion project
    console.log("Bundling Remotion project...");
    const remotionRoot = path.join(process.cwd(), 'remotion', 'index.ts');
    
    // We create a temporary bundle in the .cache folder
    const bundleLocation = await bundle({
      entryPoint: remotionRoot,
      webpackOverride: (config) => config,
    });

    console.log("Bundle location:", bundleLocation);

    // 3. Render the video
    console.log("Rendering video... This might take a while.");
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "ShimiBirthday",
      inputProps,
    });

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputLocation = path.join(publicDir, 'shimi_birthday_video.mp4');

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
      imageFormat: 'jpeg',
      // Override duration to exactly match our dynamic items
      durationInFrames: durationInFrames,
      logLevel: 'verbose',
    });

    console.log("Video rendered successfully to:", outputLocation);

    // 4. Return the public URL
    // (Assuming XAMPP / Next.js serves the 'public' folder at root)
    return NextResponse.json({ 
      success: true, 
      url: "/shimi_birthday_video.mp4",
      message: "הסרטון מוכן!"
    });

  } catch (error: any) {
    console.error("Video rendering error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
