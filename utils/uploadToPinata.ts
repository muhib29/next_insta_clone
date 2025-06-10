// utils/uploadToPinata


export async function uploadFileSecurely(file: File): Promise<{ IpfsHash: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT; // must be public
  if (!PINATA_JWT) throw new Error("Missing Pinata JWT");

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result?.error || 'Pinata upload failed');
  }

  return result;
}
