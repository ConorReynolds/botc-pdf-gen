/**
 * @param {object} script
 */
async function compressScript(script) {
  const jsonString = JSON.stringify(script);
  const stream = new Blob([jsonString], { type: "application/json" }).stream();
  const blob = await new Response(
    stream.pipeThrough(new CompressionStream("gzip")),
  ).blob();

  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(new Uint8Array(buffer)).toString('base64');

  const param = encodeURIComponent(base64);
  return param;
}
/**
 *
 * @param {object} script
 */
export async function scriptLink(script) {
  const param = await compressScript(script);
  const url = new URL("https://script.bloodontheclocktower.com/");

  url.searchParams.set("script", param);
  return url;
}
