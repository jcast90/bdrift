'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, Trash2, BarChart2 } from 'lucide-react';
import { getRows, insertRow, updateRow, deleteRow } from '@/lib/supabase/db';

type AnalyticsRecord = {
  id: string;
  metric: string;
  value: number;
  period: string;
  details?: string;
};

const sampleData: AnalyticsRecord[] = [
  { id: '1', metric: 'Candidates Sourced', value: 1340, period: 'March 2026', details: 'Up 15% from Feb' },
  { id: '2', metric: 'Outreach Campaigns Sent', value: 45, period: 'March 2026', details: 'Stable' },
  { id: '3', metric: 'Responses Received', value: 520, period: 'March 2026', details: 'Up 10% from Feb' },
  { id: '4', metric: 'Qualified Candidates', value: 230, period: 'March 2026', details: 'Up 5% from Feb' },
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAnalytics, setFilteredAnalytics] = useState<AnalyticsRecord[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<AnalyticsRecord | null>(null);

  const [formData, setFormData] = useState<Omit<AnalyticsRecord, 'id'>>({
    metric: '',
    value: 0,
    period: '',
    details: '',
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const rows = await getRows<AnalyticsRecord>('analytics');
        if (rows && rows.length > 0) {
          setAnalytics(rows);
          setFilteredAnalytics(rows);
        } else {
          setAnalytics(sampleData);
          setFilteredAnalytics(sampleData);
        }
      } catch {
        setAnalytics(sampleData);
        setFilteredAnalytics(sampleData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAnalytics(analytics);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredAnalytics(
        analytics.filter(
          (a) =>
            a.metric.toLowerCase().includes(lower) ||
            a.period.toLowerCase().includes(lower) ||
            (a.details && a.details.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, analytics]);

  function openCreateDialog() {
    setFormData({ metric: '', value: 0, period: '', details: '' });
    setSelectedRecord(null);
    setIsCreateOpen(true);
  }

  function openEditDialog(record: AnalyticsRecord) {
    setSelectedRecord(record);
    setFormData({
      metric: record.metric,
      value: record.value,
      period: record.period,
      details: record.details || '',
    });
    setIsEditOpen(true);
  }

  function openDeleteDialog(record: AnalyticsRecord) {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  }

  async function handleCreate() {
    if (!formData.metric.trim() || !formData.period.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await insertRow('analytics', formData);
      const updated = await getRows<AnalyticsRecord>('analytics');
      setAnalytics(updated || sampleData);
      setIsCreateOpen(false);
      setSelectedRecord(null);
    } catch {
      setError('Failed to create record');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedRecord) return;
    if (!formData.metric.trim() || !formData.period.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateRow('analytics', selectedRecord.id, formData);
      const updated = await getRows<AnalyticsRecord>('analytics');
      setAnalytics(updated || sampleData);
      setIsEditOpen(false);
      setSelectedRecord(null);
    } catch {
      setError('Failed to update record');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedRecord) return;
    setLoading(true);
    setError(null);
    try {
      await deleteRow('analytics', selectedRecord.id);
      const updated = await getRows<AnalyticsRecord>('analytics');
      setAnalytics(updated || sampleData);
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    } catch {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart2 className="size-5 text-brand-primary" />
          Analytics
        </h1>
        <Button
          onClick={openCreateDialog}
          style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Record
        </Button>
      </header>
      <p className="text-white/60 max-w-xl mb-6">
        Track and analyze your recruitment pipeline metrics for optimized decision-making.
      </p>

      <div className="mb-4 max-w-md flex items-center gap-2">
        <Search className="size-4 text-white/50" />
        <Input
          type="search"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-brand-surface border-white/[0.06] text-white rounded px-3 py-2 w-full"
        />
      </div>

      <Card className="border-white/[0.06] bg-brand-surface-light text-white rounded">
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-white/40" />
            </div>
          ) : filteredAnalytics.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-white/50 text-center">
              <BarChart2 className="size-12 mb-4" />
              <p className="mb-4 text-lg">No analytics data found</p>
              <Button
                onClick={openCreateDialog}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Record
              </Button>
            </div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableHeader className="text-white/40">
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalytics.map((record) => (
                  <TableRow
                    key={record.id}
                    className="border-white/[0.06] hover:bg-white/[0.03]"
                  >
                    <TableCell className="text-white/80 font-medium">{record.metric}</TableCell>
                    <TableCell className="text-white/60">{record.value}</TableCell>
                    <TableCell className="text-white/60">{record.period}</TableCell>
                    <TableCell className="text-white/60">{record.details || '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(record)}
                        aria-label={`Edit ${record.metric}`}
                      >
                        <Plus className="size-4 rotate-45" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(record)}
                        aria-label={`Delete ${record.metric}`}
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

      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedRecord(null);
          setError(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit Record' : 'New Record'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              selectedRecord ? await handleUpdate() : await handleCreate();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="metric">Metric *</Label>
              <Input
                id="metric"
                required
                value={formData.metric}
                onChange={(e) => setFormData(f => ({ ...f, metric: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData(f => ({ ...f, value: Number(e.target.value) }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="period">Period *</Label>
              <Input
                id="period"
                required
                value={formData.period}
                onChange={(e) => setFormData(f => ({ ...f, period: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <Input
                id="details"
                value={formData.details}
                onChange={(e) => setFormData(f => ({ ...f, details: e.target.value }))}
                className="bg-brand-surface border-white/[0.06] text-white rounded"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); setSelectedRecord(null); setError(null); }}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-accent))' }}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : selectedRecord ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setSelectedRecord(null); setError(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p className="text-white/80 mb-6">
            Are you sure you want to delete the analytics record <strong>{selectedRecord?.metric}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setSelectedRecord(null); setError(null); }}>
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