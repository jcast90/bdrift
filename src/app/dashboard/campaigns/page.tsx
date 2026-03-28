'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { getRows, insertRow, deleteRow } from '@/lib/supabase/db';

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date: string;
  total_recipients: number;
};

const sampleData: Campaign[] = [
  {
    id: '1',
    name: 'Spring Hiring Blast',
    type: 'Email',
    status: 'Active',
    start_date: '2026-03-01',
    total_recipients: 1200,
  },
  {
    id: '2',
    name: 'Summer SMS Outreach',
    type: 'SMS',
    status: 'Draft',
    start_date: '2026-06-01',
    total_recipients: 800,
  },
  {
    id: '3',
    name: 'Hotel Phone Campaign',
    type: 'Phone',
    status: 'Paused',
    start_date: '2026-02-15',
    total_recipients: 450,
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTotalRecipients, setFormTotalRecipients] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const rows = await getRows<Campaign>('campaigns');
        if (rows && rows.length > 0) {
          setCampaigns(rows);
        } else {
          setCampaigns(sampleData);
        }
      } catch {
        setCampaigns(sampleData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleCreate() {
    if (!formName || !formType || !formStatus || !formStartDate) return;
    setLoading(true);
    try {
      await insertRow('campaigns', {
        name: formName,
        type: formType,
        status: formStatus,
        start_date: formStartDate,
        total_recipients: formTotalRecipients,
      });
      const updated = await getRows<Campaign>('campaigns');
      setCampaigns(updated || sampleData);
      setIsCreateOpen(false);
      clearForm();
    } catch {
      // ignore errors for simplicity
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedCampaignId) return;
    setLoading(true);
    try {
      await deleteRow('campaigns', selectedCampaignId);
      const updated = await getRows<Campaign>('campaigns');
      setCampaigns(updated || sampleData);
      setIsDeleteOpen(false);
      setSelectedCampaignId(null);
    } catch {
      // ignore errors for simplicity
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setFormName('');
    setFormType('');
    setFormStatus('');
    setFormStartDate('');
    setFormTotalRecipients(0);
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Campaigns</h1>
        <Button
          onClick={() => setIsCreateOpen(true)}
          style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Campaign
        </Button>
      </header>

      <Card className="border-white/[0.06] bg-brand-surface-light text-white rounded">
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-white/40" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-white/60 text-center">No campaigns found.</div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableHeader className="text-white/40">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Total Recipients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id} className="border-white/[0.06] hover:bg-white/[0.03]">
                    <TableCell className="text-white/80 font-medium">{c.name}</TableCell>
                    <TableCell className="text-white/60">{c.type}</TableCell>
                    <TableCell className="text-white/60">{c.status}</TableCell>
                    <TableCell className="text-white/60">{c.start_date}</TableCell>
                    <TableCell className="text-white/60">{c.total_recipients}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedCampaignId(c.id);
                          setIsDeleteOpen(true);
                        }}
                        aria-label={`Delete ${c.name}`}
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

      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); clearForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => { e.preventDefault(); handleCreate(); }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Input
                id="type"
                required
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Input
                id="status"
                required
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                required
                value={formStartDate}
                onChange={e => setFormStartDate(e.target.value)}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="total_recipients">Total Recipients</Label>
              <Input
                id="total_recipients"
                type="number"
                min={0}
                value={formTotalRecipients}
                onChange={e => setFormTotalRecipients(parseInt(e.target.value) || 0)}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); clearForm(); }}>
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setSelectedCampaignId(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mb-6">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setSelectedCampaignId(null); }}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}