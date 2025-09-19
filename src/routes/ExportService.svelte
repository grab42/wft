<script lang="ts">
    import { flowData, notes, metadata, instruments, materials } from '../lib/store';
    import jsPDF from 'jspdf';
    import html2canvas from 'html2canvas';
    import { get } from 'svelte/store';

    function exportToJSON() {
        const experimentData = {
            flowchart: get(flowData),
            notes: get(notes),
            metadata: get(metadata),
            instruments: get(instruments),
            materials: get(materials)
        };

        const jsonString = JSON.stringify(experimentData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'experiment.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async function exportToPNG() {
        const flowElement = document.querySelector('.svelte-flow');
        if (!flowElement) {
            alert('Flowchart element not found!');
            return;
        }

        const canvas = await html2canvas(flowElement as HTMLElement);
        const dataUrl = canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'flowchart.png';
        a.click();
    }

    async function exportToPDF() {
        const flowElement = document.querySelector('.svelte-flow');
        if (!flowElement) {
            alert('Flowchart element not found!');
            return;
        }

        const canvas = await html2canvas(flowElement as HTMLElement);
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        let y = pdfHeight + 10;

        pdf.text("Notes:", 10, y);
        y += 10;
        pdf.text(get(notes), 10, y);
        y += 20;

        pdf.text("Metadata:", 10, y);
        y += 10;
        pdf.text(get(metadata), 10, y);

        pdf.save('experiment.pdf');
    }
</script>

<div class="export-buttons">
    <button on:click={exportToJSON}>Export as JSON</button>
    <button on:click={exportToPNG}>Export as PNG</button>
    <button on:click={exportToPDF}>Export as PDF</button>
</div>

<style>
    .export-buttons {
        display: flex;
        gap: 1rem;
        margin-left: auto;
        align-items: center;
    }
    button {
        padding: 0.5rem 1rem;
        border: none;
        background: #28a745;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }
    button:hover {
        background: #218838;
    }
</style>
