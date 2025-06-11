// app/api/upload/route.

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { blobUrl, filename } = await req.json();

  const fileRes = await fetch(blobUrl);
  const arrayBuffer = await fileRes.arrayBuffer();
  const blob = new Blob([arrayBuffer]); 

  const pinataFormData = new FormData();
  pinataFormData.append('file', blob, filename); 
  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) {
    return NextResponse.json({ error: 'Missing PINATA_JWT' }, { status: 500 });
  }

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
