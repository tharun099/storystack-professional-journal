import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'txt' | 'docx' | 'pdf';
  filename: string;
  content: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export class DocumentExporter {
  static async exportDocument(options: ExportOptions): Promise<void> {
    const { format, filename, content, metadata } = options;

    switch (format) {
      case 'txt':
        this.exportAsText(content, filename);
        break;
      case 'docx':
        await this.exportAsDocx(content, filename, metadata);
        break;
      case 'pdf':
        this.exportAsPdf(content, filename, metadata);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private static exportAsText(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    this.downloadBlob(blob, `${filename}.txt`);
  }

  private static async exportAsDocx(content: string, filename: string, metadata?: any): Promise<void> {
    try {
      // Create a simple RTF document that can be opened by Word
      // RTF is more compatible than trying to create actual DOCX
      const rtfContent = this.convertToRTF(content, metadata);
      const rtfBlob = new Blob([rtfContent], { type: 'application/rtf' });
      this.downloadBlob(rtfBlob, `${filename}.docx`);
    } catch (error) {
      console.error('Error exporting as DOCX:', error);
      // Fallback to text export
      this.exportAsText(content, filename);
      throw new Error('DOCX export failed, downloaded as text file instead');
    }
  }

  private static exportAsPdf(content: string, filename: string, metadata?: any): void {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Set document metadata
      if (metadata) {
        pdf.setProperties({
          title: metadata.title || 'Resume Content',
          author: metadata.author || 'Resume Builder',
          subject: metadata.subject || 'Professional Resume Content'
        });
      }

      // Configure text settings
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 16;

      let yPosition = margin + 20;

      // Split content into lines and handle page breaks
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin + 20;
        }

        if (line.trim() === '') {
          yPosition += lineHeight / 2;
          continue;
        }

        // Handle headers (lines that end with :)
        if (line.trim().endsWith(':') && !line.startsWith('•') && !line.startsWith('-')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          const wrappedHeader = pdf.splitTextToSize(line.trim(), maxWidth);
          pdf.text(wrappedHeader, margin, yPosition);
          yPosition += (wrappedHeader.length * lineHeight) + 8;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          continue;
        }

        // Handle bullet points
        if (line.startsWith('•') || line.startsWith('-')) {
          const bulletText = line.replace(/^[•-]\s*/, '');
          const wrappedText = pdf.splitTextToSize(`• ${bulletText}`, maxWidth);
          pdf.text(wrappedText, margin, yPosition);
          yPosition += (wrappedText.length * lineHeight) + 4;
          continue;
        }

        // Handle regular text
        const wrappedText = pdf.splitTextToSize(line, maxWidth);
        pdf.text(wrappedText, margin, yPosition);
        yPosition += (wrappedText.length * lineHeight) + 4;
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      // Fallback to text export
      this.exportAsText(content, filename);
      throw new Error('PDF export failed, downloaded as text file instead');
    }
  }

  private static convertToRTF(content: string, metadata?: any): string {
    const lines = content.split('\n');
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';

    // Add document title if provided
    if (metadata?.title) {
      rtfContent += `\\title ${metadata.title}`;
    }

    rtfContent += '\\f0\\fs22 '; // Set font and size

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        rtfContent += '\\par ';
        continue;
      }

      // Handle section headers (lines ending with :)
      if (trimmedLine.endsWith(':') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
        rtfContent += `\\par\\b\\fs26 ${this.escapeRTF(trimmedLine)}\\b0\\fs22\\par `;
        continue;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        const bulletText = trimmedLine.replace(/^[•-]\\s*/, '');
        rtfContent += `\\par\\bullet ${this.escapeRTF(bulletText)}`;
        continue;
      }

      // Handle regular text
      rtfContent += `\\par ${this.escapeRTF(trimmedLine)}`;
    }

    rtfContent += '}';
    return rtfContent;
  }

  private static escapeRTF(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}');
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}