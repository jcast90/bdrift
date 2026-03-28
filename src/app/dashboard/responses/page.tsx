'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { getRows, insertRow, updateRow, deleteRow } from '@/lib/supabase/db';

type Response = {
  id: string;
  candidate_name: string;
  campaign_name: string;
  response_date: string;
  status: 'New' | 'Qualified' | 'Rejected' | 'Follow-up';
  notes?: string;
};

const sampleData: Response[] = [
  {
    id: '1',
    candidate_name: 'Maya Patel',
    campaign_name: 'Spring Hiring Blast',
    response_date: '2026-03-22',
    status: 'Qualified',
    notes: 'Available for immediate start.',
  },
  {
    id: '2',
    candidate_name: 'Lucas Hernandez',
    campaign_name: 'Summer SMS Outreach',
    response_date: '2026-03-20',
    status: 'Follow-up',
    notes: 'Requested more info about schedule.',
  },
  {
    id: '3',
    candidate_name: 'Sophia Lee',
    campaign_name: 'Hotel Phone Campaign',
    response_date: '2026-03-18',
    status: 'Rejected',
    notes: 'Not interested at this time.',
  },
  {
    id: '4',
    candidate_name: 'Ethan Kim',
    campaign_name: 'Social Media Campaign May',
    response_date: '2026-03-25',
    status: 'New',
    notes: '',
  },
];

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  const [formData, setFormData] = useState<Omit<Response, 'id'>>({
    candidate_name: '',
    campaign_name: '',
    response_date: '',
    status: 'New',
    notes: '',
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const rows = await getRows<Response>('responses');
        if (rows && rows.length > 0) {
          setResponses(rows);
          setFilteredResponses(rows);
        } else {
          setResponses(sampleData);
          setFilteredResponses(sampleData);
        }
      } catch {
        setResponses(sampleData);
        setFilteredResponses(sampleData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResponses(responses);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredResponses(
        responses.filter(
          (r) =>
            r.candidate_name.toLowerCase().includes(lower) ||
            r.campaign_name.toLowerCase().includes(lower) ||
            r.status.toLowerCase().includes(lower) ||
            (r.notes && r.notes.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, responses]);

  function openCreateDialog() {
    setFormData({
      candidate_name: '',
      campaign_name: '',
      response_date: '',
      status: 'New',
      notes: '',
    });
    setSelectedResponse(null);
    setIsCreateOpen(true);
  }

  function openEditDialog(response: Response) {
    setSelectedResponse(response);
    setFormData({
      candidate_name: response.candidate_name,
      campaign_name: response.campaign_name,
      response_date: response.response_date,
      status: response.status,
      notes: response.notes || '',
    });
    setIsEditOpen(true);
  }

  function openDeleteDialog(response: Response) {
    setSelectedResponse(response);
    setIsDeleteOpen(true);
  }

  async function handleCreate() {
    if (!formData.candidate_name.trim() || !formData.campaign_name.trim() || !formData.response_date) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await insertRow('responses', formData);
      const updated = await getRows<Response>('responses');
      setResponses(updated || sampleData);
      setIsCreateOpen(false);
      setSelectedResponse(null);
    } catch {
      setError('Failed to create response');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedResponse) return;
    if (!formData.candidate_name.trim() || !formData.campaign_name.trim() || !formData.response_date) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateRow('responses', selectedResponse.id, formData);
      const updated = await getRows<Response>('responses');
      setResponses(updated || sampleData);
      setIsEditOpen(false);
      setSelectedResponse(null);
    } catch {
      setError('Failed to update response');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedResponse) return;
    setLoading(true);
    setError(null);
    try {
      await deleteRow('responses', selectedResponse.id);
      const updated = await getRows<Response>('responses');
      setResponses(updated || sampleData);
      setIsDeleteOpen(false);
      setSelectedResponse(null);
    } catch {
      setError('Failed to delete response');
    } finally {
      setLoading(false);
    }
  }

  // Stats
  const totalResponses = responses.length;
  const newCount = responses.filter(r => r.status === 'New').length;
  const qualifiedCount = responses.filter(r => r.status === 'Qualified').length;
  const rejectedCount = responses.filter(r => r.status === 'Rejected').length;

  return (
    <div className="px-4 py-8 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageCircle className="size-5 text-brand-primary" />
          Responses
        </h1>
        <Button
          onClick={openCreateDialog}
          style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Response
        </Button>
      </header>
      <p className="text-white/60 max-w-xl mb-6">
        Manage candidate responses from campaigns. Qualify and track follow-ups efficiently.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">Total Responses</CardTitle>
          <CardDescription className="text-2xl font-semibold">{totalResponses}</CardDescription>
        </Card>
        <Card className="border-white/[0.06] bg-brand-surface-light text-white p-4 rounded">
          <CardTitle className="text-white/60 text-sm">New</CardTitle>
          <CardDescription className="text-2xl font-semibold">{newCount}</CardDescription>
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

      {/* Search */}
      <div className="mb-4 max-w-md flex items-center gap-2">
        <Search className="size-4 text-white/50" />
        <Input
          type="search"
          placeholder="Search responses..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-brand-surface border-white/[0.06] text-white rounded px-3 py-2 w-full"
        />
      </div>

      {/* Table */}
      <Card className="border-white/[0.06] bg-brand-surface-light text-white rounded">
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-white/40" />
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-white/50 text-center">
              <MessageCircle className="size-12 mb-4" />
              <p className="mb-4 text-lg">No responses found</p>
              <Button
                onClick={openCreateDialog}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Response
              </Button>
            </div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableHeader className="text-white/40">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map(response => (
                  <TableRow
                    key={response.id}
                    className="border-white/[0.06] hover:bg-white/[0.03]"
                  >
                    <TableCell className="text-white/80 font-medium">{response.candidate_name}</TableCell>
                    <TableCell className="text-white/60">{response.campaign_name}</TableCell>
                    <TableCell className="text-white/60">{response.response_date}</TableCell>
                    <TableCell className="text-white/60">{response.status}</TableCell>
                    <TableCell className="text-white/60">{response.notes || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(response)}
                        aria-label={`Edit ${response.candidate_name} response`}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(response)}
                        aria-label={`Delete ${response.candidate_name} response`}
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
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={open => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedResponse(null);
          setError(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedResponse ? 'Edit Response' : 'New Response'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              selectedResponse ? await handleUpdate() : await handleCreate();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="candidate_name">Candidate Name *</Label>
              <Input
                id="candidate_name"
                required
                value={formData.candidate_name}
                onChange={e => setFormData(f => ({ ...f, candidate_name: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="campaign_name">Campaign Name *</Label>
              <Input
                id="campaign_name"
                required
                value={formData.campaign_name}
                onChange={e => setFormData(f => ({ ...f, campaign_name: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="response_date">Response Date *</Label>
              <Input
                id="response_date"
                type="date"
                required
                value={formData.response_date}
                onChange={e => setFormData(f => ({ ...f, response_date: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={value => setFormData(f => ({ ...f, status: value as Response['status'] }))}
              >
                <SelectTrigger className="bg-brand-surface border-white/[0.06] text-white rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); setSelectedResponse(null); setError(null); }}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : selectedResponse ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={open => { if (!open) { setIsDeleteOpen(false); setSelectedResponse(null); setError(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Response</DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mb-6">
            Are you sure you want to delete the response from <strong>{selectedResponse?.candidate_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setSelectedResponse(null); setError(null); }}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <Loader2 className="size-4 animate-spin text-white/40" /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}