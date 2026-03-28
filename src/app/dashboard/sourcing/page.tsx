'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { getRows, insertRow, updateRow, deleteRow } from '@/lib/supabase/db';

type SourceCandidate = {
  id: string;
  name: string;
  role: string;
  location: string;
  experience_years: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Rejected';
  last_contacted?: string;
};

const sampleData: SourceCandidate[] = [
  {
    id: '1',
    name: 'Maya Patel',
    role: 'Front Desk Associate',
    location: 'Miami, FL',
    experience_years: 3,
    status: 'New',
    last_contacted: undefined,
  },
  {
    id: '2',
    name: 'Lucas Hernandez',
    role: 'Housekeeping Supervisor',
    location: 'Orlando, FL',
    experience_years: 5,
    status: 'Contacted',
    last_contacted: '2026-03-20',
  },
  {
    id: '3',
    name: 'Sophia Lee',
    role: 'Restaurant Server',
    location: 'Tampa, FL',
    experience_years: 2,
    status: 'Qualified',
    last_contacted: '2026-03-22',
  },
  {
    id: '4',
    name: 'Ethan Kim',
    role: 'Banquet Manager',
    location: 'Fort Lauderdale, FL',
    experience_years: 7,
    status: 'Rejected',
    last_contacted: '2026-03-18',
  },
  {
    id: '5',
    name: 'Olivia Nguyen',
    role: 'Event Coordinator',
    location: 'Miami, FL',
    experience_years: 4,
    status: 'Contacted',
    last_contacted: '2026-03-21',
  },
];

