
const ALLOWED_HOSTS = new Set([
  "commons.wikimedia.org",
  "www.commons.wikimedia.org"
]);

function send(res, status, data) {
  res.status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8")
    .setHeader("Cache-Control", "no-store")
    .end(JSON.stringify(data));
}

function licenseIsSupported(name, url) {
  const text = `${name || ""} ${url || ""}`.toLowerCase();

  return (
    /public domain|cc0/.test(text) ||
    /creativecommons\.org\/publicdomain/.test(text) ||
    /creativecommons\.org\/licenses\/by\//.test(text) ||
    /creativecommons\.org\/licenses\/by-sa\//.test(text)
  );
}

function clean(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return send(res, 405, { error: "Use GET." });
  }

  let page;

  try {
    page = new URL(String(req.query.url || ""));
  } catch {
    return send(res, 400, {
      error: "Enter a valid Wikimedia Commons file URL."
    });
  }

  if (
    !ALLOWED_HOSTS.has(page.hostname) ||
    !page.pathname.startsWith("/wiki/File:")
  ) {
    return send(res, 400, {
      error: "Only Wikimedia Commons File: pages are supported."
    });
  }

  try {
    const title = decodeURIComponent(
      page.pathname.slice("/wiki/".length)
    ).replace(/_/g, " ");

    const api = new URL("https://commons.wikimedia.org/w/api.php");

    api.search = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "480",
      titles: title
    }).toString();

    const response = await fetch(api, {
      headers: {
        "User-Agent": "VidLoader/1.0 (open-license video helper)"
      }
    });

    if (!response.ok) {
      return send(res, 502, {
        error: "Wikimedia Commons is temporarily unavailable."
      });
    }

    const data = await response.json();
    const file = Object.values(data?.query?.pages || {})[0];
    const info = file?.imageinfo?.[0];

    if (!info || file.missing !== undefined) {
      return send(res, 404, {
        error: "The Wikimedia Commons file was not found."
      });
    }

    if (!String(info.mime || "").startsWith("video/")) {
      return send(res, 415, {
        error: "This file is not a video."
      });
    }

    const metadata = info.extmetadata || {};
    const license = metadata.LicenseShortName?.value || "";
    const licenseUrl = metadata.LicenseUrl?.value || "";

    if (!licenseIsSupported(license, licenseUrl)) {
      return send(res, 403, {
        error:
          "A supported open license could not be verified. Check the file page and license manually."
      });
    }

    return send(res, 200, {
      title: clean(file.title).replace(/^File:/, ""),
      pageUrl: page.href,
      downloadUrl: info.url,
      thumbnail: info.thumburl || "",
      mimeType: info.mime || "video",
      size: info.size
        ? `${(info.size / 1048576).toFixed(2)} MB`
        : "Unknown",
      license: clean(license),
      licenseUrl,
      attribution: clean(
        metadata.Attribution?.value ||
        metadata.Artist?.value ||
        metadata.Credit?.value ||
        "See the original file page"
      )
    });
  } catch {
    return send(res, 500, {
      error: "Could not inspect this file. Please try again."
    });
  }
};
