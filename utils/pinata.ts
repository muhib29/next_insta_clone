// utils/pinata.ts


const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
if (!PINATA_JWT) throw new Error("PINATA_JWT not defined");

export async function uploadFileToPinata(file: File): Promise<{ IpfsHash: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      // Do NOT set 'Content-Type' manually for FormData!
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  return await res.json();
}