export default function SourcingPage() {
  const [candidates, setCandidates] = useState<SourceCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<SourceCandidate[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState<SourceCandidate | null>(null);

  const [formData, setFormData] = useState<Omit<SourceCandidate, 'id'>>({
    name: '',
    role: '',
    location: '',
    experience_years: 0,
    status: 'New',
    last_contacted: undefined,
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const rows = await getRows<SourceCandidate>('sourcing');
        if (rows && rows.length > 0) {
          setCandidates(rows);
          setFilteredCandidates(rows);
        } else {
          setCandidates(sampleData);
          setFilteredCandidates(sampleData);
        }
      } catch {
        setCandidates(sampleData);
        setFilteredCandidates(sampleData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCandidates(candidates);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredCandidates(
        candidates.filter(
          (c) =>
            c.name.toLowerCase().includes(lower) ||
            c.role.toLowerCase().includes(lower) ||
            c.location.toLowerCase().includes(lower) ||
            c.status.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, candidates]);

  function openCreateDialog() {
    setFormData({
      name: '',
      role: '',
      location: '',
      experience_years: 0,
      status: 'New',
      last_contacted: undefined,
    });
    setSelectedCandidate(null);
    setIsCreateOpen(true);
  }

  function openEditDialog(candidate: SourceCandidate) {
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name,
      role: candidate.role,
      location: candidate.location,
      experience_years: candidate.experience_years,
      status: candidate.status,
      last_contacted: candidate.last_contacted,
    });
    setIsEditOpen(true);
  }

  function openDeleteDialog(candidate: SourceCandidate) {
    setSelectedCandidate(candidate);
    setIsDeleteOpen(true);
  }

  async function handleCreate() {
    if (!formData.name.trim() || !formData.role.trim() || !formData.location.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await insertRow('sourcing', formData);
      const updated = await getRows<SourceCandidate>('sourcing');
      setCandidates(updated || sampleData);
      setIsCreateOpen(false);
      setSelectedCandidate(null);
    } catch {
      setError('Failed to create candidate');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedCandidate) return;
    if (!formData.name.trim() || !formData.role.trim() || !formData.location.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateRow('sourcing', selectedCandidate.id, formData);
      const updated = await getRows<SourceCandidate>('sourcing');
      setCandidates(updated || sampleData);
      setIsEditOpen(false);
      setSelectedCandidate(null);
    } catch {
      setError('Failed to update candidate');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedCandidate) return;
    setLoading(true);
    setError(null);
    try {
      await deleteRow('sourcing', selectedCandidate.id);
      const updated = await getRows<SourceCandidate>('sourcing');
      setCandidates(updated || sampleData);
      setIsDeleteOpen(false);
      setSelectedCandidate(null);
    } catch {
      setError('Failed to delete candidate');
    } finally {
      setLoading(false);
    }
  }

  // Stats calculations
  const totalCandidates = candidates.length;
  const contactedCount = candidates.filter((c) => c.status === 'Contacted').length;
  const qualifiedCount = candidates.filter((c) => c.status === 'Qualified').length;
  const rejectedCount = candidates.filter((c) => c.status === 'Rejected').length;

  return (
    <div className="px-4 py-8 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="size-5 text-brand-primary" />
          Sourcing
        </h1>
        <Button
          onClick={openCreateDialog}
          style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Candidate
        </Button>
      </header>
      <p className="text-white/60 max-w-xl mb-6">
        Manage your candidate sourcing pipeline with AI-driven automation for hospitality staffing.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">Total Candidates</CardTitle>
          <CardDescription className="text-2xl font-semibold">{totalCandidates}</CardDescription>
        </Card>
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">Contacted</CardTitle>
          <CardDescription className="text-2xl font-semibold">{contactedCount}</CardDescription>
        </Card>
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">Qualified</CardTitle>
          <CardDescription className="text-2xl font-semibold">{qualifiedCount}</CardDescription>
        </Card>
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">Rejected</CardTitle>
          <CardDescription className="text-2xl font-semibold">{rejectedCount}</CardDescription>
        </Card>
      </div>

      {/* Search input */}
      <div className="mb-4 max-w-md flex items-center gap-2">
        <Search className="size-4 text-white/50" />
        <Input
          type="search"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-brand-surface border-white/[0.06] text-white rounded px-3 py-2 w-full"
        />
      </div>

      {/* Data table */}
      <Card className="border-white/[0.06] bg-brand-surface-light text-white rounded">
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-white/40" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-white/50 text-center">
              <Users className="size-12 mb-4" />
              <p className="mb-4 text-lg">No candidates found</p>
              <Button
                onClick={openCreateDialog}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Candidate
              </Button>
            </div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableHeader className="text-white/40">
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Experience (Years)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="border-white/[0.06] hover:bg-white/[0.03]"
                  >
                    <TableCell className="text-white/80 font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-white/60">{candidate.role}</TableCell>
                    <TableCell className="text-white/60">{candidate.location}</TableCell>
                    <TableCell className="text-white/60">{candidate.experience_years}</TableCell>
                    <TableCell className="text-white/60">{candidate.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(candidate)}
                        aria-label={`Edit ${candidate.name}`}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(candidate)}
                        aria-label={`Delete ${candidate.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedCandidate(null);
          setError(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCandidate ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              selectedCandidate ? await handleUpdate() : await handleCreate();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Experience (Years) *</Label>
              <Input
                id="experience_years"
                type="number"
                min={0}
                required
                value={formData.experience_years}
                onChange={(e) => setFormData((f) => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={(value) => setFormData((f) => ({ ...f, status: value as SourceCandidate['status'] }))}
              >
                <SelectTrigger className="bg-brand-surface border-white/[0.06] text-white rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="last_contacted">Last Contacted</Label>
              <Input
                id="last_contacted"
                type="date"
                value={formData.last_contacted ?? ''}
                onChange={(e) => setFormData((f) => ({ ...f, last_contacted: e.target.value || undefined }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); setSelectedCandidate(null); setError(null); }}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : selectedCandidate ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setSelectedCandidate(null); setError(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Candidate</DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mb-6">
            Are you sure you want to delete <strong>{selectedCandidate?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setSelectedCandidate(null); setError(null); }}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}