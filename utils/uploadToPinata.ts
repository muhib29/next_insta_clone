// utils/uploadToPinata


export async function uploadFileSecurely(file: File): Promise<{ IpfsHash: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  return await res.json();
}
