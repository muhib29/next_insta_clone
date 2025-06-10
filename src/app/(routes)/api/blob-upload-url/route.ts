// app/api/blob-upload-url/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // This function is called before generating the token.
      // It's the ideal place to add your validation logic.
      onBeforeGenerateToken: async (pathname) => {
        // `pathname` is the filename given to the `upload` function on the client.

        // You can also access a `clientPayload` if you pass it from the client:
        // const { clientPayload } = body; --> e.g., upload(..., { payload: '...' })

        // --- IMPORTANT: ADD YOUR AUTHENTICATION AND VALIDATION LOGIC HERE ---
        // For example, check if the user is logged in.
        // const { userId } = auth();
        // if (!userId) {
        //   throw new Error('Not authenticated');
        // }
        // --------------------------------------------------------------------

        return {
          // This token is valid for 10 minutes by default
          tokenPayload: JSON.stringify({
            // You can add any custom metadata here, which is passed to `onUploadCompleted`
            // userId, 
          }),
        };
      },
      // This function is called after the upload is complete.
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // `blob` contains the final URL and other details about the uploaded file.
        console.log('✅ Vercel Blob upload completed:', blob.url);

        try {
          // You can perform server-side actions here, like updating your database.
          // const { userId } = JSON.parse(tokenPayload);
          // await db.updateUser(userId, { avatar: blob.url });
        } catch (error) {
          console.error("❌ Error in onUploadCompleted:", error);
        }
      },
    });

    // The `jsonResponse` contains the upload token and other details.
    return NextResponse.json(jsonResponse);

  } catch (error) {
    // If handleUpload throws an error (e.g., validation fails), it's caught here.
    const message = (error as Error).message;
    console.error("❌ Error in blob upload API:", message);
    return NextResponse.json(
      { error: message },
      { status: 400 }, // Use 400 for client-side errors like invalid file type.
    );
  }
}