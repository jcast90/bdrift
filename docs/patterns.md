# CRUD Page Pattern

A complete dashboard page with stats, search, table, and create/edit/delete dialogs. Copy and adapt.

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getRows, insertRow, updateRow, deleteRow } from "@/lib/supabase/db";
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  status: "active" | "inactive";
  created_at: string;
}

const SAMPLE: Item[] = [
  { id: "1", name: "Sample Item", status: "active", created_at: new Date().toISOString() },
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [formName, setFormName] = useState("");

  async function load() {
    try {
      const rows = await getRows<Item>("items", { orderBy: "created_at" });
      setItems(rows.length > 0 ? rows : SAMPLE);
    } catch {
      setItems(SAMPLE);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (editItem) {
      await updateRow("items", editItem.id, { name: formName });
    } else {
      await insertRow("items", { name: formName, status: "active" });
    }
    setDialogOpen(false);
    setEditItem(null);
    setFormName("");
    load();
  }

  async function handleDelete(id: string) {
    await deleteRow("items", id);
    load();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-white/40" /></div>;
  }

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Items</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditItem(null); setFormName(""); } }}>
          <DialogTrigger asChild>
            <Button className="text-white" style={{ background: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))" }}>
              <Plus className="size-4 mr-2" /> Create
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-brand-surface-light border-white/[0.06] text-white">
            <DialogHeader><DialogTitle>{editItem ? "Edit" : "Create"} Item</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Name</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} className="bg-white/5 border-white/10" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.06] bg-brand-surface-light text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-white/60">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{items.length}</p></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white/5 border-white/10" />
      </div>

      {/* Table */}
      <Card className="mt-4 border-white/[0.06] bg-brand-surface-light text-white">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06]">
              <TableHead className="text-white/40">Name</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                <TableCell className="text-white/80">{item.name}</TableCell>
                <TableCell><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => { setEditItem(item); setFormName(item.name); setDialogOpen(true); }}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-3.5 text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

## Key patterns to adapt

- **Stats row**: Grid of metric Cards at top. Use `sm:grid-cols-2 lg:grid-cols-4`.
- **Search**: Input with Search icon, filter in state.
- **Table**: Inside Card. Headers `text-white/40`, rows `border-white/[0.06]`.
- **Dialogs**: Single Dialog for both create and edit (toggle via `editItem` state).
- **Empty state**: Check `filtered.length === 0`, show centered text + create button.
- **Loading**: `Loader2` with `animate-spin`.
