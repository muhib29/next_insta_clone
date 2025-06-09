export async function uploadFileToPinataClient(file: File): Promise<{ IpfsHash: string }> {
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!PINATA_JWT) throw new Error("NEXT_PUBLIC_PINATA_JWT not defined");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      // Content-Type is NOT set manually because fetch will handle boundary automatically
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  return await res.json();
}