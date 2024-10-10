export async function dataURItoBlob(dataURI: string): Promise<Blob> {
  return fetch(dataURI).then(response => response.blob());
}