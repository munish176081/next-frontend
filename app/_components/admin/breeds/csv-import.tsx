"use client";

import { useState, useRef } from "react";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useImportBreeds } from "@/_services/hooks/admin";

interface CSVImportProps {
  onImportComplete?: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importBreeds = useImportBreeds();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        alert('Please select a valid CSV file');
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await importBreeds.mutateAsync(formData);
      setImportResult(result);
      
      if (result.success) {
        onImportComplete?.();
        // Reset form after successful import
        setTimeout(() => {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import failed',
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Breed Name': 'Golden Retriever',
        'Category': 'sporting',
        'URL Slug': 'golden-retriever',
        'Size': 'large',
        'Breed Description': 'Friendly, intelligent, and devoted. Golden Retrievers are one of the most popular dog breeds.',
        'Temperament': 'Friendly, Intelligent, Devoted',
        'Life Expectancy': '10-12 years',
        'Sort Order': '1'
      },
      {
        'Breed Name': 'French Bulldog',
        'Category': 'companion',
        'URL Slug': 'french-bulldog',
        'Size': 'small',
        'Breed Description': 'Adaptable, playful, and smart. French Bulldogs are excellent companion dogs.',
        'Temperament': 'Adaptable, Playful, Smart',
        'Life Expectancy': '10-12 years',
        'Sort Order': '2'
      },
      {
        'Breed Name': 'German Shepherd',
        'Category': 'herding',
        'URL Slug': 'german-shepherd',
        'Size': 'large',
        'Breed Description': 'Confident, intelligent, and versatile. German Shepherds are excellent working dogs.',
        'Temperament': 'Confident, Intelligent, Versatile',
        'Life Expectancy': '9-13 years',
        'Sort Order': '3'
      }
    ];

    const csvContent = [
      Object.keys(sampleData[0]).join(','),
      ...sampleData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'breed-import-sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Breeds from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple breeds at once. Download the sample file to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sample Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Need a template?</p>
                <p className="text-sm text-blue-700">Download our sample CSV file to get started</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-start gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={importResult.success ? "text-green-800" : "text-red-800"}>
                    <div className="font-medium">{importResult.message}</div>
                    {importResult.success && (
                      <div className="text-sm mt-1">
                        Successfully imported {importResult.imported} breeds
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Errors:</div>
                        <ul className="text-sm list-disc list-inside mt-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Breeds
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
