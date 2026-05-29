import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Search, FileText, MoreHorizontal, Trash2, Download, PenTool } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-primary/10 text-primary',
  signed: 'bg-amber-500/10 text-amber-400',
};

const statusLabels = {
  draft: 'Ciornă',
  in_progress: 'În Lucru',
  completed: 'Finalizat',
  signed: 'Semnat',
};

export default function MyDocuments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const _queryClient = useQueryClient();

  const { data: documents = [], isLoading: _isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => [],
  });

  const deleteMutation = useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {},
  });

  const filtered = documents.filter(doc => {
    const matchSearch = doc.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-space">Documentele Mele</h1>
          <p className="text-sm text-muted-foreground mt-1">{documents.length} documente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Caută documente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'completed', 'signed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'Toate' : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{search ? 'Nu am găsit documente.' : 'Nu ai documente încă.'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">Document</TableHead>
                <TableHead className="text-xs text-muted-foreground hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground hidden md:table-cell">Data</TableHead>
                <TableHead className="text-xs text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(doc => (
                <TableRow key={doc.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[doc.status] || ''}`}>
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {doc.created_date ? format(new Date(doc.created_date), 'dd MMM yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs gap-2">
                          <Download className="w-3 h-3" /> Descarcă
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2">
                          <PenTool className="w-3 h-3" /> Semnează
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs gap-2 text-destructive"
                          onClick={() => deleteMutation.mutate(doc.id)}
                        >
                          <Trash2 className="w-3 h-3" /> Șterge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}