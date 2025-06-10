import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) {
    return NextResponse.json({ error: 'Missing PINATA_JWT' }, { status: 500 });
  }

  const pinataFormData = new FormData();
  pinataFormData.append('file', new Blob([buffer]), file.name);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: pinataFormData,
  });

  const result = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: result }, { status: res.status });
  }

  return NextResponse.json({ IpfsHash: result.IpfsHash });
}
