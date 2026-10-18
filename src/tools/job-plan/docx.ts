/**
 * Word export. Builds the job plan as a real .docx (tables, numbered steps,
 * bold key steps, embedded photos) with the `docx` library — no template file.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ITableCellOptions,
} from 'docx';
import type { JobPlan } from './types';

export interface DocImage {
  id: string;
  name: string;
  data: ArrayBuffer | Uint8Array;
  width: number;
  height: number;
}

const NAVY = '0B1F3A';
const GREY = 'F1F3F5';
const LINE = { style: BorderStyle.SINGLE, size: 4, color: 'C9CED6' };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE };
const FONT = 'Calibri';
/** Printable width in twips (US Letter, 0.625" side margins). */
const CONTENT_WIDTH = 12240 - 2 * 900;
const cols = (...pct: number[]) => pct.map((p) => Math.round((CONTENT_WIDTH * p) / 100));

const text = (t: string, opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) =>
  new TextRun({ text: t, font: FONT, size: opts.size ?? 20, bold: opts.bold, color: opts.color, italics: opts.italics });

const para = (t: string, opts: Parameters<typeof text>[1] = {}) => new Paragraph({ children: [text(t, opts)] });

function cell(children: Paragraph[], opts: Partial<ITableCellOptions> = {}) {
  return new TableCell({ children, borders: BORDERS, margins: { top: 60, bottom: 60, left: 100, right: 100 }, ...opts });
}

const labelCell = (label: string, width: number) =>
  cell([para(label, { bold: true, size: 18, color: '4A5562' })], {
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: GREY },
  });

const valueCell = (value: string, width: number, span = 1) =>
  cell([para(value || ' ', { color: '1F3B73' })], { width: { size: width, type: WidthType.PERCENTAGE }, columnSpan: span });

/** Full-width section: grey heading bar over a value. */
function section(title: string, body: Paragraph[] | Table): (Paragraph | Table)[] {
  const heading = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [cell([para(title, { bold: true, color: 'FFFFFF', size: 19 })], { shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY } })] })],
  });
  const content = Array.isArray(body)
    ? new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [cell(body)] })] })
    : body;
  return [heading, content, new Paragraph({ spacing: { after: 120 }, children: [] })];
}

/** Scale an image to fit within maxWidth × maxHeight pixels, keeping its shape. */
export function fit(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function image(img: DocImage, maxW: number, maxH: number) {
  return new ImageRun({ data: img.data, transformation: fit(img.width, img.height, maxW, maxH), altText: { name: img.name, title: img.name, description: img.name } });
}

export function buildJobPlanDoc(plan: JobPlan, images: DocImage[] = [], today = new Date()): Document {
  const byId = new Map(images.map((i) => [i.id, i]));
  const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const header = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: cols(18, 32, 18, 32),
    rows: [
      new TableRow({ children: [labelCell('Work Center', 18), valueCell(plan.workCenter, 32), labelCell('Service Routine', 18), valueCell(plan.serviceRoutine, 32)] }),
      new TableRow({ children: [labelCell('Equipment Class', 18), valueCell(plan.equipmentClass, 82, 3)] }),
      new TableRow({ children: [labelCell('Frequency', 18), valueCell(plan.frequency, 32), labelCell('Est. Elapsed Time', 18), valueCell(plan.elapsedTime, 32)] }),
      new TableRow({ children: [labelCell('Est. Downtime', 18), valueCell(plan.downtime, 32), labelCell('Labor Hours', 18), valueCell(plan.laborHours, 32)] }),
    ],
  });

  const partsRows = plan.parts.filter((p) => p.stores || p.description);
  const partsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: cols(20, 45, 8, 27),
    rows: [
      new TableRow({
        tableHeader: true,
        children: [['Part # (Stores ID)', 20], ['Description', 45], ['Qty', 8], ['Remarks', 27]].map(([l, w]) => labelCell(String(l), Number(w))),
      }),
      ...(partsRows.length
        ? partsRows.map((p) => new TableRow({ children: [valueCell(p.stores, 20), valueCell(p.description, 45), valueCell(p.qty, 8), valueCell(p.remarks, 27)] }))
        : [new TableRow({ children: [valueCell('No parts required', 100, 4)] })]),
    ],
  });

  const stepParagraphs: Paragraph[] = [];
  plan.steps.forEach((s, i) => {
    stepParagraphs.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        indent: { left: 440, hanging: 440 },
        children: [text(`${i + 1}.\t`, { bold: true, color: NAVY }), text(s.text, { bold: s.key })],
        tabStops: [{ type: 'left', position: 440 }],
      }),
    );
    const img = s.imageId ? byId.get(s.imageId) : undefined;
    if (img) stepParagraphs.push(new Paragraph({ indent: { left: 440 }, spacing: { after: 120 }, children: [image(img, 320, 220)] }));
  });

  const textSections: [string, string][] = [
    ['Personal Protective Equipment Required', plan.ppe],
    ['Consumables Needed', plan.consumables],
    ['Special Tools Required', plan.specialTools],
    ['Mobile / Special Equipment', plan.mobileEquipment],
    ['Required Departmental Coordination', plan.coordination],
    ['Other Procedures Referenced', plan.procedures],
  ];

  const unplaced = images.filter((img) => !plan.steps.some((s) => s.imageId === img.id));

  return new Document({
    creator: plan.originator || 'Job Plan Builder',
    title: plan.title || 'Job Plan',
    description: 'Maintenance job plan',
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  text(`Originator: ${plan.originator || '________'}   ·   Approver: ${plan.approver || '________'}   ·   ${date}   ·   Page `, { size: 16, color: '6B7480' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '6B7480' }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ children: [text('MAINTENANCE JOB PLAN', { bold: true, size: 18, color: '6B7480' })] }),
          new Paragraph({ spacing: { after: 160 }, children: [text(plan.title || 'Untitled job plan', { bold: true, size: 30, color: NAVY })] }),
          header,
          new Paragraph({ spacing: { after: 120 }, children: [] }),
          ...section('Task Description', [para(plan.summary || ' ')]),
          ...section('Parts', partsTable),
          ...textSections.flatMap(([title, value]) => section(title, [para(value || 'None')])),
          ...section('Job Steps  (bold = key step)', stepParagraphs.length ? stepParagraphs : [para('No steps.')]),
          ...(unplaced.length
            ? section(
                'Attached Drawings & Photos',
                unplaced.flatMap((img) => [new Paragraph({ children: [image(img, 560, 340)] }), para(img.name, { italics: true, size: 16, color: '6B7480' })]),
              )
            : []),
        ],
      },
    ],
  });
}

export function fileName(plan: JobPlan): string {
  const slug = (plan.title || 'job-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${slug || 'job-plan'}.docx`;
}
