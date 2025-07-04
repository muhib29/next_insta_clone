// api/uploadProfile/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/config";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const uploadData = await pinata.upload.file(file, {
            groupId: "e269a5a5-da39-420f-895a-5a6b4ec4d899"
        });
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${uploadData.IpfsHash}`;
        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
      { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}