// src/components/ExcelButtons/ExcelButtons.jsx
import { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import { exportToExcel, importFromExcel, prepareDataForExport, validateImportData } from '../../utils/excelUtils';
import './ExcelButtons.css';

const ExcelButtons = ({ 
  data, 
  type, 
  filename = 'export', 
  onImport, 
  showNotification, 
  disabled = false,
  position = 'top' // 'top' ou 'form' pour le positionnement
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Gérer l'export vers Excel
  const handleExport = () => {
    if (disabled || !data || data.length === 0) return;
    
    setIsExporting(true);
    try {
      // Préparer les données pour l'export
      const exportData = prepareDataForExport(data, type);
      
      // Générer le fichier Excel
      const success = exportToExcel(exportData, filename, type.charAt(0).toUpperCase() + type.slice(1));
      
      if (success && showNotification) {
        showNotification(`Excel export successful: ${data.length} items exported`, 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (showNotification) {
        showNotification('Error during Excel export', 'error');
      }
    } finally {
      setIsExporting(false);
    }
  };
  
  // Ouvrir le dialogue de sélection de fichier
  const handleImportClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };
  
  // Gérer l'import depuis Excel
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      // Importer les données du fichier Excel
      const importedData = await importFromExcel(file);
      
      // Valider les données importées
      const validation = validateImportData(importedData, type);
      
      if (validation.isValid) {
        if (onImport) {
          await onImport(validation.data);
        }
        
        if (showNotification) {
          showNotification(`Excel import successful: ${validation.data.length} items imported`, 'success');
        }
      } else {
        if (showNotification) {
          showNotification(`Errors in Excel file: ${validation.errors.join(', ')}`, 'error');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      if (showNotification) {
        showNotification('Error during Excel import', 'error');
      }
    } finally {
      setIsImporting(false);
      // Réinitialiser le champ de fichier pour permettre la réimportation du même fichier
      e.target.value = '';
    }
  };
  
  const containerClass = `excel-buttons excel-buttons-${position}`;
  
  return (
    <div className={containerClass}>
      <div className="excel-buttons-label">
        <FileSpreadsheet size={18} />
        <span>Excel</span>
      </div>
      
      <div className="excel-buttons-actions">
        <button 
          className="excel-button export-button"
          onClick={handleExport}
          disabled={disabled || isExporting || !data || data.length === 0}
          title="Export to Excel"
        >
          <Download size={16} />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
        
        <button 
          className="excel-button import-button"
          onClick={handleImportClick}
          disabled={disabled || isImporting}
          title="Import from Excel"
        >
          <Upload size={16} />
          <span>{isImporting ? 'Importing...' : 'Import'}</span>
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="file-input-hidden"
        />
      </div>
    </div>
  );
};

export default ExcelButtons;