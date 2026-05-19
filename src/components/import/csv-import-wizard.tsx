'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, ChevronRight, ChevronDown, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

type WizardStep = 'upload' | 'mapping' | 'importing' | 'results';

interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

type PlatformField =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'capacity'
  | 'skip';

interface FieldOption {
  value: PlatformField;
  label: string;
  required?: boolean;
}

interface ImportResults {
  records_created: number;
  records_skipped: number;
  errors: { row: number; reason: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const FIELD_OPTIONS: FieldOption[] = [
  { value: 'first_name', label: 'First Name', required: true },
  { value: 'last_name', label: 'Last Name', required: true },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'skip', label: 'Skip (ignore column)' },
];

const REQUIRED_FIELDS: PlatformField[] = ['first_name', 'last_name'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Step indicator ─────────────────────────────────────────────────────────

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'mapping', label: 'Map Fields' },
  { key: 'importing', label: 'Import' },
  { key: 'results', label: 'Results' },
];

function StepIndicator({ current }: { current: WizardStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : active
                    ? 'border-primary bg-background text-primary'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground/50',
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs whitespace-nowrap',
                  active ? 'text-primary font-medium' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-10 mx-1 mb-4 transition-colors',
                  done ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Step 1: Upload ─────────────────────────────────────────────────────────

function UploadStep({
  onParsed,
}: {
  onParsed: (data: ParsedCsv) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function processFile(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are accepted.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds the 10 MB limit.');
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        if (headers.length === 0) {
          setError('No columns detected. Please check your CSV file.');
          return;
        }
        onParsed({ headers, rows: results.data });
      },
      error(err) {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop a CSV file here, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Accepts .csv files up to 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Step 2: Field Mapping ──────────────────────────────────────────────────

function MappingStep({
  parsed,
  mappings,
  onMappingChange,
  onImport,
}: {
  parsed: ParsedCsv;
  mappings: Record<string, PlatformField>;
  onMappingChange: (col: string, field: PlatformField) => void;
  onImport: () => void;
}) {
  const mappedFields = Object.values(mappings);
  const allRequiredMapped = REQUIRED_FIELDS.every((f) => mappedFields.includes(f));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Match each CSV column to a platform field. Fields marked with{' '}
        <span className="text-destructive font-medium">*</span> are required.
      </p>

      <div className="rounded-md border divide-y">
        {/* Header row */}
        <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>CSV Column</span>
          <span>Platform Field</span>
        </div>

        {parsed.headers.map((col) => (
          <div key={col} className="grid grid-cols-2 gap-4 items-center px-4 py-2.5">
            <span className="text-sm font-mono truncate" title={col}>
              {col}
            </span>
            <Select
              value={mappings[col] ?? 'skip'}
              onValueChange={(val) => onMappingChange(col, val as PlatformField)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                    {opt.required && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {parsed.rows.length.toLocaleString()} data row
        {parsed.rows.length !== 1 ? 's' : ''} detected.
      </p>

      <div className="flex justify-end">
        <Button onClick={onImport} disabled={!allRequiredMapped}>
          {!allRequiredMapped ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Map required fields to continue
            </>
          ) : (
            <>
              Import
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Importing (progress) ───────────────────────────────────────────

function ImportingStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium">Importing records…</p>
      <p className="text-xs text-muted-foreground">This may take a moment.</p>
    </div>
  );
}

// ── Step 4: Results ────────────────────────────────────────────────────────

function ResultsStep({
  results,
  onReset,
}: {
  results: ImportResults;
  onReset: () => void;
}) {
  const [errorsOpen, setErrorsOpen] = useState(false);
  const hasErrors = results.errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {results.records_created.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Created</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {results.records_skipped.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Skipped</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className={cn('text-2xl font-bold', hasErrors ? 'text-destructive' : 'text-muted-foreground')}>
            {results.errors.length.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Errors</p>
        </div>
      </div>

      {hasErrors && (
        <div className="rounded-md border">
          <button
            type="button"
            onClick={() => setErrorsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-destructive">
              <XCircle className="h-4 w-4" />
              {results.errors.length} error{results.errors.length !== 1 ? 's' : ''}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition-transform', errorsOpen && 'rotate-180')}
            />
          </button>
          {errorsOpen && (
            <div className="border-t divide-y max-h-60 overflow-y-auto">
              {results.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground shrink-0 font-mono text-xs pt-0.5">
                    Row {err.row}
                  </span>
                  <span className="text-destructive">{err.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results.records_created > 0 && !hasErrors && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Import completed successfully.
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Import Another File
        </Button>
      </div>
    </div>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────

interface CsvImportWizardProps {
  orgId: string;
}

export function CsvImportWizard({ orgId }: CsvImportWizardProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mappings, setMappings] = useState<Record<string, PlatformField>>({});
  const [results, setResults] = useState<ImportResults | null>(null);

  // Auto-guess mappings when CSV is parsed
  function handleParsed(data: ParsedCsv) {
    setParsed(data);

    const guessed: Record<string, PlatformField> = {};
    for (const col of data.headers) {
      const lower = col.toLowerCase().replace(/[\s_-]/g, '');
      if (lower.includes('firstname') || lower === 'first') guessed[col] = 'first_name';
      else if (lower.includes('lastname') || lower === 'last') guessed[col] = 'last_name';
      else if (lower.includes('email')) guessed[col] = 'email';
      else if (lower.includes('phone') || lower.includes('mobile')) guessed[col] = 'phone';
      else if (lower.includes('capacity') || lower.includes('giving')) guessed[col] = 'capacity';
      else guessed[col] = 'skip';
    }
    setMappings(guessed);
    setStep('mapping');
  }

  function handleMappingChange(col: string, field: PlatformField) {
    setMappings((prev) => ({ ...prev, [col]: field }));
  }

  async function handleImport() {
    if (!parsed) return;
    setStep('importing');

    try {
      const res = await fetch(`/api/organizations/${orgId}/import/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings, rows: parsed.rows }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Import failed.');
        setStep('mapping');
        return;
      }

      setResults(data as ImportResults);
      setStep('results');
    } catch {
      toast.error('An unexpected error occurred during import.');
      setStep('mapping');
    }
  }

  function handleReset() {
    setStep('upload');
    setParsed(null);
    setMappings({});
    setResults(null);
  }

  return (
    <div>
      <StepIndicator current={step} />

      {step === 'upload' && <UploadStep onParsed={handleParsed} />}

      {step === 'mapping' && parsed && (
        <MappingStep
          parsed={parsed}
          mappings={mappings}
          onMappingChange={handleMappingChange}
          onImport={handleImport}
        />
      )}

      {step === 'importing' && <ImportingStep />}

      {step === 'results' && results && (
        <ResultsStep results={results} onReset={handleReset} />
      )}
    </div>
  );
}
