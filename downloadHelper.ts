/**
 * Reliable Client-Side File Downloader
 * Overcomes iframe sandbox navigation limits by fetching blob and triggering native save
 */
export async function downloadManualFile(
  endpointUrl: string,
  fallbackFilename: string,
  onProgress?: (status: 'loading' | 'success' | 'error', message?: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress('loading', 'กำลังเตรียมไฟล์ดาวน์โหลด...');

    // Try blob fetch first
    const res = await fetch(endpointUrl);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fallbackFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    if (onProgress) onProgress('success', 'ดาวน์โหลดสำเร็จ!');
    return true;
  } catch (err: any) {
    console.warn("Direct blob download failed, falling back to direct link:", err);
    try {
      // Fallback: create temporary direct download link
      const fallbackLink = document.createElement('a');
      fallbackLink.href = endpointUrl;
      fallbackLink.download = fallbackFilename;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => {
        if (document.body.contains(fallbackLink)) {
          document.body.removeChild(fallbackLink);
        }
      }, 2000);
      if (onProgress) onProgress('success');
      return true;
    } catch (fallbackErr: any) {
      console.error("Manual download failed completely:", fallbackErr);
      if (onProgress) onProgress('error', 'ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      return false;
    }
  }
}
