// app/api/blob-upload-url/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
onBeforeGenerateToken: async () => {
  return {
    addRandomSuffix: true, // ✅ put this here, NOT inside tokenPayload
    tokenPayload: JSON.stringify({}), // Optional — only if you want to pass metadata
  };
},
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Vercel Blob upload completed:', blob.url);

        try {
        } catch (error) {
          console.error("❌ Error in onUploadCompleted:", error);
        }
      },
    });

    return NextResponse.json(jsonResponse);

  } catch (error) {
    const message = (error as Error).message;
    console.error("❌ Error in blob upload API:", message);
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
