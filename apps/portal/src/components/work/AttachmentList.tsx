import { Button } from "@/components/ui/button";
import { Paperclip, Trash2, Upload, Download } from "lucide-react";
import { type WorkAttachment } from "@/data/entities";
import { uploadAttachment, removeAttachment } from "@/data/services/work-center";
import { get as getUser } from "@/data/repositories/users";
import { formatBytes, formatRelative } from "@/data/utils";
import { useRef } from "react";
import { toast } from "sonner";

export function AttachmentList({
  workItemId,
  attachments,
  currentUserId,
  canManage,
}: {
  workItemId: string;
  attachments: WorkAttachment[];
  currentUserId: string;
  canManage: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      uploadAttachment({
        workItemId,
        uploaderId: currentUserId,
        name: f.name,
        size: f.size,
        mime: f.type || "application/octet-stream",
        url: URL.createObjectURL(f),
      });
    }
    toast.success(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((a) => {
            const up = getUser(a.uploaderId);
            return (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm"
              >
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(a.size)} · {up?.name ?? "Unknown"} · {formatRelative(a.createdAt)}
                  </p>
                </div>
                <a
                  href={a.url}
                  download={a.name}
                  className="text-muted-foreground hover:text-foreground"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                {canManage && (
                  <button
                    onClick={() => {
                      removeAttachment(a.id, currentUserId);
                      toast.success("Attachment removed");
                    }}
                    className="text-muted-foreground hover:text-[color:var(--status-attention)]"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload files
        </Button>
      </div>
    </div>
  );
}
