import path from "path";
import fs from "fs";

export class FileUtils {
  /**
   * Iterates over each file in a folder and calls a callback with its name and content.
   * If an error occurs while reading a file, it passes the error to the callback.
   */
  public static async forEachFile(
    folder: string,
    callback: (file: string, text: string, err?: Error) => Promise<void>
  ): Promise<void> {
    try {
      const files = await fs.promises.readdir(folder);

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folder, file);

          try {
            const text = await fs.promises.readFile(filePath, "utf8");
            await callback(file, text);
          } catch (err) {
            await callback(file, "", new Error(`Error reading file ${filePath}: ${err}`));
          }
        })
      );
    } catch (err) {
      throw new Error(`Error reading folder ${folder}: ${err}`);
    }
  }

  /**
   * Extracts the folder name from a folder path.
   */
  public static getFolderName(folder: string): string {
    const parts = folder.split(path.sep);

    if (parts.length < 2) return folder;

    return parts[parts.length - 2];
  }

  /**
   * Converts a Blob into a File object.
   */
  public static blobToFile(blob: Blob, fileName: string): File {
    const b: any = blob;
    b.lastModifiedDate = new Date();
    b.name = fileName;
    return b as File;
  }

  /**
   * Creates a new resource file with a name and location.
   */
  public static createResource(name: string, location: string): FileResource {
    const file: any = new File([""], name, {
      type: "text/plain",
    });
    file.location = location;

    return file;
  }

  /**
   * Saves a file by triggering a download in the browser.
   */
  public static saveFile(file: string | Blob, fileName: string): void {
    const uri =
      typeof file === "string"
        ? "data:application/octet-stream," + encodeURIComponent(file)
        : URL.createObjectURL(file);

    const el = document.createElement("a");
    el.setAttribute("href", uri);
    el.setAttribute("download", fileName);

    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);

    if (typeof file !== "string") {
      URL.revokeObjectURL(uri); // Clean up Blob URL
    }
  }
}

/**
 * Converts a file-like resource into a proper File object, if necessary.
 */
export function convertResource(resource: FileResource): FileResource | undefined {
  if (!resource) return;

  if (resource.constructor && resource.constructor.name === "File") return resource;

  const file: File = navigator["msSaveBlob"]
    ? FileUtils.blobToFile(new Blob([""], { type: resource.type }), resource.name)
    : new File([""], resource.name, {
        type: resource.type,
        lastModified: resource.lastModified,
      });

  file["location"] = resource.location;
  return file;
}

export interface FileResourceOpts extends FilePropertyBag {
  location: string;
}

export interface FileResource extends File {
  location?: string;
}
