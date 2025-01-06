import app_info from "../../../../package.json";

const URL_LATEST_VERSION =
  "https://github.com/Didiloy/GameClock/releases/latest";

let currentVersion = app_info.version;

export async function isThereNewVersion() {
  try {
    const response = await fetch(URL_LATEST_VERSION, {
      method: "HEAD",
    });

    if (!response.ok) {
      return false;
    }

    // Extract the version tag from the "location" header of the response
    const latestVersionTag = response.url.split("/").pop().slice(1);

    if (compareVersions(latestVersionTag, currentVersion) > 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking for new version:", error);
    return false;
  }
}

function compareVersions(versionA, versionB) {
  const aParts = versionA.split(".").map(Number);
  const bParts = versionB.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const a = aParts[i];
    const b = bParts[i];

    if (a > b) return 1;
    if (a < b) return -1;
  }

  return 0;
}

const GITHUB_API_RELEASES_URL =
  "https://api.github.com/repos/Didiloy/GameClock/releases/latest";

export async function getLatestReleaseChangelog() {
  try {
    const response = await fetch(GITHUB_API_RELEASES_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return "An error occured while getting the changelog";
    }

    const releaseData = await response.json();
    const changelog = releaseData.body;

    return changelog || "No changelog available for this release.";
  } catch (error) {
    console.error("Error fetching the changelog:", error);
    return "An error occured while getting the changelog";
  }
}
