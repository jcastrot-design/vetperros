"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { addDocument, deleteDocument } from "@/lib/actions/pets";
import { documentTypeLabels } from "@/lib/validations/pet";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PetDocument } from "@/generated/prisma/client";

interface DocumentListProps {
  petId: string;
  documents: PetDocument[];
}

export function DocumentList({ petId, documents }: DocumentListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [docType, setDocType] = useState("OTHER");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await addDocument({
      petId,
      type: docType,
      title: form.get("title") as string,
      fileUrl: form.get("fileUrl") as string,
    });

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Documento agregado");
      setOpen(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteDocument(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Documento eliminado");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos ({documents.length})
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button size="sm" className="bg-brand hover:bg-brand-hover" />}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Agregar
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input id="title" name="title" placeholder="Ej: Carnet de vacunas 2026" required />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <Select value={docType} onValueChange={(v) => v && setDocType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">URL del archivo *</Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Sube el archivo a un servicio de almacenamiento y pega la URL aqui
                </p>
              </div>
              <Button type="submit" className="w-full bg-brand hover:bg-brand-hover" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar documento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay documentos registrados</p>
            <p className="text-sm">Guarda historias clinicas, carnets de vacunas y recetas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{doc.title}</p>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {documentTypeLabels[doc.type] || doc.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subido el {format(new Date(doc.uploadedAt), "dd MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
