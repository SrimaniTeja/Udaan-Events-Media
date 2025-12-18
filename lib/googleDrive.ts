import "server-only";

import { google } from "googleapis";
import type { Readable } from "node:stream";

type DriveClient = ReturnType<typeof google.drive>;

let cachedDriveClient: DriveClient | null = null;

function getDriveClient(): DriveClient {
  if (cachedDriveClient) return cachedDriveClient;

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error(
      "Google Drive service account credentials are missing. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in the environment.",
    );
  }

  // Handle `\n` sequences in .env so the key is valid PEM.
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  cachedDriveClient = google.drive({ version: "v3", auth });
  return cachedDriveClient;
}

export async function createEventFolders(eventId: string, eventName: string): Promise<{
  rootId: string;
  rawId: string;
  editedId: string;
  finalId: string;
}> {
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!parentId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID is not set in the environment.");
  }

  const drive = getDriveClient();

  // Sanitize folder name for Drive
  const baseName = `${eventName}-${eventId}`.replace(/[\\/#:?*"<>|]+/g, "_");

  // Root event folder under the configured parent
  let rootRes;
  try {
    rootRes = await drive.files.create({
      requestBody: {
        name: baseName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.error("Drive API error while creating root event folder", err?.response?.data || err);
    throw new Error("Failed to create Drive root folder for event");
  }

  const rootId = rootRes.data.id;
  if (!rootId) throw new Error("Failed to create root Drive folder for event.");

  async function createChildFolder(name: string) {
    let res: any;
    try {
      res = await drive.files.create(
        {
          fields: "id",
          supportsAllDrives: true,
          requestBody: {
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [rootId],
          },
        } as any,
      );
    } catch (err: any) {
      console.error(`Drive API error while creating child folder "${name}"`, err?.response?.data || err);
      throw new Error(`Failed to create ${name} Drive folder for event`);
    }
    const id = res.data.id;
    if (!id) throw new Error(`Failed to create ${name} folder for event.`);
    return id;
  }

  const [rawId, editedId, finalId] = await Promise.all([
    createChildFolder("RAW"),
    createChildFolder("EDITED"),
    createChildFolder("FINAL"),
  ]);

  return { rootId, rawId, editedId, finalId };
}

export async function uploadFileStream(params: {
  folderId: string;
  fileStream: Readable;
  fileName: string;
  mimeType: string;
}): Promise<{ fileId: string }> {
  const { folderId, fileStream, fileName, mimeType } = params;
  const drive = getDriveClient();

  let res: any;
  try {
    res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: fileStream,
      },
      fields: "id",
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.error("Drive API error while uploading file", err?.response?.data || err);
    throw new Error("Failed to upload file to Drive");
  }

  const fileId = res.data.id;
  if (!fileId) {
    throw new Error("Google Drive did not return a file ID for uploaded file.");
  }

  return { fileId };
}

export async function downloadFileStream(fileId: string): Promise<NodeJS.ReadableStream> {
  const drive = getDriveClient();
  try {
    const res = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );
    return res.data as NodeJS.ReadableStream;
  } catch (err: any) {
    console.error("Drive API error while downloading file", err?.response?.data || err);
    throw new Error("Failed to download file from Drive");
  }
}


